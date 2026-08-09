'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  Eye,
  Brain,
  Zap,
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
import { type AgentPhase } from '@/components/ui/AgentLoopSchema';
import { AgentExplainer } from '@/components/home/AgentExplainer';
import { useLang } from '@/components/i18n/LangProvider';

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
    eyebrow: 'En clair',
    title: 'Qu’est-ce qu’un agent IA ?',
    body: 'Pas un simple chatbot. Un agent IA est un collaborateur numérique qui perçoit ce qui arrive, décide quoi faire selon vos règles, et agit dans vos outils — tout seul, en continu.',
    highlight: 'La différence avec un chatbot ? Un agent ne se contente pas de répondre : il agit.',
    loopLabel: 'En continu · 24/7',
    phases: [
      { icon: Eye, label: 'Perçoit', desc: 'Un email, une demande, un événement arrive.' },
      { icon: Brain, label: 'Décide', desc: 'Il analyse le contexte et applique vos règles.' },
      { icon: Zap, label: 'Agit', desc: 'Il répond, met à jour le CRM, planifie — dans vos outils.' },
    ] as AgentPhase[],
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
  },
  en: {
    eyebrow: 'In plain terms',
    title: 'What is an AI agent?',
    body: 'Not just a chatbot. An AI agent is a digital coworker that perceives what comes in, decides what to do based on your rules, and acts in your tools — on its own, around the clock.',
    highlight: 'The difference with a chatbot? An agent doesn’t just reply — it acts.',
    loopLabel: 'Around the clock · 24/7',
    phases: [
      { icon: Eye, label: 'Perceives', desc: 'An email, a request, an event comes in.' },
      { icon: Brain, label: 'Decides', desc: 'It reads the context and applies your rules.' },
      { icon: Zap, label: 'Acts', desc: 'It replies, updates the CRM, schedules — in your tools.' },
    ] as AgentPhase[],
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
  },
} as const;

export function WhatIsAnAgent() {
  const t = TEXT[useLang()];
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <AgentExplainer />

        {/* Métiers : un agent peut prendre n'importe quel rôle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mt-16 border-t border-border-subtle pt-10 text-center"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-green-primary">
            {t.rolesIntro}
          </p>
          <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <motion.div
              className="flex w-max gap-6 md:gap-8"
              animate={reduced ? {} : { x: ['0%', '-50%'] }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            >
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
            </motion.div>
          </div>
          <p className="mx-auto mt-8 max-w-2xl font-display text-xl font-medium leading-snug text-text-primary text-balance md:text-2xl">
            {t.rolesPunch}
          </p>
        </motion.div>

        {/* Bénéfices concrets pour le client */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
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
        </motion.div>
      </div>
    </section>
  );
}
