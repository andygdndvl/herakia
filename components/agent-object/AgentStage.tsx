'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { animate, scrambleText } from 'animejs';
import { createAgentScene } from './scene';
import { layoutCallouts, phases, PART_IDS, LABEL_WIDTH, type PartId } from './layout';
import type { AgentObjectText } from './content';

interface AgentStageProps {
  /** progression 0→1 de la section, écrite par AgentObjectSection */
  progress: MutableRefObject<number>;
  reduced: boolean;
  text: AgentObjectText;
}

type RefMap<T> = Partial<Record<PartId, T | null>>;

/** Plafond d'opacité du cartouche : discret par construction, jamais au niveau de l'objet. */
const PLATE_OPACITY = 0.6;

// ── Survol des organes ─────────────────────────────────────────────────────
/** Côté de la zone sensible (px), centrée sur l'ancre projetée de la pièce. */
const HOT_SIZE = 96;
/** Opacité des cinq autres légendes pendant qu'une pièce est isolée. */
const DIM = 0.45;
/** Délai de retour à l'état neutre : évite le clignotement quand le curseur traverse une bordure. */
const LEAVE_DELAY = 150;
/** Durée du décodage en scramble. */
const SCRAMBLE_MS = 620;
/** Raideur de l'interpolation du survol (par seconde) : ~120 ms pour aller à 75 %. */
const HOVER_DAMP = 11;
/**
 * La légende n'est survolable qu'une fois vraiment lisible : au-dessous, la zone sensible serait
 * posée sur une pièce encore en train de sortir du fût.
 */
const HOT_MIN_OPACITY = 0.5;

export default function AgentStage({ progress, reduced, text }: AgentStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const labels = useRef<RefMap<HTMLDivElement>>({});
  const lines = useRef<RefMap<SVGPolylineElement>>({});
  const dots = useRef<RefMap<SVGCircleElement>>({});
  const ticks = useRef<RefMap<SVGPathElement>>({});
  const descs = useRef<RefMap<HTMLParagraphElement>>({});
  const hots = useRef<RefMap<HTMLButtonElement>>({});
  const plateRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const hotLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const svg = svgRef.current;
    if (!wrap || !canvas || !svg) return;

    const scene = createAgentScene(canvas);
    const desktop = window.matchMedia('(min-width: 1200px)');
    // Pointeur fin ET survol réel : sur tablette / mobile il n'y a pas d'état « survolé », donc pas
    // de zone sensible et les descriptions restent affichées en permanence (comportement actuel).
    // En mouvement réduit non plus : tout reste affiché, comme aujourd'hui.
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const draw = { v: reduced ? 1 : 0 };
    let drawAnim: ReturnType<typeof animate> | null = null;
    let raf = 0;
    let visible = false;
    let width = 0;

    // ── État de survol ───────────────────────────────────────────────────────
    // Il ne passe JAMAIS par React : `hovered` est une variable de fermeture, et l'intensité par
    // pièce est amortie dans la boucle de peinture. Aucun setState par image.
    let interactive = false;
    let hovered: PartId | null = null;
    let leaveTimer = 0;
    let scramble: ReturnType<typeof animate> | null = null;
    const amount = {} as Record<PartId, number>;
    PART_IDS.forEach((id) => {
      amount[id] = 0;
    });
    let prevPaint = 0;

    /** Applique le mode : zones sensibles + descriptions masquées, ou tout affiché comme avant. */
    const applyMode = () => {
      const next = !reduced && desktop.matches && fine.matches;
      if (next === interactive) return;
      interactive = next;
      if (hotLayerRef.current) hotLayerRef.current.style.display = next ? 'block' : 'none';
      if (!next) setHover(null);
      for (const id of PART_IDS) {
        const d = descs.current[id];
        if (!d) continue;
        d.style.opacity = next ? '0' : '1';
        d.style.transform = next ? 'translateY(4px)' : 'translateY(0)';
      }
    };

    function setHover(id: PartId | null) {
      if (hovered === id) return;
      hovered = id;
      // Un seul scramble à la fois : `revert()` remet le texte d'origine, donc jamais de charabia
      // résiduel quand on passe d'une pièce à l'autre.
      scramble?.revert();
      scramble = null;
      for (const pid of PART_IDS) {
        const d = descs.current[pid];
        if (!d) continue;
        const on = pid === id;
        d.style.opacity = on ? '1' : '0';
        d.style.transform = on ? 'translateY(0)' : 'translateY(4px)';
      }
      const target = id ? descs.current[id] : null;
      if (target) {
        scramble = animate(target, {
          textContent: scrambleText({
            chars: 'lowercase',
            duration: SCRAMBLE_MS,
          }),
          duration: SCRAMBLE_MS,
          ease: 'linear',
        });
      }
    }

    const enter = (id: PartId) => () => {
      window.clearTimeout(leaveTimer);
      if (interactive) setHover(id);
    };
    const leave = () => {
      window.clearTimeout(leaveTimer);
      leaveTimer = window.setTimeout(() => setHover(null), LEAVE_DELAY);
    };
    /** Le focus clavier déclenche exactement le même état — mais pas le focus de clic souris. */
    const focus = (id: PartId) => (e: FocusEvent) => {
      const el = e.currentTarget as HTMLElement;
      if (el.matches(':focus-visible')) enter(id)();
    };

    const paint = (t: number) => {
      const dt = prevPaint ? Math.min(0.05, (t - prevPaint) / 1000) : 0;
      prevPaint = t;
      // Amortissement exponentiel de l'intensité de survol : une seule source pour la scène 3D
      // (grossissement, pointillé) et pour les légendes (isolement).
      const k = dt > 0 ? 1 - Math.exp(-dt * HOVER_DAMP) : 1;
      let peak = 0;
      for (const id of PART_IDS) {
        amount[id] += ((hovered === id ? 1 : 0) - amount[id]) * k;
        if (amount[id] > peak) peak = amount[id];
      }
      const ph = phases(reduced ? 1 : progress.current);
      const anchors = scene.render({
        explode: ph.explode,
        open: ph.open,
        rotation: ph.rotation,
        time: reduced ? 0 : t,
        draw: draw.v,
        hover: amount,
      });
      const show = desktop.matches;
      // Cartouche d'ingénieur : il n'existe qu'avec les légendes (≥ 1200 px) et se lève avec
      // l'ouverture. Plafond 0.6 : il encadre la lecture, il ne doit jamais la disputer à l'objet.
      // Il est aussi retenu tant que le bloc d'intro est là : à 1440 px ce bloc fait 528 px de
      // large et l'équerre haut-gauche tomberait en plein dans le titre. L'intro passe la main.
      if (plateRef.current) {
        plateRef.current.style.opacity = String(show ? ph.explode * (1 - ph.intro) * PLATE_OPACITY : 0);
      }
      for (const box of layoutCallouts(anchors, width)) {
        const o = show ? ph.labels[box.id] : 0;
        // Isolement : les cinq autres légendes tombent à DIM, sans bouger de place.
        const iso = 1 - peak * (1 - DIM) * (1 - amount[box.id]);
        const label = labels.current[box.id];
        const line = lines.current[box.id];
        const dot = dots.current[box.id];
        const live = interactive && o > HOT_MIN_OPACITY;
        if (label) {
          label.style.left = `${box.left}px`;
          label.style.top = `${box.top}px`;
          label.style.textAlign = box.side === 'left' ? 'right' : 'left';
          label.style.opacity = String(o * iso);
          label.style.transform = `translateY(${(1 - o) * 12}px)`;
          // La légende elle-même est survolable (le brief : « au survol d'une pièce OU de sa
          // légende »). Seule la légende reçoit les clics ; le reste de la couche reste transparent.
          label.style.pointerEvents = live ? 'auto' : 'none';
        }
        if (line) {
          line.setAttribute('points', box.points);
          line.style.opacity = String(o * iso);
        }
        if (dot) {
          dot.setAttribute('cx', String(box.ax));
          dot.setAttribute('cy', String(box.ay));
          dot.style.opacity = String(o * iso);
        }
        const tick = ticks.current[box.id];
        if (tick) {
          tick.setAttribute('d', box.tick);
          tick.style.opacity = String(o * iso * 0.7);
        }
        const hot = hots.current[box.id];
        if (hot) {
          hot.style.left = `${box.ax}px`;
          hot.style.top = `${box.ay}px`;
          hot.style.display = live ? 'block' : 'none';
        }
        // Une pièce dont la légende s'efface (retour en arrière du scroll) ne reste pas survolée.
        if (!live && hovered === box.id) setHover(null);
      }
    };

    const size = () => {
      width = wrap.clientWidth;
      const reservedSide = desktop.matches ? LABEL_WIDTH + 56 : 0;
      scene.resize(width, wrap.clientHeight, { reservedSide });
      svg.setAttribute('viewBox', `0 0 ${width} ${wrap.clientHeight}`);
      // Les équerres encadrent la zone laissée à l'objet. Elles se posent dans la gouttière entre
      // l'objet et les colonnes de légendes : la largeur réservée à la caméra, plus 10 px de jeu.
      if (frameRef.current) {
        const inset = `${Math.max(16, reservedSide + 10)}px`;
        frameRef.current.style.left = inset;
        frameRef.current.style.right = inset;
      }
      applyMode();
      // Mouvement réduit : pas de boucle rAF, on repeint explicitement au resize.
      if (reduced && visible) paint(0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(wrap);
    // La bascule légendes/liste mobile change la largeur réservée à la caméra : recalcule.
    desktop.addEventListener('change', size);
    fine.addEventListener('change', applyMode);

    // ── Zones sensibles et légendes : survol + focus clavier ────────────────
    const detach: Array<() => void> = [];
    for (const id of PART_IDS) {
      const on = enter(id);
      const onFocus = focus(id);
      for (const el of [hots.current[id], labels.current[id]] as Array<HTMLElement | null | undefined>) {
        if (!el) continue;
        el.addEventListener('mouseenter', on);
        el.addEventListener('mouseleave', leave);
        detach.push(() => {
          el.removeEventListener('mouseenter', on);
          el.removeEventListener('mouseleave', leave);
        });
      }
      const hot = hots.current[id];
      if (hot) {
        hot.addEventListener('focus', onFocus);
        hot.addEventListener('blur', leave);
        detach.push(() => {
          hot.removeEventListener('focus', onFocus);
          hot.removeEventListener('blur', leave);
        });
      }
    }

    // Mouvement réduit : pas de boucle rAF continue — un rendu à l'apparition et à chaque resize.
    const frame = (t: number) => {
      raf = 0;
      if (!visible) return;
      paint(t);
      if (!reduced) raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduced && !drawAnim)
        drawAnim = animate(draw, {
          v: [0, 1],
          duration: 2600,
          ease: 'inOutQuart',
        });
      if (visible && reduced) paint(0);
      if (visible && !reduced && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(leaveTimer);
      io.disconnect();
      ro.disconnect();
      desktop.removeEventListener('change', size);
      fine.removeEventListener('change', applyMode);
      detach.forEach((off) => off());
      // Au démontage le texte est reverté : aucune description ne reste en charabia.
      scramble?.revert();
      drawAnim?.revert();
      scene.dispose();
    };
  }, [progress, reduced]);

  return (
    <>
      {/* Décoratif : les capacités existent en HTML lisible dans AgentObjectSection (liste SSR) */}
      <div ref={wrapRef} className="absolute inset-0" aria-hidden="true">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <svg ref={svgRef} className="pointer-events-none absolute inset-0 hidden h-full w-full min-[1200px]:block">
          {PART_IDS.map((id) => (
            <g key={id}>
              <polyline
                ref={(el) => {
                  lines.current[id] = el;
                }}
                fill="none"
                strokeWidth={1}
                className="stroke-green-line"
                style={{ opacity: 0 }}
              />
              <circle
                ref={(el) => {
                  dots.current[id] = el;
                }}
                r={2.5}
                className="fill-green-primary"
                style={{ opacity: 0 }}
              />
              {/* Repère de cote : deux graduations perpendiculaires à la ligne de rappel */}
              <path
                ref={(el) => {
                  ticks.current[id] = el;
                }}
                fill="none"
                strokeWidth={1}
                className="stroke-green-line"
                style={{ opacity: 0 }}
              />
            </g>
          ))}
        </svg>

        {/* ── Cartouche d'ingénieur : équerres, mention de vue, échelle. HTML et non 3D pour rester
          net à tous les pixel-ratios. Piloté en opacité par `paint` (≥ 1200 px seulement). ── */}
        <div
          ref={plateRef}
          className="pointer-events-none absolute inset-0 hidden min-[1200px]:block"
          style={{ opacity: 0 }}
        >
          <div ref={frameRef} className="absolute bottom-[68px] top-[200px]">
            {[
              'left-0 top-0 border-l border-t',
              'right-0 top-0 border-r border-t',
              'left-0 bottom-0 border-b border-l',
              'right-0 bottom-0 border-b border-r',
            ].map((pos) => (
              <span key={pos} className={`absolute h-6 w-6 border-border-strong ${pos}`} />
            ))}
            <span className="absolute left-0 top-full mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
              {text.plate}
            </span>
            <div className="absolute right-0 top-full mt-3 flex items-center gap-2">
              {/* Échelle : segment gradué (repères longs aux extrémités et au milieu) */}
              <svg width="72" height="8" viewBox="0 0 72 8" fill="none" aria-hidden="true">
                <path
                  d="M0.5 7.5V0.5M18.5 7.5V3.5M36.5 7.5V0.5M54.5 7.5V3.5M71.5 7.5V0.5M0.5 7.5H71.5"
                  className="stroke-border-strong"
                  strokeWidth={1}
                />
              </svg>
              <span className="font-mono text-[10px] tracking-[0.12em] text-text-muted">1:2</span>
            </div>
          </div>
        </div>
        {PART_IDS.map((id) => {
          const part = text.parts[id];
          return (
            <div
              key={id}
              ref={(el) => {
                labels.current[id] = el;
              }}
              className="pointer-events-none absolute hidden min-[1200px]:block"
              style={{ opacity: 0, width: LABEL_WIDTH }}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-green-primary">{part.k}</p>
              <p className="mt-1.5 font-display text-[22px] font-bold tracking-tight text-text-primary">{part.title}</p>
              {/* Filet de cartouche sous le titre : il sépare l'identifiant du commentaire, comme sur un plan. */}
              <span className="mt-2 inline-block h-px w-12 bg-border-strong" />
              {/* Description : masquée tant que rien n'est survolé (pointeur fin uniquement — voir
                `applyMode`). Fondu + léger déplacement en CSS, décodage du texte en scramble. */}
              <p
                ref={(el) => {
                  descs.current[id] = el;
                }}
                className="mt-1 text-[13px] leading-snug text-text-muted"
                style={{
                  transition: 'opacity 220ms ease, transform 220ms ease',
                }}
              >
                {part.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Zones sensibles : de vrais boutons, hors de la couche décorative pour rester
          accessibles au clavier. La couche reste transparente aux clics ; seuls les boutons
          reçoivent le pointeur, et ils ne bloquent pas le défilement (la molette les traverse).
          `z-20` : le bloc d'intro est en `z-10` et, même effacé, il reste dans le flux — sans ça
          la zone du capteur (en haut à gauche, sous le titre) n'aurait jamais répondu. ── */}
      <div
        ref={hotLayerRef}
        className="pointer-events-none absolute inset-0 z-20 hidden min-[1200px]:block"
        style={{ display: 'none' }}
      >
        {PART_IDS.map((id) => (
          <button
            key={id}
            type="button"
            ref={(el) => {
              hots.current[id] = el;
            }}
            aria-label={text.parts[id].title}
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none focus-visible:ring-1 focus-visible:ring-green-primary"
            style={{ display: 'none', width: HOT_SIZE, height: HOT_SIZE }}
          />
        ))}
      </div>
    </>
  );
}
