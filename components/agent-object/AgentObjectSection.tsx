'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { prefersReducedMotion, useScrollProgress } from '@/lib/anim';
import { AGENT_OBJECT_TEXT } from './content';
import { PART_IDS, phases } from './layout';

const AgentStage = dynamic(() => import('./AgentStage'), { ssr: false });

type Mode = 'pending' | 'animated' | 'reduced' | 'static';

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    // Libère tout de suite le contexte de test (le navigateur en limite le nombre)
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

export function AgentObjectSection() {
  const t = AGENT_OBJECT_TEXT[useLang()];
  const progress = useRef(0);
  const introRef = useRef<HTMLDivElement>(null);
  const finaleRef = useRef<HTMLParagraphElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [mode, setMode] = useState<Mode>('pending');
  const [near, setNear] = useState(false);
  const modeRef = useRef<Mode>('pending');

  useEffect(() => {
    const next = !hasWebGL() ? 'static' : prefersReducedMotion() ? 'reduced' : 'animated';
    modeRef.current = next;
    setMode(next);
  }, []);

  const pinRef = useScrollProgress<HTMLDivElement>(
    (p) => {
      progress.current = p;
      // En mode 'static'/'reduced', tout est déjà à son état final visible (voir classes ci-dessous) :
      // on n'écrit les styles d'animation que lorsque la section est réellement pilotée par le scroll.
      if (modeRef.current !== 'animated') return;
      const ph = phases(p);
      if (introRef.current) introRef.current.style.opacity = String(ph.intro);
      if (finaleRef.current) {
        finaleRef.current.style.opacity = String(ph.finale);
        finaleRef.current.style.transform = `translateY(${(1 - ph.finale) * 16}px)`;
      }
      PART_IDS.forEach((id, i) => {
        const li = itemRefs.current[i];
        if (li) li.style.opacity = String(0.3 + 0.7 * ph.labels[id]);
      });
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
      <div ref={pinRef} className={pinned ? 'relative h-[300vh] min-[1200px]:h-[400vh]' : 'relative'}>
        <div className={pinned ? 'sticky top-0 h-svh overflow-hidden' : 'relative overflow-hidden py-24'}>
          <div ref={introRef} className="relative z-10 max-w-xl px-6 pt-24 lg:px-12 lg:pt-28">
            <span className="eyebrow">{t.eyebrow}</span>
            <h2 id="agent-title" className="h-section mt-4 !text-4xl md:!text-6xl">
              {t.title}
            </h2>
            <p
              className={`mt-5 text-base leading-relaxed text-text-secondary md:text-lg ${pinned ? 'hidden md:block' : ''}`}
            >
              {t.body}
            </p>
          </div>

          {mode !== 'static' && near && (
            <div
              className={
                pinned
                  ? 'absolute inset-x-0 top-[30vh] h-[45vh] md:top-[36vh] md:h-[42vh] min-[1200px]:inset-0 min-[1200px]:h-auto'
                  : 'relative mx-auto mt-8 h-[70vh] max-w-6xl'
              }
            >
              <AgentStage progress={progress} reduced={mode === 'reduced'} text={t} />
            </div>
          )}

          <p
            ref={finaleRef}
            data-scroll-hidden={pinned ? '' : undefined}
            className={
              pinned
                ? 'absolute inset-x-6 bottom-10 z-10 hidden text-center font-display text-2xl font-bold tracking-tight text-text-primary min-[1200px]:block lg:text-3xl'
                : 'relative mt-8 px-6 text-center font-display text-2xl font-bold tracking-tight text-text-primary lg:text-3xl'
            }
          >
            {t.finale}
          </p>

          {/* Les six capacités en HTML rendu côté serveur : visibles sur mobile, lues par les lecteurs d'écran et Google partout */}
          <ol
            className={
              mode === 'static'
                ? 'relative z-10 mx-auto mt-10 grid max-w-4xl gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3'
                : pinned
                  ? 'absolute inset-x-6 bottom-6 z-10 grid grid-cols-2 gap-x-4 gap-y-3 min-[1200px]:sr-only'
                  : 'relative z-10 mx-auto mt-10 grid max-w-4xl gap-6 px-6 sm:grid-cols-2 min-[1200px]:sr-only'
            }
          >
            {PART_IDS.map((id, i) => (
              <li
                key={id}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
              >
                <p className="font-display text-base font-bold text-text-primary">{t.parts[id].title}</p>
                <p className="text-xs leading-snug text-text-muted">{t.parts[id].desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
