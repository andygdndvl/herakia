'use client';

import { useRef } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HeroProof } from '@/components/home/HeroProof';
import { useDict, useLang, localize } from '@/components/i18n/LangProvider';
import { useReveal, useScrambleRotate, useScrollProgress, useTextReveal } from '@/lib/anim';

export function Hero() {
  const dict = useDict();
  const lang = useLang();
  const { titleLine1, rotating } = dict.hero;

  // Le dernier segment du titre se réécrit, mais seulement une fois la révélation terminée : c'est
  // elle qui recompose le balisage du h1 (découpe en caractères), et on ne peut écrire dedans
  // qu'après. La révélation rend sa découpe avant d'appeler `onSettled` ; la cible est donc
  // retrouvée à ce moment-là par `querySelector` — une ref pointerait sur le <span> d'origine,
  // remplacé entre-temps par la découpe.
  const rotate = useRef<() => void>(() => {});
  const titleRef = useTextReveal<HTMLHeadingElement>({
    by: 'chars',
    onLoad: true,
    delay: 150,
    onSettled: () => rotate.current(),
  });
  rotate.current = useScrambleRotate({
    resolve: () => titleRef.current?.querySelector<HTMLElement>('[data-hero-rotating]') ?? null,
    segments: rotating,
  });
  const restRef = useReveal<HTMLDivElement>({ onLoad: true, delay: 900, stagger: 120 });
  const innerRef = useRef<HTMLDivElement>(null);

  // Sortie : le bloc glisse vers le haut et s'estompe pendant que le hero quitte l'écran.
  const sectionRef = useScrollProgress<HTMLElement>(
    (p) => {
      if (!innerRef.current) return;
      innerRef.current.style.transform = `translate3d(0, ${-140 * p}px, 0)`;
      innerRef.current.style.opacity = String(1 - 0.85 * p);
    },
    { enter: 'top top', leave: 'top bottom', sync: true },
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-end overflow-hidden px-6 pb-16 pt-32 lg:px-8"
    >
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
            {/* Le segment tournant tient toujours sur une seule ligne (mesuré de 390 à 1920 px, le
                plus long occupe au pire 94 % de la largeur disponible) : le titre fait donc deux
                lignes quoi qu'il affiche, et rien ne bouge en dessous. */}
            <span data-hero-rotating className="whitespace-nowrap text-green-primary">
              {rotating[0]}
            </span>
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

          {/* La preuve se range juste sous les boutons : elle appuie l'appel à
              l'action, puis la ligne d'engagements ferme le hero. */}
          <div data-reveal className="mt-8">
            <HeroProof />
          </div>

          <div
            data-reveal
            className="mt-6 flex items-center gap-6 font-mono text-xs uppercase tracking-wider text-text-muted"
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
