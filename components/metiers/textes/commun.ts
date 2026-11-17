import type { TiaLandingText } from '@/components/metiers/TiaLanding';

/** Ce qui change d'un métier à l'autre ; tout le reste vient de COMMUN. */
type Propre =
  | 'eyebrow'
  | 'titleLead'
  | 'titleAccent'
  | 'moments'
  | 'subtitle'
  | 'persona'
  | 'andyNote'
  | 'steps'
  | 'scene'
  | 'smsNote'
  | 'tiaText'
  | 'roiTitle'
  | 'roiText'
  | 'faq'
  | 'finalTitle';

/** Les textes que toutes les pages métiers partagent : prix, boutons, titres de section, bloc final. */
export const COMMUN: { fr: Omit<TiaLandingText, Propre>; en: Omit<TiaLandingText, Propre> } = {
  fr: {
    price: (monthly) => `Dès ${monthly} HT/mois`,
    priceNote: 'Sans frais d’installation, sans engagement · ouverture prochaine',
    ctaDemo: 'Tester la démo',
    ctaCallback: 'Rejoindre la liste d’attente',
    demoNumber: (phone) => `Ligne de démonstration : ${phone}`,
    personaEyebrow: 'Vous reconnaissez-vous ?',
    personaTitle: 'Le téléphone sonne toujours au mauvais moment.',
    andyName: 'Andy · Herakia',
    howEyebrow: 'Comment ça marche',
    howTitleLead: 'Du premier « allô » au SMS, ',
    howTitleAccent: 'sans vous.',
    tiaTitle: 'Parlez à Tia, comme le ferait un client',
    roiEyebrow: 'Le calcul',
    faqEyebrow: 'Questions fréquentes',
    faqTitle: 'Ce qu’on nous demande avant de se lancer.',
    finalBadge: 'Liste d’attente ouverte',
    finalText: 'Parlez à Tia vous-même, ou inscrivez-vous sur la liste d’attente : on vous prévient dès l’ouverture.',
    finalFooter: 'contact@herakia.com',
  },
  en: {
    price: (monthly) => `From ${monthly}/month excl. VAT`,
    priceNote: 'No setup fee, no commitment · opening soon',
    ctaDemo: 'Try the demo',
    ctaCallback: 'Join the waiting list',
    demoNumber: (phone) => `Demo line: ${phone}`,
    personaEyebrow: 'Sound familiar?',
    personaTitle: 'The phone always rings at the wrong moment.',
    andyName: 'Andy · Herakia',
    howEyebrow: 'How it works',
    howTitleLead: 'From the first “hello” to the text, ',
    howTitleAccent: 'without you.',
    tiaTitle: 'Talk to Tia, the way a client would',
    roiEyebrow: 'The maths',
    faqEyebrow: 'FAQ',
    faqTitle: 'What people ask us before getting started.',
    finalBadge: 'Waiting list open',
    finalText: 'Talk to Tia yourself, or join the waiting list: we’ll let you know as soon as she opens.',
    finalFooter: 'contact@herakia.com',
  },
};

/** La question « Et si vous voulez arrêter ? », identique partout. */
export const FAQ_ARRET = {
  fr: {
    q: 'Et si vous voulez arrêter ?',
    a: 'C’est sans engagement : vous arrêtez quand vous voulez. On coupe le renvoi d’appel et vos téléphones fonctionnent comme avant.',
  },
  en: {
    q: 'What if you want to stop?',
    a: 'There is no commitment: you stop whenever you like. We turn off the call forwarding and your phones work as before.',
  },
} as const;

/** « Tia ne fait que le téléphone ? » : les pages métiers montrent le téléphone, Tia fait plus. */
export const FAQ_TIA = {
  fr: {
    q: 'Tia ne fait que répondre au téléphone ?',
    a: 'Non. Le téléphone est l’exemple montré ici, mais Tia répond aussi à vos messages (WhatsApp, e-mail, chat de votre site), prend les rendez-vous dans votre agenda et relance vos devis et vos factures. Un seul abonnement pour tout cela.',
  },
  en: {
    q: 'Does Tia only answer the phone?',
    a: 'No. The phone is the example shown here, but Tia also answers your messages (WhatsApp, email, your website chat), books appointments in your calendar and follows up on your quotes and invoices. One subscription for all of it.',
  },
} as const;
