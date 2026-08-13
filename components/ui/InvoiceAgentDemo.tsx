'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Mail, FileText, Check, Landmark, CalendarClock } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Locale } from '@/dictionaries';

const TEXT = {
  fr: {
    inboxLabel: 'Nouvel email',
    from: 'Fournisseur Nord SAS',
    file: 'Facture-2026-0912.pdf',
    docTitle: 'FACTURE',
    scanLabel: 'Lecture du document…',
    extractedTitle: 'Données extraites',
    fields: [
      { k: 'Montant', v: '1 240,00 €' },
      { k: 'Échéance', v: '15/08/2026' },
      { k: 'TVA', v: '20 %' },
      { k: 'Fournisseur', v: 'Nord SAS' },
    ],
    stamp: 'TRAITÉ',
    matched: 'Rapproché BC-0912 · écriture comptable créée',
    payTitle: 'Paiement programmé',
    days: ['13', '14', '15', '16', '17'],
    payDay: '15',
    done: '0 ressaisie · 0 oubli d’échéance.',
  },
  en: {
    inboxLabel: 'New email',
    from: 'Nord SAS supplier',
    file: 'Invoice-2026-0912.pdf',
    docTitle: 'INVOICE',
    scanLabel: 'Reading the document…',
    extractedTitle: 'Extracted data',
    fields: [
      { k: 'Amount', v: '€1,240.00' },
      { k: 'Due date', v: '15/08/2026' },
      { k: 'VAT', v: '20%' },
      { k: 'Supplier', v: 'Nord SAS' },
    ],
    stamp: 'DONE',
    matched: 'Matched to BC-0912 · accounting entry created',
    payTitle: 'Payment scheduled',
    days: ['13', '14', '15', '16', '17'],
    payDay: '15',
    done: '0 re-keying · 0 missed due date.',
  },
} as const;

export function InvoiceAgentDemo({
  lang,
  reducedMotion,
}: {
  lang: Locale;
  reducedMotion: boolean;
}) {
  const t = TEXT[lang];
  const [phase, setPhase] = useState(0); // 0 email · 1 scan · 2 extract · 3 stamp · 4 pay · 5 done

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
    <div className="space-y-4">
      {/* Email entrant */}
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-primary/50 p-3"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated text-text-secondary">
          <Mail className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] uppercase tracking-widest text-text-muted">
            {t.inboxLabel}
          </p>
          <p className="truncate font-sans text-sm text-text-primary">{t.from}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-md border border-border-subtle bg-bg-elevated px-2 py-1 font-mono text-[10px] text-text-secondary">
          <FileText className="h-3 w-3 text-red-400" />
          {t.file}
        </span>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Le document (scan + tampon) */}
        <div className="relative overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated p-4">
          <p className="font-display text-xs font-bold tracking-widest text-text-secondary">
            {t.docTitle}
          </p>
          <div className="mt-3 space-y-2">
            <div className="h-1.5 w-2/3 rounded bg-border-subtle" />
            <div className="h-1.5 w-1/2 rounded bg-border-subtle" />
            <div className="h-1.5 w-4/5 rounded bg-border-subtle" />
            <div className="mt-3 h-3 w-1/3 rounded bg-green-primary/30" />
            <div className="h-1.5 w-3/5 rounded bg-border-subtle" />
            <div className="h-1.5 w-2/5 rounded bg-border-subtle" />
          </div>

          {/* Ligne de scan */}
          {phase === 1 && !reducedMotion && (
            <motion.div
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 1.4, ease: 'linear' }}
              className="pointer-events-none absolute inset-x-0 h-8 bg-gradient-to-b from-green-primary/0 via-green-primary/25 to-green-primary/0"
              aria-hidden="true"
            />
          )}

          {/* Tampon « traité » */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.6, rotate: -18 }}
                animate={{ opacity: 1, scale: 1, rotate: -12 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 14 }}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border-2 border-green-primary px-2 py-1 font-display text-xs font-bold uppercase tracking-wider text-green-primary"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                {t.stamp}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Données extraites */}
        <div className="rounded-xl border border-border-subtle bg-bg-primary/50 p-4">
          <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-green-primary">
            {t.extractedTitle}
          </p>
          <div className="space-y-2">
            {t.fields.map((f, i) => (
              <motion.div
                key={f.k}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
                animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
                transition={{ duration: 0.35, delay: reducedMotion ? 0 : i * 0.18 }}
                className="flex items-center justify-between gap-2 border-b border-border-subtle pb-1.5 last:border-0 last:pb-0"
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  {f.k}
                </span>
                <span className="flex items-center gap-1.5 font-display text-sm font-semibold text-text-primary">
                  {f.v}
                  <Check className="h-3 w-3 text-green-primary" strokeWidth={3} />
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Écriture comptable */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2.5 rounded-xl border border-border-subtle bg-bg-primary/50 px-4 py-2.5 font-sans text-sm text-text-secondary"
          >
            <Landmark className="h-4 w-4 shrink-0 text-green-primary" />
            {t.matched}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paiement programmé */}
      <AnimatePresence>
        {phase >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-xl border border-border-subtle bg-bg-primary/50 p-4"
          >
            <p className="mb-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-green-primary">
              <CalendarClock className="h-3.5 w-3.5" />
              {t.payTitle}
            </p>
            <div className="flex gap-2">
              {t.days.map((d) => {
                const isPay = d === t.payDay;
                return (
                  <div
                    key={d}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-lg border py-2 ${
                      isPay
                        ? 'border-border-green bg-green-subtle'
                        : 'border-border-subtle bg-bg-elevated/60'
                    }`}
                  >
                    <span
                      className={`font-display text-sm font-bold ${
                        isPay ? 'text-green-primary' : 'text-text-muted'
                      }`}
                    >
                      {d}
                    </span>
                    {isPay && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 240 }}
                        className="h-1.5 w-1.5 rounded-full bg-green-primary"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statut / résultat */}
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
            className="rounded-full border border-border-green bg-green-subtle px-3 py-1 font-display font-semibold text-green-primary"
          >
            {t.done}
          </motion.span>
        )}
      </div>
    </div>
  );
}
