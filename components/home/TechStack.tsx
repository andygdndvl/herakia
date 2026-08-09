'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp, staggerFast, viewportSettings } from '@/lib/animations';
import { techLogos } from '@/components/ui/TechLogos';
import { useLang } from '@/components/i18n/LangProvider';

interface Tech {
  name: keyof typeof techLogos;
  category: 'LLM' | 'Automatisation' | 'Data' | 'CRM';
}

const techs: Tech[] = [
  { name: 'OpenAI', category: 'LLM' },
  { name: 'Anthropic', category: 'LLM' },
  { name: 'Google Gemini', category: 'LLM' },
  { name: 'Mistral AI', category: 'LLM' },
  { name: 'Make', category: 'Automatisation' },
  { name: 'n8n', category: 'Automatisation' },
  { name: 'Zapier', category: 'Automatisation' },
  { name: 'Airtable', category: 'Data' },
  { name: 'Supabase', category: 'Data' },
  { name: 'HubSpot', category: 'CRM' },
  { name: 'Salesforce', category: 'CRM' },
  { name: 'Pipedrive', category: 'CRM' },
];

const TEXT = {
  fr: {
    eyebrow: 'Stack technologique',
    title: 'Les meilleurs outils, intégrés à votre écosystème.',
    subtitle:
      "Nous travaillons avec les leaders de l'IA et de l'automatisation. Aucun verrouillage technologique : votre stack reste la vôtre.",
    categories: { LLM: 'LLM', Automatisation: 'Automatisation', Data: 'Données', CRM: 'CRM' },
  },
  en: {
    eyebrow: 'Technology stack',
    title: 'The best tools, integrated into your ecosystem.',
    subtitle:
      'We work with the leaders in AI and automation. No vendor lock-in: your stack stays yours.',
    categories: { LLM: 'LLM', Automatisation: 'Automation', Data: 'Data', CRM: 'CRM' },
  },
} as const;

export function TechStack() {
  const prefersReducedMotion = useReducedMotion();
  const t = TEXT[useLang()];

  return (
    <section className="relative px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          variants={staggerFast}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.span
            variants={fadeInUp}
            className="block font-mono text-xs uppercase tracking-widest text-green-primary"
          >
            {t.eyebrow}
          </motion.span>
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

        <motion.div
          variants={staggerFast}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        >
          {techs.map((tech) => {
            const Logo = techLogos[tech.name];
            return (
              <motion.div
                key={tech.name}
                variants={fadeInUp}
                whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.03 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-border-subtle bg-bg-secondary/40 p-4 backdrop-blur-md transition-all duration-300 hover:border-border-green hover:shadow-glow-green-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border-subtle bg-bg-elevated transition-all duration-300 group-hover:border-border-green group-hover:bg-green-subtle">
                  <Logo
                    className="h-6 w-6 text-text-secondary transition-colors duration-300 group-hover:text-green-primary"
                    aria-hidden="true"
                  />
                </div>

                <span className="text-center font-display text-sm font-semibold text-text-primary">
                  {tech.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  {t.categories[tech.category]}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
