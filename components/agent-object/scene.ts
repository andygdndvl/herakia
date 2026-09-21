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

  // Capteur — sur R4, posé devant.
  {
    collect = []; // tout le vert créé ici appartient à cette pièce
    const r4 = RING_SPECS[3];
    const gx = -0.28;
    const gy = r4.y;
    const gz = r4.r;
    const g = new Group();
    g.position.set(gx, gy, gz);
    const box = solid(new BoxGeometry(0.4, 0.32, 0.2), GREEN, 0.95);
    box.position.z = 0.11;
    g.add(box);
    const lens = solid(new CylinderGeometry(0.12, 0.12, 0.09, 14), GREEN, 0.95, 30);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.24;
    g.add(lens);
    g.add(segs(circlePts(0.07, 16, 'xy', [0, 0, 0.285]), GREEN, 0.8));
    g.add(segs(circlePts(0.03, 12, 'xy', [0, 0, 0.285]), GREEN, 0.8));
    addModule(
      'perceive',
      g,
      [-0.2, 0.15, 1.9],
      3,
      rectPts(gx - 0.2, gy - 0.16, gx + 0.2, gy + 0.16, gz + 0.004),
      V(gx, gy, gz + 0.004),
      V(0, 0.25, 0.2),
      [-0.1, r4.y, 0.08], // logé derrière le flanc de R4
    );
  }
  // Bras articulé — sur R3 (central), flanc gauche.
  {
    collect = []; // tout le vert créé ici appartient à cette pièce
    const r3 = RING_SPECS[2];
    const gx = -r3.r;
    const gy = r3.y;
    const gz = 0.1;
    const shoulderR = 0.16;
    const g = new Group();
    g.position.set(gx, gy, gz);
    const shoulder = solid(new CylinderGeometry(shoulderR, shoulderR, 0.18, 16), GREEN, 0.95, 30);
    shoulder.rotation.z = Math.PI / 2;
    shoulder.position.x = -0.09;
    g.add(shoulder);
    const p1 = new Group();
    p1.position.x = -0.18;
    p1.rotation.z = 0.5;
    g.add(p1);
    const upper = solid(new BoxGeometry(0.8, 0.11, 0.11), GREEN, 0.95);
    upper.position.x = -0.4;
    p1.add(upper);
    const p2 = new Group();
    p2.position.x = -0.8;
    p2.rotation.z = 0.75;
    p1.add(p2);
    const elbow = solid(new CylinderGeometry(0.1, 0.1, 0.18, 14), GREEN, 0.95, 30);
    elbow.rotation.x = Math.PI / 2;
    p2.add(elbow);
    const fore = solid(new BoxGeometry(0.62, 0.09, 0.09), GREEN, 0.95);
    fore.position.x = -0.31;
    p2.add(fore);
    for (const s of [-1, 1]) {
      const finger = solid(new BoxGeometry(0.18, 0.035, 0.08), GREEN, 0.95);
      finger.position.set(-0.7, s * 0.05, 0);
      p2.add(finger);
    }
    addModule(
      'act',
      g,
      [-1.7, 0.1, 0.3],
      2,
      circlePts(shoulderR + 0.02, 16, 'yz', [gx - 0.004, gy, gz]),
      V(gx - 0.004, gy, gz),
      V(-0.6, 0.2, 0),
      [0.46, r3.y, 0], // bras replié dans le fût, décalé pour que sa longueur y tienne
    );
  }
  // Écran flottant — sur R4, flanc droit.
  {
    collect = []; // tout le vert créé ici appartient à cette pièce
    const r4 = RING_SPECS[3];
    const gx = r4.r;
    const gy = r4.y;
    const gz = 0.15;
    const g = new Group();
    g.position.set(gx, gy, gz);
    const mount = solid(new CylinderGeometry(0.05, 0.05, 0.55, 14), GREEN, 0.8, 30);
    mount.rotation.z = Math.PI / 2;
    mount.position.x = 0.275;
    g.add(mount);
    const screen = new Group();
    screen.position.x = 0.8;
    screen.rotation.y = 0.35;
    g.add(screen);
    screen.add(solid(new BoxGeometry(1.0, 1.4, 0.05), GREEN, 0.95));
    const z = 0.03;
    const ui = rectPts(-0.42, -0.62, 0.42, 0.62, z);
    ui.push(V(-0.34, 0.5, z), V(0.05, 0.5, z));
    [0.34, 0.27, 0.19].forEach((y, i) => ui.push(V(-0.34, y, z), V(-0.34 + [0.6, 0.46, 0.53][i], y, z)));
    [0.17, 0.29, 0.23, 0.4, 0.34, 0.48].forEach((h, i) => {
      const x = -0.29 + i * 0.115;
      ui.push(V(x, -0.48, z), V(x, -0.48 + h, z));
    });
    ui.push(V(-0.34, -0.48, z), V(0.34, -0.48, z));
    screen.add(segs(ui, GREEN, 0.7));
    addModule(
      'report',
      g,
      [1.5, 0.35, 0.2],
      3,
      circlePts(0.1, 16, 'yz', [gx + 0.004, gy, gz]),
      V(gx + 0.004, gy, gz),
      V(1.15, 0.7, 0.2),
      [-0.38, r4.y - 0.12, -0.08], // plaque rangée à plat dans la colonne
    );
  }
  // Couronne de connecteurs — sur R5, posée dessus.
  {
    collect = []; // tout le vert créé ici appartient à cette pièce
    const r5 = RING_SPECS[4];
    const gx = 0;
    const gy = r5.y + r5.h / 2;
    const gz = 0;
    const g = new Group();
    g.position.set(gx, gy, gz);
    const disc = solid(new CylinderGeometry(0.5, 0.5, 0.12, 20), GREEN, 0.95, 30);
    disc.position.y = 0.06;
    g.add(disc);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const port = solid(new BoxGeometry(0.1, 0.09, 0.1), GREEN, 0.9);
      port.position.set(Math.cos(a) * 0.34, 0.16, Math.sin(a) * 0.34);
      port.rotation.y = -a;
      g.add(port);
    }
    const antenna = solid(new CylinderGeometry(0.018, 0.018, 0.65, 8), GREEN, 0.9, 30);
    antenna.position.set(0.16, 0.44, -0.08);
    g.add(antenna);
    addModule(
      'connect',
      g,
      [0, 1.15, 0],
      4,
      circlePts(0.5, 20, 'xz', [gx, gy + 0.004, gz]),
      V(gx, gy + 0.004, gz),
      V(0, 0.26, 0),
      [0, 0.02, 0], // couronne rentrée dans la colonne, antenne comprise
    );
  }
  // Haut-parleur — sur R1, devant.
  {
    collect = []; // tout le vert créé ici appartient à cette pièce
    const r1 = RING_SPECS[0];
    const gx = 0.3;
    const gy = r1.y;
    const gz = r1.r;
    const g = new Group();
    g.position.set(gx, gy, gz);
    const speaker = solid(new CylinderGeometry(0.18, 0.18, 0.08, 16), GREEN, 0.95, 30);
    speaker.rotation.x = Math.PI / 2;
    speaker.position.z = 0.04;
    g.add(speaker);
    for (const r of [0.13, 0.09, 0.05]) g.add(segs(circlePts(r, 16, 'xy', [0, 0, 0.082]), GREEN, 0.6));
    addModule(
      'reply',
      g,
      [0.5, -0.35, 1.3],
      0,
      circlePts(0.18, 16, 'xy', [gx, gy, gz + 0.004]),
      V(gx, gy, gz + 0.004),
      V(0, -0.08, 0.08),
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
