'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import { fadeInUp, staggerContainer, viewportSettings } from '@/lib/animations';
import { BeforeAfterChart } from '@/components/ui/BeforeAfterChart';
import { useLang } from '@/components/i18n/LangProvider';

const TEXT = {
  fr: {
    eyebrow: 'Avant / Après',
    title: 'Vos équipes méritent mieux que des tâches répétitives.',
    subtitle:
      "La différence entre une entreprise qui subit ses processus et une entreprise qui les automatise se mesure en heures gagnées chaque semaine.",
    withoutBadge: 'Sans Herakia',
    withoutTitle: "Le quotidien d'une entreprise non automatisée",
    withBadge: 'Avec Herakia',
    withTitle: "Le quotidien d'une entreprise libérée",
    problems: [
      '6 heures de saisie manuelle par jour',
      '12 erreurs de traitement par semaine',
      '3 employés mobilisés sur des tâches répétitives',
      'Disponibilité limitée à 5 jours sur 7',
      'Pertes de leads par manque de relance',
    ],
    solutions: [
      '0 heure de saisie : tout est automatisé',
      '0 erreur : règles validées et reproductibles',
      '1 agent IA pour le travail de 3 personnes',
      'Disponibilité 24/7, week-ends et jours fériés inclus',
      'Chaque opportunité relancée au bon moment',
    ],
  },
  en: {
    eyebrow: 'Before / After',
    title: 'Your teams deserve better than repetitive tasks.',
    subtitle:
      'The gap between a company that endures its processes and one that automates them is measured in hours saved every single week.',
    withoutBadge: 'Without Herakia',
    withoutTitle: 'A day in a company that runs on manual work',
    withBadge: 'With Herakia',
    withTitle: 'A day in a company that has been freed up',
    problems: [
      '6 hours of manual data entry a day',
      '12 processing errors a week',
      '3 employees tied up on repetitive tasks',
      'Availability limited to 5 days out of 7',
      'Leads lost for lack of follow-up',
    ],
    solutions: [
      '0 hours of data entry: everything is automated',
      '0 errors: validated, repeatable rules',
      '1 AI agent doing the work of 3 people',
      'Available 24/7, weekends and holidays included',
      'Every opportunity followed up at the right time',
    ],
  },
} as const;

export function ProblemSolution() {
  const prefersReducedMotion = useReducedMotion();
  const t = TEXT[useLang()];

  return (
    <section className="relative overflow-hidden px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={fadeInUp}>
            <span className="font-mono text-xs uppercase tracking-widest text-green-primary">
              {t.eyebrow}
            </span>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl lg:text-6xl text-balance"
          >
            {t.title}
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-6 font-sans text-lg leading-relaxed text-text-secondary md:text-xl"
          >
            {t.subtitle}
          </motion.p>
        </motion.div>

        <div className="mt-20 grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-4">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportSettings}
            className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-bg-secondary p-8 md:p-10"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 font-mono text-xs uppercase tracking-wider text-red-400">
              {t.withoutBadge}
            </div>
            <h3 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
              {t.withoutTitle}
            </h3>
            <ul className="mt-8 space-y-4">
              {t.problems.map((problem, i) => (
                <motion.li
                  key={problem}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-start gap-3 text-text-secondary"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
                    <X className="h-3 w-3 text-red-400" />
                  </span>
                  <span className="font-sans text-base leading-relaxed">{problem}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <div className="hidden lg:flex lg:items-center lg:justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-border-green bg-green-subtle"
            >
              <motion.div
                animate={prefersReducedMotion ? {} : { x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight className="h-6 w-6 text-green-primary" />
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportSettings}
            className="relative overflow-hidden rounded-2xl border border-border-green bg-bg-secondary p-8 shadow-glow-green md:p-10"
          >
            <div
              className="absolute inset-0 bg-gradient-radial from-green-primary/5 to-transparent"
              aria-hidden="true"
            />
            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-green bg-green-subtle px-3 py-1 font-mono text-xs uppercase tracking-wider text-green-primary">
                {t.withBadge}
              </div>
              <h3 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
                {t.withTitle}
              </h3>
              <ul className="mt-8 space-y-4">
                {t.solutions.map((solution, i) => (
                  <motion.li
                    key={solution}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex items-start gap-3 text-text-primary"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border-green bg-green-subtle">
                      <Check className="h-3 w-3 text-green-primary" />
                    </span>
                    <span className="font-sans text-base leading-relaxed">{solution}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10"
        >
          <BeforeAfterChart />
        </motion.div>
      </div>
    </section>
  );
}
