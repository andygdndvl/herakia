'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { animate } from 'animejs';
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

export default function AgentStage({ progress, reduced, text }: AgentStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const labels = useRef<RefMap<HTMLDivElement>>({});
  const lines = useRef<RefMap<SVGPolylineElement>>({});
  const dots = useRef<RefMap<SVGCircleElement>>({});
  const ticks = useRef<RefMap<SVGPathElement>>({});
  const plateRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const svg = svgRef.current;
    if (!wrap || !canvas || !svg) return;

    const scene = createAgentScene(canvas);
    const desktop = window.matchMedia('(min-width: 1200px)');
    const draw = { v: reduced ? 1 : 0 };
    let drawAnim: ReturnType<typeof animate> | null = null;
    let raf = 0;
    let visible = false;
    let width = 0;

    const paint = (t: number) => {
      const ph = phases(reduced ? 1 : progress.current);
      const anchors = scene.render({ explode: ph.explode, open: ph.open, rotation: ph.rotation, time: reduced ? 0 : t, draw: draw.v });
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
        const label = labels.current[box.id];
        const line = lines.current[box.id];
        const dot = dots.current[box.id];
        if (label) {
          label.style.left = `${box.left}px`;
          label.style.top = `${box.top}px`;
          label.style.textAlign = box.side === 'left' ? 'right' : 'left';
          label.style.opacity = String(o);
          label.style.transform = `translateY(${(1 - o) * 12}px)`;
        }
        if (line) {
          line.setAttribute('points', box.points);
          line.style.opacity = String(o);
        }
        if (dot) {
          dot.setAttribute('cx', String(box.ax));
          dot.setAttribute('cy', String(box.ay));
          dot.style.opacity = String(o);
        }
        const tick = ticks.current[box.id];
        if (tick) {
          tick.setAttribute('d', box.tick);
          tick.style.opacity = String(o * 0.7);
        }
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
      // Mouvement réduit : pas de boucle rAF, on repeint explicitement au resize.
      if (reduced && visible) paint(0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(wrap);
    // La bascule légendes/liste mobile change la largeur réservée à la caméra : recalcule.
    desktop.addEventListener('change', size);

    // Mouvement réduit : pas de boucle rAF continue — un rendu à l'apparition et à chaque resize.
    const frame = (t: number) => {
      raf = 0;
      if (!visible) return;
      paint(t);
      if (!reduced) raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduced && !drawAnim) drawAnim = animate(draw, { v: [0, 1], duration: 2600, ease: 'inOutQuart' });
      if (visible && reduced) paint(0);
      if (visible && !reduced && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      desktop.removeEventListener('change', size);
      drawAnim?.revert();
      scene.dispose();
    };
  }, [progress, reduced]);

  return (
    // Décoratif : les capacités existent en HTML lisible dans AgentObjectSection (liste SSR)
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
      <div ref={plateRef} className="pointer-events-none absolute inset-0 hidden min-[1200px]:block" style={{ opacity: 0 }}>
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
            <p className="mt-1 text-[13px] leading-snug text-text-muted">{part.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
