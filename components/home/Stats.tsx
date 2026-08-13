'use client';

import { motion, useInView, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useLang } from '@/components/i18n/LangProvider';

interface Stat {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  caption: string;
}

const TEXT = {
  fr: {
    eyebrow: 'Nos engagements',
    title: 'Ce que vous pouvez attendre, dès le premier échange.',
    stats: [
      { value: 30, suffix: ' min', label: 'pour cadrer votre besoin', caption: 'Diagnostic offert, sans engagement' },
      { value: 4, suffix: ' sem.', label: 'jusqu’à un premier agent en production', caption: 'De l’audit au déploiement' },
      { value: 100, suffix: '%', label: 'sur-mesure, jamais de template', caption: 'Conçu pour votre métier' },
      { value: 24, suffix: '/7', label: 'de disponibilité', caption: 'Un agent IA ne prend pas de congés' },
    ] as Stat[],
  },
  en: {
    eyebrow: 'Our commitments',
    title: 'What you can expect, from the very first conversation.',
    stats: [
      { value: 30, suffix: ' min', label: 'to scope your need', caption: 'Free assessment, no commitment' },
      { value: 4, suffix: ' wks', label: 'to a first agent in production', caption: 'From assessment to deployment' },
      { value: 100, suffix: '%', label: 'bespoke, never a template', caption: 'Built for your business' },
      { value: 24, suffix: '/7', label: 'availability', caption: 'An AI agent never takes time off' },
    ] as Stat[],
  },
} as const;

function Counter({
  value,
  prefix = '',
  suffix = '',
  reducedMotion,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 50, damping: 20 });

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      motionValue.set(value);
      if (ref.current) ref.current.textContent = `${prefix}${value}${suffix}`;
      return;
    }
    motionValue.set(value);
  }, [inView, motionValue, value, reducedMotion, prefix, suffix]);

  useEffect(() => {
    if (reducedMotion) return;
    return springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Math.floor(latest)}${suffix}`;
      }
    });
  }, [springValue, prefix, suffix, reducedMotion]);

  return <span ref={ref}>{`${prefix}0${suffix}`}</span>;
}

export function Stats() {
  const prefersReducedMotion = useReducedMotion();
  const t = TEXT[useLang()];

  return (
    <section className="relative overflow-hidden border-y border-border-subtle bg-bg-secondary/50 px-6 py-24 lg:px-8">
      <div
        className="absolute left-1/2 top-1/2 -z-0 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-primary/5 blur-[140px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-green-primary">
            {t.eyebrow}
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl text-balance">
            {t.title}
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {t.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { clipPath: 'inset(100% 0% 0% 0% round 1rem)' }
              }
              whileInView={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { clipPath: 'inset(0% 0% 0% 0% round 1rem)' }
              }
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-2xl border border-border-subtle bg-bg-primary/40 p-8 backdrop-blur-md transition-colors duration-300 hover:border-border-green hover:shadow-glow-green-sm"
            >
              <div className="font-display text-5xl font-bold text-green-primary md:text-6xl">
                <Counter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  reducedMotion={!!prefersReducedMotion}
                />
              </div>
              <p className="mt-4 font-sans text-base font-medium text-text-primary">{stat.label}</p>
              <p className="mt-1 font-mono text-xs uppercase tracking-wide text-text-muted">
                {stat.caption}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
