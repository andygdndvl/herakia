import type { ZeroAppelText } from '@/components/metiers/ZeroAppelLanding';

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
export const COMMUN: { fr: Omit<ZeroAppelText, Propre>; en: Omit<ZeroAppelText, Propre> } = {
  fr: {
    price: (setup, monthly) => `Dès ${setup} + ${monthly}/mois`,
    priceNote: 'Sans engagement',
    ctaDemo: 'Tester la démo',
    ctaCallback: 'Être rappelé',
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
    finalBadge: 'Sans engagement',
    finalText: 'Testez la démo vous-même, ou laissez votre numéro : on vous rappelle pour en parler.',
    finalFooter: 'contact@herakia.com',
  },
  en: {
    price: (setup, monthly) => `From ${setup} + ${monthly}/month`,
    priceNote: 'No commitment',
    ctaDemo: 'Try the demo',
    ctaCallback: 'Get a call back',
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
    finalBadge: 'No commitment',
    finalText: 'Try the demo yourself, or leave your number: we’ll call you back to talk it through.',
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
