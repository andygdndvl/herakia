import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

/**
 * Placeholder visible à compléter avant publication.
 * Repérable d'un coup d'œil (fond ambré) — cherchez « À COMPLÉTER » dans le code.
 */
export function Fill({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded bg-amber-400/20 px-1.5 py-0.5 font-mono text-[0.9em] text-amber-300">
      【À COMPLÉTER : {children}】
    </mark>
  );
}

interface LegalShellProps {
  title: string;
  lastUpdated: string;
  updatedLabel?: string;
  children: ReactNode;
}

export function LegalShell({ title, lastUpdated, updatedLabel = 'Dernière mise à jour', children }: LegalShellProps) {
  return (
    <>
      <Navbar />
      <main className="relative px-6 pt-40 pb-32 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-text-primary md:text-5xl text-balance">
            {title}
          </h1>
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-text-muted">
            {updatedLabel} : {lastUpdated}
          </p>

          <div
            className="mt-12 space-y-8 font-sans text-base leading-relaxed text-text-secondary
              [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-text-primary
              [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-text-primary
              [&_p]:mt-4
              [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6
              [&_a]:text-green-primary [&_a]:underline-offset-4 hover:[&_a]:underline
              [&_strong]:text-text-primary"
          >
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
