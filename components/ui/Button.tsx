'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-green-primary text-bg-primary font-semibold shadow-glow-green hover:bg-green-dark hover:shadow-glow-green-lg',
  secondary:
    'bg-transparent text-text-primary border border-border-subtle hover:border-green-primary/50 hover:bg-green-subtle',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary',
};

export function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  className = '',
  ariaLabel,
}: ButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const interactionProps = prefersReducedMotion
    ? {}
    : { whileHover: { scale: 1.03 }, whileTap: { scale: 0.97 } };

  const baseClasses = `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-sans ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <motion.div {...interactionProps} className="inline-block">
        <Link href={href} aria-label={ariaLabel} className={baseClasses}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={baseClasses}
      {...interactionProps}
    >
      {children}
    </motion.button>
  );
}
