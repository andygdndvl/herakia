'use client';

import { Quote, Star } from 'lucide-react';
import { useLang } from '@/components/i18n/LangProvider';
import { Card } from '@/components/ui/Card';
import { GoogleG } from '@/components/ui/GoogleG';
import { useReveal } from '@/lib/anim';

const TEXT = {
  fr: {
    eyebrow: 'Avis Google',
    titleLead: 'Ce qu’',
    titleAccent: 'ils en disent',
  },
  en: {
    eyebrow: 'Google reviews',
    titleLead: 'What ',
    titleAccent: 'they say',
  },
} as const;

const reviews = [
  {
    name: 'Nadja Djordjevic',
    rating: 5,
    text: 'Je suis pleinement satisfaite de mon expérience avec Herakia ! En tant qu’influenceuse avec plus de 450k abonnés, les agents IA d’Herakia m’ont énormément aidée à gagner du temps, à mieux organiser mon travail et à être plus efficace au quotidien. Un vrai gain de temps et une très belle découverte. Je recommande à 100 % !',
  },
  {
    name: 'Cindy Gondouin',
    rating: 5,
    text: 'Équipe très professionnelle et dynamique. Nous sommes ravis d’avoir choisi Herakia pour simplifier certaines tâches du quotidien.',
  },
  {
    name: 'Tiya Atwi',
    rating: 5,
    text: 'Ça fait maintenant un an que nous travaillons avec Herakia, et nous en sommes pleinement satisfaits ! Grâce à leurs agents IA, nous avons gagné un temps précieux, notamment dans la planification de nos intervenants et la gestion des entretiens d’admission. L’équipe est à l’écoute, réactive et sait résoudre rapidement les problématiques rencontrées. Une collaboration efficace et un vrai gain de temps au quotidien. Je recommande vivement Herakia !',
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

export function GoogleReviews() {
  const t = TEXT[useLang()];
  const headRef = useReveal<HTMLDivElement>();
  const gridRef = useReveal<HTMLDivElement>({ stagger: 110 });

  return (
    // Palier 1, entre les chantiers (0) et « À propos » (0)
    <section className="tier-1 relative px-6 py-24 lg:px-8" aria-label={t.eyebrow}>
      <div className="mx-auto max-w-6xl">
        <div ref={headRef} className="mb-14 text-center">
          <span data-reveal className="eyebrow inline-flex items-center gap-2">
            <GoogleG className="h-5 w-5" />
            {t.eyebrow}
          </span>
          <h2 data-reveal className="h-section mt-4 !text-4xl md:!text-5xl">
            {t.titleLead}
            <span className="text-green-primary">{t.titleAccent}</span>.
          </h2>
        </div>

        <div ref={gridRef} className="grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.name} data-reveal>
              <Card hoverable className="relative flex h-full flex-col !p-6">
                <Quote className="absolute right-5 top-5 h-8 w-8 text-text-muted/20" />
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-subtle font-display text-sm font-semibold text-green-primary">
                    {initials(review.name)}
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-text-primary">{review.name}</p>
                    <div className="mt-0.5 flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-green-primary text-green-primary" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="relative mt-5 flex-1 font-sans text-sm leading-relaxed text-text-secondary">
                  {review.text}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
