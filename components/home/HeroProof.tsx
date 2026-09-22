'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import { clientLogos } from '@/components/home/clientLogos';
import { useDict } from '@/components/i18n/LangProvider';

/**
 * Note de bas de hero : la note des avis Google (tous à 5 étoiles, cf.
 * `GoogleReviews`) et les trois logos clients (mêmes fichiers que `TrustedBy`).
 * Rien d'inventé : aucun compte d'avis, aucun chiffre que la page ne montre pas
 * plus bas. Volontairement discrète — le titre reste le sujet du hero : texte en
 * `text-muted`, logos en blanc à 45 %, hauteur d'une ligne.
 */
export function HeroProof() {
  const { hero } = useDict();

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4" aria-label={hero.proofAria} role="group">
      <span className="flex items-center gap-2">
        <span className="flex gap-[3px]" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-green-primary text-green-primary" />
          ))}
        </span>
        <span className="font-mono text-xs uppercase tracking-wider text-text-muted">{hero.proofRating}</span>
      </span>

      <span className="hidden h-px w-12 bg-border-subtle sm:block" />

      <div className="flex items-center gap-5 sm:gap-7">
        {clientLogos.map((logo) => (
          <span
            key={logo.name}
            className="flex h-6 w-[78px] items-center justify-center sm:h-7 sm:w-[96px]"
          >
            <Image
              src={logo.src}
              alt={logo.name}
              width={logo.width}
              height={logo.height}
              sizes="96px"
              className="h-full w-full object-contain opacity-55 brightness-0 invert"
              style={{ transform: `scale(${logo.scale})` }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
