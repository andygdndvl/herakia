'use client';

import Image from 'next/image';
import { Quote } from 'lucide-react';
import { useLang } from '@/components/i18n/LangProvider';
import { useReveal } from '@/lib/anim';

interface Persona {
  role: string;
  quote: string;
  pains: readonly string[];
  imageSrc: string;
  imageAlt: string;
}

const IMAGES = ['/personae-1.png', '/personae-2.png', '/personae-3.png'];

const TEXT = {
  fr: {
    eyebrow: 'Vous reconnaissez-vous ?',
    title: "Si l'une de ces phrases résonne, vous êtes au bon endroit.",
    subtitle:
      "Voici les 3 profils qu'on rencontre le plus souvent — et ce qu'ils nous disent avant qu'on déploie quoi que ce soit.",
    closing: 'Si vous vous êtes reconnu·e, lisez ce qui suit. La suite parle de vous.',
    personae: [
      {
        role: 'Dirigeant·e',
        quote: 'Ma boîte grandit, mais je passe mon énergie à faire tourner la machine au lieu de la faire grandir.',
        pains: [
          'Chaque palier de croissance ajoute de la charge, pas de la valeur',
          'Je ne veux pas empiler les recrutements pour absorber du répétitif',
          'On laisse filer des opportunités, faute de temps pour les traiter',
        ],
        imageAlt: 'Bureau lumineux, ambiance start-up apaisée',
      },
      {
        role: 'Directeur·rice des opérations',
        quote: 'Mes équipes sont solides, mais elles s’épuisent sur des tâches qu’une machine ferait mieux.',
        pains: [
          'Une part énorme du temps part en ressaisie et en copier-coller',
          'Nos outils sont là, mais ils ne se parlent pas — tout repose sur les gens',
          'Nos process ne tiennent plus le rythme quand le volume augmente',
        ],
        imageAlt: 'Mains sur clavier, ambiance concentrée',
      },
      {
        role: 'Directeur·rice commercial·e',
        quote: 'Mon équipe vend deux fois moins qu’elle ne pourrait, noyée sous l’administratif.',
        pains: [
          'Les leads chauds refroidissent pendant qu’on traite le reste',
          'Le CRM n’est jamais à jour — impossible de piloter au réel',
          'On rate des deals sans même savoir lesquels',
        ],
        imageAlt: 'Discussion en réunion professionnelle',
      },
    ],
  },
  en: {
    eyebrow: 'Does this sound like you?',
    title: 'If any of these lines rings true, you’re in the right place.',
    subtitle:
      'Here are the 3 profiles we meet most often — and what they tell us before we deploy anything.',
    closing: 'If you recognised yourself, read on. What follows is about you.',
    personae: [
      {
        role: 'Founder / CEO',
        quote: 'My company is growing, but I spend my energy keeping the machine running instead of growing it.',
        pains: [
          'Every growth milestone adds workload, not value',
          'I don’t want to stack up hires just to absorb repetitive work',
          'We let opportunities slip for lack of time to handle them',
        ],
        imageAlt: 'Bright office, calm start-up vibe',
      },
      {
        role: 'Head of Operations',
        quote: 'My teams are strong, but they burn out on tasks a machine would do better.',
        pains: [
          'A huge share of time goes into re-keying and copy-pasting',
          'Our tools are there, but they don’t talk to each other — it all rests on people',
          'Our processes can’t keep pace when volume goes up',
        ],
        imageAlt: 'Hands on keyboard, focused atmosphere',
      },
      {
        role: 'Head of Sales',
        quote: 'My team sells half of what it could, drowning in admin.',
        pains: [
          'Hot leads cool down while we deal with everything else',
          'The CRM is never up to date — impossible to steer on real data',
          'We miss deals without even knowing which ones',
        ],
        imageAlt: 'Discussion in a professional meeting',
      },
    ],
  },
} as const;

export function Personae() {
  const t = TEXT[useLang()];
  const personae: Persona[] = t.personae.map((p, i) => ({ ...p, imageSrc: IMAGES[i] }));
  const headRef = useReveal<HTMLDivElement>();
  const gridRef = useReveal<HTMLDivElement>({ y: 32, stagger: 110 });
  const closingRef = useReveal<HTMLParagraphElement>({ delay: 200 });

  return (
    <section id="personae" className="relative overflow-hidden px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div ref={headRef} className="mx-auto max-w-3xl text-center">
          <span data-reveal className="eyebrow">
            {t.eyebrow}
          </span>
          <h2 data-reveal className="h-section mt-4">
            {t.title}
          </h2>
          <p data-reveal className="mt-6 font-sans text-lg leading-relaxed text-text-secondary md:text-xl">
            {t.subtitle}
          </p>
        </div>

        <div ref={gridRef} className="mt-16 grid gap-6 lg:grid-cols-3">
          {personae.map((persona) => (
            <article
              key={persona.role}
              data-reveal
              className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-secondary/60 backdrop-blur-md transition-[transform,border-color] duration-300 hover:border-border-green motion-safe:hover:-translate-y-1.5"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                  <Image
                    src={persona.imageSrc}
                    alt={persona.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover saturate-[0.7]"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-bg-secondary/40 to-transparent"
                    aria-hidden="true"
                  />
                </div>
                <div className="absolute left-5 top-5">
                  <span className="rounded-full border border-border-green bg-bg-primary/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-green-primary backdrop-blur-md">
                    {persona.role}
                  </span>
                </div>
              </div>

              <div className="relative p-6 md:p-7">
                <Quote className="absolute right-5 top-5 h-12 w-12 text-green-primary/10" aria-hidden="true" />
                <p className="font-display text-lg font-semibold leading-snug text-text-primary md:text-xl text-balance">
                  « {persona.quote} »
                </p>
                <ul className="mt-6 space-y-3">
                  {persona.pains.map((pain) => (
                    <li
                      key={pain}
                      className="flex items-start gap-2.5 font-sans text-sm leading-relaxed text-text-secondary"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-green-primary/60" />
                      <span>{pain}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <p
          ref={closingRef}
          data-reveal
          className="mt-12 text-center font-sans text-base text-text-secondary"
        >
          {t.closing}
        </p>
      </div>
    </section>
  );
}
