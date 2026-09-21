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
}

interface RingSpec {
  r: number;
  h: number;
  y: number;
}

// Pile d'anneaux mécaniques, bas → haut (voir shape-cylinder-brief.md).
const RING_SPECS: RingSpec[] = [
  { r: 0.78, h: 0.46, y: -1.24 }, // R1, bas
  { r: 0.98, h: 0.42, y: -0.76 }, // R2
  { r: 1.05, h: 0.46, y: -0.28 }, // R3, central (le plus large)
  { r: 0.94, h: 0.42, y: 0.2 }, // R4
  { r: 0.72, h: 0.28, y: 0.6 }, // R5, haut
];
const RING_CENTER_INDEX = 2;
// Écart avec le brief (0.42) : à 0.42 la caméra (fixe, en plongée oblique) voit l'anneau du dessus
// (R4) masquer le cœur même à `open` = 1, quelle que soit sa taille raisonnable — l'anneau central
// (R3) ne bougeant jamais, aucune valeur de open ne change l'angle de vue. 0.52 dégage assez pour
// qu'une bonne partie du cœur (réduit, cf. plus bas) passe devant R4 côté caméra.
const RING_OPEN_STEP = 0.52;
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
  const lineMat = (color: number, opacity: number) =>
    track(new LineBasicMaterial({ color, transparent: true, opacity }));

  /** Volume plein (masque les traits cachés) + ses arêtes. */
  function solid(geo: BufferGeometry, color = WHITE, opacity = 0.9, threshold = 20): Group {
    const g = new Group();
    g.add(new Mesh(track(geo), fill));
    const l = new LineSegments(track(new EdgesGeometry(geo, threshold)), lineMat(color, opacity));
    g.add(l);
    drawn.push(l);
    return g;
  }
  function segs(points: Vector3[], color = WHITE, opacity = 0.6): LineSegments {
    const l = new LineSegments(track(new BufferGeometry().setFromPoints(points)), lineMat(color, opacity));
    drawn.push(l);
    return l;
  }

  const root = new Group();
  scene.add(root);

  // ── Pile d'anneaux mécaniques : s'écartent le long de Y pour révéler le cœur ──
  const rings: Group[] = RING_SPECS.map((spec) => {
    const g = new Group();
    g.position.set(0, spec.y, 0);
    g.add(solid(new CylinderGeometry(spec.r, spec.r, spec.h, 64), WHITE, 0.95, 30));
    root.add(g);
    return g;
  });

  // Détails mécaniques (rainure médiane + crans verticaux) sur R2, R3, R4.
  for (const i of [1, 2, 3]) {
    const spec = RING_SPECS[i];
    const rim = spec.r + 0.004;
    rings[i].add(segs(circlePts(rim, 64, 'xz', [0, 0, 0]), WHITE, 0.4));
    const notches: Vector3[] = [];
    const notchCount = 14;
    const nY0 = -spec.h / 2 + 0.05;
    const nY1 = spec.h / 2 - 0.05;
    for (let k = 0; k < notchCount; k++) {
      const a = (k / notchCount) * Math.PI * 2;
      const x = Math.cos(a) * rim;
      const z = Math.sin(a) * rim;
      notches.push(V(x, nY0, z), V(x, nY1, z));
    }
    rings[i].add(segs(notches, WHITE, 0.4));
  }

  // ── Cœur vert (visible quand les anneaux s'écartent) ──
  // Écarts avec le brief (position Y = -0.1, rayons 0.42 / 0.2) : à Y = -0.1 le cœur est entièrement
  // dans le volume de R3 (le brief lui-même : R3 va de -0.51 à -0.05), l'anneau central qui ne bouge
  // jamais (décalage nul par construction) — il y resterait invisible à toute valeur de `open`.
  // Recentré dans l'écart qui s'ouvre réellement entre R3 (haut fixe, -0.05) et R4 (bas, qui monte
  // avec `open`), et réduit + légèrement avancé côté caméra : la caméra fixe est en plongée oblique,
  // donc même à `open` = 1 un anneau situé au-dessus masque un point resté sur l'axe central quelle
  // que soit la taille du cœur (occlusion par la ligne de vue, pas seulement par le volume) ; le
  // réduire et le rapprocher du champ de vision de la caméra est nécessaire pour qu'il se lise.
  const coreMats = [lineMat(GREEN, 0), lineMat(GREEN, 0)];
  const core = new Group();
  core.position.set(0.12, 0.12, 0.18);
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
    ]).getPoints(40);
    const pairs: Vector3[] = [];
    for (let i = 0; i < pts.length - 1; i++) pairs.push(pts[i], pts[i + 1]);
    root.add(segs(pairs, WHITE, 0.22));
  }

  // ── Modules : chacun est une capacité de l'agent ──
  const modules: Module[] = [];
  function addModule(
    id: Module['id'],
    group: Group,
    dir: [number, number, number],
    ring: number,
    socketPts: Vector3[],
    socketCenter: Vector3,
    anchor: Vector3,
  ) {
    root.add(group);
    const socketMat = lineMat(GREEN, 0);
    const socket = new LineSegments(track(new BufferGeometry().setFromPoints(socketPts)), socketMat);
    rings[ring].add(socket);
    const tetherMat = track(
      new LineDashedMaterial({ color: GREEN, dashSize: 0.06, gapSize: 0.05, transparent: true, opacity: 0 }),
    );
    const tether = new Line(track(new BufferGeometry().setFromPoints([V(0, 0, 0), V(0, 0, 0)])), tetherMat);
    root.add(tether);
    modules.push({ id, group, rest: group.position.clone(), dir: V(...dir), ring, socketCenter, anchor, socketMat, tether, tetherMat });
  }

  // Capteur — sur R4, posé devant.
  {
    const r4 = RING_SPECS[3];
    const gx = -0.28;
    const gy = r4.y;
    const gz = r4.r;
    const g = new Group();
    g.position.set(gx, gy, gz);
    const box = solid(new BoxGeometry(0.4, 0.32, 0.2), GREEN, 0.95);
    box.position.z = 0.11;
    g.add(box);
    const lens = solid(new CylinderGeometry(0.12, 0.12, 0.09, 48), GREEN, 0.95, 30);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.24;
    g.add(lens);
    g.add(segs(circlePts(0.07, 48, 'xy', [0, 0, 0.285]), GREEN, 0.8));
    g.add(segs(circlePts(0.03, 32, 'xy', [0, 0, 0.285]), GREEN, 0.8));
    addModule(
      'perceive',
      g,
      [-0.2, 0.15, 1.9],
      3,
      rectPts(gx - 0.2, gy - 0.16, gx + 0.2, gy + 0.16, gz + 0.004),
      V(gx, gy, gz + 0.004),
      V(0, 0.25, 0.2),
    );
  }
  // Bras articulé — sur R3 (central), flanc gauche.
  {
    const r3 = RING_SPECS[2];
    const gx = -r3.r;
    const gy = r3.y;
    const gz = 0.1;
    const shoulderR = 0.16;
    const g = new Group();
    g.position.set(gx, gy, gz);
    const shoulder = solid(new CylinderGeometry(shoulderR, shoulderR, 0.18, 40), GREEN, 0.95, 30);
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
    const elbow = solid(new CylinderGeometry(0.1, 0.1, 0.18, 36), GREEN, 0.95, 30);
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
      circlePts(shoulderR + 0.02, 40, 'yz', [gx - 0.004, gy, gz]),
      V(gx - 0.004, gy, gz),
      V(-0.6, 0.2, 0),
    );
  }
  // Écran flottant — sur R4, flanc droit.
  {
    const r4 = RING_SPECS[3];
    const gx = r4.r;
    const gy = r4.y;
    const gz = 0.15;
    const g = new Group();
    g.position.set(gx, gy, gz);
    const mount = solid(new CylinderGeometry(0.05, 0.05, 0.55, 20), GREEN, 0.8, 30);
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
      circlePts(0.1, 24, 'yz', [gx + 0.004, gy, gz]),
      V(gx + 0.004, gy, gz),
      V(1.15, 0.7, 0.2),
    );
  }
  // Couronne de connecteurs — sur R5, posée dessus.
  {
    const r5 = RING_SPECS[4];
    const gx = 0;
    const gy = r5.y + r5.h / 2;
    const gz = 0;
    const g = new Group();
    g.position.set(gx, gy, gz);
    const disc = solid(new CylinderGeometry(0.5, 0.5, 0.12, 64), GREEN, 0.95, 30);
    disc.position.y = 0.06;
    g.add(disc);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const port = solid(new BoxGeometry(0.1, 0.09, 0.1), GREEN, 0.9);
      port.position.set(Math.cos(a) * 0.34, 0.16, Math.sin(a) * 0.34);
      port.rotation.y = -a;
      g.add(port);
    }
    const antenna = solid(new CylinderGeometry(0.018, 0.018, 0.65, 12), GREEN, 0.9, 30);
    antenna.position.set(0.16, 0.44, -0.08);
    g.add(antenna);
    addModule(
      'connect',
      g,
      [0, 1.15, 0],
      4,
      circlePts(0.5, 64, 'xz', [gx, gy + 0.004, gz]),
      V(gx, gy + 0.004, gz),
      V(0, 0.26, 0),
    );
  }
  // Haut-parleur — sur R1, devant.
  {
    const r1 = RING_SPECS[0];
    const gx = 0.3;
    const gy = r1.y;
    const gz = r1.r;
    const g = new Group();
    g.position.set(gx, gy, gz);
    const speaker = solid(new CylinderGeometry(0.18, 0.18, 0.08, 56), GREEN, 0.95, 30);
    speaker.rotation.x = Math.PI / 2;
    speaker.position.z = 0.04;
    g.add(speaker);
    for (const r of [0.13, 0.09, 0.05]) g.add(segs(circlePts(r, 48, 'xy', [0, 0, 0.082]), GREEN, 0.6));
    addModule(
      'reply',
      g,
      [0.5, -0.35, 1.3],
      0,
      circlePts(0.18, 48, 'xy', [gx, gy, gz + 0.004]),
      V(gx, gy, gz + 0.004),
      V(0, -0.08, 0.08),
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
      root.rotation.x = -0.04 + explode * 0.06;
      root.position.y = -0.1 - explode * 0.4 + Math.sin(time / 1800) * 0.04;

      for (let i = 0; i < rings.length; i++) {
        const shift = (i - RING_CENTER_INDEX) * RING_OPEN_STEP * open;
        rings[i].position.y = RING_SPECS[i].y + shift;
      }
      core.rotation.y = time / 4000;
      coreMats[0].opacity = open * 0.95;
      coreMats[1].opacity = open * 0.6;

      for (const l of drawn) l.geometry.setDrawRange(0, Math.floor((l.userData.count * draw) / 2) * 2);

      for (const m of modules) {
        const shift = (m.ring - RING_CENTER_INDEX) * RING_OPEN_STEP * open;
        m.group.position.copy(m.rest).addScaledVector(m.dir, explode);
        m.group.position.y += shift;
        m.socketMat.opacity = explode * 0.9;
        const pos = m.tether.geometry.attributes.position as BufferAttribute;
        pos.setXYZ(0, m.socketCenter.x, m.socketCenter.y + shift, m.socketCenter.z);
        pos.setXYZ(1, m.group.position.x, m.group.position.y, m.group.position.z);
        pos.needsUpdate = true;
        m.tether.computeLineDistances();
        m.tetherMat.opacity = explode * 0.55;
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
