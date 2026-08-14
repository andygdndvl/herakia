import type { MetadataRoute } from 'next';
import { locales } from '@/dictionaries';

const SITE = 'https://herakia.com';

// Ne liste ici que les pages indexables (pas cgu/confidentialite/mentions-legales,
// qui ont `robots: { index: false }` dans leur metadata).
const paths = ['', '/services', '/demo', '/faq', '/contact'] as const;

const priorities: Record<(typeof paths)[number], number> = {
  '': 1,
  '/services': 0.9,
  '/demo': 0.8,
  '/faq': 0.7,
  '/contact': 0.9,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return paths.flatMap((path) =>
    locales.map((lang) => ({
      url: `${SITE}/${lang}${path}`,
      lastModified,
      changeFrequency: (path === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: priorities[path],
      alternates: {
        languages: {
          fr: `${SITE}/fr${path}`,
          en: `${SITE}/en${path}`,
        },
      },
    })),
  );
}
