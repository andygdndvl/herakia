'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Building2, Flame, Calendar, Mail, Database, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Locale } from '@/dictionaries';

const TEXT = {
  fr: {
    inboxLabel: 'Nouveau lead',
    from: 'Jeanne D.',
    via: 'Formulaire site',
    profileTitle: 'Profil enrichi',
    role: 'Directrice Ops',
    company: 'PME · 80 personnes · SaaS',
    scoreTitle: 'Score de qualification',
    scoreValue: 82,
    hot: 'Lead chaud',
    actions: [
      { icon: Calendar, text: 'Créneau proposé · jeudi 14h' },
      { icon: Mail, text: 'Email de proposition envoyé' },
      { icon: Database, text: 'Fiche CRM créée et à jour' },
    ],
    scanLabel: 'Qualification en cours…',
    done: 'Plus un seul lead chaud qui refroidit.',
  },
  en: {
    inboxLabel: 'New lead',
    from: 'Jane D.',
    via: 'Website form',
    profileTitle: 'Enriched profile',
    role: 'Head of Ops',
    company: 'SME · 80 people · SaaS',
    scoreTitle: 'Qualification score',
    scoreValue: 82,
    hot: 'Hot lead',
    actions: [
      { icon: Calendar, text: 'Slot proposed · Thursday 2pm' },
      { icon: Mail, text: 'Proposal email sent' },
      { icon: Database, text: 'CRM record created and up to date' },
    ],
    scanLabel: 'Qualifying…',
    done: 'No more hot leads going cold.',
  },
} as const;

export function LeadsAgentDemo({ lang, reducedMotion }: { lang: Locale; reducedMotion: boolean }) {
  const t = TEXT[lang];
  const [phase, setPhase] = useState(0); // 0 lead · 1 enrich · 2 profile · 3 score · 4 actions · 5 done

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
      {/* Lead entrant */}
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-primary/50 p-3"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-green bg-green-subtle font-mono text-xs font-bold text-green-primary">
          JD
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] uppercase tracking-widest text-text-muted">
            {t.inboxLabel} · {t.via}
          </p>
          <p className="truncate font-sans text-sm text-text-primary">{t.from}</p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated text-green-primary">
          <UserPlus className="h-4 w-4" />
        </span>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Profil enrichi */}
        <div className="rounded-xl border border-border-subtle bg-bg-primary/50 p-4">
          <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-green-primary">
            {t.profileTitle}
          </p>
          <div className="space-y-2.5">
            <motion.div
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
              animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-2 font-sans text-sm text-text-primary"
            >
              <Building2 className="h-4 w-4 shrink-0 text-green-primary" />
              {t.role}
            </motion.div>
            <motion.div
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
              animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
              transition={{ duration: 0.35, delay: reducedMotion ? 0 : 0.15 }}
              className="font-sans text-sm text-text-secondary"
            >
              {t.company}
            </motion.div>
          </div>
        </div>

        {/* Score */}
        <div className="rounded-xl border border-border-subtle bg-bg-primary/50 p-4">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-green-primary">
            {t.scoreTitle}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-bold text-green-primary">
              {phase >= 3 ? t.scoreValue : 0}
            </span>
            <span className="font-mono text-xs text-text-muted">/100</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-elevated">
            <motion.div
              className="h-full rounded-full bg-green-primary"
              initial={{ width: 0 }}
              animate={{ width: phase >= 3 ? `${t.scoreValue}%` : 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <AnimatePresence>
            {phase >= 3 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-green-primary"
              >
                <Flame className="h-3 w-3" />
                {t.hot}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Actions déclenchées */}
      <div className="space-y-2">
        {t.actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.div
              key={a.text}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.35, delay: reducedMotion ? 0 : i * 0.15 }}
              className="flex items-center gap-2.5 rounded-xl border border-border-subtle bg-bg-primary/50 px-4 py-2.5"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border-green bg-green-subtle text-green-primary">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <Icon className="h-4 w-4 shrink-0 text-text-muted" />
              <span className="font-sans text-sm text-text-secondary">{a.text}</span>
            </motion.div>
          );
        })}
      </div>

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
            className="rounded-full border border-border-green bg-green-subtle px-3 py-1 font-display font-semibold text-green-primary"
          >
            {t.done}
          </motion.span>
        )}
      </div>
    </div>
  );
}
