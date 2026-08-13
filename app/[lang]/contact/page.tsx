import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ContactContent } from '@/components/home/ContactContent';
import { getDictionary, isLocale, defaultLocale, type Locale } from '@/dictionaries';

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang: Locale = isLocale(params.lang) ? params.lang : defaultLocale;
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.contact.title,
    description: dict.meta.contact.description,
    alternates: {
      canonical: `/${lang}/contact`,
      languages: { fr: '/fr/contact', en: '/en/contact', 'x-default': '/fr/contact' },
    },
  };
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <ContactContent />
      </main>
      <Footer />
    </>
  );
}
