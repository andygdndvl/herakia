import type { Metadata } from 'next';
import { isLocale, defaultLocale, type Locale } from '@/dictionaries';

/**
 * Les métiers pour lesquels l'offre « Zéro appel manqué » a sa page (`/<slug>`) : source unique,
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
    offerId: 'zero-appel-manque',
    noindex: true,
    label: { fr: 'Artisans du bâtiment', en: 'Building trades' },
    pitch: {
      fr: 'Sur le chantier, les mains prises : l’assistant note les demandes de travaux.',
      en: 'On site with your hands full: the assistant takes down job requests.',
    },
    meta: {
      fr: {
        title: 'Zéro appel manqué — Assistant téléphonique IA pour artisans',
        description:
          'Quand vous êtes sur un chantier, un assistant IA décroche, note le nom, l’adresse, le type de travaux et l’urgence, et vous envoie un résumé par SMS ou WhatsApp.',
      },
      en: {
        title: 'Zero missed calls — AI phone assistant for tradespeople',
        description:
          'When you are on a job site, an AI assistant picks up, takes the name, address, type of work and urgency, and sends you a summary by text message or WhatsApp.',
      },
    },
  },
  {
    slug: 'immobilier',
    offerId: 'zero-appel-immobilier',
    noindex: true,
    label: { fr: 'Agences immobilières', en: 'Estate agencies' },
    pitch: {
      fr: 'En visite : l’assistant prend les appels des vendeurs et des acquéreurs.',
      en: 'At a viewing: the assistant takes calls from sellers and buyers.',
    },
    meta: {
      fr: {
        title: 'Zéro appel manqué — Assistant téléphonique IA pour agences immobilières',
        description:
          'Pendant vos visites, un assistant IA décroche, note la demande du vendeur ou de l’acquéreur, le bien et le secteur, et vous envoie un résumé par SMS ou WhatsApp.',
      },
      en: {
        title: 'Zero missed calls — AI phone assistant for estate agencies',
        description:
          'During your viewings, an AI assistant picks up, takes down the seller’s or buyer’s request, the property and the area, and sends you a summary by text message or WhatsApp.',
      },
    },
  },
  {
    slug: 'comptables',
    offerId: 'zero-appel-comptables',
    noindex: true,
    label: { fr: 'Cabinets comptables', en: 'Accounting firms' },
    pitch: {
      fr: 'En rendez-vous client : l’assistant trie les clients du cabinet et les nouveaux contacts.',
      en: 'In a client meeting: the assistant sorts existing clients from new enquiries.',
    },
    meta: {
      fr: {
        title: 'Zéro appel manqué — Assistant téléphonique IA pour cabinets comptables',
        description:
          'Pendant vos rendez-vous, un assistant IA décroche, distingue clients et nouveaux contacts, note l’objet de l’appel et vous envoie un résumé par SMS ou WhatsApp.',
      },
      en: {
        title: 'Zero missed calls — AI phone assistant for accounting firms',
        description:
          'During your meetings, an AI assistant picks up, tells clients from new enquiries, notes what the call is about and sends you a summary by text message or WhatsApp.',
      },
    },
  },
  {
    slug: 'sante',
    offerId: 'zero-appel-sante',
    noindex: true,
    label: { fr: 'Cabinets de santé', en: 'Healthcare practices' },
    pitch: {
      fr: 'En consultation : l’assistant prend les messages des patients, sans jamais donner d’avis médical.',
      en: 'During consultations: the assistant takes patients’ messages, never giving medical advice.',
    },
    meta: {
      fr: {
        title: 'Zéro appel manqué — Assistant téléphonique IA pour cabinets de santé',
        description:
          'Pendant vos consultations, un assistant IA décroche, prend le message du patient et vous l’envoie résumé. Il ne donne aucun avis médical et oriente les urgences vers le 15.',
      },
      en: {
        title: 'Zero missed calls — AI phone assistant for healthcare practices',
        description:
          'During your consultations, an AI assistant picks up, takes the patient’s message and sends you a summary. It gives no medical advice and directs emergencies to the emergency number.',
      },
    },
  },
  {
    slug: 'enseignement',
    offerId: 'zero-appel-enseignement',
    noindex: true,
    label: { fr: 'Écoles et formation', en: 'Schools and training' },
    pitch: {
      fr: 'Pendant les cours : l’assistant prend les appels des candidats et des parents.',
      en: 'During classes: the assistant takes calls from applicants and parents.',
    },
    meta: {
      fr: {
        title: 'Zéro appel manqué — Assistant téléphonique IA pour écoles et organismes de formation',
        description:
          'Pendant les cours, un assistant IA décroche, note la formation visée, le niveau et la rentrée du candidat, et vous envoie un résumé par SMS ou WhatsApp.',
      },
      en: {
        title: 'Zero missed calls — AI phone assistant for schools and training providers',
        description:
          'During classes, an AI assistant picks up, notes the applicant’s programme, level and start date, and sends you a summary by text message or WhatsApp.',
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
