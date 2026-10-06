'use client';

import { useRef } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HeroProof } from '@/components/home/HeroProof';
import { LiveDevis } from '@/components/home/LiveDevis';
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
      className="relative flex min-h-screen items-center overflow-hidden px-6 pb-16 pt-32 lg:px-8"
    >
      {/* Halo du hero (spec vert-nuit) : un grand halo vert et une trame de points lumineux,
          dense derrière le titre, éteinte vers les bords. Statique, pur CSS ; il défile avec le
          hero, contrairement aux nappes du fond global qui restent fixes. */}
      <div aria-hidden="true" data-hero-halo className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-[-60px] h-[800px] w-[1300px] max-w-none -translate-x-1/2"
          style={{
            background:
              'radial-gradient(closest-side, rgb(var(--green-primary) / 0.26), rgb(var(--green-primary) / 0.08) 60%, transparent)',
          }}
        />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'radial-gradient(rgb(var(--green-primary) / 0.55) 1px, transparent 1.4px)',
            backgroundSize: '14px 14px',
            maskImage: 'radial-gradient(ellipse 55% 46% at 50% 42%, #000, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 55% 46% at 50% 42%, #000, transparent 80%)',
          }}
        />
      </div>
      <div ref={innerRef} className="relative z-10 mx-auto w-full max-w-7xl text-center">
        <div ref={restRef}>
          <p data-reveal className="eyebrow-pill">
            {dict.hero.badge}
          </p>

          <h1
            ref={titleRef}
            data-split
            className="h-display mx-auto mt-6 max-w-6xl text-[clamp(1.75rem,5.04vw,6.5rem)] [&_[data-word]]:whitespace-nowrap"
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

          <div className="mt-8 flex flex-col items-center gap-8">
            {/* Hors de la cascade : c'est le plus grand bloc de texte de l'écran d'accueil, donc
                l'élément LCP. Affiché d'emblée, il est peint avec la page. */}
            <p className="mx-auto max-w-xl font-sans text-lg leading-relaxed text-text-secondary md:text-xl">
              {dict.hero.subtitleBody}
            </p>
            <div data-reveal className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button href={localize(lang, '/contact')} variant="primary" size="lg">
                {dict.hero.ctaPrimary}
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button href={localize(lang, '/services')} variant="secondary" size="lg">
                {dict.hero.ctaSecondary}
              </Button>
            </div>
            {/* Le produit montré : un devis en retard que l'agent rédige et envoie, en boucle. */}
            <div data-reveal className="w-full">
              <LiveDevis />
            </div>
          </div>

          {/* La preuve se range juste sous les boutons : elle appuie l'appel à
              l'action, puis la ligne d'engagements ferme le hero. */}
          <div data-reveal className="mt-8">
            <HeroProof />
          </div>

          <div
            data-reveal
            className="mt-6 flex items-center justify-center gap-6 font-mono text-xs uppercase tracking-wider text-text-muted"
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
