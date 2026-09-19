'use client';

import { Compass, Layers, Rocket, LineChart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { prefersReducedMotion, useReveal, useScrollProgress } from '@/lib/anim';
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
  const t = TEXT[useLang()];
  const steps = t.steps;
  const [activeStep, setActiveStep] = useState(0);
  const [reduced, setReduced] = useState(false);
  const threadRef = useRef<SVGLineElement>(null);
  const mobileFillRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headRef = useReveal<HTMLDivElement>();
  const listRef = useReveal<HTMLUListElement>({ stagger: 80 });

  useEffect(() => setReduced(prefersReducedMotion()), []);

  // Desktop : l'étape active et le fil suivent la progression dans la zone épinglée
  const stickyRef = useScrollProgress<HTMLDivElement>(
    (p) => {
      const next = Math.min(Math.floor(p * steps.length), steps.length - 1);
      setActiveStep((prev) => (prev === next ? prev : next));
      if (threadRef.current) threadRef.current.style.strokeDashoffset = String(1 - p);
    },
    { enter: 'top top', leave: 'bottom bottom', sync: true },
  );

  // Mobile : le fil vertical se remplit pendant la lecture de la liste
  const mobileRef = useScrollProgress<HTMLDivElement>(
    (p) => {
      if (mobileFillRef.current) mobileFillRef.current.style.transform = `scaleY(${p})`;
    },
    { enter: 'bottom top', leave: 'center bottom', sync: true },
  );

  // Changement d'étape : la carte remonte en fondu
  useEffect(() => {
    const el = cardRef.current;
    if (!el || prefersReducedMotion()) return;
    const anim = animate(el, { opacity: [0, 1], y: [28, 0], duration: 450, ease: 'outExpo' });
    return () => {
      anim.revert();
    };
  }, [activeStep]);

  const ActiveIcon = steps[activeStep].icon;

  return (
    <section id="process" className="relative">
      <div className="px-6 pb-16 pt-32 lg:px-8">
        <div ref={headRef} className="mx-auto max-w-3xl text-center">
          <span data-reveal className="eyebrow">
            {t.eyebrow}
          </span>
          <h2 data-reveal className="h-section mt-4">
            {t.title}
          </h2>
          <p data-reveal className="mt-6 font-sans text-lg leading-relaxed text-text-secondary md:text-xl">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Toujours rendue pour que useScrollProgress trouve l'élément au montage ; masquée en mouvement réduit */}
      <div
        ref={stickyRef}
        className={reduced ? 'hidden' : 'relative hidden md:block'}
        style={{ height: `${steps.length * 100}vh` }}
      >
          <div className="sticky top-0 flex h-screen items-center overflow-hidden">
            <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-[280px_1fr] gap-16 lg:grid-cols-[320px_1fr] lg:gap-24">
                <div className="relative flex flex-col justify-center">
                  {/* Fil vert : se dessine du haut vers le bas au fil des étapes */}
                  <svg className="absolute bottom-3 left-[35px] top-3 w-px overflow-visible" aria-hidden="true">
                    <line x1="0" y1="0" x2="0" y2="100%" className="stroke-border-subtle" strokeWidth={1} />
                    <line
                      ref={threadRef}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="100%"
                      pathLength={1}
                      strokeDasharray="1"
                      strokeDashoffset="1"
                      className="stroke-green-primary"
                      strokeWidth={2}
                    />
                  </svg>
                  <div className="space-y-1">
                    {steps.map((step, i) => {
                      const Icon = step.icon;
                      const isActive = i === activeStep;
                      const isPast = i < activeStep;
                      return (
                        <div
                          key={step.number}
                          className="relative flex items-center gap-4 rounded-xl px-4 py-3 transition-opacity duration-300"
                          style={{ opacity: isActive ? 1 : isPast ? 0.45 : 0.25 }}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-bg-primary transition-colors duration-300 ${
                              isActive ? 'border-border-green' : 'border-border-subtle'
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 transition-colors duration-300 ${isActive ? 'text-green-primary' : 'text-text-muted'}`}
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="block font-mono text-xs text-text-muted">{step.number}</span>
                            <p
                              className={`truncate font-display text-sm font-semibold transition-colors duration-300 ${
                                isActive ? 'text-text-primary' : 'text-text-secondary'
                              }`}
                            >
                              {step.title}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-8 flex justify-between font-mono text-xs text-text-muted">
                    <span>
                      {t.stepWord} {activeStep + 1} / {steps.length}
                    </span>
                    <span>{Math.round(((activeStep + 1) / steps.length) * 100)} %</span>
                  </div>
                </div>

                <div
                  ref={cardRef}
                  className="relative overflow-hidden rounded-3xl border border-border-green bg-bg-secondary p-12"
                >
                  <span
                    className="pointer-events-none absolute right-8 top-2 select-none font-display text-[9rem] font-bold leading-none text-green-primary/[0.07]"
                    aria-hidden="true"
                  >
                    {steps[activeStep].number}
                  </span>
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border-green bg-bg-elevated">
                      <ActiveIcon className="h-8 w-8 text-green-primary" />
                    </div>
                    <h3 className="mt-8 font-display text-4xl font-bold leading-tight text-text-primary lg:text-5xl">
                      {steps[activeStep].title}
                    </h3>
                    <p className="mt-6 font-sans text-lg leading-relaxed text-text-secondary lg:text-xl">
                      {steps[activeStep].description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

      <div className={reduced ? 'px-6 pb-32 lg:px-8' : 'px-6 pb-32 md:hidden lg:px-8'}>
        <div ref={mobileRef} className="relative mx-auto mt-4 max-w-4xl">
          <div className="absolute left-[31px] top-0 h-full w-px bg-border-subtle" aria-hidden="true">
            <div
              ref={mobileFillRef}
              className="h-full w-full origin-top bg-green-primary"
              style={{ transform: reduced ? 'none' : 'scaleY(0)' }}
            />
          </div>
          <ul ref={listRef} className="space-y-12 md:space-y-20">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.number} data-reveal className="relative flex gap-6 md:gap-10">
                  <div className="relative shrink-0">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border-green bg-bg-elevated">
                      <Icon className="h-7 w-7 text-green-primary" />
                      <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-border-subtle bg-bg-primary font-mono text-xs font-bold text-green-primary">
                        {step.number}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="font-display text-2xl font-bold text-text-primary md:text-3xl">{step.title}</h3>
                    <p className="mt-3 font-sans text-base leading-relaxed text-text-secondary md:text-lg">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
