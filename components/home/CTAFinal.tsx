'use client';

import { useReveal, useTextReveal } from '@/lib/anim';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLang, localize } from '@/components/i18n/LangProvider';

const TEXT = {
  fr: {
    badge: 'Réponse sous 24h',
    title: 'Prêt à libérer vos équipes ?',
    body: 'Premier échange gratuit et sans engagement. Voici comment ça se passe.',
    stepsLabel: 'Comment ça se passe',
    steps: [
      { title: 'Diagnostic', badge: 'Offert', desc: '30 minutes pour repérer vos deux meilleures opportunités.' },
      { title: 'Prototype', desc: 'Vous voyez l’agent tourner avant de vous engager.' },
      { title: 'Déploiement', desc: 'Dans vos outils, vos équipes formées dès le premier jour.' },
      { title: 'Suivi', desc: 'Ajustements continus : l’agent s’améliore en exploitation.' },
    ],
    ctaPrimary: 'Planifier un échange',
    ctaSecondary: 'Voir nos services',
    footer: 'contact@herakia.com · Premier rendez-vous gratuit',
  },
  en: {
    badge: 'Reply within 24h',
    title: 'Ready to free up your teams?',
    body: 'First conversation free and with no commitment. Here is how it works.',
    stepsLabel: 'How it works',
    steps: [
      { title: 'Assessment', badge: 'Free', desc: '30 minutes to spot your two best opportunities.' },
      { title: 'Prototype', desc: 'You see the agent running before you commit.' },
      { title: 'Deployment', desc: 'Inside your tools, your teams trained from day one.' },
      { title: 'Follow-up', desc: 'Continuous tuning: the agent improves in production.' },
    ],
    ctaPrimary: 'Book a call',
    ctaSecondary: 'See our services',
    footer: 'contact@herakia.com · First meeting free',
  },
} as const;

export function CTAFinal() {
  const lang = useLang();
  const t = TEXT[lang];
  const titleRef = useTextReveal<HTMLHeadingElement>({ by: 'chars' });
  const restRef = useReveal<HTMLDivElement>({ delay: 500, stagger: 110 });

  return (
    // Palier 2, point le plus haut de la page : l'aplat opaque `bg-bg-secondary`
    // est remplacé par le voile du palier, qui laisse passer grain et vignettage
    // au lieu de poser un rectangle plat. Les deux filets neutres (`border-y`)
    // sont retirés : c'était l'ancien encadrement du bloc, le palier fait
    // désormais la séparation. Le filament vert du haut reste — c'est l'accent
    // de section (le pied de page a le même), pas un trait de séparation.
    <section className="tier-2 relative overflow-hidden px-6 py-40 lg:px-8">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-primary to-transparent"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-5xl text-center">
        <div ref={restRef}>
          <div
            data-reveal
            className="inline-flex items-center gap-2 rounded-full border border-border-green bg-green-subtle px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-green-primary"
          >
            <Calendar className="h-3.5 w-3.5" />
            {t.badge}
          </div>

          <h2 ref={titleRef} data-split className="h-display mt-8 text-[clamp(2rem,4.4vw,4.25rem)] [&_[data-word]]:whitespace-nowrap">
            {t.title}
          </h2>

          <p
            data-reveal
            className="mx-auto mt-8 max-w-2xl font-sans text-lg leading-relaxed text-text-secondary md:text-xl text-balance"
          >
            {t.body}
          </p>

          {/* La méthode, réduite à une frise : elle répond à « et après ? » juste avant le clic.
              L'étape 01 porte le diagnostic offert. `id="process"` : cible du lien « Méthode »
              du pied de page (l'ancienne section HowItWorks a quitté l'accueil). */}
          <ol
            id="process"
            data-reveal
            aria-label={t.stepsLabel}
            className="mx-auto mt-12 grid max-w-5xl scroll-mt-28 gap-7 text-left sm:grid-cols-2 lg:grid-cols-4 lg:gap-0"
          >
            {t.steps.map((step, i) => {
              const first = i === 0;
              const last = i === t.steps.length - 1;
              return (
                <li key={step.title} className="relative pl-16 lg:pl-0 lg:pr-6">
                  {/* Fil vers l'étape suivante : vertical sur mobile, horizontal à partir de lg. Le
                      premier tronçon est plein (on commence par là), les suivants atténués. */}
                  {!last && (
                    <span
                      aria-hidden="true"
                      className={`absolute left-[21px] top-11 h-[calc(100%-1rem)] w-px sm:hidden lg:block lg:left-11 lg:top-[21px] lg:h-px lg:w-[calc(100%-2.75rem)] ${
                        first ? 'bg-green-primary' : 'bg-green-primary/25'
                      }`}
                    />
                  )}
                  <span
                    className={`absolute left-0 top-0 grid h-11 w-11 place-items-center rounded-full border font-mono text-[13px] lg:relative ${
                      first
                        ? 'border-green-primary bg-green-primary text-on-green shadow-[0_0_24px_rgb(var(--green-primary)/0.6)]'
                        : 'border-green-primary/35 bg-bg-primary text-green-primary'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="flex flex-wrap items-center gap-2 font-display text-lg font-semibold text-text-primary lg:mt-4">
                    {step.title}
                    {'badge' in step && step.badge && (
                      <span className="rounded-full bg-green-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-on-green">
                        {step.badge}
                      </span>
                    )}
                  </p>
                  <p className="mt-1.5 font-sans text-sm leading-relaxed text-text-secondary">{step.desc}</p>
                </li>
              );
            })}
          </ol>

          <div data-reveal className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href={localize(lang, '/contact')} variant="primary" size="lg">
              {t.ctaPrimary}
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button href={localize(lang, '/services')} variant="secondary" size="lg">
              {t.ctaSecondary}
            </Button>
          </div>

          <p data-reveal className="mt-8 font-mono text-xs uppercase tracking-wider text-text-muted">
            {t.footer}
          </p>
        </div>
      </div>
    </section>
  );
}
