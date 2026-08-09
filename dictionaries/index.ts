import type fr from './fr';

export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// La structure du dictionnaire est dérivée du FR (source de vérité).
export type Dictionary = typeof fr;

const loaders: Record<Locale, () => Promise<{ default: Dictionary }>> = {
  fr: () => import('./fr'),
  en: () => import('./en'),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = loaders[locale] ?? loaders[defaultLocale];
  return (await loader()).default;
}
