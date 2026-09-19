'use client';

import { Quote, Star } from 'lucide-react';
import { useLang } from '@/components/i18n/LangProvider';
import { Card } from '@/components/ui/Card';
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

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-3.1-.4-4.6H24v9.1h11.9c-.5 2.8-2 5.1-4.3 6.7v5.5h6.9c4.1-3.7 6.6-9.2 6.6-16.7z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.7 0 10.5-1.9 14-5.1l-6.9-5.5c-1.9 1.3-4.4 2.1-7.1 2.1-5.5 0-10.1-3.7-11.8-8.7H5v5.7C8.4 41.6 15.6 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M12.2 28.8c-.4-1.3-.7-2.7-.7-4.1s.2-2.8.7-4.1v-5.7H5c-1 2-1.6 4.2-1.6 6.6s.6 4.6 1.6 6.6l6.6-5v5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.9c3 0 5.7 1 7.8 3l6.2-6.1C34.5 4.4 29.7 2 24 2c-8.4 0-15.6 4.4-19 11.2l7.2 5.6c1.7-5 6.3-7.9 11.8-7.9z"
      />
    </svg>
  );
}

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
    <section className="relative px-6 py-24 lg:px-8" aria-label={t.eyebrow}>
      <div className="mx-auto max-w-6xl">
        <div ref={headRef} className="mb-14 text-center">
          <span data-reveal className="eyebrow inline-flex items-center gap-2">
            <GoogleG />
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
