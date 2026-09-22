'use client';

import { useRef } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDict, useLang, localize } from '@/components/i18n/LangProvider';
import { useDrawPath, useReveal, useScrollProgress, useTextReveal } from '@/lib/anim';
import { HERO_OBJECT } from './hero-object-paths';

/** Opacité de repos du dessin : présent, jamais en concurrence avec le titre. */
const OBJECT_OPACITY = 0.62;

export function Hero() {
  const dict = useDict();
  const lang = useLang();
  const { titleLine1, titleLine2 } = dict.hero;
  const lastWord = titleLine2[titleLine2.length - 1];

  const titleRef = useTextReveal<HTMLHeadingElement>({ by: 'chars', onLoad: true, delay: 150 });
  const restRef = useReveal<HTMLDivElement>({ onLoad: true, delay: 900, stagger: 120 });
  // Le fût se dessine niveau par niveau, une seule fois, derrière le titre : silhouettes,
  // puis détails, puis textures, puis le filet de jointure. ~2 s en tout, ensuite immobile.
  const edgesRef = useDrawPath<SVGPathElement>({ onLoad: true, delay: 600, duration: 1500 });
  const detailsRef = useDrawPath<SVGPathElement>({ onLoad: true, delay: 1000, duration: 1300 });
  const textureRef = useDrawPath<SVGPathElement>({ onLoad: true, delay: 1300, duration: 1200 });
  const seamRef = useDrawPath<SVGPathElement>({ onLoad: true, delay: 1900, duration: 700 });
  const innerRef = useRef<HTMLDivElement>(null);
  const objectRef = useRef<SVGSVGElement>(null);

  // Sortie : le bloc glisse vers le haut et s'estompe pendant que le hero quitte l'écran.
  // Le dessin est posé sur la section (et non dans le bloc, qui est aligné en bas) : il reçoit
  // donc le même traitement à la main, pour quitter l'écran exactement comme le texte.
  const sectionRef = useScrollProgress<HTMLElement>(
    (p) => {
      const transform = `translate3d(0, ${-140 * p}px, 0)`;
      const fade = 1 - 0.85 * p;
      if (innerRef.current) {
        innerRef.current.style.transform = transform;
        innerRef.current.style.opacity = String(fade);
      }
      if (objectRef.current) {
        objectRef.current.style.transform = transform;
        objectRef.current.style.opacity = String(OBJECT_OPACITY * fade);
      }
    },
    { enter: 'top top', leave: 'top bottom', sync: true },
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-end overflow-hidden px-6 pb-16 pt-32 lg:px-8"
    >
      {/* L'objet de l'agent, fermé, tracé au trait (cf. hero-object-paths.ts) : présence, pas
          sujet. Il quitte l'écran avec le bloc de texte (cf. `useScrollProgress` ci-dessus). */}
      <svg
        ref={objectRef}
        className="pointer-events-none absolute right-10 top-24 hidden h-[min(62vh,560px)] w-auto text-stroke-object lg:block"
        style={{ opacity: OBJECT_OPACITY }}
        viewBox={HERO_OBJECT.viewBox}
        fill="none"
        aria-hidden="true"
      >
        <path
          ref={textureRef}
          data-reveal
          d={HERO_OBJECT.texture}
          stroke="currentColor"
          strokeOpacity="0.3"
          strokeWidth="1.25"
        />
        <path
          ref={detailsRef}
          data-reveal
          d={HERO_OBJECT.details}
          stroke="currentColor"
          strokeOpacity="0.55"
          strokeWidth="1.4"
        />
        <path
          ref={seamRef}
          data-reveal
          d={HERO_OBJECT.seam}
          className="text-green-primary"
          stroke="currentColor"
          strokeOpacity="0.5"
          strokeWidth="1.7"
        />
        <path
          ref={edgesRef}
          data-reveal
          d={HERO_OBJECT.edges}
          stroke="currentColor"
          strokeOpacity="0.95"
          strokeWidth="1.7"
          strokeLinecap="round"
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
            className="h-display mt-6 text-[clamp(1.75rem,5.04vw,6.5rem)] [&_[data-word]]:whitespace-nowrap"
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
