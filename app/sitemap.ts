import type { MetadataRoute } from 'next';
import { locales } from '@/dictionaries';

const SITE = 'https://herakia.com';
const paths = ['', '/services', '/contact'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return paths.flatMap((path) =>
    locales.map((lang) => ({
      url: `${SITE}/${lang}${path}`,
      lastModified,
      changeFrequency: (path === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: path === '' ? 1 : 0.9,
      alternates: {
        languages: {
          fr: `${SITE}/fr${path}`,
          en: `${SITE}/en${path}`,
        },
      },
    })),
  );
}
