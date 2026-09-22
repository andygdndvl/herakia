'use client';

import { useReveal } from '@/lib/anim';
import {
  Clock,
  Users,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { AgentObjectSection } from '@/components/agent-object/AgentObjectSection';
import { Button } from '@/components/ui/Button';
import { useLang, localize } from '@/components/i18n/LangProvider';

interface Benefit {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const TEXT = {
  fr: {
    benefitsIntro: 'Concrètement, pour vous',
    benefits: [
      { icon: Clock, title: 'Du temps rendu', desc: 'Des heures rendues à vos équipes, chaque semaine.' },
      { icon: Users, title: 'Vos équipes déchargées', desc: 'Le répétitif quitte leur assiette — place à ce qui compte.' },
      { icon: UserPlus, title: 'Sans recruter', desc: 'De la capacité en plus, sans embaucher ni charges.' },
    ] as Benefit[],
    demoCta: 'Voir un agent en action',
  },
  en: {
    benefitsIntro: 'Concretely, for you',
    benefits: [
      { icon: Clock, title: 'Time given back', desc: 'Hours returned to your teams, every week.' },
      { icon: Users, title: 'Teams offloaded', desc: 'The repetitive work leaves their plate — room for what matters.' },
      { icon: UserPlus, title: 'No hiring needed', desc: 'Extra capacity, without recruiting or payroll.' },
    ] as Benefit[],
    demoCta: 'See an agent in action',
  },
} as const;

export function WhatIsAnAgent() {
  const lang = useLang();
  const t = TEXT[lang];
  const revealRef = useReveal<HTMLDivElement>({ stagger: 140 });
  return (
    <>
    <AgentObjectSection />
    <section className="relative overflow-hidden px-6 pb-32 lg:px-8">
      <div ref={revealRef} className="mx-auto max-w-6xl">
        {/* Bénéfices concrets pour le client */}
        <div
          data-reveal
          className="mt-16 border-t border-border-subtle pt-10"
        >
          <p className="text-center font-mono text-xs uppercase tracking-widest text-green-primary">
            {t.benefitsIntro}
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {t.benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-border-subtle bg-bg-secondary/40 p-6 backdrop-blur-md transition-colors duration-300 hover:border-border-green"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border-green bg-green-subtle">
                    <Icon className="h-5 w-5 text-green-primary" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-text-primary">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 font-sans text-sm leading-relaxed text-text-secondary">
                    {benefit.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Renvoi vers la page démo */}
        <div
          data-reveal
          className="mt-12 flex justify-center"
        >
          <Button href={localize(lang, '/demo')} variant="primary" size="lg">
            {t.demoCta}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
    </>
  );
}
