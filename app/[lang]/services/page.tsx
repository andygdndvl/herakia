import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CTAFinal } from '@/components/home/CTAFinal';
import { getDictionary, isLocale, defaultLocale, type Locale } from '@/dictionaries';
import { ServicesList } from '@/components/home/ServicesList';

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang: Locale = isLocale(params.lang) ? params.lang : defaultLocale;
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.services.title,
    description: dict.meta.services.description,
    alternates: {
      canonical: `/${lang}/services`,
      languages: { fr: '/fr/services', en: '/en/services', 'x-default': '/fr/services' },
    },
  };
}

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main>
        <ServicesList />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
