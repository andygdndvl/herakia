'use client';

import { TiaLanding } from '@/components/metiers/TiaLanding';
import { TEXTES } from '@/components/metiers/textes';
import { getMetier, type MetierSlug } from '@/lib/metiers';

/**
 * Page de prospection de Tia pour un métier (voir lib/metiers.ts). Les textes
 * contiennent des fonctions (prix, FAQ) : ils restent côté client, la page serveur ne transmet
 * que le nom du métier.
 */
export function MetierLanding({ slug }: { slug: MetierSlug }) {
  return <TiaLanding text={TEXTES[slug]} page={slug} offerId={getMetier(slug).offerId} />;
}
