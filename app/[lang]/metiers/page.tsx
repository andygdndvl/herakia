import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MetiersHub } from '@/components/metiers/MetiersHub';
import { isLocale, defaultLocale, type Locale } from '@/dictionaries';
import { METIERS_HUB_NOINDEX } from '@/lib/metiers';

const META = {
  fr: {
    title: 'Par métier — Ce qu’Herakia construit pour votre activité',
    description:
      'Artisans, agences immobilières, cabinets comptables, cabinets de santé, écoles : assistant téléphonique, agents IA, automatisations et données, réglés pour votre métier.',
  },
  en: {
    title: 'By industry — What Herakia builds for your business',
    description:
      'Tradespeople, estate agencies, accounting firms, healthcare practices, schools: phone assistant, AI agents, automations and data, set up for your line of work.',
  },
} as const;

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang: Locale = isLocale(params.lang) ? params.lang : defaultLocale;
  return {
    title: META[lang].title,
    description: META[lang].description,
    alternates: {
      canonical: `/${lang}/metiers`,
      languages: { fr: '/fr/metiers', en: '/en/metiers', 'x-default': '/fr/metiers' },
    },
    ...(METIERS_HUB_NOINDEX ? { robots: { index: false, follow: false } } : {}),
  };
}

export default function MetiersPage() {
  return (
    <>
      <Navbar />
      <main>
        <MetiersHub />
      </main>
      <Footer />
    </>
  );
}
