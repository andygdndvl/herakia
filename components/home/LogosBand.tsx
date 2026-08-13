'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useLang } from '@/components/i18n/LangProvider';

const logos = [
  'OpenAI',
  'Anthropic',
  'Google Gemini',
  'Mistral AI',
  'Make',
  'n8n',
  'Zapier',
  'Airtable',
  'Supabase',
  'HubSpot',
];

function LogoTile({ name }: { name: string }) {
  return (
    <div className="mx-8 flex h-12 shrink-0 items-center justify-center font-display text-lg font-bold uppercase tracking-widest text-text-secondary/40 transition-colors hover:text-text-primary/70 md:mx-12 md:text-xl">
      {name}
    </div>
  );
}

export function LogosBand() {
  const prefersReducedMotion = useReducedMotion();
  const lang = useLang();
  const label =
    lang === 'en' ? 'Built with the best AI technologies' : 'Conçu avec les meilleures technologies IA';
  const duplicatedLogos = [...logos, ...logos];

  return (
    <section
      id="logos"
      className="relative border-y border-border-subtle bg-bg-secondary/30 py-12"
      aria-label="Technologies utilisées"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="mb-8 text-center font-mono text-xs uppercase tracking-widest text-text-muted">
          {label}
        </p>

        <div
          className="relative overflow-hidden"
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
          }}
        >
          <motion.div
            className="flex"
            animate={prefersReducedMotion ? {} : { x: ['0%', '-50%'] }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {duplicatedLogos.map((logo, idx) => (
              <LogoTile key={`${logo}-${idx}`} name={logo} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
