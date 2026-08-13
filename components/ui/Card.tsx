'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  glow?: boolean;
}

export function Card({ children, className = '', hoverable = false, glow = false }: CardProps) {
  const prefersReducedMotion = useReducedMotion();
  const hoverProps =
    hoverable && !prefersReducedMotion
      ? { whileHover: { y: -6, scale: 1.01 } }
      : {};

  const glowClass = glow ? 'shadow-glow-green-sm hover:shadow-glow-green' : '';

  return (
    <motion.div
      {...hoverProps}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-card rounded-2xl p-8 transition-all duration-300 hover:border-green-primary/30 ${glowClass} ${className}`}
    >
      {children}
    </motion.div>
  );
}
