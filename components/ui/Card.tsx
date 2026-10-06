import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  glow?: boolean;
}

export function Card({ children, className = '', hoverable = false, glow = false }: CardProps) {
  const hoverClass = hoverable ? 'motion-safe:hover:-translate-y-1.5' : '';
  const glowClass = glow ? 'shadow-glow-green-sm hover:shadow-glow-green' : '';
  return (
    <div
      className={`glass-card rounded-3xl p-8 transition-[transform,border-color,box-shadow] duration-300 hover:border-green-primary/30 ${hoverClass} ${glowClass} ${className}`}
    >
      {children}
    </div>
  );
}
