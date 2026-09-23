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
  const { titleLead, titleAccent, means } = dict.hero;

  // La promesse, elle, ne bouge plus : c'est la ligne des moyens, sous le titre, qui se réécrit.
  // Elle vit hors du h1 — la découpe en caractères de la révélation ne la touche donc jamais et
  // une simple ref suffit à la désigner. Le départ reste séquencé sur `onSettled` : la rotation
  // ne s'arme qu'une fois le titre posé, pour qu'on lise la promesse avant que rien ne bouge.
  const rotate = useRef<() => void>(() => {});
  const titleRef = useTextReveal<HTMLHeadingElement>({
    by: 'chars',
    onLoad: true,
    delay: 150,
    onSettled: () => rotate.current(),
  });
  const meansRef = useRef<HTMLSpanElement>(null);
  rotate.current = useScrambleRotate({
    resolve: () => meansRef.current,
    segments: means,
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
            {titleLead} <span className="text-green-primary">{titleAccent}</span>
          </h1>

          {/* Les moyens, en petites capitales. Le segment est sur sa propre ligne et tient
              d'un seul tenant (le plus long, « APPLICATIONS SUR-MESURE », occupe 65 % de la
              largeur disponible à 390 px) : il peut changer de longueur sans que rien ne
              bouge, ni autour ni en dessous. */}
          <p
            data-reveal
            className="mt-5 font-mono text-xs uppercase tracking-[0.2em] text-green-muted sm:text-sm"
          >
            <span ref={meansRef} className="whitespace-nowrap">
              {means[0]}
            </span>
          </p>

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
