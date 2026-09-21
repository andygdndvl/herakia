'use client';

import { AnimatePresence } from 'framer-motion';
import { Mic } from 'lucide-react';
import { useState } from 'react';
import { TiaCall } from '@/components/ui/TiaCall';
import { useLang, localize } from '@/components/i18n/LangProvider';
import { useReveal } from '@/lib/anim';

const TEXT = {
  fr: {
    title: 'Un agent, ça s’entend.',
    pitch: 'Parlez à Tia, notre agent vocal, pendant deux minutes.',
    cta: 'Parler à Tia',
  },
  en: {
    title: 'An agent is best heard.',
    pitch: 'Talk to Tia, our voice agent, for two minutes.',
    cta: 'Talk to Tia',
  },
} as const;

export function TiaInlineCTA() {
  const lang = useLang();
  const t = TEXT[lang];
  const [open, setOpen] = useState(false);
  const revealRef = useReveal<HTMLDivElement>({ stagger: 90 });

  return (
    <section className="border-t border-border-subtle px-6 py-10 lg:px-8 lg:py-14">
      <div
        ref={revealRef}
        className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left"
      >
        <div data-reveal>
          <p className="font-display text-xl font-bold leading-snug text-text-primary md:text-2xl">
            {t.title}
          </p>
          <p className="mt-1.5 font-sans text-sm text-text-secondary md:text-base">{t.pitch}</p>
        </div>

        <button
          data-reveal
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full bg-green-primary px-7 py-3.5 font-display text-base font-bold text-on-green transition-transform motion-safe:hover:scale-[1.03]"
        >
          <Mic className="h-5 w-5" />
          {t.cta}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <TiaCall
            lang={lang}
            onClose={() => setOpen(false)}
            contactHref={localize(lang, '/contact')}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
