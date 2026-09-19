'use client';

import { useEffect, useRef, type DependencyList } from 'react';
import { animate, createDrawable, createScope, onScroll, splitText, stagger, utils } from 'animejs';

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

/** Découpe un titre `[data-split]` et fait monter lettres ou mots depuis un masque. */
export function useTextReveal<T extends HTMLElement = HTMLElement>({
  by = 'chars',
  delay = 0,
  onLoad = false,
}: { by?: 'chars' | 'words'; delay?: number; onLoad?: boolean } = {}) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.visibility = 'visible';
      return;
    }
    const split = splitText(el, { words: { wrap: 'clip' }, chars: by === 'chars' });
    const parts = by === 'chars' ? split.chars : split.words;
    utils.set(parts, { y: '110%' });
    el.style.visibility = 'visible';
    let anim: Anim | undefined;
    const play = () => {
      anim = animate(parts, {
        y: ['110%', '0%'],
        duration: 1100,
        delay: stagger(by === 'chars' ? 22 : 60, { start: delay }),
        ease: EASE,
      });
    };
    const stop = onLoad ? (play(), () => {}) : onceInView(el, play);
    return () => {
      stop();
      anim?.revert();
      split.revert();
    };
  }, [by, delay, onLoad]);
  return ref;
}

/** Trace un chemin SVG `[data-reveal]` (dessin du trait de 0 à 100 %). */
export function useDrawPath<T extends SVGGeometryElement = SVGPathElement>({
  delay = 0,
  duration = 2000,
  onLoad = false,
}: { delay?: number; duration?: number; onLoad?: boolean } = {}) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const [drawable] = createDrawable(el);
    let anim: Anim | undefined;
    const play = () => {
      utils.set(el, { opacity: 1 });
      anim = animate(drawable, { draw: ['0 0', '0 1'], duration, delay, ease: 'inOutQuart' });
    };
    const stop = onLoad ? (play(), () => {}) : onceInView(el, play);
    return () => {
      stop();
      anim?.revert();
    };
  }, [delay, duration, onLoad]);
  return ref;
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
