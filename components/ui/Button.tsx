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
  primary: 'bg-green-primary text-on-green font-semibold hover:bg-green-dark',
  secondary: 'bg-transparent text-text-primary border border-border-strong hover:border-green-primary/60 hover:bg-green-subtle',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary',
};

// Micro-interactions sobres : léger enfoncement au clic, l'icône glisse au survol
const base =
  'group inline-flex items-center justify-center gap-2 rounded-full font-medium font-sans transition-[background-color,border-color,color,transform] duration-300 motion-safe:active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:transition-transform [&_svg]:duration-300 motion-safe:group-hover:[&_svg]:translate-x-1';

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
  const classes = `${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} aria-label={ariaLabel} className={classes}>
      {children}
    </button>
  );
}
