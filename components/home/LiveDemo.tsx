'use client';

import { motion } from 'framer-motion';
import { WorkflowSchema } from '@/components/ui/WorkflowSchema';
import { useLang } from '@/components/i18n/LangProvider';

const TEXT = {
  fr: {
    eyebrow: 'Démonstration',
    title: 'Une automatisation en action.',
    subtitle:
      "Un email arrive. L'agent consulte votre CRM, analyse le contexte, définit une priorité et déclenche la bonne action — sans intervention humaine, en moins de 2 secondes.",
    kpis: [
      { value: '< 2s', label: 'Temps de traitement' },
      { value: '24/7', label: 'Disponibilité' },
      { value: '5', label: "Cas d'usage illustrés" },
      { value: '0', label: 'Intervention manuelle' },
    ],
  },
  en: {
    eyebrow: 'Live demo',
    title: 'An automation in action.',
    subtitle:
      'An email comes in. The agent checks your CRM, reads the context, sets a priority and triggers the right action — with no human intervention, in under 2 seconds.',
    kpis: [
      { value: '< 2s', label: 'Processing time' },
      { value: '24/7', label: 'Availability' },
      { value: '5', label: 'Use cases shown' },
      { value: '0', label: 'Manual intervention' },
    ],
  },
} as const;

export function LiveDemo() {
  const t = TEXT[useLang()];

  return (
    <section className="relative overflow-hidden border-y border-border-subtle bg-bg-secondary/40 px-6 py-32 lg:px-8">
      <div
        className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-primary/5 blur-[140px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="block font-mono text-xs uppercase tracking-widest text-green-primary">
            {t.eyebrow}
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl text-balance">
            {t.title}
          </h2>
          <p className="mt-6 font-sans text-lg leading-relaxed text-text-secondary md:text-xl">
            {t.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-14"
        >
          <WorkflowSchema />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {t.kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-border-subtle bg-bg-primary/40 p-4 text-center backdrop-blur-md"
            >
              <div className="font-display text-2xl font-bold text-green-primary md:text-3xl">
                {kpi.value}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                {kpi.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
