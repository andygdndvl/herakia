'use client';

import { Star } from 'lucide-react';
import { useDict } from '@/components/i18n/LangProvider';

/**
 * Note de bas de hero : la note des avis Google (tous à 5 étoiles, cf.
 * `GoogleReviews`) et un extrait d'avis réel, cité mot pour mot. Les logos
 * clients ont été retirés d'ici : ils font doublon avec `TrustedBy`, juste en
 * dessous. Rien d'inventé — aucun compte d'avis, et la phrase citée figure telle
 * quelle plus bas dans la page.
 */
export function HeroProof() {
  const { hero } = useDict();

  return (
    <div className="flex flex-col items-start gap-2" aria-label={hero.proofAria} role="group">
      <span className="flex items-center gap-2">
        <span className="flex gap-[3px]" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-green-primary text-green-primary" />
          ))}
        </span>
        <span className="font-mono text-xs uppercase tracking-wider text-text-muted">{hero.proofRating}</span>
      </span>

      <figure className="m-0 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <blockquote className="m-0 font-sans text-sm text-text-secondary md:text-base">
          « {hero.proofQuote} »
        </blockquote>
        <figcaption className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
          {hero.proofAuthor}
        </figcaption>
      </figure>
    </div>
  );
}
