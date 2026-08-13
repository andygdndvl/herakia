'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { User, Search, Truck, Check, ExternalLink, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Locale } from '@/dictionaries';

const TEXT = {
  fr: {
    customerLabel: 'Client',
    question: 'Bonjour, où en est ma commande #4821 ?',
    checkLabel: 'Vérification CRM + transporteur…',
    lookupTitle: 'Statut commande',
    order: '#4821 · expédiée hier · livraison prévue demain',
    agentLabel: 'Agent Herakia',
    reply: 'Bonjour ! Votre commande #4821 a été expédiée hier, livraison prévue demain. Voici le lien de suivi :',
    trackChip: 'Suivi du colis',
    resolved: 'Résolu',
    scanLabel: 'Traitement…',
    done: 'Une réponse en secondes, à toute heure.',
  },
  en: {
    customerLabel: 'Customer',
    question: 'Hi, where is my order #4821?',
    checkLabel: 'Checking CRM + carrier…',
    lookupTitle: 'Order status',
    order: '#4821 · shipped yesterday · delivery expected tomorrow',
    agentLabel: 'Herakia agent',
    reply: 'Hi! Your order #4821 shipped yesterday, delivery expected tomorrow. Here is the tracking link:',
    trackChip: 'Track parcel',
    resolved: 'Resolved',
    scanLabel: 'Processing…',
    done: 'An answer in seconds, at any hour.',
  },
} as const;

export function SupportAgentDemo({ lang, reducedMotion }: { lang: Locale; reducedMotion: boolean }) {
  const t = TEXT[lang];
  const [phase, setPhase] = useState(0); // 0 question · 1 check · 2 found · 3 typing · 4 reply · 5 done

  useEffect(() => {
    if (reducedMotion) {
      setPhase(5);
      return;
    }
    setPhase(0);
    const id = setInterval(() => {
      setPhase((p) => {
        if (p >= 5) {
          clearInterval(id);
          return p;
        }
        return p + 1;
      });
    }, 1600);
    return () => clearInterval(id);
  }, [reducedMotion]);

  return (
    <div className="space-y-3">
      {/* Message client */}
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start gap-2.5"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated text-text-secondary">
          <User className="h-4 w-4" />
        </span>
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border-subtle bg-bg-elevated px-4 py-2.5">
          <p className="font-mono text-[9px] uppercase tracking-widest text-text-muted">
            {t.customerLabel}
          </p>
          <p className="mt-0.5 font-sans text-sm text-text-primary">{t.question}</p>
        </div>
      </motion.div>

      {/* Recherche / statut */}
      <AnimatePresence>
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto w-full max-w-[92%] rounded-xl border border-border-subtle bg-bg-primary/50 p-3"
          >
            {phase < 2 ? (
              <span className="flex items-center gap-2 font-mono text-xs text-cyan-300">
                <motion.span
                  animate={reducedMotion ? {} : { rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="flex"
                >
                  <Search className="h-3.5 w-3.5" />
                </motion.span>
                {t.checkLabel}
              </span>
            ) : (
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border-green bg-green-subtle text-green-primary">
                  <Truck className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-green-primary">
                    {t.lookupTitle}
                  </p>
                  <p className="font-sans text-sm text-text-primary">{t.order}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Réponse de l'agent */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-row-reverse items-start gap-2.5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-green bg-green-subtle text-green-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-border-green bg-green-subtle px-4 py-2.5">
              <p className="font-mono text-[9px] uppercase tracking-widest text-green-primary">
                {t.agentLabel}
              </p>
              {phase === 3 ? (
                <span className="mt-1.5 flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-green-primary"
                      animate={reducedMotion ? {} : { opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                    />
                  ))}
                </span>
              ) : (
                <>
                  <p className="mt-0.5 font-sans text-sm text-text-primary">{t.reply}</p>
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border-green bg-bg-primary/40 px-2.5 py-1 font-mono text-[11px] text-green-primary">
                    <ExternalLink className="h-3 w-3" />
                    {t.trackChip}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statut */}
      <div className="flex items-center justify-center gap-2 pt-1 font-mono text-xs">
        {phase < 5 ? (
          <span className="flex items-center gap-2 text-cyan-300">
            <motion.span
              animate={reducedMotion ? {} : { rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="block h-3 w-3 rounded-full border-2 border-cyan-300 border-t-transparent"
            />
            {t.scanLabel}
          </span>
        ) : (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border-green bg-green-subtle px-3 py-1 font-display font-semibold text-green-primary"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
            {t.done}
          </motion.span>
        )}
      </div>
    </div>
  );
}
