'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLang, localize } from '@/components/i18n/LangProvider';

type Variant = 'scoping' | 'demo' | 'build';

const TEXT = {
  fr: {
    scoping: { line: 'Le premier échange est gratuit — et le diagnostic offert.', cta: 'Réserver un échange' },
    demo: { line: 'Envie de voir ça tourner sur VOS process ?', cta: 'Démarrer un projet' },
    build: { line: 'Un besoin bien à vous ? C’est exactement ce qu’on adore construire.', cta: 'Parlons de votre cas' },
  },
  en: {
    scoping: { line: 'The first conversation is free — and the assessment is on us.', cta: 'Book a call' },
    demo: { line: 'Want to see this running on YOUR processes?', cta: 'Start a project' },
    build: { line: 'A need that’s uniquely yours? That’s exactly what we love to build.', cta: 'Let’s talk about your case' },
  },
} as const;

export function InlineCTA({ variant }: { variant: Variant }) {
  const lang = useLang();
  const t = TEXT[lang][variant];

  return (
    <section className="bg-gradient-to-r from-green-primary to-green-dark px-6 py-14 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left"
      >
        <p className="font-display text-xl font-bold leading-snug text-bg-primary text-balance md:text-2xl">
          {t.line}
        </p>
        <Link
          href={localize(lang, '/contact')}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-bg-primary px-8 py-4 font-display text-lg font-bold text-text-primary shadow-xl transition-transform duration-300 hover:scale-[1.04]"
        >
          {t.cta}
          <ArrowRight className="h-5 w-5" />
        </Link>
      </motion.div>
    </section>
  );
}
