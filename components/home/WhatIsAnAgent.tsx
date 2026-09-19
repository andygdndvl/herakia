'use client';

import { animate, onScroll } from 'animejs';
import { useAnime, useReveal } from '@/lib/anim';
import {
  Clock,
  Users,
  UserPlus,
  Calculator,
  Briefcase,
  ClipboardList,
  Headphones,
  FileText,
  Send,
  BarChart3,
  PenLine,
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

interface Role {
  icon: LucideIcon;
  label: string;
}

const TEXT = {
  fr: {
    rolesIntro: 'Il prend le rôle que vous voulez',
    roles: [
      { icon: Calculator, label: 'Comptable' },
      { icon: Briefcase, label: 'Commercial' },
      { icon: ClipboardList, label: 'Secrétaire' },
      { icon: Headphones, label: 'Support client' },
      { icon: FileText, label: 'Assistant admin' },
      { icon: Send, label: 'Chargé de relance' },
      { icon: BarChart3, label: 'Analyste' },
      { icon: PenLine, label: 'Rédacteur' },
    ] as Role[],
    rolesPunch:
      'On lui donne le métier dont vous avez besoin. Aucune limite : tant que ça vous décharge, on le construit sur-mesure.',
    benefitsIntro: 'Concrètement, pour vous',
    benefits: [
      { icon: Clock, title: 'Du temps rendu', desc: 'Des heures rendues à vos équipes, chaque semaine.' },
      { icon: Users, title: 'Vos équipes déchargées', desc: 'Le répétitif quitte leur assiette — place à ce qui compte.' },
      { icon: UserPlus, title: 'Sans recruter', desc: 'De la capacité en plus, sans embaucher ni charges.' },
    ] as Benefit[],
    demoCta: 'Voir un agent en action',
  },
  en: {
    rolesIntro: 'It takes on whatever role you want',
    roles: [
      { icon: Calculator, label: 'Accountant' },
      { icon: Briefcase, label: 'Salesperson' },
      { icon: ClipboardList, label: 'Secretary' },
      { icon: Headphones, label: 'Customer support' },
      { icon: FileText, label: 'Admin assistant' },
      { icon: Send, label: 'Follow-up rep' },
      { icon: BarChart3, label: 'Analyst' },
      { icon: PenLine, label: 'Copywriter' },
    ] as Role[],
    rolesPunch:
      'We give it the job you need. No limits: as long as it takes work off your plate, we build it — bespoke.',
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
  // Défilement continu des métiers, en pause hors écran
  const marqueeRef = useAnime<HTMLDivElement>((track) => {
    animate(track, { x: ['0%', '-50%'], duration: 24000, ease: 'linear', loop: true, autoplay: onScroll({ target: track }) });
  });

  return (
    <>
    <AgentObjectSection />
    <section className="relative overflow-hidden px-6 pb-32 lg:px-8">
      <div ref={revealRef} className="mx-auto max-w-6xl">
        {/* Métiers : un agent peut prendre n'importe quel rôle */}
        <div
          data-reveal
          className="mt-16 border-t border-border-subtle pt-10 text-center"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-green-primary">
            {t.rolesIntro}
          </p>
          <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div ref={marqueeRef} className="flex w-max gap-6 md:gap-8">
              {[...t.roles, ...t.roles].map((role, i) => {
                const Icon = role.icon;
                return (
                  <span
                    key={`${role.label}-${i}`}
                    className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-border-subtle bg-bg-secondary/50 px-5 py-3 font-sans text-sm font-medium text-text-secondary backdrop-blur-md md:text-base"
                  >
                    <Icon className="h-4 w-4 text-green-primary md:h-5 md:w-5" aria-hidden="true" />
                    {role.label}
                  </span>
                );
              })}
            </div>
          </div>
          <p className="mx-auto mt-8 max-w-2xl font-display text-xl font-medium leading-snug text-text-primary text-balance md:text-2xl">
            {t.rolesPunch}
          </p>
        </div>

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
