'use client';

import { useCallback, useEffect, useRef, type DependencyList } from 'react';
import { animate, createScope, onScroll, scrambleText, splitText, stagger, utils } from 'animejs';

type Anim = ReturnType<typeof animate>;

export const EASE = 'outExpo';

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Appelle `cb` une seule fois quand `el` entre dans l'écran. Retourne la fonction d'arrêt. */
export function onceInView(el: Element, cb: () => void, rootMargin = '0px 0px -12% 0px'): () => void {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        cb();
      }
    },
    { rootMargin },
  );
  io.observe(el);
  return () => io.disconnect();
}

interface RevealOptions {
  y?: number;
  stagger?: number;
  delay?: number;
  duration?: number;
  onLoad?: boolean;
}

/** Révèle en cascade les éléments `[data-reveal]` de la racine (fondu + montée). */
export function useReveal<T extends HTMLElement = HTMLElement>({
  y = 24,
  stagger: gap = 90,
  delay = 0,
  duration = 900,
  onLoad = false,
}: RevealOptions = {}) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const targets = root.matches('[data-reveal]')
      ? [root]
      : Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (targets.length === 0) return;
    let anim: Anim | undefined;
    const play = () => {
      anim = animate(targets, {
        opacity: [0, 1],
        y: [y, 0],
        duration,
        delay: stagger(gap, { start: delay }),
        ease: EASE,
      });
    };
    const stop = onLoad ? (play(), () => {}) : onceInView(root, play);
    return () => {
      stop();
      anim?.revert();
    };
  }, [y, gap, delay, duration, onLoad]);
  return ref;
}

/**
 * Découpe un titre `[data-split]` et fait monter lettres ou mots depuis un masque.
 *
 * `onSettled` : appelé quand le titre a atteint son état final. Fournir ce rappel fait *rendre* la
 * découpe dès la fin de l'animation (balisage d'origine restauré, copie d'accessibilité et
 * `ResizeObserver` de `splitText` retirés) — indispensable si un autre effet doit ensuite écrire
 * dans ce titre : sans cela il écrirait dans des `<span>` que la découpe peut recomposer à tout
 * moment, et un re-découpage figerait du texte brouillé. Visuellement c'est un non-événement :
 * à ce stade les caractères sont déjà à leur place.
 */
export function useTextReveal<T extends HTMLElement = HTMLElement>({
  by = 'chars',
  delay = 0,
  onLoad = false,
  onSettled,
}: { by?: 'chars' | 'words'; delay?: number; onLoad?: boolean; onSettled?: () => void } = {}) {
  const ref = useRef<T>(null);
  const settled = useRef(onSettled);
  settled.current = onSettled;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.visibility = 'visible';
      settled.current?.();
      return;
    }
    const split = splitText(el, { words: { wrap: 'clip' }, chars: by === 'chars' });
    const parts = by === 'chars' ? split.chars : split.words;
    utils.set(parts, { y: '110%' });
    el.style.visibility = 'visible';
    let anim: Anim | undefined;
    let done = false;
    const play = () => {
      anim = animate(parts, {
        y: ['110%', '0%'],
        duration: 1100,
        delay: stagger(by === 'chars' ? 22 : 60, { start: delay }),
        ease: EASE,
        onComplete: () => {
          if (!settled.current) return;
          done = true;
          split.revert();
          settled.current();
        },
      });
    };
    const stop = onLoad ? (play(), () => {}) : onceInView(el, play);
    return () => {
      stop();
      if (done) return; // la découpe a déjà été rendue, il n'y a plus rien à annuler
      anim?.revert();
      split.revert();
    };
  }, [by, delay, onLoad]);
  return ref;
}

/**
 * Réécrit en boucle le texte d'un élément, chaque segment se décodant depuis un brouillage
 * (`scrambleText`, comme les légendes de l'objet).
 *
 * La rotation ne démarre pas d'elle-même : `start()` l'arme. C'est ce qui permet de la séquencer
 * *après* la révélation du titre, qui recompose le balisage sous elle — d'où `resolve`, rappelé au
 * démarrage puis à chaque pas, la cible ayant pu être recréée entre-temps.
 *
 * Une seule animation à la fois ; elle est annulée (`revert`, qui remet le segment précédent, donc
 * jamais de charabia résiduel) au démontage. La boucle s'interrompt hors écran et onglet caché.
 */
export function useScrambleRotate({
  resolve,
  segments,
  interval = 3600,
  duration = 700,
  firstDelay = 1800,
}: {
  resolve: () => HTMLElement | null;
  segments: string[];
  /** Temps entre deux réécritures, décodage compris. */
  interval?: number;
  duration?: number;
  /** Attente avant la toute première réécriture : le temps de lire la phrase une fois. */
  firstDelay?: number;
}) {
  const find = useRef(resolve);
  find.current = resolve;
  const armed = useRef(false);
  const begin = useRef<(() => void) | null>(null);
  // Les segments sont une liste littérale recréée à chaque rendu : on la compare par sa valeur.
  const key = JSON.stringify(segments);

  useEffect(() => {
    const list = JSON.parse(key) as string[];
    if (list.length < 2 || prefersReducedMotion()) return;

    let anim: Anim | undefined;
    let timer = 0;
    let running = false;
    let inView = true;

    const schedule = (wait = interval) => {
      if (!running || !inView || document.hidden) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(step, wait);
    };

    const step = () => {
      const el = find.current();
      if (!el) return;
      // On repart du texte réellement affiché : la rotation reprend au bon segment après une pause.
      const i = (Math.max(0, list.indexOf(el.textContent ?? '')) + 1) % list.length;
      anim = animate(el, {
        textContent: scrambleText({ text: list[i], chars: 'lowercase', from: 'left', duration }),
        duration,
        ease: 'linear',
        onComplete: () => {
          anim = undefined;
        },
      });
      schedule();
    };

    let io: IntersectionObserver | null = null;
    const onVisibility = () => (document.hidden ? window.clearTimeout(timer) : schedule());

    begin.current = () => {
      // Tout est branché au démarrage seulement : avant, l'élément résolu serait celui que la
      // découpe du titre s'apprête à remplacer — un observateur posé sur un nœud détaché.
      const el = find.current();
      if (running || !el) return;
      running = true;
      io = new IntersectionObserver((entries) => {
        const next = entries.some((e) => e.isIntersecting);
        if (next === inView) return; // le premier rapport confirme l'état de départ : ne rien replanifier
        inView = next;
        if (inView) schedule();
        else window.clearTimeout(timer);
      });
      io.observe(el);
      document.addEventListener('visibilitychange', onVisibility);
      schedule(firstDelay);
    };
    if (armed.current) begin.current();

    return () => {
      begin.current = null;
      running = false;
      window.clearTimeout(timer);
      io?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      anim?.revert();
    };
  }, [key, interval, duration, firstDelay]);

  return useCallback(() => {
    armed.current = true;
    begin.current?.();
  }, []);
}

/**
 * Progression 0→1 d'un élément selon le scroll (anime.js onScroll).
 * `enter` / `leave` : "<bord du conteneur> <bord de la cible>", ex. 'top top', 'bottom bottom'.
 * `sync` : true = collé au scroll ; nombre (0–1) = lissage.
 */
export function useScrollProgress<T extends HTMLElement = HTMLElement>(
  onProgress: (p: number) => void,
  { enter = 'top top', leave = 'bottom bottom', sync = 0.2 }: { enter?: string; leave?: string; sync?: number | boolean } = {},
) {
  const ref = useRef<T>(null);
  const cb = useRef(onProgress);
  cb.current = onProgress;
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const state = { p: 0 };
    const observer = onScroll({ target: el, enter, leave, sync });
    const anim = animate(state, {
      p: [0, 1],
      duration: 1000,
      ease: 'linear',
      autoplay: observer,
      onUpdate: () => cb.current(state.p),
    });
    return () => {
      anim.revert();
      observer.revert();
    };
  }, [enter, leave, sync]);
  return ref;
}

/** Exécute une animation arbitraire dans un scope anime.js, annulée au démontage. */
export function useAnime<T extends HTMLElement | SVGElement = HTMLElement>(
  setup: (root: T) => void | (() => void),
  deps: DependencyList = [],
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const scope = createScope({ root }).add(() => setup(root));
    return () => scope.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
