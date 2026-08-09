'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLang, localize } from '@/components/i18n/LangProvider';

const TEXT = {
  fr: {
    badge: 'Réponse sous 24h',
    title: 'Prêt à libérer vos équipes ?',
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
  const prefersReducedMotion = useReducedMotion();
  const lang = useLang();
  const t = TEXT[lang];

  return (
    <section className="relative overflow-hidden border-y border-border-subtle bg-bg-secondary px-6 py-32 lg:px-8">
      <motion.div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-primary to-transparent"
        animate={prefersReducedMotion ? {} : { opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />

      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {!prefersReducedMotion &&
          Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-green-primary"
              style={{
                left: `${(i * 8.3) % 100}%`,
                top: `${(i * 17) % 100}%`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                y: [0, -40, -80],
              }}
              transition={{
                duration: 4 + (i % 3),
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeInOut',
              }}
            />
          ))}
      </div>

      <div
        className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-primary/10 blur-[140px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-border-green bg-green-subtle px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-green-primary"
        >
          <Calendar className="h-3.5 w-3.5" />
          {t.badge}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8 font-display text-5xl font-bold leading-[1.05] tracking-tight text-text-primary md:text-6xl lg:text-7xl text-balance"
        >
          {t.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-8 max-w-2xl font-sans text-lg leading-relaxed text-text-secondary md:text-xl text-balance"
        >
          {t.body}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button href={localize(lang, '/contact')} variant="primary" size="lg">
            {t.ctaPrimary}
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button href={localize(lang, '/services')} variant="secondary" size="lg">
            {t.ctaSecondary}
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 font-mono text-xs uppercase tracking-wider text-text-muted"
        >
          {t.footer}
        </motion.p>
      </div>
    </section>
  );
}
