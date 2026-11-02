'use client';

import { ZeroAppelLanding } from '@/components/metiers/ZeroAppelLanding';
import { TEXTES } from '@/components/metiers/textes';
import { getMetier, type MetierSlug } from '@/lib/metiers';

/**
 * Page de prospection « Zéro appel manqué » d'un métier (voir lib/metiers.ts). Les textes
 * contiennent des fonctions (prix, FAQ) : ils restent côté client, la page serveur ne transmet
 * que le nom du métier.
 */
export function MetierLanding({ slug }: { slug: MetierSlug }) {
  return <ZeroAppelLanding text={TEXTES[slug]} page={slug} offerId={getMetier(slug).offerId} />;
}
