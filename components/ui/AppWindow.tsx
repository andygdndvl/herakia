import type { ReactNode } from 'react';

/**
 * Fenêtre d'application claire, au style des écrans du film de présentation : barre à trois
 * points et titre, fond crème, encre presque noire. Sert d'illustration (scène des
 * bénéfices) : le contenu montre un usage, il ne présente aucun client réel.
 */
export function AppWindow({
  title,
  icon,
  children,
  className = '',
}: {
  title: string;
  /** Logo de l'outil (WhatsApp, Téléphone, Excel…), affiché devant le titre. */
  icon?: ReactNode;
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
        <span className="ml-1.5 flex min-w-0 items-center gap-1.5">
          {icon && <span className="flex h-4 w-4 shrink-0 [&>svg]:h-full [&>svg]:w-full">{icon}</span>}
          <span className="truncate">{title}</span>
        </span>
      </div>
      {children}
    </div>
  );
}
