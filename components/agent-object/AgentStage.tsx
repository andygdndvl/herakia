'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { animate } from 'animejs';
import { createAgentScene } from './scene';
import { phases } from './layout';
import type { AgentObjectText } from './content';

interface AgentStageProps {
  /** progression 0→1 de la section, écrite par AgentObjectSection */
  progress: MutableRefObject<number>;
  reduced: boolean;
  text: AgentObjectText;
}

export default function AgentStage({ progress, reduced }: AgentStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const scene = createAgentScene(canvas);
    const draw = { v: reduced ? 1 : 0 };
    let drawAnim: ReturnType<typeof animate> | null = null;
    let raf = 0;
    let visible = false;

    const size = () => scene.resize(wrap.clientWidth, wrap.clientHeight);
    size();
    const ro = new ResizeObserver(size);
    ro.observe(wrap);

    const frame = (t: number) => {
      raf = 0;
      if (!visible) return;
      const ph = phases(reduced ? 1 : progress.current);
      scene.render({ explode: ph.explode, open: ph.open, rotation: ph.rotation, time: reduced ? 0 : t, draw: draw.v });
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      // Le tracé initial démarre à la première apparition, pas au montage
      if (visible && !reduced && !drawAnim) drawAnim = animate(draw, { v: [0, 1], duration: 2600, ease: 'inOutQuart' });
      if (visible && !raf) raf = requestAnimationFrame(frame);
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
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
    </div>
  );
}
