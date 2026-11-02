import type { ZeroAppelText } from '@/components/metiers/ZeroAppelLanding';
import type { MetierSlug } from '@/lib/metiers';
import { ARTISANS } from '@/components/metiers/textes/artisans';
import { IMMOBILIER } from '@/components/metiers/textes/immobilier';
import { COMPTABLES } from '@/components/metiers/textes/comptables';
import { SANTE } from '@/components/metiers/textes/sante';
import { ENSEIGNEMENT } from '@/components/metiers/textes/enseignement';

/** Les textes de chaque métier. Ils contiennent des fonctions (prix, FAQ) : à n'importer que côté client. */
export const TEXTES: Record<MetierSlug, { fr: ZeroAppelText; en: ZeroAppelText }> = {
  artisans: ARTISANS,
  immobilier: IMMOBILIER,
  comptables: COMPTABLES,
  sante: SANTE,
  enseignement: ENSEIGNEMENT,
};
