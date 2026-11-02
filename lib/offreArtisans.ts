/**
 * Offre « Zéro appel manqué » : prix, délai et numéro de démo, communs à tous les métiers.
 * La carte de la page Offres et les pages métiers (lib/metiers.ts) lisent ces valeurs.
 *
 * Les prix sont des hypothèses à tester : on les change ici, nulle part ailleurs.
 */

/** Numéro de la ligne de démonstration, tel qu'affiché. Remplacer le placeholder par le vrai numéro. */
export const DEMO_PHONE = '+33 X XX XX XX XX';

/** Frais d'installation, en euros, affichés « dès ». */
export const PRICE_SETUP = 490;

/** Abonnement mensuel, en euros, affiché « dès ». */
export const PRICE_MONTHLY = 79;

/**
 * Option « relance automatique des devis sans réponse ». Pas encore disponible : tant que c'est
 * `false`, elle n'apparaît nulle part (carte Offres, FAQ de /artisans). Passer à `true` pour la réafficher.
 */
export const SHOW_QUOTE_FOLLOWUP = false;

/** Délai d'installation annoncé, en jours. */
export const DELAY_DAYS = 7;

/** Vrai tant que DEMO_PHONE contient encore le placeholder (des « X »). */
export const isDemoPhonePlaceholder = /x/i.test(DEMO_PHONE);

/**
 * Lien du bouton « Écouter la démo ». Tant que le vrai numéro n'est pas renseigné, il mène à la
 * démo en ligne de Tia (`/demo`) plutôt qu'à un lien d'appel qui ne composerait rien.
 */
export function demoHref(lang: string): string {
  return isDemoPhonePlaceholder ? `/${lang}/demo` : `tel:${DEMO_PHONE.replace(/[^\d+]/g, '')}`;
}

/** Prix formatés à la française (« 490 € »). */
export function euros(value: number, lang: string): string {
  return `${value.toLocaleString(lang === 'en' ? 'en-GB' : 'fr-FR')}\u00a0€`; // insécable : « 79 » et « € » restent sur la même ligne
}
