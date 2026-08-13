'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, Check, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Locale } from '@/dictionaries';

const TEXT = {
  fr: {
    inboxLabel: 'Demande de RDV',
    participantsLabel: '3 participants',
    names: ['AM', 'JD', 'LB'],
    gridTitle: 'Créneau commun',
    days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
    times: ['9h', '10h', '11h'],
    slotCol: 3,
    slotRow: 1,
    invitesLabel: 'Invitations agenda envoyées',
    remindersLabel: 'Rappels programmés · J-1 et H-1',
    scanLabel: 'Coordination des agendas…',
    done: 'Un RDV calé, zéro échange inutile.',
  },
  en: {
    inboxLabel: 'Meeting request',
    participantsLabel: '3 participants',
    names: ['AM', 'JD', 'LB'],
    gridTitle: 'Common slot',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    times: ['9', '10', '11'],
    slotCol: 3,
    slotRow: 1,
    invitesLabel: 'Calendar invites sent',
    remindersLabel: 'Reminders scheduled · 1 day & 1 hour before',
    scanLabel: 'Coordinating calendars…',
    done: 'A meeting booked, zero pointless emails.',
  },
} as const;

export function PlanningAgentDemo({ lang, reducedMotion }: { lang: Locale; reducedMotion: boolean }) {
  const t = TEXT[lang];
  const [phase, setPhase] = useState(0); // 0 request · 1 search · 2 slot · 3 invites · 4 reminders · 5 done

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
      {/* Demande entrante */}
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-primary/50 p-3"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated text-green-primary">
          <CalendarClock className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] uppercase tracking-widest text-text-muted">
            {t.inboxLabel}
          </p>
          <p className="font-sans text-sm text-text-primary">{t.participantsLabel}</p>
        </div>
        <div className="flex -space-x-2">
          {t.names.map((n, i) => (
            <span
              key={n}
              className="relative flex h-7 w-7 items-center justify-center rounded-full border border-border-green bg-green-subtle font-mono text-[9px] font-bold text-green-primary"
            >
              {n}
              {phase >= 3 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.12, type: 'spring', stiffness: 240 }}
                  className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-bg-secondary bg-green-primary text-bg-primary"
                >
                  <Check className="h-2 w-2" strokeWidth={4} />
                </motion.span>
              )}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Grille calendrier */}
      <div className="rounded-xl border border-border-subtle bg-bg-primary/50 p-4">
        <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-green-primary">
          {t.gridTitle}
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {t.days.map((d) => (
            <div key={d} className="text-center font-mono text-[9px] uppercase text-text-muted">
              {d}
            </div>
          ))}
          {t.times.map((time, row) =>
            t.days.map((d, col) => {
              const isSlot = row === t.slotRow && col === t.slotCol && phase >= 2;
              return (
                <div
                  key={`${row}-${col}`}
                  className={`relative flex h-9 items-center justify-center rounded-md border text-[10px] transition-colors duration-500 ${
                    isSlot
                      ? 'border-border-green bg-green-subtle font-bold text-green-primary'
                      : 'border-border-subtle bg-bg-elevated/40 text-text-muted/40'
                  }`}
                >
                  {isSlot ? time : ''}
                  {isSlot && !reducedMotion && (
                    <motion.span
                      className="absolute inset-0 rounded-md border border-green-primary"
                      initial={{ opacity: 0.7, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.3 }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>

      {/* Invitations + rappels */}
      <div className="space-y-2">
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-2.5 rounded-xl border border-border-subtle bg-bg-primary/50 px-4 py-2.5"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border-green bg-green-subtle text-green-primary">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span className="font-sans text-sm text-text-secondary">{t.invitesLabel}</span>
        </motion.div>
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-2.5 rounded-xl border border-border-subtle bg-bg-primary/50 px-4 py-2.5"
        >
          <Bell className="h-4 w-4 shrink-0 text-green-primary" />
          <span className="font-sans text-sm text-text-secondary">{t.remindersLabel}</span>
        </motion.div>
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
