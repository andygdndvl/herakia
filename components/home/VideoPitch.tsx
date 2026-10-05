'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { useLang } from '@/components/i18n/LangProvider';
import { prefersReducedMotion, useReveal } from '@/lib/anim';

const TEXT = {
  fr: {
    eyebrow: 'Herakia en une minute',
    videoLabel: 'Présentation de Herakia en vidéo',
    unmute: 'Activer le son',
    mute: 'Couper le son',
    play: 'Lire la vidéo',
  },
  en: {
    eyebrow: 'Herakia in one minute (in French)',
    videoLabel: 'Herakia presentation video (in French)',
    unmute: 'Turn sound on',
    mute: 'Mute',
    play: 'Play video',
  },
} as const;

/** Part de la vidéo qui doit être à l'écran pour qu'elle joue. */
const VISIBLE_RATIO = 0.35;

/**
 * Le film de présentation, juste sous le hero. Muet et en boucle, il ne se télécharge et ne joue
 * que lorsqu'il entre à l'écran (`preload="none"` + IntersectionObserver) : le haut de page et son
 * LCP n'en paient rien. Il se met en pause dès qu'on le quitte.
 *
 * « Activer le son » relance le film depuis le début : on entend alors tout le message, pas sa fin.
 * En mouvement réduit, aucune lecture automatique : l'aperçu et un bouton lecture, qui lance le
 * film avec le son.
 */
export function VideoPitch() {
  const t = TEXT[useLang()];
  const rootRef = useReveal<HTMLDivElement>({ y: 24 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  // `null` tant qu'on n'a pas lu la préférence côté client : le rendu serveur ne la connaît pas.
  const [reduced, setReduced] = useState<boolean | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => setReduced(prefersReducedMotion()), []);

  // Lecture pilotée par la visibilité. En mouvement réduit, seulement la pause en sortie d'écran
  // (une fois que le visiteur a lui-même lancé le film).
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced === null) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= VISIBLE_RATIO) {
          if (!reduced || started) video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: [0, VISIBLE_RATIO] },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reduced, started]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    if (muted) {
      video.currentTime = 0;
      video.muted = false;
      video.play().catch(() => {});
    } else {
      video.muted = true;
    }
    setMuted(!muted);
  };

  const playWithSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setMuted(false);
    setStarted(true);
    video.play().catch(() => {});
  };

  return (
    // Niveau 0, comme le hero : le film prolonge la promesse du titre, les deux forment un seul
    // bloc de lecture avant les preuves (logos, chantiers).
    <section aria-label={t.videoLabel} className="relative px-6 pb-20 pt-4 lg:px-8 lg:pb-24">
      <div ref={rootRef} className="mx-auto max-w-6xl">
        <p data-reveal className="eyebrow mb-6">
          — {t.eyebrow}
        </p>

        <div
          data-reveal
          className="relative aspect-video overflow-hidden rounded-2xl border border-border-subtle bg-bg-secondary"
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            poster="/videos/herakia-poster.jpg"
            muted
            loop
            playsInline
            preload="none"
            aria-label={t.videoLabel}
          >
            {/* Le navigateur prend la première source dont la condition est remplie. */}
            <source src="/videos/herakia-720.mp4" type="video/mp4" media="(max-width: 767px)" />
            <source src="/videos/herakia-1080.mp4" type="video/mp4" />
          </video>

          {reduced && !started ? (
            <button
              type="button"
              onClick={playWithSound}
              aria-label={t.play}
              className="absolute inset-0 grid place-items-center bg-bg-primary/30 transition-colors hover:bg-bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-primary"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full bg-action text-on-green">
                <Play className="ml-1 h-7 w-7" aria-hidden="true" />
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={!muted}
              className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full border border-border-strong bg-bg-primary/70 p-2.5 font-mono text-xs uppercase tracking-[0.12em] text-text-primary backdrop-blur-md transition-colors hover:border-green-line hover:text-green-primary focus:outline-none focus-visible:border-green-line focus-visible:text-green-primary sm:bottom-5 sm:right-5 sm:px-4 sm:py-2"
            >
              {muted ? (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              )}
              {/* Sous 640 px la vidéo est petite : l'icône seule, le libellé reste pour les lecteurs d'écran. */}
              <span className="sr-only sm:not-sr-only">{muted ? t.unmute : t.mute}</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
