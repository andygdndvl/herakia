import type { Metadata } from 'next';
import { LegalShell, Fill } from '@/components/layout/LegalShell';
import { isLocale, defaultLocale, type Locale } from '@/dictionaries';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang: Locale = isLocale(params.lang) ? params.lang : defaultLocale;
  return {
    title: lang === 'en' ? 'Legal notice' : 'Mentions légales',
    description:
      lang === 'en'
        ? 'Legal notice for the Herakia website — publisher, host and intellectual property.'
        : 'Mentions légales du site Herakia — éditeur, hébergeur et propriété intellectuelle.',
    alternates: {
      canonical: `/${lang}/mentions-legales`,
      languages: { fr: '/fr/mentions-legales', en: '/en/mentions-legales' },
    },
    robots: { index: false, follow: true },
  };
}

export default function MentionsLegalesPage({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : defaultLocale;

  if (lang === 'en') {
    return (
      <LegalShell title="Legal notice" lastUpdated="TO BE COMPLETED" updatedLabel="Last updated">
        <h2>Publisher</h2>
        <p>
          The <strong>herakia.com</strong> website is published by:
        </p>
        <ul>
          <li>Company name: <Fill>company name</Fill></li>
          <li>Legal form: <Fill>SASU / sole trader…</Fill></li>
          <li>Share capital: <Fill>amount, if any</Fill></li>
          <li>Registered office: <Fill>full address</Fill></li>
          <li>Company registration no.: <Fill>SIRET number</Fill></li>
          <li>VAT number: <Fill>VAT no., if any</Fill></li>
          <li>Publication director: <Fill>name of the person responsible (e.g. Andy …)</Fill></li>
          <li>Contact: <a href="mailto:contact@herakia.com">contact@herakia.com</a></li>
        </ul>

        <h2>Hosting</h2>
        <p>The website is hosted by:</p>
        <ul>
          <li>Name: <Fill>e.g. Vercel Inc.</Fill></li>
          <li>Address: <Fill>host address (e.g. 340 S Lemon Ave #4133, Walnut, CA 91789, USA)</Fill></li>
          <li>Website: <Fill>e.g. vercel.com</Fill></li>
        </ul>

        <h2>Intellectual property</h2>
        <p>
          All content on this website (text, visuals, logos, graphic elements, code) is the exclusive
          property of Herakia, unless otherwise stated, and is protected by intellectual property law.
          Any reproduction or representation, in whole or in part, without prior written authorisation
          is prohibited.
        </p>

        <h2>Liability</h2>
        <p>
          Herakia strives to ensure the accuracy of the information published on this website but cannot
          guarantee it is free of errors or omissions. Links to third-party sites do not engage
          Herakia’s responsibility for their content.
        </p>

        <h2>Personal data &amp; cookies</h2>
        <p>
          The processing of your personal data is described in our{' '}
          <a href="/en/confidentialite">Privacy policy</a>.
        </p>
      </LegalShell>
    );
  }

  return (
    <LegalShell title="Mentions légales" lastUpdated="À COMPLÉTER">
      <h2>Éditeur du site</h2>
      <p>
        Le site <strong>herakia.com</strong> est édité par&nbsp;:
      </p>
      <ul>
        <li>Raison sociale&nbsp;: <Fill>raison sociale</Fill></li>
        <li>Forme juridique&nbsp;: <Fill>SASU / EI / auto-entrepreneur…</Fill></li>
        <li>Capital social&nbsp;: <Fill>montant, le cas échéant</Fill></li>
        <li>Siège social&nbsp;: <Fill>adresse complète</Fill></li>
        <li>SIRET&nbsp;: <Fill>numéro SIRET</Fill></li>
        <li>Numéro de TVA intracommunautaire&nbsp;: <Fill>n° TVA, le cas échéant</Fill></li>
        <li>Directeur de la publication&nbsp;: <Fill>nom du responsable (ex. Andy …)</Fill></li>
        <li>Contact&nbsp;: <a href="mailto:contact@herakia.com">contact@herakia.com</a></li>
      </ul>

      <h2>Hébergeur</h2>
      <p>Le site est hébergé par&nbsp;:</p>
      <ul>
        <li>Nom&nbsp;: <Fill>ex. Vercel Inc.</Fill></li>
        <li>Adresse&nbsp;: <Fill>adresse de l’hébergeur (ex. 340 S Lemon Ave #4133, Walnut, CA 91789, USA)</Fill></li>
        <li>Site&nbsp;: <Fill>ex. vercel.com</Fill></li>
      </ul>

      <h2>Propriété intellectuelle</h2>
      <p>
        L’ensemble des contenus présents sur ce site (textes, visuels, logos, éléments graphiques,
        code) est la propriété exclusive d’Herakia, sauf mention contraire, et est protégé par le
        droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou
        partielle, sans autorisation écrite préalable est interdite.
      </p>

      <h2>Responsabilité</h2>
      <p>
        Herakia s’efforce d’assurer l’exactitude des informations diffusées sur ce site mais ne peut
        garantir qu’elles soient exemptes d’erreurs ou d’omissions. Les liens vers des sites tiers
        n’engagent pas la responsabilité d’Herakia quant à leur contenu.
      </p>

      <h2>Données personnelles &amp; cookies</h2>
      <p>
        Le traitement de vos données personnelles est décrit dans notre{' '}
        <a href="/fr/confidentialite">Politique de confidentialité</a>.
      </p>
    </LegalShell>
  );
}
