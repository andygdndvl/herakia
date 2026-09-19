'use client';

import { useReveal, useTextReveal } from '@/lib/anim';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLang, localize } from '@/components/i18n/LangProvider';

const TEXT = {
  fr: {
    badge: 'Réponse sous 24h',
    title: 'Prêt à libérer vos équipes ?',
    body: "Premier échange gratuit et sans engagement. En 30 minutes, nous identifions ensemble vos deux meilleures opportunités d'automatisation IA.",
    ctaPrimary: 'Planifier un échange',
    ctaSecondary: 'Voir nos services',
    footer: 'contact@herakia.com · Premier rendez-vous gratuit',
  },
  en: {
    badge: 'Reply within 24h',
    title: 'Ready to free up your teams?',
    body: 'First conversation free and with no commitment. In 30 minutes, we pinpoint together your two best AI automation opportunities.',
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
    <section className="relative overflow-hidden border-y border-border-subtle bg-bg-secondary px-6 py-40 lg:px-8">
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

          <h2 ref={titleRef} data-split className="h-display mt-8 text-[clamp(2.75rem,7vw,7rem)] [&_[data-word]]:whitespace-nowrap">
            {t.title}
          </h2>

          <p
            data-reveal
            className="mx-auto mt-8 max-w-2xl font-sans text-lg leading-relaxed text-text-secondary md:text-xl text-balance"
          >
            {t.body}
          </p>

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
