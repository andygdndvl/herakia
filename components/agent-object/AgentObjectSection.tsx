'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { prefersReducedMotion, useScrollProgress } from '@/lib/anim';
import { AGENT_OBJECT_TEXT } from './content';
import { phases } from './layout';

const AgentStage = dynamic(() => import('./AgentStage'), { ssr: false });

type Mode = 'pending' | 'animated' | 'reduced' | 'static';

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function AgentObjectSection() {
  const t = AGENT_OBJECT_TEXT[useLang()];
  const progress = useRef(0);
  const introRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('pending');
  const [near, setNear] = useState(false);

  useEffect(() => {
    setMode(!hasWebGL() ? 'static' : prefersReducedMotion() ? 'reduced' : 'animated');
  }, []);

  const pinRef = useScrollProgress<HTMLDivElement>(
    (p) => {
      progress.current = p;
      if (introRef.current) introRef.current.style.opacity = String(phases(p).intro);
    },
    { enter: 'top top', leave: 'bottom bottom', sync: 0.2 },
  );

  // three.js n'est chargé que lorsque la section est à moins d'un écran
  useEffect(() => {
    const el = pinRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '100% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pinRef]);

  const pinned = mode === 'pending' || mode === 'animated';

  return (
    <section aria-labelledby="agent-title" className="relative">
      <div ref={pinRef} className={pinned ? 'relative h-[300vh] md:h-[400vh]' : 'relative'}>
        <div className={pinned ? 'sticky top-0 h-screen overflow-hidden' : 'relative overflow-hidden py-24'}>
          <div ref={introRef} className="relative z-10 max-w-xl px-6 pt-24 lg:px-12 lg:pt-28">
            <span className="eyebrow">{t.eyebrow}</span>
            <h2 id="agent-title" className="h-section mt-4 !text-4xl md:!text-6xl">
              {t.title}
            </h2>
            <p className="mt-5 hidden text-base leading-relaxed text-text-secondary md:block md:text-lg">{t.body}</p>
          </div>

          {mode !== 'static' && near && (
            <div
              className={
                pinned
                  ? 'absolute inset-x-0 top-[30vh] h-[45vh] md:inset-0 md:h-auto'
                  : 'relative mx-auto mt-8 h-[70vh] max-w-6xl'
              }
            >
              <AgentStage progress={progress} reduced={mode === 'reduced'} text={t} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
