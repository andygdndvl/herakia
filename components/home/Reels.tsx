'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLang, localize } from '@/components/i18n/LangProvider';
import { useReveal } from '@/lib/anim';

interface Reel {
  /** Nom de fichier dans `public/videos`, sans extension : `<id>.mp4` et `<id>-poster.jpg`. */
  id: string;
  title: string;
  duration: string;
}

const TEXT = {
  fr: {
    eyebrow: 'En vidéo',
    title: 'On vous explique.',
    play: 'Lire la vidéo',
    track: 'Vidéos, défilement horizontal',
    cta: 'Réserver mon diagnostic offert',
    reels: [
      { id: 'reel-problemes', title: 'Vos problèmes, notre solution', duration: '15 s' },
      { id: 'reel-process', title: 'Trois étapes pour démarrer', duration: '16 s' },
      { id: 'reel-tia', title: 'Notre collègue… pas comme les autres', duration: '12 s' },
    ] as Reel[],
  },
  en: {
    eyebrow: 'On video',
    title: 'Let us explain.',
    play: 'Play video',
    track: 'Videos, horizontal scroll',
    cta: 'Book my free assessment',
    reels: [
      { id: 'reel-problemes', title: 'Your problems, our solution (in French)', duration: '15 s' },
      { id: 'reel-process', title: 'Three steps to get started (in French)', duration: '16 s' },
      { id: 'reel-tia', title: 'Our colleague… unlike any other (in French)', duration: '12 s' },
    ] as Reel[],
  },
} as const;

/**
 * Les vidéos verticales tournées pour la publicité, entre les chantiers et les profils : après la
 * preuve écrite, quelqu'un le dit de vive voix. Rien ne se télécharge tant qu'on n'a pas cliqué
 * (`preload="none"`), et les aperçus ne se chargent qu'à l'approche de la section.
 *
 * Une seule vidéo joue à la fois, avec le son. Elle se met en pause en sortant de l'écran.
 */
export function Reels() {
  const lang = useLang();
  const t = TEXT[lang];
  const rootRef = useReveal<HTMLDivElement>({ y: 20, stagger: 110 });
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  // Vidéos déjà lancées : elles gardent les commandes natives, les autres montrent le bouton lecture.
  const [started, setStarted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) (entry.target as HTMLVideoElement).pause();
        }
      },
      { threshold: 0.2 },
    );
    for (const video of videoRefs.current) if (video) io.observe(video);
    return () => io.disconnect();
  }, []);

  const pauseOthers = (index: number) => {
    videoRefs.current.forEach((video, i) => {
      if (video && i !== index) video.pause();
    });
  };

  const play = (index: number, id: string) => {
    const video = videoRefs.current[index];
    if (!video) return;
    setStarted((s) => ({ ...s, [id]: true }));
    video.play().catch(() => {});
  };

  return (
    // Palier 1, comme les chantiers qui précèdent et les profils qui suivent : même démonstration.
    <section aria-labelledby="reels-title" className="tier-1 relative border-b border-border-subtle px-6 py-20 lg:px-8 lg:py-24">
      <div ref={rootRef} className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          <span data-reveal className="eyebrow">
            {t.eyebrow}
          </span>
          <h2 id="reels-title" data-reveal className="h-section mt-4">
            {t.title}
          </h2>
        </div>

        {/* Sous 768 px : une piste à faire glisser, la carte suivante dépasse à droite. Au-delà :
            les trois côte à côte. Les marges négatives laissent la piste aller jusqu'au bord. */}
        <ol
          data-reveal
          tabIndex={0}
          aria-label={t.track}
          className="-mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 [scrollbar-width:none] focus:outline-none md:mx-auto md:grid md:max-w-4xl md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 lg:mt-14 lg:gap-8 [&::-webkit-scrollbar]:hidden"
        >
          {t.reels.map((reel, i) => (
            <li key={reel.id} className="shrink-0 basis-[72%] snap-center sm:basis-[46%] md:basis-auto">
              <div className="relative aspect-[9/16] overflow-hidden rounded-3xl border border-green-primary/15 bg-bg-secondary">
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  className="h-full w-full object-cover"
                  src={`/videos/${reel.id}.mp4`}
                  playsInline
                  preload="none"
                  controls={!!started[reel.id]}
                  aria-label={reel.title}
                  onPlay={() => pauseOthers(i)}
                />
                {/* L'aperçu est une image paresseuse, pas l'attribut `poster` : celui-ci se télécharge
                    dès l'ouverture de la page, en concurrence avec le haut de page. */}
                {!started[reel.id] && (
                  <Image
                    src={`/videos/${reel.id}-poster.jpg`}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 72vw, 280px"
                    className="object-cover"
                  />
                )}
                {!started[reel.id] && (
                  // Bouton décalé sous le centre (`pt-[45%]`) : au centre, il masquerait le visage.
                  <button
                    type="button"
                    onClick={() => play(i, reel.id)}
                    aria-label={`${t.play} : ${reel.title}`}
                    className="group absolute inset-0 grid place-items-center bg-bg-primary/20 pt-[45%] transition-colors hover:bg-bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-primary"
                  >
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-action text-on-green transition-transform group-hover:scale-105">
                      <Play className="ml-1 h-7 w-7" aria-hidden="true" />
                    </span>
                  </button>
                )}
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-3">
                <h3 className="font-display text-base font-semibold leading-snug text-text-primary">{reel.title}</h3>
                <span className="shrink-0 font-mono text-xs tracking-[0.12em] text-text-muted">{reel.duration}</span>
              </div>
            </li>
          ))}
        </ol>

        {/* Deux des vidéos se terminent sur le diagnostic offert : le bouton est juste dessous. */}
        <div data-reveal className="mt-12 flex justify-center">
          <Button href={localize(lang, '/contact')} variant="primary" size="lg">
            {t.cta}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
