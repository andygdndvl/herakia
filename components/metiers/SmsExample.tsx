'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MessageSquareText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { TEXTES } from '@/components/metiers/textes';
import { METIERS } from '@/lib/metiers';

const TEXT = {
  fr: { badge: 'Exemple', caption: 'Exemples de résumés reçus par SMS, un par métier' },
  en: { badge: 'Example', caption: 'Examples of text message summaries, one per line of work' },
} as const;

/** Temps d'affichage de chaque métier. */
const ROTATE_MS = 4500;

/**
 * Maquette du résumé reçu après un appel, sur la carte « Zéro appel manqué » de la page Offres.
 * Elle passe d'un métier à l'autre (résumés des pages métiers, lib/metiers.ts) ; en mouvement
 * réduit, elle reste sur le premier. Toujours marquée « Exemple » : les données sont fictives.
 */
export function SmsExample({ className = '' }: { className?: string }) {
  const lang = useLang();
  const t = TEXT[lang];
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % METIERS.length), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [reduced]);

  const m = METIERS[active];
  const scene = TEXTES[m.slug][lang].scene;

  return (
    <figure aria-label={t.caption} className={`relative rounded-[1.5rem] border border-border-strong bg-bg-primary/60 p-4 ${className}`}>
      <span className="absolute -top-3 right-5 rounded-full bg-signal-late px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-bg-primary">
        {t.badge}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={m.slug}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
        >
          <figcaption className="flex items-center gap-2 border-b border-border-subtle pb-2.5 font-sans text-sm font-semibold text-text-primary">
            <MessageSquareText className="h-4 w-4 shrink-0 text-green-primary" aria-hidden="true" />
            {scene.assistant}
          </figcaption>
          <div className="mt-3 min-h-[8.5rem] rounded-2xl rounded-tl-sm bg-green-subtle px-4 py-3 font-sans text-sm leading-relaxed text-text-primary">
            {scene.smsLines.map((line, i) => (
              <p key={line} className={i === 0 ? 'font-semibold' : undefined}>
                {line}
              </p>
            ))}
          </div>
          <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">{m.label[lang]}</p>
        </motion.div>
      </AnimatePresence>
    </figure>
  );
}
