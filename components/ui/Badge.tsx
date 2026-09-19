import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  pulse?: boolean;
  variant?: 'default' | 'green';
  className?: string;
}

export function Badge({ children, pulse = false, variant = 'green', className = '' }: BadgeProps) {
  const variantClass =
    variant === 'green'
      ? 'border-border-green bg-green-subtle text-green-primary'
      : 'border-border-subtle bg-bg-elevated text-text-secondary';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-wide ${variantClass} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-primary opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-primary" />
        </span>
      )}
      {children}
    </span>
  );
}
