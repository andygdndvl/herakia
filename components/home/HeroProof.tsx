'use client';

import { Star } from 'lucide-react';
import { useDict } from '@/components/i18n/LangProvider';
import { GoogleG } from '@/components/ui/GoogleG';

/**
 * Note de bas de hero, en pastille centrée : la note des avis Google (tous à 5 étoiles, cf.
 * `GoogleReviews`) et un extrait d'avis réel, cité mot pour mot. Les logos
 * clients ont été retirés d'ici : ils font doublon avec `TrustedBy`, juste en
 * dessous. Rien d'inventé — aucun compte d'avis, et la phrase citée figure telle
 * quelle plus bas dans la page.
 */
export function HeroProof() {
  const { hero } = useDict();

  return (
    <div
      className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-3xl border border-border-subtle bg-white/[0.03] px-5 py-3 lg:rounded-full"
      aria-label={hero.proofAria}
      role="group"
    >
      <span className="flex items-center gap-2.5">
        <GoogleG className="h-5 w-5" />
        {/* Jaune des étoiles Google (token `--google-star`), pas le vert de la charte : à côté du « G »,
            c'est la note telle qu'on la voit sur Google qui fait foi. */}
        <span className="flex gap-1" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-[18px] w-[18px] fill-[rgb(var(--google-star))] text-[rgb(var(--google-star))]" />
          ))}
        </span>
        <span className="font-mono text-sm uppercase tracking-wider text-text-secondary">{hero.proofRating}</span>
      </span>
      <figure className="m-0 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5">
        <blockquote className="m-0 font-sans text-base text-text-primary">
          {/* Espaces insécables : le guillemet fermant ne part jamais seul à la ligne. */}
          « {hero.proofQuote} »
        </blockquote>
        <figcaption className="font-mono text-xs uppercase tracking-wider text-text-muted">
          {hero.proofAuthor}
        </figcaption>
      </figure>
    </div>
  );
}
