import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  OrthographicCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { PartId, ScreenAnchor } from './layout';

// Couleurs de la charte (three.js ne lit pas Tailwind) : green-primary, stroke-object, bg-primary.
const GREEN = 0x3ecf8e;
const WHITE = 0xdedede;
const BG = 0x080808;

export interface SceneState {
  explode: number;
  open: number;
  rotation: number;
  /** ms, pour le léger flottement ; 0 = figé */
  time: number;
  /** 0→1 : tracé initial des traits */
  draw: number;
}

export interface AgentScene {
  resize(width: number, height: number, opts?: { reservedSide?: number }): void;
  render(state: SceneState): ScreenAnchor[];
  dispose(): void;
}

type Plane = 'xy' | 'xz' | 'yz';
const V = (x: number, y: number, z: number) => new Vector3(x, y, z);

function circlePts(r: number, n: number, plane: Plane, c: [number, number, number]): Vector3[] {
  const pts: Vector3[] = [];
  for (let i = 0; i < n; i++) {
    for (const k of [i, i + 1]) {
      const a = (k / n) * Math.PI * 2;
      const u = Math.cos(a) * r;
      const v = Math.sin(a) * r;
      pts.push(
        plane === 'xy' ? V(c[0] + u, c[1] + v, c[2]) : plane === 'xz' ? V(c[0] + u, c[1], c[2] + v) : V(c[0], c[1] + u, c[2] + v),
      );
    }
  }
  return pts;
}

function rectPts(x0: number, y0: number, x1: number, y1: number, z: number): Vector3[] {
  return [
    V(x0, y0, z), V(x1, y0, z),
    V(x1, y0, z), V(x1, y1, z),
    V(x1, y1, z), V(x0, y1, z),
    V(x0, y1, z), V(x0, y0, z),
  ];
}

/**
 * Projette des points 2D sur le plan tangent au flanc du fût, à l'angle `a` et au rayon `r` :
 * `x` court le long du pourtour, `y` est vertical, `z` est le débord vers l'extérieur.
 * C'est ce qui permet de visser une plaque ou une vis sur un cylindre sans créer un Group par pièce.
 */
function onFlank(a: number, y: number, r: number, pts: Vector3[]): Vector3[] {
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  return pts.map((p) => V(ca * (r + p.z) - sa * p.x, y + p.y, sa * (r + p.z) + ca * p.x));
}

interface Module {
  id: Exclude<PartId, 'decide'>;
  group: Group;
  rest: Vector3;
  dir: Vector3;
  /** index 0..4 de l'anneau auquel le module est accroché */
  ring: number;
  socketCenter: Vector3;
  anchor: Vector3;
  socketMat: LineBasicMaterial;
  tether: Line;
  tetherMat: LineDashedMaterial;
  /** traits verts de la pièce, avec leur opacité nominale : masqués à l'état fermé */
  greenMats: Array<{ mat: LineBasicMaterial; base: number }>;
}

interface RingSpec {
  r: number;
  h: number;
  y: number;
}

/**
 * Paramètres de gravure d'un étage. Tout est généré par code (cf. shape-dense-brief.md) :
 * l'objet doit lire « machine usinée » — des centaines de petits éléments répétés —
 * et non « pile d'anneaux lisses ».
 */
interface TierDetail {
  /** rainures tournées sur le flanc, en fraction de la hauteur de l'étage (-0.5 → 0.5) */
  grooves: number[];
  /** graduations fines sur une bande du flanc */
  grad: number;
  /** position de la bande de graduations, en fraction de la hauteur */
  gradY: number;
  gradLen: number;
  /** bande moletée : traits verticaux serrés sur tout le pourtour */
  knurl?: { count: number; y0: number; y1: number };
  /** couronne de vis vissées dans le flanc */
  flankBolts?: { count: number; y: number; r: number; phase: number };
  /** plaques vissées sur le flanc : [angle, demi-largeur, demi-hauteur] */
  plates: Array<[number, number, number]>;
  /** couronne de crans radiaux sur une face supérieure visible (tête, ou collerette débordante) */
  teeth?: { count: number; depth: number; r: number };
  /** cercles concentriques gravés sur la face supérieure */
  engraved?: number[];
  /** couronne de vis sur la face supérieure */
  topBolts?: { count: number; ring: number; r: number };
  /** couronne de crans radiaux gravés sur la face supérieure (se découvre pendant la bascule) */
  topCrown?: { count: number; r0: number; r1: number };
  /** plan de la face gravée au-dessus de la face supérieure (épaisseur d'une collerette) */
  topLift?: number;
}

const TAU = Math.PI * 2;
/** Nombre de segments d'un cercle : proportionnel au rayon, pour ne pas gaspiller sur les petits. */
const cseg = (r: number) => Math.max(16, Math.min(48, Math.round(r * 40)));

// Fût usiné d'un seul tenant, découpé en 5 étages qui s'écartent à l'ouverture.
// Les rayons ne varient que de quelques pour cent d'un étage à l'autre (aucun étage n'est plus de
// 15 % plus étroit que son voisin) : la silhouette est droite, c'est la GRAVURE du flanc qui porte
// la richesse, pas le diamètre. Hauteurs et `y` inchangés → hauteur totale et cadrage identiques.
const RING_SPECS: RingSpec[] = [
  { r: 0.96, h: 0.46, y: -1.24 }, // R1, embase
  { r: 1.0, h: 0.42, y: -0.76 }, // R2
  { r: 1.04, h: 0.46, y: -0.28 }, // R3, section médiane (collerettes débordantes)
  { r: 1.0, h: 0.42, y: 0.2 }, // R4
  { r: 0.88, h: 0.28, y: 0.6 }, // R5, tête
];
// Un jeu de paramètres par étage. Sur un fût droit la face supérieure d'un étage est masquée par
// l'étage du dessus : tout le détail part sur le FLANC (rainures, graduations, moletage, vis,
// plaques). Seules deux faces restent visibles et gravées : la tête (R5) et la collerette de R3.
// Les valeurs changent d'un étage à l'autre pour éviter la répétition mécanique parfaite.
const RING_DETAILS: TierDetail[] = [
  // R1 — embase.
  {
    grooves: [-0.4, 0.4],
    grad: 36,
    gradY: -0.02,
    gradLen: 0.05,
    knurl: { count: 40, y0: 0.1, y1: 0.34 },
    flankBolts: { count: 12, y: -0.3, r: 0.026, phase: 0.1 },
    plates: [
      [0.55, 0.19, 0.1],
      [3.6, 0.15, 0.085],
    ],
    engraved: [0.78, 0.52],
    topCrown: { count: 28, r0: 0.84, r1: 0.94 },
  },
  // R2 — bande moletée.
  {
    grooves: [-0.4, 0.18, 0.4],
    grad: 34,
    gradY: 0.24,
    gradLen: 0.05,
    knurl: { count: 48, y0: -0.22, y1: 0.06 },
    plates: [[2.1, 0.14, 0.11]],
    engraved: [0.82, 0.55],
    topCrown: { count: 32, r0: 0.88, r1: 0.98 },
  },
  // R3 — section médiane : deux collerettes débordantes, crans sur la collerette haute.
  {
    grooves: [-0.4, 0, 0.4],
    grad: 38,
    gradY: -0.26,
    gradLen: 0.055,
    flankBolts: { count: 10, y: 0.16, r: 0.028, phase: 0.2 },
    plates: [
      [1.15, 0.22, 0.115],
      [4.4, 0.18, 0.1],
    ],
    teeth: { count: 36, depth: 0.075, r: 1.1 },
    engraved: [0.88, 0.6],
    topLift: 0.039,
  },
  // R4.
  {
    grooves: [-0.4, 0.4],
    grad: 32,
    gradY: 0.16,
    gradLen: 0.055,
    flankBolts: { count: 14, y: -0.24, r: 0.024, phase: 0 },
    plates: [[5.0, 0.15, 0.095]],
    engraved: [0.82, 0.55],
    topCrown: { count: 24, r0: 0.88, r1: 0.98 },
  },
  // R5 — tête : la seule face supérieure entièrement visible, c'est le cadran de l'objet.
  {
    grooves: [-0.34, 0.3],
    grad: 24,
    gradY: -0.1,
    gradLen: 0.045,
    plates: [],
    teeth: { count: 24, depth: 0.09, r: 0.88 },
    engraved: [0.8, 0.7, 0.56, 0.36],
    topBolts: { count: 8, ring: 0.66, r: 0.026 },
  },
];
const RING_CENTER_INDEX = 2;
// Écart avec le brief (0.42) : à 0.42 la caméra (fixe, en plongée oblique) voit l'anneau du dessus
// (R4) masquer le cœur même à `open` = 1, quelle que soit sa taille raisonnable — l'anneau central
// (R3) ne bougeant jamais, aucune valeur de open ne change l'angle de vue. 0.52 dégage assez pour
// qu'une bonne partie du cœur (réduit, cf. plus bas) passe devant R4 côté caméra.
const RING_OPEN_STEP = 0.52;
/** décalage de départ d'une pièce verte à la suivante : la sortie ne part pas d'un bloc */
const MODULE_STAGGER = 0.04;
// Les deux pièces les plus petites (barillet d'objectif, membrane) sont dessinées à l'échelle 1
// puis agrandies : à l'échelle 1 elles tombaient sous les 60 px de large à l'écran, le plancher de
// lisibilité fixé par le brief. Les ancres de légende sont divisées par le même facteur, donc
// inchangées dans le monde ; les deux pièces restent logées dans le fût à l'état fermé.
const PERCEIVE_SCALE = 1.28;
const REPLY_SCALE = 1.32;
const RING_BOTTOM = RING_SPECS[0].y - RING_SPECS[0].h / 2;

export function createAgentScene(canvas: HTMLCanvasElement): AgentScene {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  camera.position.set(8, 5.2, 10);
  camera.lookAt(0, 0, 0);
  // La caméra ne bouge jamais après ce point : on fige sa matrice de vue tout de suite.
  // Sans ça, le tout premier appel à render() (le seul appel en mouvement réduit, qui ne boucle pas
  // en rAF) projetterait les ancres avec une matrice de vue identité, plaçant les légendes n'importe où.
  camera.updateMatrixWorld();

  const disposables: Array<{ dispose(): void }> = [];
  const track = <T extends { dispose(): void }>(x: T): T => {
    disposables.push(x);
    return x;
  };
  /** traits concernés par le tracé initial */
  const drawn: LineSegments[] = [];
  const fill = track(
    new MeshBasicMaterial({ color: BG, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
  );
  /**
   * Quand il est non nul, tout matériau créé y est enregistré avec son opacité nominale : c'est
   * ainsi qu'on collecte les matériaux verts d'une pièce pour les faire apparaître à l'ouverture.
   */
  let collect: Array<{ mat: LineBasicMaterial; base: number }> | null = null;
  const lineMat = (color: number, opacity: number) => {
    const m = track(new LineBasicMaterial({ color, transparent: true, opacity }));
    collect?.push({ mat: m, base: opacity });
    return m;
  };

  /** Volume plein (masque les traits cachés) + ses arêtes. */
  function solid(geo: BufferGeometry, color = WHITE, opacity = 0.9, threshold = 20): Group {
    const g = new Group();
    g.add(new Mesh(track(geo), fill));
    const l = new LineSegments(track(new EdgesGeometry(geo, threshold)), lineMat(color, opacity));
    g.add(l);
    drawn.push(l);
    return g;
  }
  /** Traits partageant un matériau déjà créé (les gravures, regroupées par niveau de gris). */
  function segsWith(points: Vector3[], material: LineBasicMaterial): LineSegments {
    const l = new LineSegments(track(new BufferGeometry().setFromPoints(points)), material);
    drawn.push(l);
    return l;
  }
  function segs(points: Vector3[], color = WHITE, opacity = 0.6): LineSegments {
    return segsWith(points, lineMat(color, opacity));
  }
  /** Volume plein SANS arêtes : ne sert qu'à masquer ce qui passe derrière (silhouette dessinée à la main). */
  const blank = (geo: BufferGeometry) => new Mesh(track(geo), fill);
  /**
   * Étage tourné d'une pièce, coaxial à +Z : c'est la brique des bagues de barillet et des pavillons.
   * Deux arêtes circulaires seulement (seuil 30° → pas de génératrice tant que n ≥ 12).
   */
  function stageZ(r: number, z0: number, z1: number, n: number, opacity = 0.95): Group {
    const s = solid(new CylinderGeometry(r, r, Math.abs(z1 - z0), n), GREEN, opacity, 30);
    s.rotation.x = Math.PI / 2;
    s.position.z = (z0 + z1) / 2;
    return s;
  }
  /** Même chose, coaxial à X : corps et tige du vérin. */
  function stageX(r: number, x0: number, x1: number, n: number, opacity = 0.95): Group {
    const s = solid(new CylinderGeometry(r, r, Math.abs(x1 - x0), n), GREEN, opacity, 30);
    s.rotation.z = Math.PI / 2;
    s.position.x = (x0 + x1) / 2;
    return s;
  }
  /** Couronne de vis à plat sur une face (plan 'xy' ou 'xz'), tête + fente. */
  function boltRing(
    count: number,
    ring: number,
    r: number,
    plane: Plane,
    c: [number, number, number],
    phase = 0,
  ): Vector3[] {
    const pts: Vector3[] = [];
    for (let k = 0; k < count; k++) {
      const a = (k / count) * TAU + phase;
      const u = Math.cos(a) * ring;
      const v = Math.sin(a) * ring;
      const cc: [number, number, number] =
        plane === 'xy' ? [c[0] + u, c[1] + v, c[2]] : plane === 'xz' ? [c[0] + u, c[1], c[2] + v] : [c[0], c[1] + u, c[2] + v];
      pts.push(...circlePts(r, 5, plane, cc));
    }
    return pts;
  }

  const root = new Group();
  scene.add(root);

  // ── Pile d'anneaux mécaniques : s'écartent le long de Y pour révéler le cœur ──
  const rings: Group[] = RING_SPECS.map((spec) => {
    const g = new Group();
    g.position.set(0, spec.y, 0);
    g.add(solid(new CylinderGeometry(spec.r, spec.r, spec.h, 48), WHITE, 0.95, 30));
    root.add(g);
    return g;
  });

  // ── Volumes secondaires : les seuls décrochements du fût (quelques pour cent de rayon) ──
  // (enfants des étages : ils suivent l'écartement, aucun index d'étage n'est ajouté)
  {
    const plinth = solid(new CylinderGeometry(1.0, 1.0, 0.07, 40), WHITE, 0.85, 30);
    plinth.position.y = -RING_SPECS[0].h / 2 - 0.035;
    rings[0].add(plinth);
    for (const s of [-1, 1]) {
      const lip = solid(new CylinderGeometry(1.1, 1.1, 0.035, 44), WHITE, 0.8, 30);
      lip.position.y = s * (RING_SPECS[2].h / 2 + 0.017);
      rings[2].add(lip);
    }
    const collar = solid(new CylinderGeometry(0.92, 0.92, 0.05, 36), WHITE, 0.8, 30);
    collar.position.y = -RING_SPECS[4].h / 2 - 0.025;
    rings[4].add(collar);
  }

  // ── Gravures : sur un fût droit, l'essentiel se joue sur le flanc. Tous les traits d'un étage
  // sont fusionnés en trois LineSegments (un par niveau de gris) pour limiter les appels de rendu.
  const engraveStrong = lineMat(WHITE, 0.58);
  const engraveMid = lineMat(WHITE, 0.4);
  const engraveFaint = lineMat(WHITE, 0.26);
  for (let i = 0; i < rings.length; i++) {
    const spec = RING_SPECS[i];
    const d = RING_DETAILS[i];
    const rim = spec.r + 0.004;
    const strong: Vector3[] = [];
    const mid: Vector3[] = [];
    const faint: Vector3[] = [];

    // Rainures tournées. Celles posées près des arêtes (±0.4) font office de gorge de jointure :
    // sur un fût droit, c'est elle qui marque la séparation des étages, pas un décrochement.
    for (const f of d.grooves) mid.push(...circlePts(rim, cseg(spec.r), 'xz', [0, f * spec.h, 0]));

    // Graduations fines (longueurs alternées, repère long tous les cinq).
    for (let k = 0; k < d.grad; k++) {
      const a = (k / d.grad) * TAU;
      const len = d.gradLen * (k % 5 === 0 ? 1 : k % 5 === 2 ? 0.62 : 0.36);
      const gx = Math.cos(a) * rim;
      const gz = Math.sin(a) * rim;
      const y = d.gradY * spec.h;
      faint.push(V(gx, y, gz), V(gx, y + len, gz));
    }

    // Bande moletée : traits verticaux serrés sur tout le pourtour.
    if (d.knurl) {
      const { count, y0, y1 } = d.knurl;
      for (let k = 0; k < count; k++) {
        const a = (k / count) * TAU;
        const kx = Math.cos(a) * rim;
        const kz = Math.sin(a) * rim;
        faint.push(V(kx, y0 * spec.h, kz), V(kx, y1 * spec.h, kz));
      }
    }

    // Couronne de vis vissées dans le flanc (tête + fente de serrage).
    if (d.flankBolts) {
      const b = d.flankBolts;
      const head = circlePts(b.r, 8, 'xy', [0, 0, 0.002]);
      const slot = [V(-b.r * 0.72, 0, 0.004), V(b.r * 0.72, 0, 0.004)];
      for (let k = 0; k < b.count; k++) {
        const a = (k / b.count) * TAU + b.phase;
        mid.push(...onFlank(a, b.y * spec.h, rim, head), ...onFlank(a, b.y * spec.h, rim, slot));
      }
    }

    // Plaques vissées : contour, contour intérieur, 4 vis, trait de séparation.
    for (const [a, pw, ph] of d.plates) {
      const pts = rectPts(-pw, -ph, pw, ph, 0.002);
      pts.push(...rectPts(-pw + 0.022, -ph + 0.022, pw - 0.022, ph - 0.022, 0.002));
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          pts.push(...circlePts(0.019, 6, 'xy', [sx * (pw - 0.048), sy * (ph - 0.045), 0.004]));
        }
      }
      pts.push(V(-pw + 0.022, ph - 0.062, 0.002), V(pw - 0.022, ph - 0.062, 0.002));
      strong.push(...onFlank(a, 0, rim, pts));
    }

    // Faces supérieures : seules la tête et la collerette haute de R3 en laissent voir une.
    const top = spec.h / 2 + (d.topLift ?? 0) + 0.004;
    if (d.teeth) {
      const t = d.teeth;
      const ro = t.r + 0.004;
      const ri = ro - t.depth;
      for (let k = 0; k < t.count; k++) {
        const a0 = (k / t.count) * TAU;
        const a1 = a0 + (TAU / t.count) * 0.46;
        const p = (a: number, r: number) => V(Math.cos(a) * r, top, Math.sin(a) * r);
        strong.push(p(a0, ri), p(a0, ro), p(a0, ro), p(a1, ro), p(a1, ro), p(a1, ri));
      }
    }
    for (const r of d.engraved ?? []) faint.push(...circlePts(r, cseg(r), 'xz', [0, top, 0]));
    if (d.topCrown) {
      const c = d.topCrown;
      for (let k = 0; k < c.count; k++) {
        const a = (k / c.count) * TAU;
        const r0 = k % 4 === 0 ? c.r0 : c.r0 + (c.r1 - c.r0) * 0.45;
        mid.push(V(Math.cos(a) * r0, top, Math.sin(a) * r0), V(Math.cos(a) * c.r1, top, Math.sin(a) * c.r1));
      }
    }
    if (d.topBolts) {
      const b = d.topBolts;
      for (let k = 0; k < b.count; k++) {
        const a = (k / b.count) * TAU + 0.13;
        const bx = Math.cos(a) * b.ring;
        const bz = Math.sin(a) * b.ring;
        mid.push(...circlePts(b.r, 8, 'xz', [bx, top + 0.002, bz]));
        mid.push(V(bx - b.r * 0.72, top + 0.002, bz), V(bx + b.r * 0.72, top + 0.002, bz));
      }
    }

    if (strong.length) rings[i].add(segsWith(strong, engraveStrong));
    if (mid.length) rings[i].add(segsWith(mid, engraveMid));
    if (faint.length) rings[i].add(segsWith(faint, engraveFaint));
  }

  // ── Filet vert aux jointures : la seule trace de couleur à l'état fermé, on devine
  // qu'il y a quelque chose à l'intérieur (brief : opacité ≤ 0.35).
  const seamMat = lineMat(GREEN, 0.3);
  for (let i = 1; i < rings.length; i++) {
    const spec = RING_SPECS[i];
    rings[i].add(segsWith(circlePts(spec.r + 0.01, cseg(spec.r), 'xz', [0, -spec.h / 2 - 0.012, 0]), seamMat));
  }

  // ── Cœur vert (visible quand les anneaux s'écartent) ──
  // Avec la bascule, la vue devient plongeante : un cœur resté sur l'axe central est masqué PAR LE
  // DESSUS par l'étage supérieur (R4), quelle que soit sa taille — la ligne de vue entre dans
  // l'écart R3/R4 et ressort sous R4 avant d'atteindre l'axe. Il est donc décalé à ~0.8 du centre,
  // du côté qui fait face à la caméra une fois la rotation Y de la séquence appliquée (≈0.3 rad),
  // et légèrement vers la gauche de l'écran pour que sa légende (colonne de gauche) ne traverse pas
  // tout l'objet. Il reste dans l'enveloppe du fût, donc invisible tant que rien n'est ouvert.
  const coreMats = [lineMat(GREEN, 0), lineMat(GREEN, 0)];
  const core = new Group();
  core.position.set(-0.28, 0.22, 0.74);
  core.add(new LineSegments(track(new EdgesGeometry(track(new IcosahedronGeometry(0.3, 0)))), coreMats[0]));
  core.add(new LineSegments(track(new EdgesGeometry(track(new OctahedronGeometry(0.14, 0)))), coreMats[1]));
  root.add(core);

  // ── Câbles fixes sous l'objet ──
  const cables: Array<[number, number, number, number]> = [
    [0.3, -0.3, 1.6, -1.8],
    [-0.2, -0.4, -1.2, -2.2],
    [0.6, 0.1, 2.4, -0.4],
  ];
  for (const [x, z, ex, ez] of cables) {
    const pts = new CatmullRomCurve3([
      V(x, RING_BOTTOM, z),
      V(x + (ex - x) * 0.2, RING_BOTTOM - 0.8, z + (ez - z) * 0.2),
      V(ex, RING_BOTTOM - 1.6, ez),
    ]).getPoints(18);
    const pairs: Vector3[] = [];
    for (let i = 0; i < pts.length - 1; i++) pairs.push(pts[i], pts[i + 1]);
    root.add(segs(pairs, WHITE, 0.22));
  }

  // ── Modules : chacun est une capacité de l'agent ──
  const modules: Module[] = [];
  /**
   * `group.position` porte ici la position de la pièce POSÉE sur le flanc, et `dir` le trajet
   * qu'elle parcourait depuis ce point : leur somme est la position éclatée finale, qui ne change
   * pas. `hidden` est la nouvelle position de repos, À L'INTÉRIEUR de l'empilement : la pièce part
   * de là et rejoint la même position éclatée.
   */
  function addModule(
    id: Module['id'],
    group: Group,
    dir: [number, number, number],
    ring: number,
    socketPts: Vector3[],
    socketCenter: Vector3,
    anchor: Vector3,
    hidden: [number, number, number],
  ) {
    const exploded = group.position.clone().add(V(...dir));
    const rest = V(...hidden);
    group.position.copy(rest);
    const greenMats = collect ?? [];
    collect = null;
    group.visible = false; // état fermé : aucune pièce verte, ni trait ni volume noir occultant
    root.add(group);
    const socketMat = lineMat(GREEN, 0);
    const socket = new LineSegments(track(new BufferGeometry().setFromPoints(socketPts)), socketMat);
    // socketPts est donné en coordonnées de `root` ; l'étage porte déjà son propre y, on le retranche
    // (sans ça la collerette d'accroche flottait à `RING_SPECS[ring].y` au-dessus de sa pièce).
    socket.position.y = -RING_SPECS[ring].y;
    rings[ring].add(socket);
    const tetherMat = track(
      new LineDashedMaterial({ color: GREEN, dashSize: 0.06, gapSize: 0.05, transparent: true, opacity: 0 }),
    );
    const tether = new Line(track(new BufferGeometry().setFromPoints([V(0, 0, 0), V(0, 0, 0)])), tetherMat);
    root.add(tether);
    modules.push({
      id,
      group,
      rest,
      dir: exploded.sub(rest),
      ring,
      socketCenter,
      anchor,
      socketMat,
      tether,
      tetherMat,
      greenMats,
    });
  }

  // Capteur — barillet d'objectif sur R4, posé devant.
  // Collerette arrière boulonnée → deux bagues de diamètres décroissants (l'une moletée) → lentille.
  {
    collect = []; // tout le vert créé ici appartient à cette pièce
    const r4 = RING_SPECS[3];
    const gx = -0.28;
    const gy = r4.y;
    const gz = r4.r;
    const g = new Group();
    g.position.set(gx, gy, gz);
    // À l'échelle 1 le barillet ne faisait que ~50 px de large à l'écran, sous le seuil de
    // lisibilité du brief (60–120 px) : on l'agrandit d'un cinquième. L'ancre de légende est
    // divisée par la même valeur pour rester au même point dans le monde.
    g.scale.setScalar(PERCEIVE_SCALE);
    // Collerette arrière : elle déborde largement du corps, pour que son annulaire avant reste
    // lisible de trois quarts et porte un vrai cercle de vis (0.25 → 0.17 : 0.08 d'annulaire).
    g.add(stageZ(0.25, 0, 0.055, 14));
    g.add(segs(boltRing(6, 0.212, 0.026, 'xy', [0, 0, 0.058], 0.3), GREEN, 0.75));
    // Bague principale, puis bague moletée (crans radiaux), puis bague de tête.
    g.add(stageZ(0.172, 0.055, 0.21, 14));
    g.add(stageZ(0.152, 0.21, 0.32, 14));
    const knurl: Vector3[] = [];
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * TAU;
      const kx = Math.cos(a) * 0.155;
      const ky = Math.sin(a) * 0.155;
      knurl.push(V(kx, ky, 0.222), V(kx, ky, 0.308));
    }
    g.add(segs(knurl, GREEN, 0.6));
    g.add(stageZ(0.125, 0.32, 0.44, 12));
    // Lentille : trois cercles concentriques + un éclat oblique.
    const lens = [
      ...circlePts(0.102, 12, 'xy', [0, 0, 0.446]),
      ...circlePts(0.072, 10, 'xy', [0, 0, 0.448]),
      ...circlePts(0.04, 8, 'xy', [0, 0, 0.45]),
    ];
    lens.push(V(-0.072, 0.042, 0.452), V(-0.028, 0.08, 0.452));
    g.add(segs(lens, GREEN, 0.8));
    addModule(
      'perceive',
      g,
      [-0.2, 0.15, 1.9],
      3,
      circlePts(0.25 * PERCEIVE_SCALE, 14, 'xy', [gx, gy, gz + 0.004]),
      V(gx, gy, gz + 0.004),
      V(0, 0.25 / PERCEIVE_SCALE, 0.2 / PERCEIVE_SCALE),
      [-0.1, r4.y, 0.08], // logé derrière le flanc de R4
    );
  }
  // Agir — vérin articulé sur R3 (central), flanc gauche.
  // Embase boulonnée → corps nervuré → tige coaxiale sortie → chape percée + axe traversant.
  {
    collect = []; // tout le vert créé ici appartient à cette pièce
    const r3 = RING_SPECS[2];
    const gx = -r3.r;
    const gy = r3.y;
    const gz = 0.1;
    const g = new Group();
    g.position.set(gx, gy, gz);
    // Embase : elle déborde du corps, ses vis sont sur la face tournée vers le fût (donc vers l'œil).
    g.add(stageX(0.195, 0, -0.06, 14));
    g.add(segs(boltRing(6, 0.158, 0.022, 'yz', [0.006, 0, 0], 0.5), GREEN, 0.75));
    // Corps du vérin : deux rainures tournées + six nervures longitudinales.
    g.add(stageX(0.145, -0.06, -0.58, 14));
    const body: Vector3[] = [];
    for (const x of [-0.17, -0.45]) body.push(...circlePts(0.149, 12, 'yz', [x, 0, 0]));
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * TAU;
      const ry = Math.sin(a) * 0.147;
      const rz = Math.cos(a) * 0.147;
      body.push(V(-0.075, ry, rz), V(-0.565, ry, rz));
    }
    g.add(segs(body, GREEN, 0.55));
    // Tige : second cylindre coaxial, plus fin, avec sa gorge de fin de course.
    g.add(stageX(0.062, -0.58, -1.02, 12));
    g.add(segs(circlePts(0.066, 10, 'yz', [-0.955, 0, 0]), GREEN, 0.6));
    // Chape : deux joues percées de part et d'autre, traversées par un axe.
    for (const s of [-1, 1]) {
      const cheek = solid(new BoxGeometry(0.22, 0.19, 0.035), GREEN, 0.9);
      cheek.position.set(-1.1, 0, s * 0.082);
      g.add(cheek);
    }
    const clevis = circlePts(0.052, 10, 'xy', [-1.1, 0, 0.102]);
    clevis.push(...circlePts(0.032, 6, 'xy', [-1.1, 0, 0.128]));
    clevis.push(V(-1.1, -0.03, 0.13), V(-1.1, 0.03, 0.13));
    g.add(segs(clevis, GREEN, 0.8));
    addModule(
      'act',
      g,
      [-1.7, 0.1, 0.3],
      2,
      circlePts(0.215, 14, 'yz', [gx - 0.004, gy, gz]),
      V(gx - 0.004, gy, gz),
      V(-0.6, 0.2, 0),
      [0.46, r3.y, 0], // vérin rentré dans le fût, décalé pour que sa longueur y tienne
    );
  }
  // Rendre compte — plaque à cadran sur R4, flanc droit.
  // Plaque à coins coupés boulonnée aux 4 angles : cadran gradué + aiguille, lignes de repères,
  // et la barre de valeurs d'avant, désormais alignée sur une grille.
  {
    collect = []; // tout le vert créé ici appartient à cette pièce
    const r4 = RING_SPECS[3];
    const gx = r4.r;
    const gy = r4.y;
    const gz = 0.15;
    const g = new Group();
    g.position.set(gx, gy, gz);
    // Bras de support : cylindre usiné + sa bague d'arrêt.
    const mount = solid(new CylinderGeometry(0.052, 0.052, 0.5, 12), GREEN, 0.8, 30);
    mount.rotation.z = Math.PI / 2;
    mount.position.x = 0.25;
    g.add(mount);
    g.add(segs(circlePts(0.078, 10, 'yz', [0.14, 0, 0]), GREEN, 0.6));
    const plate = new Group();
    plate.position.x = 0.8;
    plate.rotation.y = 0.35;
    g.add(plate);
    const hw = 0.5;
    const hh = 0.64;
    // Le volume plein ne sert qu'à masquer ce qui passe derrière : la silhouette (coins coupés)
    // est tracée à la main, un BoxGeometry ne sait pas la donner.
    plate.add(blank(new BoxGeometry(hw * 2 - 0.02, hh * 2 - 0.02, 0.05)));
    const pz = 0.031;
    /** contour rectangulaire à coins coupés */
    const chamfered = (w: number, h: number, c: number): Vector3[] => {
      const corners = [
        V(-w + c, -h, pz), V(w - c, -h, pz), V(w, -h + c, pz), V(w, h - c, pz),
        V(w - c, h, pz), V(-w + c, h, pz), V(-w, h - c, pz), V(-w, -h + c, pz),
      ];
      const out: Vector3[] = [];
      for (let k = 0; k < corners.length; k++) out.push(corners[k], corners[(k + 1) % corners.length]);
      return out;
    };
    const face = [...chamfered(hw, hh, 0.14), ...chamfered(hw - 0.05, hh - 0.05, 0.105)];
    // Quatre boulons d'angle, tête fendue.
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        const bx = sx * (hw - 0.105);
        const by = sy * (hh - 0.105);
        face.push(...circlePts(0.032, 6, 'xy', [bx, by, pz + 0.002]));
        face.push(V(bx - 0.023, by + 0.023, pz + 0.003), V(bx + 0.023, by - 0.023, pz + 0.003));
      }
    }
    // Cadran gravé : arc gradué de 220°, aiguille fine, moyeu.
    const cy = 0.24;
    const a0 = Math.PI * 1.11;
    const a1 = -Math.PI * 0.11;
    const arcPt = (t: number, r: number) => {
      const a = a0 + (a1 - a0) * t;
      return V(Math.cos(a) * r, cy + Math.sin(a) * r, pz);
    };
    for (let k = 0; k < 14; k++) face.push(arcPt(k / 14, 0.3), arcPt((k + 1) / 14, 0.3));
    for (let k = 0; k < 10; k++) face.push(arcPt(k / 10, 0.245), arcPt((k + 1) / 10, 0.245));
    for (let k = 0; k <= 10; k++) face.push(arcPt(k / 10, 0.245), arcPt(k / 10, k % 5 === 0 ? 0.19 : 0.288));
    face.push(V(0, cy, pz + 0.002), arcPt(0.7, 0.272));
    face.push(...circlePts(0.036, 6, 'xy', [0, cy, pz + 0.003]));
    // Trois lignes de repères sous le cadran, alignées à gauche sur la même marge.
    [-0.09, -0.17, -0.25].forEach((y, i) => {
      face.push(V(-0.34, y, pz), V(-0.34 + [0.56, 0.4, 0.49][i], y, pz));
      face.push(V(-0.385, y, pz), V(-0.36, y, pz));
    });
    // Barre de valeurs : six barres sur une grille de deux lignes.
    const b0 = -0.47;
    face.push(V(-0.36, b0, pz), V(0.36, b0, pz));
    face.push(V(-0.36, b0 + 0.13, pz), V(0.36, b0 + 0.13, pz));
    [0.06, 0.13, 0.1, 0.19, 0.16, 0.23].forEach((h, i) => {
      const x = -0.29 + i * 0.116;
      face.push(V(x, b0, pz), V(x, b0 + h, pz));
    });
    plate.add(segs(face, GREEN, 0.85));
    addModule(
      'report',
      g,
      [1.5, 0.35, 0.2],
      3,
      circlePts(0.1, 14, 'yz', [gx + 0.004, gy, gz]),
      V(gx + 0.004, gy, gz),
      V(1.15, 0.7, 0.2),
      [-0.38, r4.y - 0.12, -0.08], // plaque rangée à plat dans la colonne
    );
  }
  // Se connecter — couronne d'accouplement sur R5, posée dessus.
  // Plateau tourné + rainure de guidage, couronne de 10 embouts cylindriques, tige filetée.
  {
    collect = []; // tout le vert créé ici appartient à cette pièce
    const r5 = RING_SPECS[4];
    const gx = 0;
    const gy = r5.y + r5.h / 2;
    const gz = 0;
    const g = new Group();
    g.position.set(gx, gy, gz);
    const disc = solid(new CylinderGeometry(0.48, 0.48, 0.11, 16), GREEN, 0.95, 30);
    disc.position.y = 0.055;
    g.add(disc);
    const topFace = 0.113;
    // Rainure de guidage : deux cercles rapprochés sur la face du plateau.
    g.add(
      segs(
        [...circlePts(0.43, 14, 'xz', [0, topFace, 0]), ...circlePts(0.4, 14, 'xz', [0, topFace, 0])],
        GREEN,
        0.55,
      ),
    );
    // Embouts : volume plein (masquage) + cercle de tête et deux génératrices tangentes.
    // Vus de dessus (la bascule met le plateau presque à plat), ils doivent être assez hauts
    // pour que leur paroi se lise — sinon il ne reste qu'une couronne de pastilles.
    const ports: Vector3[] = [];
    const portTop = 0.3;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU + 0.12;
      const px = Math.cos(a) * 0.33;
      const pz = Math.sin(a) * 0.33;
      const fillPort = blank(new CylinderGeometry(0.052, 0.052, portTop - 0.1, 8));
      fillPort.position.set(px, (portTop + 0.1) / 2, pz);
      g.add(fillPort);
      ports.push(...circlePts(0.052, 7, 'xz', [px, portTop, pz]));
      const ox = -Math.sin(a) * 0.052;
      const oz = Math.cos(a) * 0.052;
      ports.push(V(px + ox, 0.105, pz + oz), V(px + ox, portTop, pz + oz));
      ports.push(V(px - ox, 0.105, pz - oz), V(px - ox, portTop, pz - oz));
    }
    g.add(segs(ports, GREEN, 0.85));
    // Tige filetée : en vue plongeante un filet en travers est sous le pixel — le pas est donc
    // dessiné comme une pile de bagues régulières, qui se lit encore vue de dessus.
    const rodX = 0.17;
    const rodZ = -0.09;
    const rodTop = 0.66;
    const rodR = 0.036;
    const rodFill = blank(new CylinderGeometry(rodR, rodR, rodTop - 0.11, 8));
    rodFill.position.set(rodX, (rodTop + 0.11) / 2, rodZ);
    g.add(rodFill);
    const rod: Vector3[] = [
      V(rodX - rodR, 0.11, rodZ), V(rodX - rodR, rodTop, rodZ),
      V(rodX + rodR, 0.11, rodZ), V(rodX + rodR, rodTop, rodZ),
    ];
    for (let k = 0; k < 6; k++) rod.push(...circlePts(rodR, 6, 'xz', [rodX, 0.17 + k * 0.083, rodZ]));
    // Embout : petite bague de plus grand diamètre au sommet.
    rod.push(...circlePts(0.058, 8, 'xz', [rodX, rodTop + 0.06, rodZ]));
    rod.push(V(rodX - 0.058, rodTop, rodZ), V(rodX - 0.058, rodTop + 0.06, rodZ));
    rod.push(V(rodX + 0.058, rodTop, rodZ), V(rodX + 0.058, rodTop + 0.06, rodZ));
    g.add(segs(rod, GREEN, 0.75));
    addModule(
      'connect',
      g,
      [0, 1.15, 0],
      4,
      circlePts(0.48, 18, 'xz', [gx, gy + 0.004, gz]),
      V(gx, gy + 0.004, gz),
      V(0, 0.26, 0),
      [0, 0.02, 0], // couronne rentrée dans la colonne, tige comprise
    );
  }
  // Répondre — membrane annelée sur R1, devant.
  // Bague de serrage vissée, puis pavillon en trois anneaux de rayons décroissants (vraie
  // profondeur, chacun est un volume), enfin la grille de fentes radiales sur la membrane.
  {
    collect = []; // tout le vert créé ici appartient à cette pièce
    const r1 = RING_SPECS[0];
    const gx = 0.3;
    const gy = r1.y;
    const gz = r1.r;
    const g = new Group();
    g.position.set(gx, gy, gz);
    // Même correction d'échelle que le barillet (cf. `PERCEIVE_SCALE`) : c'est la plus petite
    // pièce à l'écran, elle passait sous les 60 px du brief.
    g.scale.setScalar(REPLY_SCALE);
    // Bague de serrage : large annulaire (0.26 → 0.19) pour que son cercle de vis se lise.
    g.add(stageZ(0.26, 0, 0.07, 14));
    g.add(segs(boltRing(8, 0.226, 0.022, 'xy', [0, 0, 0.073], 0.2), GREEN, 0.7));
    // Pavillon : trois anneaux de rayon décroissant, chacun avec sa propre profondeur —
    // les marches doivent être franches, sinon l'ensemble s'écrase en dôme vu de trois quarts.
    g.add(stageZ(0.192, 0.07, 0.17, 14));
    g.add(stageZ(0.142, 0.17, 0.25, 12));
    g.add(stageZ(0.094, 0.25, 0.31, 12));
    const grille: Vector3[] = [];
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * TAU;
      grille.push(V(Math.cos(a) * 0.026, Math.sin(a) * 0.026, 0.313), V(Math.cos(a) * 0.085, Math.sin(a) * 0.085, 0.313));
    }
    grille.push(...circlePts(0.026, 8, 'xy', [0, 0, 0.314]));
    g.add(segs(grille, GREEN, 0.65));
    addModule(
      'reply',
      g,
      [0.5, -0.35, 1.3],
      0,
      circlePts(0.26 * REPLY_SCALE, 14, 'xy', [gx, gy, gz + 0.004]),
      V(gx, gy, gz + 0.004),
      V(0, -0.08 / REPLY_SCALE, 0.08 / REPLY_SCALE),
      [0.22, r1.y, 0.1], // membrane logée derrière le flanc de l'embase
    );
  }

  for (const l of drawn) l.userData.count = l.geometry.attributes.position.count;

  let vw = 1;
  let vh = 1;
  const tmp = new Vector3();
  const project = (id: PartId, v: Vector3): ScreenAnchor => {
    v.project(camera);
    return { id, x: ((v.x + 1) / 2) * vw, y: ((1 - v.y) / 2) * vh };
  };

  return {
    resize(width, height, opts) {
      vw = Math.max(1, width);
      vh = Math.max(1, height);
      renderer.setSize(vw, vh, false);
      const aspect = vw / vh;
      // Assez de champ pour la vue éclatée, en paysage comme en portrait, borné par la largeur
      // utilisable entre les colonnes de légendes (reservedSide de chaque côté) pour qu'aucune
      // légende ne recouvre l'objet.
      const reservedSide = opts?.reservedSide ?? 0;
      const usable = Math.max(240, vw - 2 * reservedSide);
      const half = Math.max(4.6, 4.4 / aspect, (4 * vh) / usable);
      camera.left = -half * aspect;
      camera.right = half * aspect;
      camera.top = half;
      camera.bottom = -half;
      camera.updateProjectionMatrix();
    },

    render({ explode, open, rotation, time, draw }) {
      root.rotation.y = rotation + Math.sin(time / 2600) * 0.02;
      // Bascule : vue de face → trois quarts plongeante, on découvre les faces supérieures.
      // Elle suit `open` (et non `explode`) pour accompagner l'écartement des étages.
      root.rotation.x = -0.05 + open * 0.55;
      root.position.y = -0.1 - explode * 0.4 + Math.sin(time / 1800) * 0.04;

      for (let i = 0; i < rings.length; i++) {
        const shift = (i - RING_CENTER_INDEX) * RING_OPEN_STEP * open;
        rings[i].position.y = RING_SPECS[i].y + shift;
      }
      core.rotation.y = time / 4000;
      coreMats[0].opacity = open * 0.95;
      coreMats[1].opacity = open * 0.6;

      for (const l of drawn) l.geometry.setDrawRange(0, Math.floor((l.userData.count * draw) / 2) * 2);

      // Les pièces vertes partent de l'intérieur de l'empilement et sortent une par une :
      // chacune démarre `MODULE_STAGGER` plus tard que la précédente, et n'apparaît que sur les
      // 25 premiers % de son trajet (avant, le volume plein noir occulterait les gravures).
      const span = 1 - MODULE_STAGGER * (modules.length - 1);
      for (let mi = 0; mi < modules.length; mi++) {
        const m = modules[mi];
        const t = Math.max(0, Math.min(1, (explode - mi * MODULE_STAGGER) / span));
        const reveal = Math.min(1, t / 0.25);
        const shift = (m.ring - RING_CENTER_INDEX) * RING_OPEN_STEP * open;
        m.group.visible = reveal > 0.001;
        for (const { mat, base } of m.greenMats) mat.opacity = base * reveal;
        m.group.position.copy(m.rest).addScaledVector(m.dir, t);
        m.group.position.y += shift;
        m.socketMat.opacity = t * 0.9;
        const pos = m.tether.geometry.attributes.position as BufferAttribute;
        pos.setXYZ(0, m.socketCenter.x, m.socketCenter.y + shift, m.socketCenter.z);
        pos.setXYZ(1, m.group.position.x, m.group.position.y, m.group.position.z);
        pos.needsUpdate = true;
        m.tether.computeLineDistances();
        m.tetherMat.opacity = t * 0.55;
      }

      scene.updateMatrixWorld();
      const anchors = modules.map((m) => project(m.id, tmp.copy(m.anchor).applyMatrix4(m.group.matrixWorld)));
      anchors.push(project('decide', tmp.set(0, 0, 0).applyMatrix4(core.matrixWorld)));
      renderer.render(scene, camera);
      return anchors;
    },

    dispose() {
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
