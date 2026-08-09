import type { Metadata } from 'next';
import { LegalShell, Fill } from '@/components/layout/LegalShell';
import { isLocale, defaultLocale, type Locale } from '@/dictionaries';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const lang: Locale = isLocale(params.lang) ? params.lang : defaultLocale;
  return {
    title: lang === 'en' ? 'Privacy policy' : 'Politique de confidentialité',
    description:
      lang === 'en'
        ? 'Herakia privacy policy — processing of personal data, purposes, retention period and GDPR rights.'
        : 'Politique de confidentialité d’Herakia — traitement des données personnelles, finalités, durée de conservation et droits RGPD.',
    alternates: {
      canonical: `/${lang}/confidentialite`,
      languages: { fr: '/fr/confidentialite', en: '/en/confidentialite' },
    },
    robots: { index: false, follow: true },
  };
}

export default function ConfidentialitePage({ params }: { params: { lang: string } }) {
  const lang: Locale = isLocale(params.lang) ? params.lang : defaultLocale;

  if (lang === 'en') {
    return (
      <LegalShell title="Privacy policy" lastUpdated="TO BE COMPLETED" updatedLabel="Last updated">
        <p>
          Herakia places particular importance on protecting your personal data. This policy describes
          what data we collect, why, how long we keep it and what your rights are, in accordance with
          the General Data Protection Regulation (GDPR).
        </p>

        <h2>Data controller</h2>
        <p>
          The data controller is <Fill>company name / name</Fill>, reachable at{' '}
          <a href="mailto:contact@herakia.com">contact@herakia.com</a>.
        </p>

        <h2>Data collected</h2>
        <p>We only collect the data you voluntarily provide to us:</p>
        <ul>
          <li>Via the contact form: name, work email, company, message.</li>
          <li>
            Via browsing: <Fill>specify whether audience-measurement tools are used (e.g. Plausible,
            GA4) and which — otherwise state “no audience measurement”</Fill>.
          </li>
        </ul>

        <h2>Purposes &amp; legal basis</h2>
        <ul>
          <li>Responding to your requests and contacting you back — legal basis: pre-contractual measures / legitimate interest.</li>
          <li><Fill>any other purposes (newsletter, statistics…) and their legal basis</Fill></li>
        </ul>

        <h2>Recipients</h2>
        <p>
          Your data is intended for Herakia and is not resold. It may pass through our technical
          subprocessors: <Fill>e.g. Resend (email sending), Vercel (hosting) — list the providers
          actually used</Fill>.
        </p>

        <h2>Retention period</h2>
        <p>
          Data from the contact form is kept for{' '}
          <Fill>duration (e.g. 3 years from the last contact)</Fill>, then deleted or anonymised.
        </p>

        <h2>Your rights</h2>
        <p>
          You have a right of access, rectification, erasure, restriction, objection and portability of
          your data. To exercise them, write to{' '}
          <a href="mailto:contact@herakia.com">contact@herakia.com</a>. You may also lodge
          a complaint with the CNIL (
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">cnil.fr</a>).
        </p>

        <h2>Cookies</h2>
        <p>
          <Fill>Describe cookie usage. If no non-essential cookies are set, state it clearly. If
          measurement/marketing cookies are used, a consent banner is mandatory.</Fill>
        </p>
      </LegalShell>
    );
  }

  return (
    <LegalShell title="Politique de confidentialité" lastUpdated="À COMPLÉTER">
      <p>
        Herakia accorde une importance particulière à la protection de vos données personnelles.
        Cette politique décrit quelles données nous collectons, pourquoi, combien de temps nous les
        conservons et quels sont vos droits, conformément au Règlement Général sur la Protection des
        Données (RGPD).
      </p>

      <h2>Responsable du traitement</h2>
      <p>
        Le responsable du traitement est <Fill>raison sociale / nom</Fill>, joignable à l’adresse{' '}
        <a href="mailto:contact@herakia.com">contact@herakia.com</a>.
      </p>

      <h2>Données collectées</h2>
      <p>Nous collectons uniquement les données que vous nous transmettez volontairement&nbsp;:</p>
      <ul>
        <li>Via le formulaire de contact&nbsp;: nom, email professionnel, entreprise, message.</li>
        <li>
          Via la navigation&nbsp;: <Fill>préciser si des outils de mesure d’audience sont utilisés
          (ex. Plausible, GA4) et lesquels — sinon indiquer « aucune mesure d’audience »</Fill>.
        </li>
      </ul>

      <h2>Finalités &amp; base légale</h2>
      <ul>
        <li>
          Répondre à vos demandes et vous recontacter — base légale&nbsp;: mesures précontractuelles
          / intérêt légitime.
        </li>
        <li>
          <Fill>autres finalités éventuelles (newsletter, statistiques…) et leur base légale</Fill>
        </li>
      </ul>

      <h2>Destinataires</h2>
      <p>
        Vos données sont destinées à Herakia et ne sont pas revendues. Elles peuvent transiter par nos
        sous-traitants techniques&nbsp;: <Fill>ex. Resend (envoi d’emails), Vercel (hébergement) —
        lister les prestataires réellement utilisés</Fill>.
      </p>

      <h2>Durée de conservation</h2>
      <p>
        Les données issues du formulaire de contact sont conservées pendant{' '}
        <Fill>durée (ex. 3 ans à compter du dernier contact)</Fill>, puis supprimées ou anonymisées.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition
        et de portabilité de vos données. Pour les exercer, écrivez à{' '}
        <a href="mailto:contact@herakia.com">contact@herakia.com</a>. Vous pouvez également introduire une
        réclamation auprès de la CNIL (
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          cnil.fr
        </a>
        ).
      </p>

      <h2>Cookies</h2>
      <p>
        <Fill>Décrire l’usage des cookies. Si aucun cookie non essentiel n’est déposé, l’indiquer
        clairement. Si des cookies de mesure/marketing sont utilisés, un bandeau de consentement est
        obligatoire.</Fill>
      </p>
    </LegalShell>
  );
}
