import type { MetadataRoute } from 'next';
import { locales } from '@/dictionaries';
import { METIERS, METIERS_HUB_NOINDEX } from '@/lib/metiers';

const SITE = 'https://herakia.com';

// Ne liste ici que les pages indexables (pas cgu/confidentialite/mentions-legales,
// qui ont `robots: { index: false }` dans leur metadata).
const paths = ['', '/services', '/offres', '/demo', '/faq', '/contact'] as const;

const priorities: Record<string, number> = {
  '': 1,
  '/services': 0.9,
  '/offres': 0.9,
  '/demo': 0.8,
  '/faq': 0.7,
  '/contact': 0.9,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Les pages métiers et leur page d'aiguillage n'y figurent que lorsqu'elles sont ouvertes au
  // référencement (lib/metiers.ts).
  const metiers = [
    ...(METIERS_HUB_NOINDEX ? [] : ['/metiers']),
    ...METIERS.filter((m) => !m.noindex).map((m) => `/${m.slug}`),
  ];
  const listed: string[] = [...paths, ...metiers];

  return listed.flatMap((path) =>
    locales.map((lang) => ({
      url: `${SITE}/${lang}${path}`,
      lastModified,
      changeFrequency: (path === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: priorities[path] ?? 0.8,
      alternates: {
        languages: {
          fr: `${SITE}/fr${path}`,
          en: `${SITE}/en${path}`,
        },
      },
    })),
  );
}
