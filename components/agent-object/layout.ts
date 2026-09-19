export const PART_IDS = ['perceive', 'decide', 'act', 'connect', 'report', 'reply'] as const;
export type PartId = (typeof PART_IDS)[number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);

export interface Phases {
  /** 0 = assemblé, 1 = modules détachés (15 → 55 %) */
  explode: number;
  /** ouverture de la pierre et apparition du cœur (25 → 55 %) */
  open: number;
  /** opacité de chaque légende, une par une (55 → 85 %) */
  labels: Record<PartId, number>;
  /** opacité du bloc d'intro (s'efface 40 → 52 %) */
  intro: number;
  /** opacité de la phrase finale (85 → 91 %) */
  finale: number;
  /** rotation Y de l'objet (radians) */
  rotation: number;
}

export function phases(p: number): Phases {
  const labels = {} as Record<PartId, number>;
  PART_IDS.forEach((id, i) => {
    labels[id] = clamp01((p - (0.55 + i * 0.045)) / 0.05);
  });
  return {
    explode: easeInOutCubic(clamp01((p - 0.15) / 0.4)),
    open: easeInOutCubic(clamp01((p - 0.25) / 0.3)),
    labels,
    intro: 1 - clamp01((p - 0.4) / 0.12),
    finale: clamp01((p - 0.85) / 0.06),
    rotation: 0.85 - p * 0.75,
  };
}

export interface ScreenAnchor {
  id: PartId;
  x: number;
  y: number;
}

export interface CalloutBox {
  id: PartId;
  side: 'left' | 'right';
  /** position de la légende (px, relatif à la scène) */
  left: number;
  top: number;
  /** points de la ligne de rappel : ancrage → coude → bord de la légende */
  points: string;
  ax: number;
  ay: number;
}

const LABEL_WIDTH = 250;
const ROW_GAP = 118;
const TOP = 70;

/** Range les légendes en deux colonnes (gauche/droite selon l'ancrage), sans chevauchement vertical. */
export function layoutCallouts(anchors: ScreenAnchor[], width: number): CalloutBox[] {
  const out: CalloutBox[] = [];
  for (const side of ['left', 'right'] as const) {
    const column = anchors
      .filter((a) => (side === 'left' ? a.x < width / 2 : a.x >= width / 2))
      .sort((a, b) => a.y - b.y);
    let next = TOP;
    for (const a of column) {
      const y = Math.max(a.y, next);
      next = y + ROW_GAP;
      const colX = side === 'left' ? width * 0.07 : width * 0.93;
      const left = side === 'left' ? colX : colX - LABEL_WIDTH;
      const edge = side === 'left' ? colX + LABEL_WIDTH + 12 : colX - LABEL_WIDTH - 12;
      const knee = side === 'left' ? edge + 30 : edge - 30;
      out.push({
        id: a.id,
        side,
        left,
        top: y - 22,
        points: `${a.x},${a.y} ${knee},${y} ${edge},${y}`,
        ax: a.x,
        ay: a.y,
      });
    }
  }
  return out;
}
