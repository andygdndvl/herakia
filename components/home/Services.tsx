'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Bot, Brain, Database, MessageSquare, Workflow } from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { fadeInUp, staggerContainer, viewportSettings } from '@/lib/animations';
import { useLang, localize } from '@/components/i18n/LangProvider';

interface Service {
  icon: LucideIcon;
  title: string;
  href: string;
}

const TEXT = {
  fr: {
    eyebrow: 'Nos savoir-faire',
    title: 'Cinq savoir-faire, assemblés sur-mesure.',
    subtitle:
      'Pour absorber les chantiers ci-dessus, on combine cinq savoir-faire — jamais une brique isolée, toujours un système taillé pour votre organisation.',
    types: ['Automatisation', 'Assistant IA', 'IA conversationnelle', 'Données', 'Audit & conseil'],
    blurbs: [
      'Vos outils reliés, le répétitif en pilote automatique.',
      'La capacité d’un collaborateur, sans le recrutement.',
      'Vos clients répondus 24/7, vos données chez vous.',
      'Des données fiables, des décisions au clair.',
      'On chiffre le gain avant que vous signiez.',
    ],
    services: [
      { icon: Workflow, title: 'Vos process qui tournent seuls', href: '/services#workflows' },
      { icon: Bot, title: 'Un assistant taillé pour votre métier', href: '/services#agents' },
      { icon: MessageSquare, title: 'Vos clients répondus, 24/7', href: '/services#llm' },
      { icon: Database, title: 'Vos données enfin exploitables', href: '/services#data' },
      { icon: Brain, title: 'On chiffre le gain avant que vous signiez', href: '/services#conseil' },
    ] as Service[],
  },
  en: {
    eyebrow: 'Our capabilities',
    title: 'Five capabilities, assembled bespoke.',
    subtitle:
      'To absorb the areas above, we combine five capabilities — never a single block, always a system tailored to your organisation.',
    types: ['Automation', 'AI assistant', 'Conversational AI', 'Data', 'Advisory'],
    blurbs: [
      'Your tools connected, the repetitive work on autopilot.',
      'The capacity of a hire, without the recruiting.',
      'Your customers answered 24/7, your data with you.',
      'Reliable data, clear decisions.',
      'We quantify the gain before you sign.',
    ],
    services: [
      { icon: Workflow, title: 'Processes that run themselves', href: '/services#workflows' },
      { icon: Bot, title: 'An assistant built for your business', href: '/services#agents' },
      { icon: MessageSquare, title: 'Your customers answered, 24/7', href: '/services#llm' },
      { icon: Database, title: 'Your data finally usable', href: '/services#data' },
      { icon: Brain, title: 'We quantify the gain before you sign', href: '/services#conseil' },
    ] as Service[],
  },
} as const;

export function Services() {
  const lang = useLang();
  const t = TEXT[lang];

  return (
    <section id="services" className="relative px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-4xl">
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
            className="mt-6 font-sans text-lg leading-relaxed text-text-secondary md:text-xl text-balance"
          >
            {t.subtitle}
          </motion.p>
        </motion.div>

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          className="mt-14 border-t border-border-subtle"
        >
          {t.services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.li key={service.title} variants={fadeInUp} className="border-b border-border-subtle">
                <Link
                  href={localize(lang, service.href)}
                  className="group flex items-center gap-5 py-6 transition-colors"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-bg-secondary/60 transition-all duration-300 group-hover:border-border-green group-hover:bg-green-subtle">
                    <Icon className="h-5 w-5 text-text-secondary transition-colors duration-300 group-hover:text-green-primary" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-green-primary">
                      {t.types[i]}
                    </span>
                    <h3 className="font-display text-lg font-semibold leading-snug text-text-primary transition-colors group-hover:text-green-primary md:text-xl">
                      {service.title}
                    </h3>
                    <p className="mt-0.5 truncate font-sans text-sm text-text-secondary">
                      {t.blurbs[i]}
                    </p>
                  </div>

                  <ArrowRight className="h-5 w-5 shrink-0 -translate-x-1 text-text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-green-primary group-hover:opacity-100" />
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
