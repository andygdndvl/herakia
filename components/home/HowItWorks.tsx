'use client';

import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion';
import { Compass, Layers, Rocket, LineChart } from 'lucide-react';
import { useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useLang } from '@/components/i18n/LangProvider';

interface Step {
  icon: LucideIcon;
  number: string;
  title: string;
  description: string;
}

const TEXT = {
  fr: {
    eyebrow: 'Notre méthode',
    title: 'Une méthode éprouvée en 4 étapes.',
    subtitle:
      "De l'audit initial au passage à l'échelle, chaque étape vise un livrable concret et mesurable.",
    stepWord: 'Étape',
    steps: [
      { icon: Compass, number: '01', title: 'Diagnostic & opportunités', description: 'On cartographie vos process et on chiffre le ROI potentiel. Vous savez où investir avant de signer.' },
      { icon: Layers, number: '02', title: 'Design & prototypes', description: "Conception et prototypes fonctionnels : vous voyez l'IA tourner avant le déploiement." },
      { icon: Rocket, number: '03', title: 'Déploiement & intégration', description: 'Mise en production dans vos outils, avec formation des équipes et monitoring dès le jour 1.' },
      { icon: LineChart, number: '04', title: 'Suivi & optimisation', description: "Suivi en temps réel et ajustements continus : votre IA s'améliore en exploitation." },
    ] as Step[],
  },
  en: {
    eyebrow: 'Our method',
    title: 'A proven method in 4 steps.',
    subtitle:
      'From the initial assessment to scaling up, every step targets a concrete, measurable deliverable.',
    stepWord: 'Step',
    steps: [
      { icon: Compass, number: '01', title: 'Assessment & opportunities', description: 'We map your processes and quantify the potential ROI. You know where to invest before signing.' },
      { icon: Layers, number: '02', title: 'Design & prototypes', description: 'Designed and validated with working prototypes: you see the AI running before deployment.' },
      { icon: Rocket, number: '03', title: 'Deployment & integration', description: 'Go-live inside your tools, with team training and active monitoring from day 1.' },
      { icon: LineChart, number: '04', title: 'Monitoring & optimisation', description: 'Real-time monitoring and continuous tuning: your AI keeps improving in production.' },
    ] as Step[],
  },
} as const;

export function HowItWorks() {
  const prefersReducedMotion = useReducedMotion();
  const t = TEXT[useLang()];
  const steps = t.steps;
  const stickyRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: stickyRef,
    offset: ['start start', 'end end'],
  });

  const { scrollYProgress: mobileScrollProgress } = useScroll({
    target: mobileRef,
    offset: ['start 0.7', 'end 0.5'],
  });

  const pathLength = useTransform(mobileScrollProgress, [0, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const next = Math.min(Math.floor(latest * steps.length), steps.length - 1);
    setActiveStep(next);
  });

  const ActiveIcon = steps[activeStep].icon;

  return (
    <section id="process" className="relative">
      <div className="px-6 pb-16 pt-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="block font-mono text-xs uppercase tracking-widest text-green-primary"
            >
              {t.eyebrow}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-4 text-balance font-display text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl lg:text-6xl"
            >
              {t.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 font-sans text-lg leading-relaxed text-text-secondary md:text-xl"
            >
              {t.subtitle}
            </motion.p>
          </div>
        </div>
      </div>

      {!prefersReducedMotion && (
        <div
          ref={stickyRef}
          className="relative hidden md:block"
          style={{ height: `${steps.length * 100}vh` }}
        >
          <div className="sticky top-0 flex h-screen items-center overflow-hidden">
            <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-[280px_1fr] gap-16 lg:grid-cols-[320px_1fr] lg:gap-24">
                <div className="flex flex-col justify-center">
                  <div className="space-y-1">
                    {steps.map((step, i) => {
                      const Icon = step.icon;
                      const isActive = i === activeStep;
                      const isPast = i < activeStep;
                      return (
                        <motion.div
                          key={step.number}
                          animate={{ opacity: isActive ? 1 : isPast ? 0.45 : 0.25 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-4 rounded-xl px-4 py-3"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                              isActive
                                ? 'border-border-green bg-green-subtle shadow-glow-green-sm'
                                : 'border-border-subtle bg-transparent'
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 transition-colors duration-300 ${
                                isActive ? 'text-green-primary' : 'text-text-muted'
                              }`}
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="block font-mono text-xs text-text-muted">
                              {step.number}
                            </span>
                            <p
                              className={`truncate font-display text-sm font-semibold transition-colors duration-300 ${
                                isActive ? 'text-text-primary' : 'text-text-secondary'
                              }`}
                            >
                              {step.title}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="mt-8 h-px w-full overflow-hidden bg-border-subtle">
                    <motion.div
                      className="h-full bg-green-primary"
                      animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between font-mono text-xs text-text-muted">
                    <span>{t.stepWord} {activeStep + 1} / {steps.length}</span>
                    <span>{Math.round(((activeStep + 1) / steps.length) * 100)} %</span>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      filter: 'blur(0px)',
                      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                    }}
                    exit={{ opacity: 0, y: -18, filter: 'blur(6px)', transition: { duration: 0.2 } }}
                    className="relative overflow-hidden rounded-3xl border border-border-green bg-bg-secondary p-12 shadow-glow-green"
                  >
                    <div
                      className="absolute inset-0 bg-gradient-radial from-green-primary/5 to-transparent"
                      aria-hidden="true"
                    />
                    <span
                      className="pointer-events-none absolute right-8 top-2 select-none font-display text-[9rem] font-bold leading-none text-green-primary/[0.07]"
                      aria-hidden="true"
                    >
                      {steps[activeStep].number}
                    </span>

                    <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border-green bg-bg-elevated shadow-glow-green-sm">
                        <ActiveIcon className="h-8 w-8 text-green-primary" />
                      </div>
                      <h3 className="mt-8 font-display text-4xl font-bold leading-tight text-text-primary lg:text-5xl">
                        {steps[activeStep].title}
                      </h3>
                      <p className="mt-6 font-sans text-lg leading-relaxed text-text-secondary lg:text-xl">
                        {steps[activeStep].description}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={prefersReducedMotion ? 'px-6 pb-32 lg:px-8' : 'px-6 pb-32 md:hidden lg:px-8'}>
        <div ref={mobileRef} className="relative mx-auto mt-4 max-w-4xl">
          <svg
            className="absolute left-[31px] top-0 hidden h-full w-2 md:block"
            preserveAspectRatio="none"
            viewBox="0 0 2 100"
            aria-hidden="true"
          >
            <line x1="1" y1="0" x2="1" y2="100" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <motion.line
              x1="1"
              y1="0"
              x2="1"
              y2="100"
              stroke="#3ecf8e"
              strokeWidth="2"
              style={prefersReducedMotion ? { pathLength: 1 } : { pathLength }}
            />
          </svg>

          <ul className="space-y-12 md:space-y-20">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="relative flex gap-6 md:gap-10"
                >
                  <div className="relative shrink-0">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.05 + 0.2, type: 'spring' }}
                      className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border-green bg-bg-elevated shadow-glow-green-sm"
                    >
                      <Icon className="h-7 w-7 text-green-primary" />
                      <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-border-subtle bg-bg-primary font-mono text-xs font-bold text-green-primary">
                        {step.number}
                      </span>
                    </motion.div>
                  </div>

                  <div className="flex-1 pt-2">
                    <h3 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
                      {step.title}
                    </h3>
                    <p className="mt-3 font-sans text-base leading-relaxed text-text-secondary md:text-lg">
                      {step.description}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
