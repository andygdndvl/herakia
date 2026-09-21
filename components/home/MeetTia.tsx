'use client';

import { AnimatePresence } from 'framer-motion';
import { animate, onScroll, stagger } from 'animejs';
import Image from 'next/image';
import { Sparkles, Mic } from 'lucide-react';
import { useState } from 'react';
import { TiaCall } from '@/components/ui/TiaCall';
import { useLang, localize } from '@/components/i18n/LangProvider';
import { useAnime, useReveal } from '@/lib/anim';

const TEXT = {
  fr: {
    eyebrow: 'Notre agent vocal',
    title: 'Échanger avec Tia',
    badge: 'En vedette',
    online: 'En ligne',
    role: 'Agent d’accueil vocal',
    pitch:
      'Parlez-lui en direct : elle cerne votre besoin, vous oriente, et peut caler un échange. La meilleure preuve de ce qu’on sait faire.',
    cta: 'Parler à Tia',
  },
  en: {
    eyebrow: 'Our voice agent',
    title: 'Talk with Tia',
    badge: 'Featured',
    online: 'Online',
    role: 'Voice intake agent',
    pitch:
      'Talk to her live: she scopes your need, points you the right way, and can book a call. The best proof of what we can do.',
    cta: 'Talk to Tia',
  },
} as const;

const BARS = 28;

/** Onde vocale décorative : barres qui respirent en boucle, en pause hors écran. */
function Waveform() {
  const ref = useAnime<SVGSVGElement>((svg) => {
    animate(svg.querySelectorAll('rect'), {
      scaleY: [0.25, 1],
      duration: 700,
      delay: stagger(55, { from: 'center' }),
      ease: 'inOutSine',
      loop: true,
      alternate: true,
      autoplay: onScroll({ target: svg }),
    });
  });
  return (
    <svg ref={ref} viewBox={`0 0 ${BARS * 6} 32`} className="mt-6 h-8 w-44 text-green-primary" aria-hidden="true">
      {Array.from({ length: BARS }).map((_, i) => {
        const h = 8 + Math.round(20 * Math.abs(Math.sin(i * 0.9)));
        return (
          <rect
            key={i}
            x={i * 6}
            y={(32 - h) / 2}
            width={3}
            height={h}
            rx={1.5}
            fill="currentColor"
            opacity={Math.round((0.35 + 0.65 * Math.abs(Math.sin(i * 0.9))) * 100) / 100}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        );
      })}
    </svg>
  );
}

export function MeetTia() {
  const lang = useLang();
  const t = TEXT[lang];
  const [open, setOpen] = useState(false);
  const revealRef = useReveal<HTMLDivElement>({ stagger: 120 });

  return (
    <section className="px-6 pb-24 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div ref={revealRef}>
        <div data-reveal className="text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-green-primary">
            {t.eyebrow}
          </span>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-text-primary md:text-4xl text-balance">
            {t.title}
          </h2>
        </div>

        <div
          data-reveal
          className="relative mt-8 overflow-hidden rounded-3xl border border-border-green bg-gradient-to-br from-green-primary/10 via-bg-secondary/70 to-bg-secondary/70"
        >
          {/* Image à droite (desktop) / en haut (mobile), sans cadre */}
          <div className="relative h-56 w-full sm:h-64 md:absolute md:inset-y-0 md:right-0 md:h-full md:w-[54%]">
            <Image
              src="/agent-ia-vocal.png"
              alt="Tia, agent d’accueil vocal Herakia"
              fill
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover object-center"
            />
            {/* dégradé noir fort et court, pile sur la couture, pour cacher la démarcation (desktop) */}
            <div
              className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-bg-primary from-0% via-bg-primary via-[10%] to-transparent to-[38%] md:block"
              aria-hidden="true"
            />
            {/* fondu par le bas (mobile) */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-secondary to-transparent md:hidden"
              aria-hidden="true"
            />
          </div>

          {/* Texte à gauche */}
          <div className="relative p-8 text-left md:w-1/2 md:p-10">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border-green bg-green-subtle px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-green-primary">
                <Sparkles className="h-3 w-3" />
                {t.badge}
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-text-secondary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-primary/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-primary" />
                </span>
                {t.online}
              </span>
            </div>

            <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-green-primary">
              {t.role}
            </p>
            <h3 className="mt-0.5 font-display text-3xl font-bold text-text-primary md:text-4xl">
              Tia
            </h3>
            <p className="mt-3 max-w-md font-sans text-base leading-relaxed text-text-secondary">
              {t.pitch}
            </p>
            <Waveform />

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-6 inline-flex items-center justify-center gap-2.5 rounded-xl bg-green-primary px-7 py-3.5 font-display text-base font-bold text-on-green transition-transform motion-safe:hover:scale-[1.03]"
            >
              <Mic className="h-5 w-5" />
              {t.cta}
            </button>
          </div>
        </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <TiaCall
            lang={lang}
            onClose={() => setOpen(false)}
            contactHref={localize(lang, '/contact')}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
