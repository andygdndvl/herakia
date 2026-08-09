'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Dictionary, Locale } from '@/dictionaries';

interface I18nValue {
  lang: Locale;
  dict: Dictionary;
}

const I18nContext = createContext<I18nValue | null>(null);

export function LangProvider({
  lang,
  dict,
  children,
}: {
  lang: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  return <I18nContext.Provider value={{ lang, dict }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n doit être utilisé dans un <LangProvider>.');
  return ctx;
}

export function useDict(): Dictionary {
  return useI18n().dict;
}

export function useLang(): Locale {
  return useI18n().lang;
}

/** Préfixe un chemin interne avec la locale : localize('en', '/contact') → '/en/contact'. */
export function localize(lang: Locale, href: string): string {
  if (!href.startsWith('/')) return href; // mailto:, https://, ancres externes…
  if (href === '/') return `/${lang}`;
  if (href.startsWith('/#')) return `/${lang}${href.slice(1)}`; // '/#faq' → '/en#faq'
  return `/${lang}${href}`;
}
