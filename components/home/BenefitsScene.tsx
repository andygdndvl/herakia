'use client';

import { useEffect, useRef, useState } from 'react';
import { BenefitPreview, type BenefitPreviewKind } from '@/components/home/BenefitPreview';
import { prefersReducedMotion } from '@/lib/anim';

export interface Benefit {
  /** Fenêtre d'interface qui montre le bénéfice. */
  preview: BenefitPreviewKind;
  title: string;
  desc: string;
}

/** Durée d'affichage de chaque bénéfice en défilement automatique. */
const STEP_MS = 3000;

/**
 * Place de chaque fenêtre dans la scène (≥ lg) : trois fenêtres empilées en quinconce. Celle du
 * bénéfice actif passe devant, nette ; les autres reculent dans l'ombre.
 */
const SLOTS = ['left-[5%] top-[40px]', 'left-[28%] top-[130px]', 'left-[15%] top-[230px]'];

/**
 * « Concrètement, pour vous » : une scène, trois bénéfices. En bureau, la liste à gauche et les
 * fenêtres en perspective à droite ; le bénéfice actif tourne seul toutes les 3 s, se fixe au
 * survol ou au focus clavier, et s'arrête hors écran. En mouvement réduit, pas de défilement
 * automatique (survol et focus restent actifs). Sous lg, une liste simple : chaque fenêtre sous
 * son bénéfice, à plat.
 *
 * La scène est décorative (`aria-hidden`) : les titres et textes portent le sens.
 */
export function BenefitsScene({ intro, benefits }: { intro: string; benefits: readonly Benefit[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || held || prefersReducedMotion()) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !timer) {
        timer = setInterval(() => setActive((a) => (a + 1) % benefits.length), STEP_MS);
      } else if (!entry.isIntersecting && timer) {
        clearInterval(timer);
        timer = undefined;
      }
    });
    io.observe(root);
    return () => {
      io.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [held, benefits.length]);

  return (
    <div ref={rootRef} className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
      <div>
        <p className="text-center font-mono text-xs uppercase tracking-widest text-green-primary lg:text-left">
          {intro}
        </p>
        <ul className="mt-8 space-y-10 lg:mt-5 lg:space-y-0" onMouseLeave={() => setHeld(false)}>
          {benefits.map((b, i) => {
            const on = i === active;
            return (
              <li
                key={b.title}
                onMouseEnter={() => {
                  setActive(i);
                  setHeld(true);
                }}
                className={`transition-[border-color,opacity] duration-300 lg:border-l-2 lg:py-5 lg:pl-6 ${
                  on ? 'lg:border-green-primary lg:opacity-100' : 'lg:border-border-subtle lg:opacity-[0.45]'
                }`}
              >
                <h3 className="font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-text-primary lg:text-[1.875rem]">
                  {/* Un bouton dans le titre : le clavier peut choisir le bénéfice mis en scène. */}
                  <button
                    type="button"
                    aria-pressed={on}
                    onFocus={() => {
                      setActive(i);
                      setHeld(true);
                    }}
                    onBlur={() => setHeld(false)}
                    onClick={() => setActive(i)}
                    className="text-left focus:outline-none focus-visible:underline focus-visible:decoration-green-primary focus-visible:underline-offset-4"
                  >
                    {b.title}
                  </button>
                </h3>
                <p className="mt-2 max-w-[34ch] font-sans text-[15px] leading-relaxed text-text-secondary">{b.desc}</p>
                {/* Mobile : la fenêtre à plat, sous son bénéfice. */}
                <div aria-hidden="true" className="mt-5 lg:hidden">
                  <BenefitPreview kind={b.preview} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bureau : la scène en perspective, sur une lueur verte. */}
      <div aria-hidden="true" className="relative hidden h-[420px] [perspective:1400px] lg:block">
        <div className="absolute inset-[10%_5%] bg-[radial-gradient(closest-side,rgb(var(--green-primary)/0.28),transparent)]" />
        {benefits.map((b, i) => {
          const on = i === active;
          return (
            <div
              key={b.preview}
              className={`absolute w-[360px] transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(.2,.8,.2,1)] ${SLOTS[i]} ${
                on
                  ? 'z-30 opacity-100 [filter:none] [transform:rotateY(-8deg)_rotateX(4deg)_scale(1.04)_translateY(-8px)]'
                  : 'z-10 opacity-[0.55] [filter:saturate(.5)_brightness(.8)] [transform:rotateY(-14deg)_rotateX(6deg)_scale(.9)]'
              }`}
            >
              <BenefitPreview kind={b.preview} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
