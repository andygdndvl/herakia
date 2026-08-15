import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CTAFinal } from '@/components/home/CTAFinal';
import { getDictionary, isLocale, defaultLocale, type Locale } from '@/dictionaries';
import { OffresList } from '@/components/home/OffresList';

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang: Locale = isLocale(params.lang) ? params.lang : defaultLocale;
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.offres.title,
    description: dict.meta.offres.description,
    alternates: {
      canonical: `/${lang}/offres`,
      languages: { fr: '/fr/offres', en: '/en/offres', 'x-default': '/fr/offres' },
    },
  };
}

export default function OffresPage() {
  return (
    <>
      <Navbar />
      <main>
        <OffresList />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
