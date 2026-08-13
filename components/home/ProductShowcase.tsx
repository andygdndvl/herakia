'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';

interface FeedEvent {
  label: string;
  value: string;
}

const TEXT = {
  fr: {
    eyebrow: 'Votre cockpit',
    title: 'Vos automatisations, en direct.',
    subtitle: 'Ce que vos équipes voient : le travail qui se fait, en temps réel.',
    window: 'Herakia · Cockpit',
    live: 'En direct',
    kpis: [
      { label: 'Tâches traitées · aujourd’hui' },
      { label: 'Temps gagné · cette semaine', value: '37 h' },
      { label: 'Agents actifs', value: '6' },
    ],
    feedTitle: 'Activité en direct',
    chartTitle: 'Charge absorbée · 7 jours',
    events: [
      { label: 'Relance envoyée', value: '+1 prospect' },
      { label: 'Lead qualifié', value: 'Jeanne D. · 82/100' },
      { label: 'Facture traitée', value: '1 240 € · sans erreur' },
      { label: 'RDV confirmé', value: 'jeudi 10h' },
      { label: 'Ticket résolu', value: '#4821' },
      { label: 'Contact enrichi', value: 'CRM à jour' },
      { label: 'Email trié', value: 'priorité haute' },
      { label: 'Devis relancé', value: 'relance J+3' },
    ] as FeedEvent[],
  },
  en: {
    eyebrow: 'Your control panel',
    title: 'Your automations, live.',
    subtitle: 'What your teams see: the work getting done, in real time.',
    window: 'Herakia · Control panel',
    live: 'Live',
    kpis: [
      { label: 'Tasks handled · today' },
      { label: 'Time saved · this week', value: '37 h' },
      { label: 'Active agents', value: '6' },
    ],
    feedTitle: 'Live activity',
    chartTitle: 'Load absorbed · 7 days',
    events: [
      { label: 'Follow-up sent', value: '+1 prospect' },
      { label: 'Lead qualified', value: 'Jane D. · 82/100' },
      { label: 'Invoice processed', value: '€1,240 · error-free' },
      { label: 'Meeting confirmed', value: 'Thursday 10am' },
      { label: 'Ticket resolved', value: '#4821' },
      { label: 'Contact enriched', value: 'CRM updated' },
      { label: 'Email sorted', value: 'high priority' },
      { label: 'Quote followed up', value: 'day 3 nudge' },
    ] as FeedEvent[],
  },
} as const;

const BAR_SETS = [
  [38, 52, 44, 66, 58, 79, 71],
  [44, 48, 58, 61, 70, 74, 83],
  [40, 55, 50, 72, 63, 82, 77],
];
const FEED_LEN = 5;
const TASKS_START = 142;

export function ProductShowcase() {
  const prefersReducedMotion = useReducedMotion();
  const t = TEXT[useLang()];

  const [tasks, setTasks] = useState(TASKS_START);
  const idRef = useRef(1000);
  const poolRef = useRef(FEED_LEN); // prochain index à piocher dans t.events
  const [feed, setFeed] = useState(() =>
    t.events.slice(0, FEED_LEN).map((e, i) => ({ id: 900 + i, ...e })),
  );
  const [barIdx, setBarIdx] = useState(0);
  const bars = BAR_SETS[barIdx];

  // Compteur de tâches qui monte
  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => setTasks((n) => n + 1), 2600);
    return () => clearInterval(id);
  }, [prefersReducedMotion]);

  // Flux d'activité qui défile
  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => {
      const ev = t.events[poolRef.current % t.events.length];
      poolRef.current += 1;
      idRef.current += 1;
      setFeed((f) => [{ id: idRef.current, ...ev }, ...f].slice(0, FEED_LEN));
    }, 2600);
    return () => clearInterval(id);
  }, [prefersReducedMotion, t.events]);

  // Graphe qui s'anime
  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => setBarIdx((i) => (i + 1) % BAR_SETS.length), 3200);
    return () => clearInterval(id);
  }, [prefersReducedMotion]);

  return (
    <section className="relative overflow-hidden px-6 py-32 lg:px-8">
      <div
        className="absolute left-1/2 top-1/3 -z-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-green-primary/5 blur-[150px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-green-primary">
            {t.eyebrow}
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-text-primary md:text-4xl text-balance">
            {t.title}
          </h2>
          <p className="mt-4 font-sans text-base leading-relaxed text-text-secondary md:text-lg">
            {t.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-12 overflow-hidden rounded-2xl border border-border-subtle bg-bg-secondary/70 shadow-glow-green backdrop-blur-md"
        >
          {/* Barre de fenêtre */}
          <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-primary/60" />
            </div>
            <span className="font-mono text-xs text-text-muted">{t.window}</span>
            <span className="flex items-center gap-1.5 font-mono text-xs text-green-primary">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-green-primary"
                animate={prefersReducedMotion ? {} : { opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              {t.live}
            </span>
          </div>

          <div className="grid gap-5 p-5 md:p-7">
            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {t.kpis.map((kpi, i) => (
                <div key={kpi.label} className="rounded-xl border border-border-subtle bg-bg-primary/50 p-4">
                  <div className="flex items-baseline gap-1.5 font-display text-3xl font-bold text-green-primary md:text-4xl">
                    {i === 0 ? (
                      <>
                        <AnimatePresence mode="popLayout">
                          <motion.span
                            key={tasks}
                            initial={prefersReducedMotion ? false : { y: -12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={prefersReducedMotion ? undefined : { y: 12, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="tabular-nums"
                          >
                            {tasks}
                          </motion.span>
                        </AnimatePresence>
                      </>
                    ) : (
                      <span>{'value' in kpi ? kpi.value : ''}</span>
                    )}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    {kpi.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
              {/* Flux d'activité en direct */}
              <div className="rounded-xl border border-border-subtle bg-bg-primary/50 p-4">
                <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  <span>{t.feedTitle}</span>
                  <span className="flex items-center gap-1.5 text-green-primary">
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full bg-green-primary"
                      animate={prefersReducedMotion ? {} : { opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    {t.live}
                  </span>
                </div>
                <div className="space-y-2.5">
                  <AnimatePresence initial={false} mode="popLayout">
                    {feed.map((row) => (
                      <motion.div
                        key={row.id}
                        layout
                        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -14, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="flex items-center gap-2.5 font-sans text-sm text-text-secondary">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border-green bg-green-subtle text-green-primary">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                          {row.label}
                        </span>
                        <span className="shrink-0 font-mono text-xs text-green-primary">{row.value}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Graphe animé */}
              <div className="rounded-xl border border-border-subtle bg-bg-primary/50 p-4">
                <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  <TrendingUp className="h-3.5 w-3.5 text-green-primary" />
                  {t.chartTitle}
                </div>
                <div className="flex h-28 items-end gap-2">
                  {bars.map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t transition-[height] duration-700 ease-out ${
                        i === bars.length - 1 ? 'bg-green-primary' : 'bg-green-primary/30'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
