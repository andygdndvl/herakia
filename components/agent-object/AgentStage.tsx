'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { animate } from 'animejs';
import { createAgentScene } from './scene';
import { layoutCallouts, phases, PART_IDS, type PartId } from './layout';
import type { AgentObjectText } from './content';

interface AgentStageProps {
  /** progression 0→1 de la section, écrite par AgentObjectSection */
  progress: MutableRefObject<number>;
  reduced: boolean;
  text: AgentObjectText;
}

type RefMap<T> = Partial<Record<PartId, T | null>>;

export default function AgentStage({ progress, reduced, text }: AgentStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const labels = useRef<RefMap<HTMLDivElement>>({});
  const lines = useRef<RefMap<SVGPolylineElement>>({});
  const dots = useRef<RefMap<SVGCircleElement>>({});

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const svg = svgRef.current;
    if (!wrap || !canvas || !svg) return;

    const scene = createAgentScene(canvas);
    const desktop = window.matchMedia('(min-width: 768px)');
    const draw = { v: reduced ? 1 : 0 };
    let drawAnim: ReturnType<typeof animate> | null = null;
    let raf = 0;
    let visible = false;
    let width = 0;

    const paint = (t: number) => {
      const ph = phases(reduced ? 1 : progress.current);
      const anchors = scene.render({ explode: ph.explode, open: ph.open, rotation: ph.rotation, time: reduced ? 0 : t, draw: draw.v });
      const show = desktop.matches;
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
      }
    };

    const size = () => {
      width = wrap.clientWidth;
      scene.resize(width, wrap.clientHeight);
      svg.setAttribute('viewBox', `0 0 ${width} ${wrap.clientHeight}`);
      // Mouvement réduit : pas de boucle rAF, on repeint explicitement au resize.
      if (reduced && visible) paint(0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(wrap);

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
      drawAnim?.revert();
      scene.dispose();
    };
  }, [progress, reduced]);

  return (
    // Décoratif : les capacités existent en HTML lisible dans AgentObjectSection (liste SSR)
    <div ref={wrapRef} className="absolute inset-0" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <svg ref={svgRef} className="pointer-events-none absolute inset-0 hidden h-full w-full md:block">
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
              r={3}
              className="fill-green-primary"
              style={{ opacity: 0 }}
            />
          </g>
        ))}
      </svg>
      {PART_IDS.map((id) => {
        const part = text.parts[id];
        return (
          <div
            key={id}
            ref={(el) => {
              labels.current[id] = el;
            }}
            className="pointer-events-none absolute hidden w-[250px] md:block"
            style={{ opacity: 0 }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-green-primary">{part.k}</p>
            <p className="mt-1.5 font-display text-[22px] font-bold tracking-tight text-text-primary">{part.title}</p>
            <p className="mt-1 text-[13px] leading-snug text-text-muted">{part.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
