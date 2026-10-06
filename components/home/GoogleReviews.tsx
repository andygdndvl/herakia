'use client';

import { Star } from 'lucide-react';
import { useLang } from '@/components/i18n/LangProvider';
import { GoogleG } from '@/components/ui/GoogleG';
import { useReveal } from '@/lib/anim';

/**
 * Fiche Google de Herakia. Tant qu'une valeur manque, l'encart de note ne l'affiche pas :
 * aucun chiffre ni lien n'est inventé.
 */
const GOOGLE_REVIEWS_COUNT: number | null = null;
// Adresse Google Maps officielle et stable (API « Maps URLs ») : ouvre la fiche et ses avis chez
// n'importe quel visiteur, contrairement à une URL de recherche copiée, liée à une session.
const GOOGLE_REVIEWS_URL: string | null = 'https://www.google.com/maps/search/?api=1&query=Herakia';

const TEXT = {
  fr: {
    eyebrow: 'Avis Google',
    titleLead: 'Ce qu’',
    titleAccent: 'ils en disent',
    rating: (count: number | null) => (count ? `sur ${count} avis Google` : 'Note Google'),
    seeOnGoogle: 'Voir sur Google',
    roles: { nadja: 'Influenceuse · 450k abonnés', cindy: 'Avis Google', tiya: 'Cliente depuis un an' },
  },
  en: {
    eyebrow: 'Google reviews',
    titleLead: 'What ',
    titleAccent: 'they say',
    rating: (count: number | null) => (count ? `from ${count} Google reviews` : 'Google rating'),
    seeOnGoogle: 'See on Google',
    roles: { nadja: 'Influencer · 450k followers', cindy: 'Google review', tiya: 'Client for a year' },
  },
} as const;

interface Review {
  id: 'nadja' | 'cindy' | 'tiya';
  name: string;
  rating: number;
  /** Phrase clé, citée mot pour mot depuis l'avis. */
  quote: string;
  /** Texte affiché sous la phrase clé : l'avis complet (vedette) ou un extrait mot pour mot. */
  text: string;
  /** Passage surligné dans le texte (vedette seulement), présent mot pour mot dans `text`. */
  highlight?: string;
}

// Avis réels, en français d'origine sur les deux versions du site (on ne traduit pas la parole
// d'un client). La vedette est le témoignage le plus concret : un an de collaboration, et ce que
// les agents ont changé.
const FEATURED: Review = {
  id: 'tiya',
  name: 'Tiya Atwi',
  rating: 5,
  quote: 'Nous avons gagné un temps précieux.',
  text: 'Ça fait maintenant un an que nous travaillons avec Herakia, et nous en sommes pleinement satisfaits ! Grâce à leurs agents IA, nous avons gagné un temps précieux, notamment dans la planification de nos intervenants et la gestion des entretiens d’admission. L’équipe est à l’écoute, réactive et sait résoudre rapidement les problématiques rencontrées. Je recommande vivement Herakia !',
  highlight:
    'nous avons gagné un temps précieux, notamment dans la planification de nos intervenants et la gestion des entretiens d’admission.',
};

const OTHERS: Review[] = [
  {
    id: 'nadja',
    name: 'Nadja Djordjevic',
    rating: 5,
    quote: 'Un vrai gain de temps et une très belle découverte.',
    text: 'Les agents IA d’Herakia m’ont énormément aidée à gagner du temps, à mieux organiser mon travail et à être plus efficace au quotidien.',
  },
  {
    id: 'cindy',
    name: 'Cindy Gondouin',
    rating: 5,
    quote: 'Équipe très professionnelle et dynamique.',
    text: 'Nous sommes ravis d’avoir choisi Herakia pour simplifier certaines tâches du quotidien.',
  },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** Étoiles au jaune Google, comme la note du hero. */
function Stars({ count, size = 'h-4 w-4' }: { count: number; size?: string }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${count}/5`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className={`${size} fill-[rgb(var(--google-star))] text-[rgb(var(--google-star))]`} aria-hidden="true" />
      ))}
    </span>
  );
}

function Author({ review, role }: { review: Review; role: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-subtle font-display text-sm font-semibold text-green-primary">
        {initials(review.name)}
      </span>
      <div>
        <p className="font-display text-[15px] font-semibold text-text-primary">{review.name}</p>
        <p className="text-xs text-text-muted">{role}</p>
      </div>
    </div>
  );
}

/** Le texte de l'avis vedette, avec son passage fort surligné. */
function Highlighted({ text, highlight }: { text: string; highlight?: string }) {
  const at = highlight ? text.indexOf(highlight) : -1;
  if (!highlight || at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="bg-[linear-gradient(transparent_62%,rgb(var(--green-primary)/0.35)_62%)] bg-transparent font-semibold text-text-primary">
        {highlight}
      </mark>
      {text.slice(at + highlight.length)}
    </>
  );
}

export function GoogleReviews() {
  const t = TEXT[useLang()];
  const headRef = useReveal<HTMLDivElement>();
  const gridRef = useReveal<HTMLDivElement>({ stagger: 110 });

  return (
    // Palier 1, entre les corvées (0) et « À propos » (0)
    <section className="tier-1 relative px-6 py-24 lg:px-8" aria-label={t.eyebrow}>
      <div className="mx-auto max-w-6xl">
        <div ref={headRef} className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span data-reveal className="eyebrow inline-flex items-center gap-2">
              <GoogleG className="h-5 w-5" />
              {t.eyebrow}
            </span>
            <h2 data-reveal className="h-section mt-4 !text-4xl md:!text-5xl">
              {t.titleLead}
              <span className="text-green-primary">{t.titleAccent}</span>.
            </h2>
          </div>

          {/* Encart de note : chiffre et lien seulement s'ils sont renseignés (cf. constantes). */}
          <div
            data-reveal
            className="flex items-center gap-4 rounded-[18px] border border-border-subtle bg-white/[0.03] px-5 py-3"
          >
            <span className="font-display text-4xl font-bold leading-none text-text-primary">5,0</span>
            <div>
              <Stars count={5} />
              <p className="mt-1 text-xs text-text-muted">{t.rating(GOOGLE_REVIEWS_COUNT)}</p>
            </div>
            {GOOGLE_REVIEWS_URL && (
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="whitespace-nowrap text-sm font-medium text-green-primary transition-colors hover:text-green-dark"
              >
                {t.seeOnGoogle} →
              </a>
            )}
          </div>
        </div>

        <div ref={gridRef} className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          {/* L'avis vedette */}
          <figure data-reveal className="glass-card m-0 flex flex-col rounded-3xl p-7 md:p-9">
            <Stars count={FEATURED.rating} />
            <blockquote className="m-0">
              <p className="mt-5 font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-text-primary md:text-[1.875rem]">
                {`«\u00a0${FEATURED.quote}\u00a0»`}
              </p>
              <p className="mt-4 font-sans text-[15px] leading-relaxed text-text-secondary">
                <Highlighted text={FEATURED.text} highlight={FEATURED.highlight} />
              </p>
            </blockquote>
            <figcaption className="mt-auto pt-7">
              <Author review={FEATURED} role={t.roles[FEATURED.id]} />
            </figcaption>
          </figure>

          {/* Les deux autres, plus compacts */}
          <div className="flex flex-col gap-5">
            {OTHERS.map((review) => (
              <figure key={review.id} data-reveal className="glass-card m-0 flex flex-1 flex-col rounded-3xl p-6 md:p-7">
                <Stars count={review.rating} size="h-3.5 w-3.5" />
                <blockquote className="m-0">
                  <p className="mt-3 font-display text-lg font-semibold leading-snug text-text-primary md:text-xl">
                    {`«\u00a0${review.quote}\u00a0»`}
                  </p>
                  <p className="mt-2.5 font-sans text-sm leading-relaxed text-text-secondary">{review.text}</p>
                </blockquote>
                <figcaption className="mt-auto pt-5">
                  <Author review={review} role={t.roles[review.id]} />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
