/**
 * Offre « Tia » : le super-agent IA prêt à l'emploi (téléphone, messages, rendez-vous, relances).
 * Prix, état d'ouverture et numéro de démo, communs à la page Offres et aux pages métiers
 * (lib/metiers.ts). On les change ici, nulle part ailleurs.
 */

/** Numéro de la ligne de démonstration, tel qu'affiché. Remplacer le placeholder par le vrai numéro. */
export const DEMO_PHONE = '+33 X XX XX XX XX';

/** Abonnement mensuel HT, en euros, affiché « dès ». Pas de frais d'installation. */
export const PRICE_MONTHLY = 79;

/**
 * Tia n'est pas encore ouverte à la vente : tant que c'est `true`, les boutons mènent à la liste
 * d'attente (formulaire de contact, offre « tia » présélectionnée) et un badge « Bientôt » s'affiche.
 */
export const TIA_WAITLIST = true;

/** Vrai tant que DEMO_PHONE contient encore le placeholder (des « X »). */
export const isDemoPhonePlaceholder = /x/i.test(DEMO_PHONE);

/**
 * Lien du bouton de démo. Tant que le vrai numéro n'est pas renseigné, il mène à la démo en ligne
 * de Tia (`/demo`) plutôt qu'à un lien d'appel qui ne composerait rien.
 */
export function demoHref(lang: string): string {
  return isDemoPhonePlaceholder ? `/${lang}/demo` : `tel:${DEMO_PHONE.replace(/[^\d+]/g, '')}`;
}

/** Prix formatés à la française (« 79 € »). */
export function euros(value: number, lang: string): string {
  return `${value.toLocaleString(lang === 'en' ? 'en-GB' : 'fr-FR')}\u00a0€`; // insécable : « 79 » et « € » restent sur la même ligne
}
