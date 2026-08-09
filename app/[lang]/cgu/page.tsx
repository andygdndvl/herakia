import type { Metadata } from 'next';
import { LegalShell, Fill } from '@/components/layout/LegalShell';
import { isLocale, defaultLocale, type Locale } from '@/dictionaries';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang: Locale = isLocale(params.lang) ? params.lang : defaultLocale;
  return {
    title: lang === 'en' ? 'Terms of use' : 'Conditions générales d’utilisation',
    description:
      lang === 'en'
        ? 'Terms of use of the Herakia website — purpose, access, intellectual property and liability.'
        : 'Conditions générales d’utilisation du site Herakia — objet, accès, propriété intellectuelle et responsabilité.',
    alternates: {
      canonical: `/${lang}/cgu`,
      languages: { fr: '/fr/cgu', en: '/en/cgu' },
    },
    robots: { index: false, follow: true },
  };
}

export default function CguPage({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : defaultLocale;

  if (lang === 'en') {
    return (
      <LegalShell title="Terms of use" lastUpdated="TO BE COMPLETED" updatedLabel="Last updated">
        <h2>1. Purpose</h2>
        <p>
          These terms of use govern access to and use of the <strong>herakia.com</strong>{' '}
          website, published by <Fill>company name</Fill>. By browsing the site, you accept these terms
          without reservation.
        </p>

        <h2>2. Access to the site</h2>
        <p>
          The site is freely accessible to any user with Internet access. Costs related to access
          (hardware, connection) are the user’s responsibility. Herakia strives to keep the site
          available without guaranteeing it, and may suspend access for maintenance or updates.
        </p>

        <h2>3. Services presented</h2>
        <p>
          The site presents Herakia’s services in automation and artificial intelligence solutions. The
          information provided is indicative and does not constitute a contractual offer. Every
          engagement is subject to a quote and specific terms: <Fill>link to your terms of sale if they
          exist, or specify the contractual arrangements</Fill>.
        </p>

        <h2>4. Intellectual property</h2>
        <p>
          All elements of the site are protected by intellectual property law and remain the property
          of Herakia. Any unauthorised reproduction is prohibited. See the{' '}
          <a href="/en/mentions-legales">legal notice</a>.
        </p>

        <h2>5. Personal data</h2>
        <p>
          The processing of personal data is detailed in the{' '}
          <a href="/en/confidentialite">privacy policy</a>.
        </p>

        <h2>6. Liability</h2>
        <p>
          Herakia cannot be held liable for direct or indirect damage resulting from access to or use of
          the site, including unavailability, data loss or the presence of viruses.
        </p>

        <h2>7. Governing law</h2>
        <p>
          These terms are governed by French law. In the event of a dispute, and failing an amicable
          resolution, jurisdiction is granted to the courts of{' '}
          <Fill>city of the registered office’s jurisdiction</Fill>.
        </p>
      </LegalShell>
    );
  }

  return (
    <LegalShell title="Conditions générales d’utilisation" lastUpdated="À COMPLÉTER">
      <h2>1. Objet</h2>
      <p>
        Les présentes conditions générales d’utilisation (CGU) encadrent l’accès et l’utilisation du
        site <strong>herakia.com</strong>, édité par <Fill>raison sociale</Fill>. En naviguant sur le
        site, vous acceptez sans réserve les présentes CGU.
      </p>

      <h2>2. Accès au site</h2>
      <p>
        Le site est accessible gratuitement à tout utilisateur disposant d’un accès à Internet. Les
        frais liés à l’accès (matériel, connexion) sont à la charge de l’utilisateur. Herakia s’efforce
        d’assurer la disponibilité du site sans pouvoir la garantir, et peut en suspendre l’accès pour
        maintenance ou mise à jour.
      </p>

      <h2>3. Services proposés</h2>
      <p>
        Le site présente les prestations d’Herakia en matière d’automatisation et de solutions
        d’intelligence artificielle. Les informations diffusées ont une valeur indicative et ne
        constituent pas une offre contractuelle. Toute prestation fait l’objet d’un devis et de
        conditions spécifiques&nbsp;: <Fill>renvoyer vers vos CGV si elles existent, ou préciser les
        modalités contractuelles</Fill>.
      </p>

      <h2>4. Propriété intellectuelle</h2>
      <p>
        L’ensemble des éléments du site est protégé par le droit de la propriété intellectuelle et
        demeure la propriété d’Herakia. Toute reproduction non autorisée est interdite. Voir les{' '}
        <a href="/fr/mentions-legales">mentions légales</a>.
      </p>

      <h2>5. Données personnelles</h2>
      <p>
        Le traitement des données personnelles est détaillé dans la{' '}
        <a href="/fr/confidentialite">politique de confidentialité</a>.
      </p>

      <h2>6. Responsabilité</h2>
      <p>
        Herakia ne saurait être tenue responsable des dommages directs ou indirects résultant de
        l’accès ou de l’utilisation du site, y compris l’inaccessibilité, la perte de données ou la
        présence de virus.
      </p>

      <h2>7. Droit applicable</h2>
      <p>
        Les présentes CGU sont régies par le droit français. En cas de litige, et à défaut de
        résolution amiable, compétence est attribuée aux tribunaux de{' '}
        <Fill>ville du ressort du siège social</Fill>.
      </p>
    </LegalShell>
  );
}
