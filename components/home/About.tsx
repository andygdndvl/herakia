'use client';

import { motion } from 'framer-motion';
import { Target, Zap, TrendingUp, Building2 } from 'lucide-react';
import Image from 'next/image';
import { useLang } from '@/components/i18n/LangProvider';

const TEXT = {
  fr: {
    eyebrow: 'À propos',
    titleLead: 'Herakia vous rend votre ',
    titleAccent: 'temps',
    paragraphs: [
      "Nous éliminons les tâches répétitives, les processus lents et les frictions opérationnelles grâce à l'IA et à l'automatisation intelligente.",
      'L’objectif est simple : vous concentrer sur ce qui compte vraiment — créer, décider, construire, avancer.',
    ],
    values: [
      { icon: Target, title: 'Sobriété & efficacité', description: 'Pas de surcomplexité technique. Des solutions pragmatiques qui fonctionnent.' },
      { icon: Zap, title: 'IA comme levier', description: "L'IA n'est pas une fin, mais un moyen d'atteindre vos objectifs business." },
      { icon: TrendingUp, title: 'ROI rapide', description: 'Implémentations agiles et mesurables, retour sur investissement immédiat.' },
    ],
    name: 'Andy Duval',
    role: 'Fondateur · Herakia',
    line: 'Vous échangez directement avec moi — pas un commercial.',
    officeCaption: 'Nos locaux',
  },
  en: {
    eyebrow: 'About',
    titleLead: 'Herakia gives you back your ',
    titleAccent: 'time',
    paragraphs: [
      'We eliminate repetitive tasks, slow processes and operational friction with AI and smart automation.',
      'The goal is simple: to let you focus on what truly matters — creating, deciding, building, moving forward.',
    ],
    values: [
      { icon: Target, title: 'Lean & effective', description: 'No needless technical complexity. Pragmatic solutions that just work.' },
      { icon: Zap, title: 'AI as a lever', description: 'AI is not an end in itself, but a means to reach your business goals.' },
      { icon: TrendingUp, title: 'Fast ROI', description: 'Agile, measurable implementations with an immediate return on investment.' },
    ],
    name: 'Andy Duval',
    role: 'Founder · Herakia',
    line: 'You talk directly to me — not a salesperson.',
    officeCaption: 'Our offices',
  },
} as const;

export function About() {
  const t = TEXT[useLang()];

  return (
    <section id="about" className="relative overflow-hidden px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <span className="block font-mono text-xs uppercase tracking-widest text-green-primary">
              {t.eyebrow}
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl lg:text-6xl text-balance">
              {t.titleLead}
              <span className="text-green-primary">{t.titleAccent}</span>.
            </h2>

            <div className="mt-8 space-y-5 font-sans text-lg leading-relaxed text-text-secondary">
              {t.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {t.values.map((value, idx) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 + idx * 0.08 }}
                    className="rounded-xl border border-border-subtle bg-bg-secondary/40 p-4 backdrop-blur-md"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-subtle">
                      <Icon className="h-4 w-4 text-green-primary" />
                    </span>
                    <h4 className="mt-3 font-display text-sm font-semibold text-text-primary">
                      {value.title}
                    </h4>
                    <p className="mt-1 font-sans text-xs leading-relaxed text-text-secondary">
                      {value.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Grand cadre : photo des locaux.
                Quand la vraie photo est prête, déposer public/locaux.jpg et remplacer le
                bloc placeholder ci-dessous par :
                <Image src="/locaux.jpg" alt="Les locaux d'Herakia" fill
                  sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority /> */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border-subtle bg-bg-secondary">
              <div className="absolute inset-0 bg-grid-pattern bg-grid-md opacity-20" aria-hidden="true" />
              <div
                className="absolute inset-0 bg-gradient-to-tr from-green-primary/10 via-transparent to-transparent"
                aria-hidden="true"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Building2 className="h-9 w-9 text-green-primary/50" aria-hidden="true" />
                <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
                  {t.officeCaption}
                </span>
              </div>
            </div>

            {/* Andy en petit, dessous */}
            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-border-subtle bg-bg-secondary/60 p-4 backdrop-blur-md">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-border-green">
                <Image
                  src="/andy.jpg"
                  alt="Andy Duval, fondateur d'Herakia"
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: '50% 30%' }}
                />
              </div>
              <div>
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h3 className="font-display text-base font-bold text-text-primary">{t.name}</h3>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-green-primary">
                    {t.role}
                  </span>
                </div>
                <p className="mt-1 font-sans text-sm leading-snug text-text-secondary">
                  « {t.line} »
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
