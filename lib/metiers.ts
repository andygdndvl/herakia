import type { Metadata } from 'next';
import { isLocale, defaultLocale, type Locale } from '@/dictionaries';

/**
 * Les métiers pour lesquels Tia a sa page (`/<slug>`) : source unique,
 * lue par chaque page, la page d'aiguillage /metiers, le sitemap et le formulaire de contact.
 * Ajouter un métier = une entrée ici, ses textes dans components/metiers/textes/ et sa page dans
 * app/[lang]/<slug>/.
 */
export interface Metier {
  slug: string;
  /** Valeur de l'offre présélectionnée dans le formulaire de contact (`/contact?offre=…`). */
  offerId: string;
  /** Page de prospection : hors des moteurs de recherche (noindex, absente du sitemap) tant que c'est `true`. */
  noindex: boolean;
  label: Record<Locale, string>;
  /** Phrase courte de la carte sur /metiers. */
  pitch: Record<Locale, string>;
  meta: Record<Locale, { title: string; description: string }>;
}

export const METIERS = [
  {
    slug: 'artisans',
    offerId: 'tia-artisans',
    noindex: true,
    label: { fr: 'Artisans du bâtiment', en: 'Building trades' },
    pitch: {
      fr: 'Sur le chantier, les mains prises : Tia note les demandes de travaux.',
      en: 'On site with your hands full: Tia takes down job requests.',
    },
    meta: {
      fr: {
        title: 'Tia — Assistante IA pour artisans',
        description:
          'Quand vous êtes sur un chantier, Tia, votre assistante IA, décroche, note le nom, l’adresse, le type de travaux et l’urgence, et vous envoie un résumé par SMS ou WhatsApp.',
      },
      en: {
        title: 'Tia — AI assistant for tradespeople',
        description:
          'When you are on a job site, Tia, your AI assistant, picks up, takes the name, address, type of work and urgency, and sends you a summary by text message or WhatsApp.',
      },
    },
  },
  {
    slug: 'immobilier',
    offerId: 'tia-immobilier',
    noindex: true,
    label: { fr: 'Agences immobilières', en: 'Estate agencies' },
    pitch: {
      fr: 'En visite : Tia prend les appels des vendeurs et des acquéreurs.',
      en: 'At a viewing: Tia takes calls from sellers and buyers.',
    },
    meta: {
      fr: {
        title: 'Tia — Assistante IA pour agences immobilières',
        description:
          'Pendant vos visites, Tia, votre assistante IA, décroche, note la demande du vendeur ou de l’acquéreur, le bien et le secteur, et vous envoie un résumé par SMS ou WhatsApp.',
      },
      en: {
        title: 'Tia — AI assistant for estate agencies',
        description:
          'During your viewings, Tia, your AI assistant, picks up, takes down the seller’s or buyer’s request, the property and the area, and sends you a summary by text message or WhatsApp.',
      },
    },
  },
  {
    slug: 'comptables',
    offerId: 'tia-comptables',
    noindex: true,
    label: { fr: 'Cabinets comptables', en: 'Accounting firms' },
    pitch: {
      fr: 'En rendez-vous client : Tia trie les clients du cabinet et les nouveaux contacts.',
      en: 'In a client meeting: Tia sorts existing clients from new enquiries.',
    },
    meta: {
      fr: {
        title: 'Tia — Assistante IA pour cabinets comptables',
        description:
          'Pendant vos rendez-vous, Tia, votre assistante IA, décroche, distingue clients et nouveaux contacts, note l’objet de l’appel et vous envoie un résumé par SMS ou WhatsApp.',
      },
      en: {
        title: 'Tia — AI assistant for accounting firms',
        description:
          'During your meetings, Tia, your AI assistant, picks up, tells clients from new enquiries, notes what the call is about and sends you a summary by text message or WhatsApp.',
      },
    },
  },
  {
    slug: 'sante',
    offerId: 'tia-sante',
    noindex: true,
    label: { fr: 'Cabinets de santé', en: 'Healthcare practices' },
    pitch: {
      fr: 'En consultation : Tia prend les messages des patients, sans jamais donner d’avis médical.',
      en: 'During consultations: Tia takes patients’ messages, never giving medical advice.',
    },
    meta: {
      fr: {
        title: 'Tia — Assistante IA pour cabinets de santé',
        description:
          'Pendant vos consultations, Tia, votre assistante IA, décroche, prend le message du patient et vous l’envoie résumé. Il ne donne aucun avis médical et oriente les urgences vers le 15.',
      },
      en: {
        title: 'Tia — AI assistant for healthcare practices',
        description:
          'During your consultations, Tia, your AI assistant, picks up, takes the patient’s message and sends you a summary. It gives no medical advice and directs emergencies to the emergency number.',
      },
    },
  },
  {
    slug: 'enseignement',
    offerId: 'tia-enseignement',
    noindex: true,
    label: { fr: 'Écoles et formation', en: 'Schools and training' },
    pitch: {
      fr: 'Pendant les cours : Tia prend les appels des candidats et des parents.',
      en: 'During classes: Tia takes calls from applicants and parents.',
    },
    meta: {
      fr: {
        title: 'Tia — Assistante IA pour écoles et organismes de formation',
        description:
          'Pendant les cours, Tia, votre assistante IA, décroche, note la formation visée, le niveau et la rentrée du candidat, et vous envoie un résumé par SMS ou WhatsApp.',
      },
      en: {
        title: 'Tia — AI assistant for schools and training providers',
        description:
          'During classes, Tia, your AI assistant, picks up, notes the applicant’s programme, level and start date, and sends you a summary by text message or WhatsApp.',
      },
    },
  },
] as const satisfies readonly Metier[];

export type MetierSlug = (typeof METIERS)[number]['slug'];

export function getMetier(slug: MetierSlug): Metier {
  return METIERS.find((m) => m.slug === slug)!;
}

/**
 * La page d'aiguillage /metiers, liée depuis le hero de l'accueil. Hors des moteurs tant que
 * les pages métiers le sont aussi.
 */
export const METIERS_HUB_NOINDEX = true;

/** Métadonnées d'une page métier (titre, description, langues, noindex). */
export function metierMetadata(slug: MetierSlug, langParam: string): Metadata {
  const lang: Locale = isLocale(langParam) ? langParam : defaultLocale;
  const m = getMetier(slug);
  return {
    title: m.meta[lang].title,
    description: m.meta[lang].description,
    alternates: {
      canonical: `/${lang}/${slug}`,
      languages: { fr: `/fr/${slug}`, en: `/en/${slug}`, 'x-default': `/fr/${slug}` },
    },
    ...(m.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
