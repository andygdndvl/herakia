import type { Metadata, Viewport } from 'next';
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google';
import '../globals.css';
import { getDictionary, locales, isLocale, defaultLocale, type Locale } from '@/dictionaries';
import { LangProvider } from '@/components/i18n/LangProvider';
import { AmbientBackground } from '@/components/layout/AmbientBackground';
import { notFound } from 'next/navigation';
import Script from 'next/script';

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const SITE = 'https://herakia.com';

export const viewport: Viewport = {
  themeColor: '#080808',
  width: 'device-width',
  initialScale: 1,
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang: Locale = isLocale(params.lang) ? params.lang : defaultLocale;
  const dict = await getDictionary(lang);
  const ogLocale = lang === 'fr' ? 'fr_FR' : 'en_US';

  return {
    metadataBase: new URL(SITE),
    title: {
      default: dict.meta.home.title,
      template: '%s | Herakia',
    },
    description: dict.meta.home.description,
    keywords: [
      'automatisation IA',
      'AI automation',
      'agent IA sur mesure',
      'bespoke AI agent',
      'workflow automation',
      'agence IA France',
      'AI agency',
    ],
    authors: [{ name: 'Herakia', url: SITE }],
    creator: 'Herakia',
    publisher: 'Herakia',
    icons: {
      icon: '/favicon.png',
      shortcut: '/favicon.png',
      apple: '/apple-icon.png',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: dict.meta.home.title,
      description: dict.meta.home.description,
      url: `${SITE}/${lang}`,
      siteName: 'Herakia',
      locale: ogLocale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.meta.home.title,
      description: dict.meta.home.description,
    },
    alternates: {
      canonical: `/${lang}`,
      languages: {
        fr: '/fr',
        en: '/en',
        'x-default': '/fr',
      },
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  if (!isLocale(params.lang)) notFound();
  const lang = params.lang;
  const dict = await getDictionary(lang);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE}/#organization`,
        name: 'Herakia',
        url: SITE,
        logo: {
          '@type': 'ImageObject',
          // Version à mot-marque foncé : les moteurs affichent ce logo sur fond clair.
          url: `${SITE}/logo-herakia.png`,
          width: 2256,
          height: 556,
        },
        description: dict.meta.home.description,
        foundingDate: '2024',
        founder: { '@type': 'Person', name: 'Andy Duval' },
        address: { '@type': 'PostalAddress', addressCountry: 'FR' },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: 'contact@herakia.com',
          availableLanguage: ['French', 'English'],
          areaServed: ['FR', 'BE', 'CH'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: SITE,
        name: 'Herakia',
        description: dict.meta.home.description,
        publisher: { '@id': `${SITE}/#organization` },
        inLanguage: lang === 'fr' ? 'fr-FR' : 'en-US',
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE}/${lang}#faq`,
        inLanguage: lang === 'fr' ? 'fr-FR' : 'en-US',
        mainEntity: dict.faq.items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };

  return (
    <html
      lang={lang}
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Doit s'exécuter avant la première peinture : active le masquage des éléments animés */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-B1VYENR8Q6" strategy="afterInteractive" />
        <Script id="google-tag-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-B1VYENR8Q6');
          `}
        </Script>
      </head>
      <body>
        <AmbientBackground />
        <LangProvider lang={lang} dict={dict}>
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
