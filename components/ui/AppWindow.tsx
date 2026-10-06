import type { ReactNode } from 'react';

/**
 * Fenêtre d'application claire, au style des écrans du film de présentation : barre à trois
 * points et titre, fond crème, encre presque noire. Sert d'illustration (devis vivant du hero,
 * aperçus des bénéfices) : le contenu montre un usage, il ne présente aucun client réel.
 */
export function AppWindow({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl bg-window text-left font-sans text-window-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/5 ${className}`}
    >
      <div className="flex items-center gap-1.5 border-b border-window-line px-3 py-2 text-[10px] text-window-muted">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-[7px] w-[7px] rounded-full bg-window-line" />
        ))}
        <span className="ml-1.5 truncate">{title}</span>
      </div>
      {children}
    </div>
  );
}
