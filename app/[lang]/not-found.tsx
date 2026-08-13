'use client';

import Link from 'next/link';
import { useLang, localize } from '@/components/i18n/LangProvider';

export default function NotFound() {
  const lang = useLang();
  const t =
    lang === 'en'
      ? { code: '404', title: 'Page not found.', body: 'This page does not exist or has moved.', cta: 'Back to home' }
      : { code: '404', title: 'Page introuvable.', body: "Cette page n'existe pas ou a été déplacée.", cta: "Retour à l'accueil" };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="font-mono text-sm uppercase tracking-widest text-green-primary">
        {t.code}
      </span>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
        {t.title}
      </h1>
      <p className="mt-4 max-w-md font-sans text-text-secondary">{t.body}</p>
      <Link
        href={localize(lang, '/')}
        className="mt-8 rounded-lg bg-green-primary px-6 py-3 font-display text-sm font-semibold text-bg-primary transition-colors hover:bg-green-dark"
      >
        {t.cta}
      </Link>
    </main>
  );
}
