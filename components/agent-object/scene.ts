import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  EdgesGeometry,
  ExtrudeGeometry,
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
  Shape,
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
  /** -1 = moitié gauche de la pierre, 1 = droite, 0 = aucune */
  half: -1 | 0 | 1;
  socketCenter: Vector3;
  anchor: Vector3;
  socketMat: LineBasicMaterial;
  tether: Line;
  tetherMat: LineDashedMaterial;
}

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

  // ── Monolithe : deux moitiés chanfreinées qui s'écartent pour révéler le cœur ──
  const W = 2.0, H = 3.0, D = 1.3, b = 0.07, zf = D / 2 + 0.004;
  function halfBlock(x0: number, x1: number): Group {
    const s = new Shape();
    s.moveTo(x0 + b, -H / 2 + b);
    s.lineTo(x1 - b, -H / 2 + b);
    s.lineTo(x1 - b, H / 2 - b);
    s.lineTo(x0 + b, H / 2 - b);
    s.closePath();
    const geo = new ExtrudeGeometry(s, {
      depth: D - 2 * b,
      bevelEnabled: true,
      bevelThickness: b,
      bevelSize: b,
      bevelSegments: 1,
    });
    geo.translate(0, 0, -(D - 2 * b) / 2);
    return solid(geo, WHITE, 0.95, 15);
  }
  const leftHalf = new Group();
  leftHalf.add(halfBlock(-W / 2, 0));
  root.add(leftHalf);
  const rightHalf = new Group();
  rightHalf.add(halfBlock(0, W / 2));
  root.add(rightHalf);

  // Gravures façon glyphes (pseudo-aléatoire déterministe) sur la moitié droite
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const glyph: Vector3[] = [];
  for (let y = 1.25; y > -0.45; y -= 0.13) {
    let x = 0.14;
    while (x < 0.8) {
      const w = 0.05 + rnd() * 0.2;
      if (x + w > 0.82) break;
      glyph.push(V(x, y, zf), V(x + w, y, zf));
      if (rnd() > 0.7) glyph.push(V(x, y, zf), V(x, y - 0.06, zf));
      x += w + 0.05 + rnd() * 0.06;
    }
  }
  rightHalf.add(segs(glyph, WHITE, 0.35));
  rightHalf.add(segs(rectPts(0.07, -0.55, 0.88, 1.33, zf), WHITE, 0.25));
  const grooves: Vector3[] = [];
  for (const y of [-1.1, -0.95, 1.05, 1.2]) grooves.push(V(W / 2 + 0.004, y, -D / 2 + 0.15), V(W / 2 + 0.004, y, D / 2 - 0.15));
  rightHalf.add(segs(grooves, WHITE, 0.3));
  const leftLines: Vector3[] = [];
  for (const y of [-0.3, -0.42, -0.54]) leftLines.push(V(-0.85, y, zf), V(-0.15, y, zf));
  leftHalf.add(segs(leftLines, WHITE, 0.3));

  // ── Cœur vert (visible quand la pierre s'ouvre) ──
  const coreMats = [lineMat(GREEN, 0), lineMat(GREEN, 0)];
  const core = new Group();
  core.position.set(0, 0.1, 0);
  core.add(new LineSegments(track(new EdgesGeometry(track(new IcosahedronGeometry(0.42, 0)))), coreMats[0]));
  core.add(new LineSegments(track(new EdgesGeometry(track(new OctahedronGeometry(0.2, 0)))), coreMats[1]));
  root.add(core);

  // ── Câbles fixes sous l'objet ──
  const cables: Array<[number, number, number, number]> = [
    [0.3, -0.3, 1.6, -1.8],
    [-0.2, -0.4, -1.2, -2.2],
    [0.6, 0.1, 2.4, -0.4],
  ];
  for (const [x, z, ex, ez] of cables) {
    const pts = new CatmullRomCurve3([
      V(x, -H / 2, z),
      V(x + (ex - x) * 0.2, -H / 2 - 0.8, z + (ez - z) * 0.2),
      V(ex, -H / 2 - 1.6, ez),
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
    half: Module['half'],
    socketPts: Vector3[],
    socketCenter: Vector3,
    anchor: Vector3,
  ) {
    root.add(group);
    const socketMat = lineMat(GREEN, 0);
    const socket = new LineSegments(track(new BufferGeometry().setFromPoints(socketPts)), socketMat);
    (half === -1 ? leftHalf : half === 1 ? rightHalf : root).add(socket);
    const tetherMat = track(
      new LineDashedMaterial({ color: GREEN, dashSize: 0.06, gapSize: 0.05, transparent: true, opacity: 0 }),
    );
    const tether = new Line(track(new BufferGeometry().setFromPoints([V(0, 0, 0), V(0, 0, 0)])), tetherMat);
    root.add(tether);
    modules.push({ id, group, rest: group.position.clone(), dir: V(...dir), half, socketCenter, anchor, socketMat, tether, tetherMat });
  }

  // Capteur — face avant, haut gauche
  {
    const g = new Group();
    g.position.set(-0.45, 0.82, D / 2);
    const box = solid(new BoxGeometry(0.72, 0.72, 0.3), GREEN, 0.95);
    box.position.z = 0.15;
    g.add(box);
    const lens = solid(new CylinderGeometry(0.22, 0.22, 0.14, 48), GREEN, 0.95, 30);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.37;
    g.add(lens);
    g.add(segs(circlePts(0.13, 48, 'xy', [0, 0, 0.442]), GREEN, 0.8));
    g.add(segs(circlePts(0.05, 32, 'xy', [0, 0, 0.442]), GREEN, 0.8));
    addModule('perceive', g, [-0.2, 0.15, 1.9], -1, rectPts(-0.81, 0.46, -0.09, 1.18, zf), V(-0.45, 0.82, zf), V(0, 0.4, 0.3));
  }
  // Bras articulé — flanc gauche
  {
    const g = new Group();
    g.position.set(-W / 2, 0.05, 0.1);
    const shoulder = solid(new CylinderGeometry(0.2, 0.2, 0.22, 40), GREEN, 0.95, 30);
    shoulder.rotation.z = Math.PI / 2;
    shoulder.position.x = -0.11;
    g.add(shoulder);
    const p1 = new Group();
    p1.position.x = -0.22;
    p1.rotation.z = 0.5;
    g.add(p1);
    const upper = solid(new BoxGeometry(0.9, 0.12, 0.12), GREEN, 0.95);
    upper.position.x = -0.45;
    p1.add(upper);
    const p2 = new Group();
    p2.position.x = -0.9;
    p2.rotation.z = 0.75;
    p1.add(p2);
    const elbow = solid(new CylinderGeometry(0.12, 0.12, 0.2, 36), GREEN, 0.95, 30);
    elbow.rotation.x = Math.PI / 2;
    p2.add(elbow);
    const fore = solid(new BoxGeometry(0.7, 0.1, 0.1), GREEN, 0.95);
    fore.position.x = -0.35;
    p2.add(fore);
    for (const s of [-1, 1]) {
      const finger = solid(new BoxGeometry(0.2, 0.04, 0.09), GREEN, 0.95);
      finger.position.set(-0.78, s * 0.055, 0);
      p2.add(finger);
    }
    addModule('act', g, [-1.7, 0.1, 0.3], -1, circlePts(0.22, 40, 'yz', [-W / 2 - 0.004, 0.05, 0.1]), V(-W / 2 - 0.004, 0.05, 0.1), V(-0.6, 0.2, 0));
  }
  // Écran flottant — flanc droit
  {
    const g = new Group();
    g.position.set(W / 2, 0.5, 0.15);
    const mount = solid(new CylinderGeometry(0.05, 0.05, 0.6, 20), GREEN, 0.8, 30);
    mount.rotation.z = Math.PI / 2;
    mount.position.x = 0.3;
    g.add(mount);
    const screen = new Group();
    screen.position.x = 0.85;
    screen.rotation.y = 0.35;
    g.add(screen);
    screen.add(solid(new BoxGeometry(1.05, 1.45, 0.05), GREEN, 0.95));
    const z = 0.03;
    const ui = rectPts(-0.44, -0.64, 0.44, 0.64, z);
    ui.push(V(-0.36, 0.52, z), V(0.05, 0.52, z));
    [0.36, 0.28, 0.2].forEach((y, i) => ui.push(V(-0.36, y, z), V(-0.36 + [0.62, 0.48, 0.55][i], y, z)));
    [0.18, 0.3, 0.24, 0.42, 0.36, 0.5].forEach((h, i) => {
      const x = -0.3 + i * 0.12;
      ui.push(V(x, -0.5, z), V(x, -0.5 + h, z));
    });
    ui.push(V(-0.36, -0.5, z), V(0.36, -0.5, z));
    screen.add(segs(ui, GREEN, 0.7));
    addModule('report', g, [1.5, 0.35, 0.2], 1, circlePts(0.1, 24, 'yz', [W / 2 + 0.004, 0.5, 0.15]), V(W / 2 + 0.004, 0.5, 0.15), V(1.2, 0.75, 0.2));
  }
  // Couronne de connecteurs — dessus
  {
    const g = new Group();
    g.position.set(0, H / 2, 0);
    const disc = solid(new CylinderGeometry(0.55, 0.55, 0.14, 64), GREEN, 0.95, 30);
    disc.position.y = 0.07;
    g.add(disc);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const port = solid(new BoxGeometry(0.11, 0.1, 0.11), GREEN, 0.9);
      port.position.set(Math.cos(a) * 0.4, 0.19, Math.sin(a) * 0.4);
      port.rotation.y = -a;
      g.add(port);
    }
    const antenna = solid(new CylinderGeometry(0.02, 0.02, 0.75, 12), GREEN, 0.9, 30);
    antenna.position.set(0.2, 0.52, -0.1);
    g.add(antenna);
    addModule('connect', g, [0, 1.15, 0], 0, circlePts(0.55, 64, 'xz', [0, H / 2 + 0.004, 0]), V(0, H / 2 + 0.004, 0), V(0, 0.3, 0));
  }
  // Haut-parleur — face avant, bas droite
  {
    const g = new Group();
    g.position.set(0.48, -0.95, D / 2);
    const speaker = solid(new CylinderGeometry(0.34, 0.34, 0.1, 56), GREEN, 0.95, 30);
    speaker.rotation.x = Math.PI / 2;
    speaker.position.z = 0.05;
    g.add(speaker);
    for (const r of [0.25, 0.17, 0.09]) g.add(segs(circlePts(r, 48, 'xy', [0, 0, 0.102]), GREEN, 0.6));
    addModule('reply', g, [0.5, -0.35, 1.3], 1, circlePts(0.34, 48, 'xy', [0.48, -0.95, zf]), V(0.48, -0.95, zf), V(0, -0.1, 0.1));
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

      const sep = open * 0.55;
      leftHalf.position.x = -sep;
      rightHalf.position.x = sep;
      core.rotation.y = time / 4000;
      coreMats[0].opacity = open * 0.95;
      coreMats[1].opacity = open * 0.6;

      for (const l of drawn) l.geometry.setDrawRange(0, Math.floor((l.userData.count * draw) / 2) * 2);

      for (const m of modules) {
        const shift = m.half * sep;
        m.group.position.copy(m.rest).addScaledVector(m.dir, explode);
        m.group.position.x += shift;
        m.socketMat.opacity = explode * 0.9;
        const pos = m.tether.geometry.attributes.position as BufferAttribute;
        pos.setXYZ(0, m.socketCenter.x + shift, m.socketCenter.y, m.socketCenter.z);
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
