'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Mail, Globe, MessageSquare, Brain, Send, Database, Calendar } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLang } from '@/components/i18n/LangProvider';

interface Connector {
  icon: LucideIcon;
  label: string;
}

const inputs: Connector[] = [
  { icon: Mail, label: 'Email' },
  { icon: Globe, label: 'API' },
  { icon: MessageSquare, label: 'Chat' },
];

const outputIcons = [Send, Database, Calendar];

export function ArchitectureSchema() {
  const prefersReducedMotion = useReducedMotion();
  const lang = useLang();
  const t =
    lang === 'en'
      ? { realtime: 'Real time', agent: 'AI agent', agentSub: 'LLM · Rules', outputs: ['Reply', 'CRM', 'Calendar'] }
      : { realtime: 'Temps réel', agent: 'Agent IA', agentSub: 'LLM · Règles', outputs: ['Réponse', 'CRM', 'Agenda'] };
  const outputs: Connector[] = outputIcons.map((icon, i) => ({ icon, label: t.outputs[i] }));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-secondary/50 p-8 backdrop-blur-md md:p-10">
      <div className="mb-8 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-green-primary">
          Architecture · Herakia
        </span>
        <span className="flex items-center gap-1.5 font-mono text-xs text-text-muted">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-green-primary"
            animate={prefersReducedMotion ? {} : { opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {t.realtime}
        </span>
      </div>

      <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-8">
        <div className="flex flex-col gap-3">
          <span className="mb-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Input
          </span>
          {inputs.map((input, idx) => {
            const Icon = input.icon;
            return (
              <motion.div
                key={input.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-elevated px-3 py-2.5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-primary text-text-secondary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-display text-sm font-medium text-text-primary">
                  {input.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        <div className="relative flex h-full flex-col items-center justify-center">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 200 240"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="arch-flow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(62, 207, 142, 0)" />
                <stop offset="50%" stopColor="rgba(62, 207, 142, 1)" />
                <stop offset="100%" stopColor="rgba(62, 207, 142, 0)" />
              </linearGradient>
            </defs>
            {[40, 120, 200].map((y, idx) => (
              <g key={`in-${y}`}>
                <line
                  x1="0"
                  y1={y}
                  x2="100"
                  y2="120"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
                {!prefersReducedMotion && (
                  <motion.line
                    x1="0"
                    y1={y}
                    x2="100"
                    y2="120"
                    stroke="url(#arch-flow)"
                    strokeWidth="2"
                    strokeDasharray="0 30 30 200"
                    initial={{ strokeDashoffset: 260 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{
                      duration: 2,
                      delay: idx * 0.4,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: 'linear',
                    }}
                  />
                )}
              </g>
            ))}
            {[40, 120, 200].map((y, idx) => (
              <g key={`out-${y}`}>
                <line
                  x1="100"
                  y1="120"
                  x2="200"
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
                {!prefersReducedMotion && (
                  <motion.line
                    x1="100"
                    y1="120"
                    x2="200"
                    y2={y}
                    stroke="url(#arch-flow)"
                    strokeWidth="2"
                    strokeDasharray="0 30 30 200"
                    initial={{ strokeDashoffset: 260 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{
                      duration: 2,
                      delay: 1 + idx * 0.4,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: 'linear',
                    }}
                  />
                )}
              </g>
            ))}
          </svg>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: 0.3,
              type: 'spring',
              stiffness: 200,
              damping: 16,
            }}
            className="relative z-10"
          >
            <motion.div
              animate={
                prefersReducedMotion
                  ? {}
                  : { boxShadow: [
                      '0 0 0 0 rgba(62, 207, 142, 0.4)',
                      '0 0 0 16px rgba(62, 207, 142, 0)',
                      '0 0 0 0 rgba(62, 207, 142, 0)',
                    ] }
              }
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border-green bg-bg-primary shadow-glow-green md:h-24 md:w-24"
            >
              <Brain className="h-9 w-9 text-green-primary md:h-10 md:w-10" />
            </motion.div>
            <p className="mt-3 text-center font-display text-sm font-bold text-text-primary md:text-base">
              {t.agent}
            </p>
            <p className="text-center font-mono text-[10px] uppercase tracking-wider text-green-primary">
              {t.agentSub}
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="mb-1 text-right font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Output
          </span>
          {outputs.map((output, idx) => {
            const Icon = output.icon;
            return (
              <motion.div
                key={output.label}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                className="flex items-center gap-3 rounded-xl border border-border-green bg-green-subtle px-3 py-2.5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-primary text-green-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-display text-sm font-medium text-text-primary">
                  {output.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
