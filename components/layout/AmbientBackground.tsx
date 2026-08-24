'use client';

import { motion, useReducedMotion } from 'framer-motion';

const NOISE_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function AmbientBackground() {
  const prefersReducedMotion = useReducedMotion();

  const drift = (x: number[], y: number[], duration: number) =>
    prefersReducedMotion ? {} : { x, y, transition: { duration, repeat: Infinity, ease: 'easeInOut' } };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-bg-primary" aria-hidden="true">
      <motion.div
        className="absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-green-glow blur-[120px]"
        animate={drift([0, 60, 0], [0, 40, 0], 26)}
      />
      <motion.div
        className="absolute bottom-[-14rem] left-1/3 h-[28rem] w-[28rem] rounded-full bg-green-glow blur-[130px] opacity-70"
        animate={drift([0, 40, 0], [0, -30, 0], 30)}
      />

      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-soft-light"
        style={{ backgroundImage: `url("${NOISE_URL}")` }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 0%, transparent 0%, rgba(10,10,10,0.35) 60%, rgba(10,10,10,0.75) 100%)',
        }}
      />
    </div>
  );
}
