import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  EdgesGeometry,
  Fog,
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

// ── Hiérarchie des traits ──────────────────────────────────────────────────
// Trois niveaux seulement : au-delà, la multiplication des valeurs intermédiaires
// ramène le « lavis gris » que cette hiérarchie doit supprimer.
/** silhouettes et arêtes principales des volumes (étages, pièces, couvercle) */
const L1 = 0.95;
/** détails fonctionnels : rainures, gorges, plaques, vis, embouts */
const L2 = 0.55;
/** textures répétées : moletage, graduations, couronnes de crans, câbles */
const L3 = 0.3;
// Le vert garde sa propre échelle : les pièces sont dix fois plus petites que le fût à l'écran,
// aux valeurs blanches leur niveau 3 passerait sous le seuil de lisibilité. Même logique, plancher relevé.
const G1 = 0.95;
const G2 = 0.62;
const G3 = 0.42;

// ── Fondu de profondeur ────────────────────────────────────────────────────
// Caméra orthographique fixe à ~13.8 unités de l'origine ; le fût occupe ±1.1 autour d'elle et les
// pièces éclatées ±3.5. Brouillard linéaire de la couleur du fond : les traits arrière s'éteignent
// vers le noir sans jamais disparaître (à l'arrière du fût il reste ~60 % de l'intensité nominale).
const FOG_NEAR = 11.8;
const FOG_FAR = 17.6;

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
  id: PartId;
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
  /**
   * Dévissage : la pièce est au repos tournée de `spin` radians autour de son propre axe, et
   * revient à 0 en sortant. Dans ce sens, l'état éclaté final reste exactement celui qui a été
   * résolu à la passe 4 (positions d'ancre comprises) — un dévissage qui finirait en biais
   * déplacerait les points de rappel.
   */
  spin: number;
  /** axe de dévissage, dans le repère de la pièce (cf. `rotation.order` posé à la construction) */
  spinAxis: 'x' | 'y' | 'z';
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
    knurl: { count: 36, y0: 0.1, y1: 0.34 },
    flankBolts: { count: 12, y: -0.3, r: 0.026, phase: 0.1 },
    plates: [
      [0.55, 0.19, 0.1],
      [3.6, 0.15, 0.085],
    ],
    engraved: [0.78, 0.52],
    topCrown: { count: 22, r0: 0.84, r1: 0.94 },
  },
  // R2 — bande moletée.
  {
    grooves: [-0.4, 0.18, 0.4],
    grad: 34,
    gradY: 0.24,
    gradLen: 0.05,
    knurl: { count: 42, y0: -0.22, y1: 0.06 },
    plates: [[2.1, 0.14, 0.11]],
    engraved: [0.82, 0.55],
    topCrown: { count: 20, r0: 0.88, r1: 0.98 },
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
    teeth: { count: 30, depth: 0.075, r: 1.1 },
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
  // R5 — tête : elle porte le couvercle usiné (cf. `LID_*`), qui recouvre le disque central.
  // Le détail de la face supérieure reste donc sur sa couronne extérieure, hors du couvercle.
  {
    grooves: [-0.34, 0.3],
    grad: 24,
    gradY: -0.1,
    gradLen: 0.045,
    plates: [],
    teeth: { count: 24, depth: 0.09, r: 0.88 },
    engraved: [0.8],
  },
];
/** Couvercle blanc usiné du sommet du fût (la couronne verte a déménagé en embase). */
const LID_R = 0.62;
const LID_H = 0.085;
const RING_CENTER_INDEX = 2;
// Écart avec le brief (0.42) : à 0.42 la caméra (fixe, en plongée oblique) voit l'anneau du dessus
// (R4) masquer le cœur même à `open` = 1, quelle que soit sa taille raisonnable — l'anneau central
// (R3) ne bougeant jamais, aucune valeur de open ne change l'angle de vue. 0.52 dégage assez pour
// qu'une bonne partie du cœur (réduit, cf. plus bas) passe devant R4 côté caméra.
const RING_OPEN_STEP = 0.52;
/** décalage de départ d'une pièce verte à la suivante : la sortie ne part pas d'un bloc */
const MODULE_STAGGER = 0.04;
/**
 * Décélération de la trajectoire de sortie : la pièce arrive en glissant, elle ne s'arrête pas net.
 * Ease-out cubique dosé à 45 % (mélangé à la droite) : `explode` porte déjà un in-out cubique, et
 * un ease-out cubique pur par-dessus avançait tellement les pièces que la vue était éclatée avant
 * même que le bloc d'intro ait commencé à s'effacer. Au dosage retenu, la pièce part environ deux
 * fois plus vite que la moyenne et arrive à 55 % de cette vitesse — ça se pose, ça ne cogne pas.
 */
const EASE_OUT_MIX = 0.45;
const settle = (x: number) => x + (1 - (1 - x) ** 3 - x) * EASE_OUT_MIX;
/**
 * Tracé du lien pointillé : il se dessine de la collerette vers la pièce entre `t` = 0.15 et 0.65,
 * puis suit la pièce. Il apparaît par la longueur, pas par un fondu.
 */
const TETHER_START = 0.15;
const TETHER_SPAN = 0.5;
const TETHER_OPACITY = 0.55;
// Inertie : oscillateur amorti excité par la vitesse de rotation du scroll. Il ne se voit que
// lorsque le défilement s'arrête — pas de flottement permanent, l'amplitude est bornée à 0.01 rad.
const SWING_MAX = 0.01;
const SWING_GAIN = 55;
/** raideur (≈1.5 Hz) et amortissement sous-critique : deux allers-retours, puis plus rien */
const SWING_K = 90;
const SWING_C = 5.2;
// Les deux pièces les plus petites (barillet d'objectif, membrane) sont dessinées à l'échelle 1
// puis agrandies : à l'échelle 1 elles tombaient sous les 60 px de large à l'écran, le plancher de
// lisibilité fixé par le brief. Les ancres de légende sont divisées par le même facteur, donc
// inchangées dans le monde ; les deux pièces restent logées dans le fût à l'état fermé.
const PERCEIVE_SCALE = 1.28;
const REPLY_SCALE = 1.32;
/** Le cœur est désormais une pièce à part entière, sortie du fût : il lui faut la taille des autres. */
const CORE_SCALE = 1.5;
// Azimuts de sortie (0 = +X, π/2 = +Z). Ils sont choisis pour que la PROJECTION à 1440×900 en fin
// d'ouverture donne la lecture en Z voulue : à gauche perceive > act > reply, à droite decide >
// report > connect. La bascule (rotation X) mélange les axes, donc ces valeurs ne se devinent pas
// des vecteurs 3D seuls : elles sont résolues pour des cibles écran (cf. shape-dense-report.md).
const PERCEIVE_AZ = (172 * Math.PI) / 180;
const DECIDE_AZ = (28 * Math.PI) / 180;
const ACT_AZ = (152 * Math.PI) / 180;
// La membrane est un pavillon peu profond : à 147° son axe tombait perpendiculaire à l'axe de vue
// et elle se lisait comme une pile de traits plats. 105° la remet de trois quarts face caméra.
const REPLY_AZ = (105 * Math.PI) / 180;
const RING_BOTTOM = RING_SPECS[0].y - RING_SPECS[0].h / 2;

export function createAgentScene(canvas: HTMLCanvasElement): AgentScene {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new Scene();
  // Fondu de profondeur : `LineBasicMaterial.fog` et `LineDashedMaterial.fog` sont à true par
  // défaut, tous les traits en profitent sans autre réglage. Les volumes pleins sont déjà à `BG`.
  scene.fog = new Fog(BG, FOG_NEAR, FOG_FAR);
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
    // Le fondu de profondeur sert à donner du volume au fût blanc. Les pièces vertes, elles,
    // portent l'information : elles doivent rester également lisibles où qu'elles soient dans la
    // profondeur (sans ça la couronne d'embase, la plus éloignée, vire au vert sombre).
    if (color === GREEN) m.fog = false;
    collect?.push({ mat: m, base: opacity });
    return m;
  };

  /** Volume plein (masque les traits cachés) + ses arêtes. */
  function solid(geo: BufferGeometry, color = WHITE, opacity = L1, threshold = 20): Group {
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
  function stageZ(r: number, z0: number, z1: number, n: number, opacity = G1): Group {
    const s = solid(new CylinderGeometry(r, r, Math.abs(z1 - z0), n), GREEN, opacity, 30);
    s.rotation.x = Math.PI / 2;
    s.position.z = (z0 + z1) / 2;
    return s;
  }
  /** Même chose, coaxial à X : corps et tige du vérin. */
  function stageX(r: number, x0: number, x1: number, n: number, opacity = G1): Group {
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

  /**
   * Collerette d'accroche posée à plat sur le flanc du fût, à l'azimut `az` (0 = +X, π/2 = +Z).
   * Les pièces ne sortent plus toutes vers l'avant : chacune a son azimut, et sa collerette doit
   * être dans le plan tangent correspondant, sinon elle se lit comme une ellipse posée de travers.
   */
  function flankRing(ringR: number, y: number, az: number, rad: number, n: number) {
    const c = V(Math.cos(az) * (ringR + 0.004), y, Math.sin(az) * (ringR + 0.004));
    const tx = -Math.sin(az);
    const tz = Math.cos(az);
    const pts: Vector3[] = [];
    for (let i = 0; i < n; i++) {
      for (const k of [i, i + 1]) {
        const a = (k / n) * TAU;
        const u = Math.cos(a) * rad;
        pts.push(V(c.x + tx * u, c.y + Math.sin(a) * rad, c.z + tz * u));
      }
    }
    return { pts, center: c };
  }

  const root = new Group();
  scene.add(root);

  // ── Pile d'anneaux mécaniques : s'écartent le long de Y pour révéler le cœur ──
  const rings: Group[] = RING_SPECS.map((spec) => {
    const g = new Group();
    g.position.set(0, spec.y, 0);
    g.add(solid(new CylinderGeometry(spec.r, spec.r, spec.h, 48), WHITE, L1, 30));
    root.add(g);
    return g;
  });

  // ── Volumes secondaires : les seuls décrochements du fût (quelques pour cent de rayon) ──
  // (enfants des étages : ils suivent l'écartement, aucun index d'étage n'est ajouté)
  {
    const plinth = solid(new CylinderGeometry(1.0, 1.0, 0.07, 40), WHITE, L1, 30);
    plinth.position.y = -RING_SPECS[0].h / 2 - 0.035;
    rings[0].add(plinth);
    for (const s of [-1, 1]) {
      const lip = solid(new CylinderGeometry(1.1, 1.1, 0.035, 44), WHITE, L1, 30);
      lip.position.y = s * (RING_SPECS[2].h / 2 + 0.017);
      rings[2].add(lip);
    }
    const collar = solid(new CylinderGeometry(0.92, 0.92, 0.05, 36), WHITE, L1, 30);
    collar.position.y = -RING_SPECS[4].h / 2 - 0.025;
    rings[4].add(collar);
    // Couvercle usiné du sommet : la couronne d'accouplement verte a quitté la tête pour l'embase,
    // le fût retrouve un couvercle blanc à cadran gravé (cf. gravures plus bas).
    const lid = solid(new CylinderGeometry(LID_R, LID_R, LID_H, 20), WHITE, L1, 30);
    lid.position.y = RING_SPECS[4].h / 2 + LID_H / 2;
    rings[4].add(lid);
  }

  // ── Gravures : sur un fût droit, l'essentiel se joue sur le flanc. Tous les traits d'un étage
  // sont fusionnés en trois LineSegments (un par niveau de gris) pour limiter les appels de rendu.
  // Deux niveaux ici seulement : le niveau 1 est porté par les arêtes des volumes (`solid`).
  const engraveDetail = lineMat(WHITE, L2);
  const engraveTexture = lineMat(WHITE, L3);
  for (let i = 0; i < rings.length; i++) {
    const spec = RING_SPECS[i];
    const d = RING_DETAILS[i];
    const rim = spec.r + 0.004;
    const detail: Vector3[] = [];
    const texture: Vector3[] = [];

    // Rainures tournées. Celles posées près des arêtes (±0.4) font office de gorge de jointure :
    // sur un fût droit, c'est elle qui marque la séparation des étages, pas un décrochement.
    for (const f of d.grooves) detail.push(...circlePts(rim, cseg(spec.r), 'xz', [0, f * spec.h, 0]));

    // Graduations fines (longueurs alternées, repère long tous les cinq).
    for (let k = 0; k < d.grad; k++) {
      const a = (k / d.grad) * TAU;
      const len = d.gradLen * (k % 5 === 0 ? 1 : k % 5 === 2 ? 0.62 : 0.36);
      const gx = Math.cos(a) * rim;
      const gz = Math.sin(a) * rim;
      const y = d.gradY * spec.h;
      texture.push(V(gx, y, gz), V(gx, y + len, gz));
    }

    // Bande moletée : traits verticaux serrés sur tout le pourtour.
    if (d.knurl) {
      const { count, y0, y1 } = d.knurl;
      for (let k = 0; k < count; k++) {
        const a = (k / count) * TAU;
        const kx = Math.cos(a) * rim;
        const kz = Math.sin(a) * rim;
        texture.push(V(kx, y0 * spec.h, kz), V(kx, y1 * spec.h, kz));
      }
    }

    // Couronne de vis vissées dans le flanc (tête + fente de serrage).
    if (d.flankBolts) {
      const b = d.flankBolts;
      const head = circlePts(b.r, 8, 'xy', [0, 0, 0.002]);
      const slot = [V(-b.r * 0.72, 0, 0.004), V(b.r * 0.72, 0, 0.004)];
      for (let k = 0; k < b.count; k++) {
        const a = (k / b.count) * TAU + b.phase;
        detail.push(...onFlank(a, b.y * spec.h, rim, head), ...onFlank(a, b.y * spec.h, rim, slot));
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
      detail.push(...onFlank(a, 0, rim, pts));
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
        texture.push(p(a0, ri), p(a0, ro), p(a0, ro), p(a1, ro), p(a1, ro), p(a1, ri));
      }
    }
    for (const r of d.engraved ?? []) texture.push(...circlePts(r, cseg(r), 'xz', [0, top, 0]));
    if (d.topCrown) {
      const c = d.topCrown;
      for (let k = 0; k < c.count; k++) {
        const a = (k / c.count) * TAU;
        const r0 = k % 4 === 0 ? c.r0 : c.r0 + (c.r1 - c.r0) * 0.45;
        texture.push(V(Math.cos(a) * r0, top, Math.sin(a) * r0), V(Math.cos(a) * c.r1, top, Math.sin(a) * c.r1));
      }
    }
    if (d.topBolts) {
      const b = d.topBolts;
      for (let k = 0; k < b.count; k++) {
        const a = (k / b.count) * TAU + 0.13;
        const bx = Math.cos(a) * b.ring;
        const bz = Math.sin(a) * b.ring;
        detail.push(...circlePts(b.r, 8, 'xz', [bx, top + 0.002, bz]));
        detail.push(V(bx - b.r * 0.72, top + 0.002, bz), V(bx + b.r * 0.72, top + 0.002, bz));
      }
    }

    if (detail.length) rings[i].add(segsWith(detail, engraveDetail));
    if (texture.length) rings[i].add(segsWith(texture, engraveTexture));
  }

  // ── Cadran gravé du couvercle : c'est lui qui termine le fût, à la place de la couronne verte.
  {
    const top = RING_SPECS[4].h / 2 + LID_H + 0.004;
    // Graduations et cercles du cadran = texture répétée (niveau 3) ; vis et aiguille = pièces
    // fonctionnelles (niveau 2). Le contour du couvercle, lui, est une arête de volume (niveau 1).
    const dialTexture: Vector3[] = [];
    for (const r of [0.46, 0.24]) dialTexture.push(...circlePts(r, cseg(r), 'xz', [0, top, 0]));
    // Couronne de graduations, un repère long sur quatre.
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * TAU;
      const r0 = k % 4 === 0 ? 0.46 : 0.51;
      dialTexture.push(V(Math.cos(a) * r0, top, Math.sin(a) * r0), V(Math.cos(a) * 0.56, top, Math.sin(a) * 0.56));
    }
    const dialDetail: Vector3[] = [];
    // Vis de fixation du couvercle (c'est lui qui est boulonné, la tête n'en porte plus).
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * TAU + 0.26;
      const bx = Math.cos(a) * 0.35;
      const bz = Math.sin(a) * 0.35;
      dialDetail.push(...circlePts(0.026, 5, 'xz', [bx, top + 0.002, bz]));
      dialDetail.push(V(bx - 0.019, top + 0.002, bz - 0.019), V(bx + 0.019, top + 0.002, bz + 0.019));
    }
    // Aiguille du cadran.
    dialDetail.push(V(0, top + 0.002, 0), V(Math.cos(-0.9) * 0.42, top + 0.002, Math.sin(-0.9) * 0.42));
    rings[4].add(segsWith(dialTexture, engraveTexture), segsWith(dialDetail, engraveDetail));
  }

  // ── Filet vert aux jointures : la seule trace de couleur à l'état fermé, on devine
  // qu'il y a quelque chose à l'intérieur (brief : opacité ≤ 0.35).
  const seamMat = lineMat(GREEN, 0.3);
  for (let i = 1; i < rings.length; i++) {
    const spec = RING_SPECS[i];
    rings[i].add(segsWith(circlePts(spec.r + 0.01, cseg(spec.r), 'xz', [0, -spec.h / 2 - 0.012, 0]), seamMat));
  }

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
    ]).getPoints(14);
    const pairs: Vector3[] = [];
    for (let i = 0; i < pts.length - 1; i++) pairs.push(pts[i], pts[i + 1]);
    root.add(segs(pairs, WHITE, L3));
  }

  // ── Modules : chacun est une capacité de l'agent ──
  const modules: Module[] = [];
  /** La cage du cœur tourne lentement sur elle-même ; le reste des pièces est fixe. */
  let coreGroup: Group | null = null;
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
    spin: { axis: 'x' | 'y' | 'z'; max: number },
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
      new LineDashedMaterial({ color: GREEN, dashSize: 0.06, gapSize: 0.05, transparent: true, opacity: 0, fog: false }),
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
      spin: spin.max,
      spinAxis: spin.axis,
    });
  }

  // 01 · Capteur — barillet d'objectif sur R4, sorti vers le HAUT-GAUCHE (rangée haute, colonne de gauche).
  // Collerette arrière boulonnée → deux bagues de diamètres décroissants (l'une moletée) → lentille.
  {
    collect = []; // tout le vert créé ici appartient à cette pièce
    const r4 = RING_SPECS[3];
    const az = PERCEIVE_AZ;
    const seat = flankRing(r4.r, r4.y, az, 0.25 * PERCEIVE_SCALE, 14);
    const g = new Group();
    g.position.copy(seat.center);
    // Le barillet est dessiné le long de +Z : on le tourne pour qu'il vise son azimut de sortie.
    g.rotation.y = Math.PI / 2 - az;
    // À l'échelle 1 le barillet ne faisait que ~50 px de large à l'écran, sous le seuil de
    // lisibilité du brief (60–120 px) : on l'agrandit d'un cinquième. L'ancre de légende est
    // divisée par la même valeur pour rester au même point dans le monde.
    g.scale.setScalar(PERCEIVE_SCALE);
    // Collerette arrière : elle déborde largement du corps, pour que son annulaire avant reste
    // lisible de trois quarts et porte un vrai cercle de vis (0.25 → 0.17 : 0.08 d'annulaire).
    g.add(stageZ(0.25, 0, 0.055, 14));
    g.add(segs(boltRing(6, 0.212, 0.026, 'xy', [0, 0, 0.058], 0.3), GREEN, G2));
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
    g.add(segs(knurl, GREEN, G3));
    g.add(stageZ(0.125, 0.32, 0.44, 12));
    // Lentille : trois cercles concentriques + un éclat oblique.
    const lens = [
      ...circlePts(0.102, 12, 'xy', [0, 0, 0.446]),
      ...circlePts(0.072, 10, 'xy', [0, 0, 0.448]),
      ...circlePts(0.04, 8, 'xy', [0, 0, 0.45]),
    ];
    lens.push(V(-0.072, 0.042, 0.452), V(-0.028, 0.08, 0.452));
    g.add(segs(lens, GREEN, G2));
    addModule(
      'perceive',
      g,
      [-1.715, 1.1, 0.018],
      3,
      seat.pts,
      seat.center,
      V(0, 0.25 / PERCEIVE_SCALE, 0.2 / PERCEIVE_SCALE),
      [0.15, r4.y, 0], // logé dans l'empilement, l'axe couché vers son azimut de sortie
      // Ordre d'Euler XYZ : `rotation.z` est la rotation la plus interne, donc bien l'axe du
      // barillet, appliqué avant l'orientation d'azimut portée par `rotation.y`.
      { axis: 'z', max: 0.34 },
    );
  }
  // 02 · Cœur — cage à facettes, sortie du haut du fût vers le HAUT-DROITE.
  // C'est une pièce comme les autres depuis cette passe : même mécanique repos caché → émergence,
  // même collerette d'accroche, même lien pointillé. Elle finit loin du fût, donc jamais masquée.
  {
    collect = [];
    const r5 = RING_SPECS[4];
    const az = DECIDE_AZ;
    const seat = flankRing(r5.r, r5.y, az, 0.2, 12);
    const g = new Group();
    g.position.copy(seat.center);
    g.scale.setScalar(CORE_SCALE);
    g.add(new LineSegments(track(new EdgesGeometry(track(new IcosahedronGeometry(0.3, 0)))), lineMat(GREEN, G1)));
    g.add(new LineSegments(track(new EdgesGeometry(track(new OctahedronGeometry(0.14, 0)))), lineMat(GREEN, G2)));
    coreGroup = g;
    addModule(
      'decide',
      g,
      [2.705, -0.298, -1.514],
      4,
      seat.pts,
      seat.center,
      // L'ancre est sur l'axe de rotation de la cage : sans ça le point de rappel tournerait avec elle.
      V(0, 0.3, 0),
      [0, 0.35, 0.05], // au cœur de l'empilement, masqué par les volumes pleins des étages
      { axis: 'y', max: 0.25 }, // s'additionne à la rotation lente de la cage
    );
  }
  // 03 · Bras — vérin articulé sur R3 (central), flanc gauche.
  // Embase boulonnée → corps nervuré → tige coaxiale sortie → chape percée + axe traversant.
  {
    collect = []; // tout le vert créé ici appartient à cette pièce
    const r3 = RING_SPECS[2];
    const az = ACT_AZ;
    const seat = flankRing(r3.r, r3.y, az, 0.215, 14);
    const g = new Group();
    g.position.copy(seat.center);
    // Le vérin est dessiné le long de -X : on le tourne pour qu'il vise son azimut de sortie.
    // Ordre YXZ (et non XYZ) pour que le dévissage `rotation.x` reste INTERNE à l'azimut :
    // en XYZ il tournerait autour de l'axe du monde et le vérin partirait de travers.
    g.rotation.order = 'YXZ';
    g.rotation.y = Math.PI - az;
    // Embase : elle déborde du corps, ses vis sont sur la face tournée vers le fût (donc vers l'œil).
    g.add(stageX(0.195, 0, -0.06, 14));
    g.add(segs(boltRing(6, 0.158, 0.022, 'yz', [0.006, 0, 0], 0.5), GREEN, G2));
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
    g.add(segs(body, GREEN, G2));
    // Tige : second cylindre coaxial, plus fin, avec sa gorge de fin de course.
    g.add(stageX(0.062, -0.58, -1.02, 12));
    g.add(segs(circlePts(0.066, 10, 'yz', [-0.955, 0, 0]), GREEN, G2));
    // Chape : deux joues percées de part et d'autre, traversées par un axe.
    for (const s of [-1, 1]) {
      const cheek = solid(new BoxGeometry(0.22, 0.19, 0.035), GREEN, G1);
      cheek.position.set(-1.1, 0, s * 0.082);
      g.add(cheek);
    }
    const clevis = circlePts(0.052, 10, 'xy', [-1.1, 0, 0.102]);
    clevis.push(...circlePts(0.032, 6, 'xy', [-1.1, 0, 0.128]));
    clevis.push(V(-1.1, -0.03, 0.13), V(-1.1, 0.03, 0.13));
    g.add(segs(clevis, GREEN, G2));
    addModule(
      'act',
      g,
      [-1.421, 0.559, 0.528],
      2,
      seat.pts,
      seat.center,
      V(-0.6, 0.2, 0),
      [0.46, r3.y, 0], // vérin rentré dans le fût, décalé pour que sa longueur y tienne
      { axis: 'x', max: 0.4 },
    );
  }
  // 04 · Écran — plaque à cadran sur R4, flanc droit.
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
    const mount = solid(new CylinderGeometry(0.052, 0.052, 0.5, 12), GREEN, G1, 30);
    mount.rotation.z = Math.PI / 2;
    mount.position.x = 0.25;
    g.add(mount);
    g.add(segs(circlePts(0.078, 10, 'yz', [0.14, 0, 0]), GREEN, G2));
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
    // La plaque est la seule pièce qui porte les trois niveaux d'un coup : sa silhouette (niveau 1),
    // sa visserie et son cadran (niveau 2), ses graduations et sa barre de valeurs (niveau 3).
    const faceEdge = [...chamfered(hw, hh, 0.14)];
    const faceDetail = [...chamfered(hw - 0.05, hh - 0.05, 0.105)];
    const faceTexture: Vector3[] = [];
    // Quatre boulons d'angle, tête fendue.
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        const bx = sx * (hw - 0.105);
        const by = sy * (hh - 0.105);
        faceDetail.push(...circlePts(0.032, 6, 'xy', [bx, by, pz + 0.002]));
        faceDetail.push(V(bx - 0.023, by + 0.023, pz + 0.003), V(bx + 0.023, by - 0.023, pz + 0.003));
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
    for (let k = 0; k < 14; k++) faceDetail.push(arcPt(k / 14, 0.3), arcPt((k + 1) / 14, 0.3));
    for (let k = 0; k < 10; k++) faceDetail.push(arcPt(k / 10, 0.245), arcPt((k + 1) / 10, 0.245));
    for (let k = 0; k <= 10; k++) faceTexture.push(arcPt(k / 10, 0.245), arcPt(k / 10, k % 5 === 0 ? 0.19 : 0.288));
    faceDetail.push(V(0, cy, pz + 0.002), arcPt(0.7, 0.272));
    faceDetail.push(...circlePts(0.036, 6, 'xy', [0, cy, pz + 0.003]));
    // Trois lignes de repères sous le cadran, alignées à gauche sur la même marge.
    [-0.09, -0.17, -0.25].forEach((y, i) => {
      faceTexture.push(V(-0.34, y, pz), V(-0.34 + [0.56, 0.4, 0.49][i], y, pz));
      faceTexture.push(V(-0.385, y, pz), V(-0.36, y, pz));
    });
    // Barre de valeurs : six barres sur une grille de deux lignes.
    const b0 = -0.47;
    faceDetail.push(V(-0.36, b0, pz), V(0.36, b0, pz));
    faceTexture.push(V(-0.36, b0 + 0.13, pz), V(0.36, b0 + 0.13, pz));
    [0.06, 0.13, 0.1, 0.19, 0.16, 0.23].forEach((h, i) => {
      const x = -0.29 + i * 0.116;
      faceTexture.push(V(x, b0, pz), V(x, b0 + h, pz));
    });
    plate.add(segs(faceEdge, GREEN, G1), segs(faceDetail, GREEN, G2), segs(faceTexture, GREEN, G3));
    addModule(
      'report',
      g,
      [1.133, -1.619, -1.108],
      3,
      circlePts(0.1, 14, 'yz', [gx + 0.004, gy, gz]),
      V(gx + 0.004, gy, gz),
      V(1.15, 0.7, 0.2),
      [-0.38, r4.y - 0.12, -0.08], // plaque rangée à plat dans la colonne
      { axis: 'x', max: 0.2 }, // la plaque pivote autour de son bras de support
    );
  }
  // 05 · Voix — membrane annelée sur R1, devant.
  // Bague de serrage vissée, puis pavillon en trois anneaux de rayons décroissants (vraie
  // profondeur, chacun est un volume), enfin la grille de fentes radiales sur la membrane.
  {
    collect = []; // tout le vert créé ici appartient à cette pièce
    const r1 = RING_SPECS[0];
    const az = REPLY_AZ;
    const seat = flankRing(r1.r, r1.y, az, 0.26 * REPLY_SCALE, 14);
    const g = new Group();
    g.position.copy(seat.center);
    // Le pavillon est dessiné le long de +Z : on le tourne pour qu'il vise son azimut de sortie.
    g.rotation.y = Math.PI / 2 - az;
    // Même correction d'échelle que le barillet (cf. `PERCEIVE_SCALE`) : c'est la plus petite
    // pièce à l'écran, elle passait sous les 60 px du brief.
    g.scale.setScalar(REPLY_SCALE);
    // Bague de serrage : large annulaire (0.26 → 0.19) pour que son cercle de vis se lise.
    g.add(stageZ(0.26, 0, 0.07, 14));
    g.add(segs(boltRing(8, 0.226, 0.022, 'xy', [0, 0, 0.073], 0.2), GREEN, G2));
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
    g.add(segs(grille, GREEN, G2));
    addModule(
      'reply',
      g,
      [-2.698, 0.829, 1.431],
      0,
      seat.pts,
      seat.center,
      V(0, -0.08 / REPLY_SCALE, 0.08 / REPLY_SCALE),
      [0.22, r1.y, 0.1], // membrane logée derrière le flanc de l'embase
      { axis: 'z', max: 0.3 },
    );
  }
  // 06 · Connecteurs — couronne d'accouplement EN EMBASE : elle quitte le fût par-dessous R1 et
  // descend vers la droite. Plateau tourné + rainure de guidage, 10 embouts, tige d'accouplement.
  {
    collect = []; // tout le vert créé ici appartient à cette pièce
    const r1 = RING_SPECS[0];
    const gx = 0;
    const gy = r1.y - r1.h / 2 - 0.07; // sous la plinthe : la couronne se détache de l'embase
    const gz = 0;
    const g = new Group();
    g.position.set(gx, gy, gz);
    const disc = solid(new CylinderGeometry(0.48, 0.48, 0.11, 16), GREEN, G1, 30);
    disc.position.y = 0.055;
    g.add(disc);
    const topFace = 0.113;
    // Rainure de guidage : deux cercles rapprochés sur la face du plateau.
    g.add(
      segs(
        [...circlePts(0.43, 14, 'xz', [0, topFace, 0]), ...circlePts(0.4, 14, 'xz', [0, topFace, 0])],
        GREEN,
        G2,
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
    g.add(segs(ports, GREEN, G2));
    // Tige d'accouplement : courte, SOUS la couronne (l'antenne verticale du sommet a disparu
    // avec le déménagement en embase). Fût tourné + bague d'arrêt + embout.
    // Elle est décentrée vers +Z : au centre, le plateau vu en plongée la masquerait entièrement.
    const stubZ = 0.26;
    const stub = solid(new CylinderGeometry(0.105, 0.105, 0.55, 12), GREEN, G1, 30);
    stub.position.set(0, -0.275, stubZ);
    g.add(stub);
    g.add(segs(circlePts(0.15, 12, 'xz', [0, -0.5, stubZ]), GREEN, G2));
    addModule(
      'connect',
      g,
      [1.49, -1.231, -0.416],
      0,
      circlePts(0.48, 18, 'xz', [gx, gy - 0.004, gz]),
      V(gx, gy - 0.004, gz),
      V(0.44, 0.12, 0.06),
      [0, -0.9, 0], // couronne rentrée dans la colonne, tige d'accouplement comprise
      { axis: 'y', max: 0.3 },
    );
  }

  for (const l of drawn) l.userData.count = l.geometry.attributes.position.count;

  let vw = 1;
  let vh = 1;
  // État de l'inertie du fût (cf. `SWING_*`). Conservé d'une image à l'autre.
  let prevRotation = 0;
  let prevTime = 0;
  let swing = 0;
  let swingVel = 0;
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
      // Inertie : quand la progression de scroll s'arrête, le fût finit sa course et revient.
      // `time` vaut 0 en mouvement réduit (appel unique, hors rAF) : tout reste figé.
      if (time > 0) {
        const dt = prevTime ? Math.min(0.05, (time - prevTime) / 1000) : 0;
        prevTime = time;
        swingVel += (rotation - prevRotation) * SWING_GAIN;
        swingVel += (-SWING_K * swing - SWING_C * swingVel) * dt;
        swing = Math.max(-SWING_MAX, Math.min(SWING_MAX, swing + swingVel * dt));
      } else {
        swing = 0;
        swingVel = 0;
        prevTime = 0;
      }
      prevRotation = rotation;

      root.rotation.y = rotation + swing + Math.sin(time / 2600) * 0.02;
      // Bascule : vue de face → trois quarts plongeante, on découvre les faces supérieures.
      // Elle suit `open` (et non `explode`) pour accompagner l'écartement des étages.
      root.rotation.x = -0.05 + open * 0.55;
      root.position.y = -0.1 - explode * 0.4 + Math.sin(time / 1800) * 0.04;

      for (let i = 0; i < rings.length; i++) {
        const shift = (i - RING_CENTER_INDEX) * RING_OPEN_STEP * open;
        rings[i].position.y = RING_SPECS[i].y + shift;
      }
      for (const l of drawn) l.geometry.setDrawRange(0, Math.floor((l.userData.count * draw) / 2) * 2);

      // Les pièces vertes partent de l'intérieur de l'empilement et sortent une par une :
      // chacune démarre `MODULE_STAGGER` plus tard que la précédente, et n'apparaît que sur les
      // 25 premiers % de son trajet (avant, le volume plein noir occulterait les gravures).
      const span = 1 - MODULE_STAGGER * (modules.length - 1);
      for (let mi = 0; mi < modules.length; mi++) {
        const m = modules[mi];
        const t = Math.max(0, Math.min(1, (explode - mi * MODULE_STAGGER) / span));
        // Décélération : la pièce sort vite puis se pose. `e` vaut 1 à `t` = 1, donc la position
        // éclatée finale est inchangée.
        const e = settle(t);
        const reveal = Math.min(1, e / 0.25);
        const shift = (m.ring - RING_CENTER_INDEX) * RING_OPEN_STEP * open;
        m.group.visible = reveal > 0.001;
        for (const { mat, base } of m.greenMats) mat.opacity = base * reveal;
        m.group.position.copy(m.rest).addScaledVector(m.dir, e);
        m.group.position.y += shift;
        // Dévissage : rangée, la pièce est tournée de `spin` ; elle se remet droite en sortant.
        m.group.rotation[m.spinAxis] = m.spin * (1 - e);
        m.socketMat.opacity = e * 0.9;
        // Le lien se DESSINE : sa longueur croît de la collerette vers la pièce. Pas de fondu.
        const trace = Math.max(0, Math.min(1, (t - TETHER_START) / TETHER_SPAN));
        const pos = m.tether.geometry.attributes.position as BufferAttribute;
        const sy = m.socketCenter.y + shift;
        pos.setXYZ(0, m.socketCenter.x, sy, m.socketCenter.z);
        pos.setXYZ(
          1,
          m.socketCenter.x + (m.group.position.x - m.socketCenter.x) * trace,
          sy + (m.group.position.y - sy) * trace,
          m.socketCenter.z + (m.group.position.z - m.socketCenter.z) * trace,
        );
        pos.needsUpdate = true;
        m.tether.computeLineDistances();
        m.tetherMat.opacity = trace > 0 ? TETHER_OPACITY : 0;
      }
      // La cage du cœur tourne lentement en plus de son dévissage (même axe Y).
      if (coreGroup) coreGroup.rotation.y += time / 4000;

      scene.updateMatrixWorld();
      const anchors = modules.map((m) => project(m.id, tmp.copy(m.anchor).applyMatrix4(m.group.matrixWorld)));
      renderer.render(scene, camera);
      return anchors;
    },

    dispose() {
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
