'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  pulse?: boolean;
  variant?: 'default' | 'green';
  className?: string;
}

export function Badge({
  children,
  pulse = false,
  variant = 'green',
  className = '',
}: BadgeProps) {
  const prefersReducedMotion = useReducedMotion();
  const variantClass =
    variant === 'green'
      ? 'border-border-green bg-green-subtle text-green-primary'
      : 'border-border-subtle bg-bg-elevated text-text-secondary';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide font-mono uppercase ${variantClass} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          {!prefersReducedMotion && (
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full bg-green-primary"
              animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-primary" />
        </span>
      )}
      {children}
    </span>
  );
}
