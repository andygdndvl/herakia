'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useLang } from '@/components/i18n/LangProvider';

interface DataPoint {
  label: string;
  before: number;
  after: number;
  unit: string;
  inverse?: boolean;
}

const values = [
  { before: 6, after: 0 },
  { before: 12, after: 0 },
  { before: 5, after: 7, inverse: true },
];

const TEXT = {
  fr: {
    title: 'Mesures comparées',
    before: 'Avant',
    after: 'Après',
    productivity: 'Productivité globale',
    rows: [
      { label: 'Saisie manuelle', unit: 'h/jour' },
      { label: 'Erreurs de traitement', unit: '/sem' },
      { label: 'Disponibilité', unit: 'j/7' },
    ],
  },
  en: {
    title: 'Compared metrics',
    before: 'Before',
    after: 'After',
    productivity: 'Overall productivity',
    rows: [
      { label: 'Manual data entry', unit: 'h/day' },
      { label: 'Processing errors', unit: '/wk' },
      { label: 'Availability', unit: 'd/7' },
    ],
  },
} as const;

function getPercentage(point: DataPoint): { beforePct: number; afterPct: number } {
  const max = Math.max(point.before, point.after, 1);
  return {
    beforePct: (point.before / max) * 100,
    afterPct: (point.after / max) * 100,
  };
}

export function BeforeAfterChart() {
  const prefersReducedMotion = useReducedMotion();
  const t = TEXT[useLang()];
  const data: DataPoint[] = values.map((v, i) => ({ ...v, ...t.rows[i] }));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-secondary/50 p-8 backdrop-blur-md">
      <div className="mb-8 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-green-primary">
          {t.title}
        </span>
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-text-muted">
            <span className="h-2 w-2 rounded-full bg-red-400/60" />
            {t.before}
          </span>
          <span className="flex items-center gap-1.5 text-green-primary">
            <span className="h-2 w-2 rounded-full bg-green-primary" />
            {t.after}
          </span>
        </div>
      </div>

      <div className="space-y-7">
        {data.map((point, idx) => {
          const { beforePct, afterPct } = getPercentage(point);
          return (
            <div key={point.label}>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-sans text-sm text-text-primary">{point.label}</span>
                <span className="font-mono text-xs text-text-muted">{point.unit}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="w-12 shrink-0 font-mono text-xs text-text-muted">{t.before}</span>
                  <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-bg-elevated">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${beforePct}%` }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 1.2, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full bg-red-400/40"
                    />
                  </div>
                  <span className="w-14 shrink-0 text-right font-display text-base font-bold text-text-secondary">
                    {point.before}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-12 shrink-0 font-mono text-xs text-green-primary">{t.after}</span>
                  <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-bg-elevated">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${afterPct}%` }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 1.2, delay: idx * 0.15 + 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="relative h-full rounded-full bg-green-primary"
                    >
                      {!prefersReducedMotion && (
                        <motion.span
                          className="absolute inset-y-0 right-0 w-8 bg-gradient-to-r from-transparent to-green-primary/60 blur-sm"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                    </motion.div>
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.15 + 1 }}
                    className="w-14 shrink-0 text-right font-display text-base font-bold text-green-primary"
                  >
                    {point.after}
                  </motion.span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 1.4 }}
        className="mt-8 flex items-center justify-between rounded-xl border border-border-green bg-green-subtle px-4 py-3"
      >
        <span className="font-sans text-sm text-text-primary">{t.productivity}</span>
        <span className="flex items-center gap-2">
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1.6 }}
            className="font-display text-2xl font-bold text-green-primary"
          >
            ×3
          </motion.span>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
            <motion.path
              d="M1 9 L7 1 L13 9"
              stroke="#3ecf8e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.7 }}
            />
          </svg>
        </span>
      </motion.div>
    </div>
  );
}
