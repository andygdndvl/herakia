'use client';

import { useRef } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDict, useLang, localize } from '@/components/i18n/LangProvider';
import { useDrawPath, useReveal, useScrollProgress, useTextReveal } from '@/lib/anim';

export function Hero() {
  const dict = useDict();
  const lang = useLang();
  const { titleLine1, titleLine2 } = dict.hero;
  const lastWord = titleLine2[titleLine2.length - 1];

  const titleRef = useTextReveal<HTMLHeadingElement>({ by: 'chars', onLoad: true, delay: 150 });
  const restRef = useReveal<HTMLDivElement>({ onLoad: true, delay: 900, stagger: 120 });
  const pathRef = useDrawPath<SVGPathElement>({ onLoad: true, delay: 400, duration: 2200 });
  const innerRef = useRef<HTMLDivElement>(null);

  // Sortie : le bloc glisse vers le haut et s'estompe pendant que le hero quitte l'écran
  const sectionRef = useScrollProgress<HTMLElement>(
    (p) => {
      const el = innerRef.current;
      if (!el) return;
      el.style.transform = `translate3d(0, ${-140 * p}px, 0)`;
      el.style.opacity = String(1 - 0.85 * p);
    },
    { enter: 'top top', leave: 'top bottom', sync: true },
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-end overflow-hidden px-6 pb-16 pt-32 lg:px-8"
    >
      <svg
        className="pointer-events-none absolute right-0 top-[14%] hidden w-[46vw] max-w-[680px] text-green-primary md:block"
        viewBox="0 0 680 420"
        fill="none"
        aria-hidden="true"
      >
        <path
          ref={pathRef}
          data-reveal
          d="M10 380 C 120 380, 150 120, 280 120 S 440 300, 520 220 S 640 40, 675 20"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>

      <div ref={innerRef} className="relative z-10 mx-auto w-full max-w-7xl">
        <div ref={restRef}>
          <p data-reveal className="eyebrow">
            — {dict.hero.badge}
          </p>

          <h1
            ref={titleRef}
            data-split
            className="h-display mt-6 text-[clamp(1.7rem,4.4vw,6.5rem)]"
          >
            {titleLine1.join(' ')}
            <br />
            {titleLine2.slice(0, -1).join(' ')} <span className="text-green-primary">{lastWord}</span>
          </h1>

          <div className="mt-10 grid gap-8 border-t border-border-subtle pt-8 md:grid-cols-[1fr_auto] md:items-end">
            <p data-reveal className="max-w-xl font-sans text-lg leading-relaxed text-text-secondary md:text-xl">
              {dict.hero.subtitleBody}
            </p>
            <div data-reveal className="flex flex-col gap-3 sm:flex-row">
              <Button href={localize(lang, '/contact')} variant="primary" size="lg">
                {dict.hero.ctaPrimary}
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button href={localize(lang, '/services')} variant="secondary" size="lg">
                {dict.hero.ctaSecondary}
              </Button>
            </div>
          </div>

          <div
            data-reveal
            className="mt-8 flex items-center gap-6 font-mono text-xs uppercase tracking-wider text-text-muted"
          >
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-green-primary" /> {dict.hero.chip1}
            </span>
            <span className="hidden h-px w-12 bg-border-subtle sm:block" />
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-green-primary" /> {dict.hero.chip2}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => document.getElementById('personae')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-6 right-6 text-text-muted transition-colors hover:text-green-primary motion-safe:animate-bounce lg:right-8"
        aria-label={dict.hero.scrollAria}
      >
        <ChevronDown className="h-6 w-6" />
      </button>
    </section>
  );
}
