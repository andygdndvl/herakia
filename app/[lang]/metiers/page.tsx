import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MetiersHub } from '@/components/metiers/MetiersHub';
import { isLocale, defaultLocale, type Locale } from '@/dictionaries';
import { METIERS_HUB_NOINDEX } from '@/lib/metiers';

const META = {
  fr: {
    title: 'Zéro appel manqué — Un assistant téléphonique IA pour votre métier',
    description:
      'Artisans, agences immobilières, cabinets comptables, cabinets de santé, écoles : un assistant IA décroche quand personne ne peut, et vous envoie le résumé par SMS.',
  },
  en: {
    title: 'Zero missed calls — An AI phone assistant for your line of work',
    description:
      'Tradespeople, estate agencies, accounting firms, healthcare practices, schools: an AI assistant picks up when nobody can and texts you the summary.',
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
