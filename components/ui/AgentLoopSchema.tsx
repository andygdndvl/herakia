'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ChevronDown, RotateCw, type LucideIcon } from 'lucide-react';

export interface AgentPhase {
  icon: LucideIcon;
  label: string;
  desc: string;
}

export function AgentLoopSchema({ phases, loopLabel }: { phases: AgentPhase[]; loopLabel: string }) {
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % phases.length), 2200);
    return () => clearInterval(id);
  }, [phases.length]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-secondary/60 p-6 backdrop-blur-md md:p-8">
      <div
        className="absolute right-0 top-0 h-40 w-40 rounded-full bg-green-primary/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Badge « en boucle » */}
      <div className="relative mb-6 flex justify-end">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-green bg-green-subtle px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-green-primary">
          <motion.span
            animate={prefersReducedMotion ? {} : { rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="flex"
          >
            <RotateCw className="h-3 w-3" />
          </motion.span>
          {loopLabel}
        </span>
      </div>

      <div className="relative">
        {phases.map((phase, i) => {
          const Icon = phase.icon;
          const isActive = i === active;
          return (
            <div key={phase.label}>
              <div className="flex items-start gap-4">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                  {isActive && !prefersReducedMotion && (
                    <motion.span
                      className="absolute inset-0 rounded-xl border border-green-primary"
                      initial={{ opacity: 0.6, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.35 }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                      aria-hidden="true"
                    />
                  )}
                  <motion.div
                    animate={{
                      borderColor: isActive ? 'rgba(62,207,142,0.6)' : 'rgba(255,255,255,0.08)',
                      backgroundColor: isActive ? 'rgba(62,207,142,0.12)' : 'rgba(255,255,255,0.02)',
                    }}
                    transition={{ duration: 0.4 }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border"
                  >
                    <Icon
                      className={`h-5 w-5 transition-colors duration-300 ${
                        isActive ? 'text-green-primary' : 'text-text-muted'
                      }`}
                    />
                  </motion.div>
                </div>

                <div className="pt-1">
                  <p
                    className={`font-display text-lg font-semibold transition-colors duration-300 ${
                      isActive ? 'text-text-primary' : 'text-text-secondary'
                    }`}
                  >
                    {phase.label}
                  </p>
                  <p className="mt-1 font-sans text-sm leading-relaxed text-text-secondary">
                    {phase.desc}
                  </p>
                </div>
              </div>

              {i < phases.length - 1 && (
                <div className="flex w-12 justify-center py-1.5">
                  <motion.span
                    animate={
                      prefersReducedMotion
                        ? {}
                        : { opacity: i === active ? [0.3, 1, 0.3] : 0.25, y: i === active ? [0, 3, 0] : 0 }
                    }
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                    className={i === active ? 'text-green-primary' : 'text-text-muted'}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
