# Herakia — Refonte visuelle « éditorial noir » — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre la home Herakia en direction « éditorial noir », avec anime.js pour le mouvement et un objet 3D au trait (three.js) qui se déconstruit au scroll dans la section « Qu'est-ce qu'un agent IA ? ».

**Architecture:** Une charte de tokens Tailwind, des hooks d'animation (`lib/anim`) qui encapsulent anime.js (scope, nettoyage, mouvement réduit), puis chaque section de la home est portée de Framer Motion vers ces hooks. L'objet vit dans `components/agent-object/` : une scène three.js pure (`scene.ts`), des fonctions pures de chorégraphie (`layout.ts`), un pilote chargé à la demande (`AgentStage.tsx`) et la section épinglée (`AgentObjectSection.tsx`).

**Tech Stack:** Next.js 14.2 (App Router), React 18, TypeScript 5, Tailwind CSS 3.4, anime.js 4.5, three.js 0.170.

**Spec:** `docs/superpowers/specs/2026-09-19-herakia-refonte-visuelle-design.md`

## Global Constraints

- Pas de montée de version : Next 14, React 18, Tailwind 3 restent tels quels.
- Dépendances ajoutées : `animejs@^4.5.0`, `three@^0.170.0`, `@types/three@^0.170.0` (dev). Rien d'autre.
- `framer-motion` reste installé (utilisé par `WhatWeHandle`, `TiaCall`, pages secondaires) ; il disparaît des fichiers réécrits par ce plan.
- Aucune couleur en dur dans les fichiers créés ou réécrits : uniquement les tokens de `tailwind.config.ts` (exceptions : constantes numériques de couleur dans `components/agent-object/scene.ts`, qui ne peut pas lire Tailwind).
- Textes : aucun texte existant n'est modifié ; les seuls textes nouveaux sont ceux de `components/agent-object/content.ts`.
- `prefers-reduced-motion: reduce` → aucune animation, contenu dans son état final.
- Tout élément portant `data-reveal` ou `data-split` DOIT être pris en charge par un hook : à l'intérieur d'une racine `useReveal`, ou directement relié à `useTextReveal` (`data-split`) ou `useDrawPath` (sinon il reste invisible : la CSS le masque).
- Les racines `useReveal` ne s'imbriquent pas (une racine ne contient pas une autre racine).
- Le projet n'a pas de tests automatisés et la spec n'en ajoute pas : chaque tâche se vérifie par `npm run build` + contrôle visuel dans Chrome (desktop ≈1440 px, mobile ≈390 px).
- Serveur de dev : `npx next dev -p 3001` (le port 3000 est pris par un autre projet). Pages : `http://localhost:3001/fr` et `/en`.
- Travail sur la branche `refonte-visuelle`. Un commit par tâche. Fin de message de commit : `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.

## Carte des fichiers

| Fichier | Rôle | Tâche |
|---|---|---|
| `tailwind.config.ts` | tokens couleurs, fonds, ombres | 1 |
| `app/globals.css` | variables CSS, classes typo, règles `.js [data-reveal]` | 1 |
| `app/[lang]/layout.tsx` | classe `js`, `themeColor` | 1 |
| `components/layout/AmbientBackground.tsx` | fond éditorial statique | 1 |
| `lib/anim/index.ts` | hooks anime.js | 2 |
| `components/home/Personae.tsx`, `GoogleReviews.tsx` | premiers consommateurs | 2 |
| `components/agent-object/content.ts` | textes FR/EN de l'objet | 3 |
| `components/agent-object/layout.ts` | phases + placement des légendes (pur) | 3 |
| `components/agent-object/scene.ts` | scène three.js (pur) | 3 |
| `components/agent-object/AgentStage.tsx` | canvas + boucle + légendes desktop | 3, 4 |
| `components/agent-object/AgentObjectSection.tsx` | section épinglée | 3, 4 |
| `components/home/WhatIsAnAgent.tsx` | branche l'objet ; port métiers/bénéfices | 3, 7 |
| `components/home/AgentExplainer.tsx`, `public/herakia-agent-explicatif.html` | supprimés | 4 |
| `components/home/Hero.tsx` | hero éditorial | 5 |
| `components/home/TrustedBy.tsx`, `MeetTia.tsx` | bandeau, onde | 6 |
| `components/home/About.tsx` | révélations | 7 |
| `components/home/HowItWorks.tsx` | fil lié au scroll | 8 |
| `components/home/CTAFinal.tsx`, `WhatWeHandle.tsx` | CTA ; titres WhatWeHandle | 9 |
| `components/ui/Button.tsx`, `Badge.tsx`, `Card.tsx`, `components/layout/Navbar.tsx`, `Footer.tsx` | partagés sans Framer | 10 |
| 13 composants morts | supprimés | 11 |

---

### Task 1: Socle — mise de côté, mesures de départ, dépendances, charte, fond

**Files:**
- Modify: `.gitignore`, `package.json`, `package-lock.json`
- Modify: `tailwind.config.ts` (bloc `theme.extend`)
- Modify: `app/globals.css` (bloc `:root` + ajouts en fin de fichier)
- Modify: `app/[lang]/layout.tsx` (`viewport.themeColor`, balise `<html>`, `<head>`)
- Rewrite: `components/layout/AmbientBackground.tsx`
- Create: `docs/superpowers/plans/baseline.md` (mesures de départ)

**Interfaces:**
- Produces: classes Tailwind `bg-bg-primary` (#080808), `bg-bg-secondary`, `bg-bg-elevated`, `text-text-primary|secondary|muted`, `text-green-primary`, `bg-green-subtle`, `stroke-green-line`, `text-on-green`, `border-border-subtle|strong|green`, `bg-rules` + `bg-rules-72` ; classes CSS `.h-display`, `.h-section`, `.eyebrow` ; classe `js` sur `<html>` ; attributs `data-reveal`, `data-split`, `data-scroll-hidden` masqués par CSS quand `.js` et mouvement autorisé.

- [ ] **Step 1: Mettre de côté les modifications en cours (sans toucher `.superpowers/`)**

```bash
cd ~/Downloads/herakia-main
git status --short
git stash push -u -m "wip-avant-refonte" -- . ':!.superpowers'
git status --short
```
Expected: le second `git status` ne liste plus que `?? .superpowers/` (et rien d'autre). `git stash list` affiche `stash@{0}: On refonte-visuelle: wip-avant-refonte`.

- [ ] **Step 2: Mesurer l'état de départ**

```bash
npm run build 2>&1 | tee /tmp/herakia-build-before.txt | grep -E "○|●|ƒ|First Load" | head -40
```
Relever la ligne de la route `/[lang]` (colonne « First Load JS »).

Puis Lighthouse mobile sur le build de prod :
```bash
npx next start -p 3002 &
sleep 5
npx -y lighthouse http://localhost:3002/fr --only-categories=performance,accessibility --form-factor=mobile --quiet --chrome-flags="--headless=new" --output=json --output-path=/tmp/lh-before.json
node -e "const r=require('/tmp/lh-before.json');console.log('perf',r.categories.performance.score,'a11y',r.categories.accessibility.score)"
kill %1
```
Écrire les trois chiffres dans `docs/superpowers/plans/baseline.md` :
```markdown
# Mesures de départ (commit 69c8833)

- First Load JS `/[lang]` : <valeur relevée> kB
- Lighthouse mobile performance : <score>
- Lighthouse mobile accessibilité : <score>
```

- [ ] **Step 3: Installer les dépendances et ignorer le dossier de brainstorming**

```bash
npm install animejs@^4.5.0 three@^0.170.0
npm install -D @types/three@^0.170.0
printf '\n# brainstorming superpowers\n.superpowers/\n' >> .gitignore
```
Expected: `package.json` contient `"animejs": "^4.5.0"`, `"three": "^0.170.0"` et `"@types/three"` en devDependencies.

- [ ] **Step 4: Remplacer les tokens dans `tailwind.config.ts`**

Remplacer tout le bloc `extend: { ... }` par :

```ts
    extend: {
      colors: {
        // Fonds
        'bg-primary': '#080808',
        'bg-secondary': '#0f0f0f',
        'bg-elevated': '#161616',
        // Vert signature — unique accent, ~5 % de la surface
        'green-primary': '#3ecf8e',
        'green-dark': '#2a9e6a',
        'green-glow': 'rgba(62, 207, 142, 0.15)',
        'green-subtle': 'rgba(62, 207, 142, 0.08)',
        'green-line': 'rgba(62, 207, 142, 0.55)',
        'on-green': '#04120a',
        // Textes (contrastes sur #080808 : 17:1, 7,7:1, 5,8:1)
        'text-primary': '#ededed',
        'text-secondary': '#a0a0a0',
        'text-muted': '#8a8a8a',
        // Lignes
        'border-subtle': 'rgba(255, 255, 255, 0.08)',
        'border-strong': 'rgba(255, 255, 255, 0.14)',
        'border-green': 'rgba(62, 207, 142, 0.3)',
        'stroke-object': '#dedede',
        'stroke-deco': '#555555',
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern':
          'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        rules: 'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-md': '60px 60px',
        'rules-72': '100% 72px',
      },
      boxShadow: {
        'glow-green': '0 0 24px rgba(62, 207, 142, 0.12)',
        'glow-green-lg': '0 0 48px rgba(62, 207, 142, 0.2)',
        'glow-green-sm': '0 0 12px rgba(62, 207, 142, 0.1)',
      },
    },
```
(Les clés `violet-primary` et `violet-glow` disparaissent ; elles ne sont utilisées par aucun composant.)

- [ ] **Step 5: Mettre à jour `app/globals.css`**

Remplacer le bloc `:root { ... }` par :

```css
:root {
  --bg-primary: #080808;
  --bg-secondary: #0f0f0f;
  --bg-elevated: #161616;
  --green-primary: #3ecf8e;
  --green-dark: #2a9e6a;
  --green-glow: rgba(62, 207, 142, 0.15);
  --green-subtle: rgba(62, 207, 142, 0.08);
  --text-primary: #ededed;
  --text-secondary: #a0a0a0;
  --text-muted: #8a8a8a;
  --border: rgba(255, 255, 255, 0.08);
  --border-green: rgba(62, 207, 142, 0.3);
}
```

Ajouter en fin de fichier :

```css
@layer components {
  /* Titres éditoriaux : Syne serrée, interlignage court */
  .h-display {
    @apply font-display font-extrabold leading-[0.92] tracking-[-0.035em] text-text-primary;
    text-wrap: balance;
  }
  .h-section {
    @apply font-display text-4xl font-extrabold leading-[0.95] tracking-[-0.03em] text-text-primary md:text-6xl lg:text-7xl;
    text-wrap: balance;
  }
  .eyebrow {
    @apply block font-mono text-xs uppercase tracking-[0.14em] text-green-primary;
  }
}

/* Éléments animés par lib/anim : masqués uniquement si JS actif et mouvement autorisé,
   pour éviter tout flash avant l'animation. Sans JS ou en mouvement réduit : visibles. */
@media (prefers-reduced-motion: no-preference) {
  .js [data-reveal],
  .js [data-scroll-hidden] {
    opacity: 0;
  }
  .js [data-split] {
    visibility: hidden;
  }
}
```

- [ ] **Step 6: Classe `js` et couleur de thème dans `app/[lang]/layout.tsx`**

Remplacer `themeColor: '#0a0a0a',` par `themeColor: '#080808',`.

Remplacer la balise ouvrante :
```tsx
    <html
      lang={lang}
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <head>
```
par :
```tsx
    <html
      lang={lang}
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Doit s'exécuter avant la première peinture : active le masquage des éléments animés */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
```

- [ ] **Step 7: Réécrire `components/layout/AmbientBackground.tsx`**

```tsx
const NOISE_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

/** Fond éditorial : filets horizontaux fins + grain léger + vignettage. Statique, sans JS. */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-bg-primary" aria-hidden="true">
      <div className="absolute inset-0 bg-rules bg-rules-72 opacity-60" />
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-soft-light"
        style={{ backgroundImage: `url("${NOISE_URL}")` }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 0%, transparent 0%, rgba(8,8,8,0.35) 60%, rgba(8,8,8,0.8) 100%)',
        }}
      />
    </div>
  );
}
```

- [ ] **Step 8: Vérifier**

```bash
npm run build 2>&1 | tail -30
```
Expected: `✓ Compiled successfully`, aucune erreur TypeScript.

Lancer `npx next dev -p 3001`, ouvrir `http://localhost:3001/fr` dans Chrome : fond noir avec filets horizontaux, plus aucun halo vert flou ni violet ; toutes les sections encore visibles (aucun élément ne porte encore `data-reveal`) ; console sans erreur ni avertissement d'hydratation. Ouvrir aussi `/fr/contact` : la page s'affiche normalement.

- [ ] **Step 9: Commit**

```bash
git add .gitignore package.json package-lock.json tailwind.config.ts app/globals.css "app/[lang]/layout.tsx" components/layout/AmbientBackground.tsx docs/superpowers/plans/baseline.md
git commit -m "feat(refonte): charte éditorial noir, fond statique, dépendances anime.js et three.js

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Briques d'animation `lib/anim` + premiers consommateurs (Personae, GoogleReviews)

**Files:**
- Create: `lib/anim/index.ts`
- Rewrite: `components/home/Personae.tsx` (partie JSX et imports ; l'objet `TEXT` est inchangé)
- Rewrite: `components/home/GoogleReviews.tsx` (partie `GoogleReviews()` et imports ; `TEXT`, `reviews`, `GoogleG`, `initials` inchangés)

**Interfaces:**
- Consumes: CSS `.js [data-reveal]`, `.js [data-split]` (Task 1).
- Produces (exports de `@/lib/anim`) :
  - `prefersReducedMotion(): boolean`
  - `onceInView(el: Element, cb: () => void, rootMargin?: string): () => void`
  - `useReveal<T extends HTMLElement>(opts?: { y?: number; stagger?: number; delay?: number; duration?: number; onLoad?: boolean }): RefObject<T>` — anime tous les `[data-reveal]` de la racine (ou la racine elle-même si elle porte `data-reveal`), en cascade, à l'entrée à l'écran.
  - `useTextReveal<T extends HTMLElement>(opts?: { by?: 'chars' | 'words'; delay?: number; onLoad?: boolean }): RefObject<T>` — l'élément doit porter `data-split`.
  - `useDrawPath<T extends SVGGeometryElement>(opts?: { delay?: number; duration?: number; onLoad?: boolean }): RefObject<T>` — l'élément doit porter `data-reveal`.
  - `useScrollProgress<T extends HTMLElement>(onProgress: (p: number) => void, opts?: { enter?: string; leave?: string; sync?: number | boolean }): RefObject<T>`
  - `useAnime<T extends HTMLElement | SVGElement>(setup: (root: T) => void, deps?: DependencyList): RefObject<T>` — exécute `setup` dans un `createScope`, annulé au démontage.

- [ ] **Step 1: Créer `lib/anim/index.ts`**

```ts
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
  setup: (root: T) => void,
  deps: DependencyList = [],
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const scope = createScope({ root }).add(() => {
      setup(root);
    });
    return () => scope.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
```

- [ ] **Step 2: Vérifier que les hooks compilent**

```bash
npx tsc --noEmit -p . 2>&1 | grep -E "lib/anim" ; echo "exit: done"
```
Expected: aucune ligne mentionnant `lib/anim` (seul `exit: done` s'affiche).

- [ ] **Step 3: Porter `components/home/Personae.tsx`**

Remplacer les imports :
```tsx
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { Quote } from 'lucide-react';
import { useLang } from '@/components/i18n/LangProvider';
```
par :
```tsx
import Image from 'next/image';
import { Quote } from 'lucide-react';
import { useLang } from '@/components/i18n/LangProvider';
import { useReveal } from '@/lib/anim';
```

Remplacer toute la fonction `Personae()` par :
```tsx
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
```
(Changements voulus : le voile vert `mix-blend-soft-light` sur les photos disparaît — trop « effet » pour la direction ; le titre passe en `.h-section`.)

- [ ] **Step 4: Porter `components/home/GoogleReviews.tsx`**

Remplacer `import { motion } from 'framer-motion';` par `import { useReveal } from '@/lib/anim';`.

Remplacer la fonction `GoogleReviews()` par :
```tsx
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
```
Note : `.eyebrow` est `display:block` ; `inline-flex` placé après l'emporte car les utilitaires Tailwind sont générés après la couche `components`.

- [ ] **Step 5: Vérifier**

```bash
npm run build 2>&1 | tail -20
```
Expected: build OK.

Dans Chrome (`http://localhost:3001/fr`), descendre jusqu'à « Vous reconnaissez-vous ? » : eyebrow, titre, sous-titre apparaissent en cascade, puis les 3 cartes l'une après l'autre ; survol d'une carte : elle monte de 6 px. Même contrôle sur les avis Google. Recharger la page déjà scrollée au milieu des avis : ils apparaissent (pas de contenu bloqué invisible). Console sans erreur.

- [ ] **Step 6: Commit**

```bash
git add lib/anim/index.ts components/home/Personae.tsx components/home/GoogleReviews.tsx
git commit -m "feat(refonte): hooks anime.js (lib/anim) ; Personae et avis Google portés

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: L'objet — scène 3D au trait, épinglée dans la section agent

**Files:**
- Create: `components/agent-object/content.ts`
- Create: `components/agent-object/layout.ts`
- Create: `components/agent-object/scene.ts`
- Create: `components/agent-object/AgentStage.tsx`
- Create: `components/agent-object/AgentObjectSection.tsx`
- Modify: `components/home/WhatIsAnAgent.tsx` (imports, clés `TEXT` inutilisées, rendu)

**Interfaces:**
- Consumes: `useScrollProgress`, `prefersReducedMotion` (Task 2) ; classes `.h-section`, `.eyebrow`, `data-scroll-hidden` (Task 1).
- Produces:
  - `layout.ts` : `PART_IDS` (`'perceive' | 'decide' | 'act' | 'connect' | 'report' | 'reply'`), `type PartId`, `clamp01`, `easeInOutCubic`, `phases(p): Phases`, `layoutCallouts(anchors, width): CalloutBox[]`.
  - `scene.ts` : `createAgentScene(canvas): AgentScene` avec `resize(w, h)`, `render(state: SceneState): Anchor[]`, `dispose()`.
  - `content.ts` : `AGENT_OBJECT_TEXT: Record<'fr' | 'en', AgentObjectText>`.
  - `AgentStage.tsx` : `export default function AgentStage({ progress, reduced, text })`.
  - `AgentObjectSection.tsx` : `export function AgentObjectSection()`.

- [ ] **Step 1: Créer `components/agent-object/content.ts`**

```ts
import type { PartId } from './layout';

export interface AgentObjectText {
  eyebrow: string;
  title: string;
  body: string;
  finale: string;
  parts: Record<PartId, { k: string; title: string; desc: string }>;
}

export const AGENT_OBJECT_TEXT: Record<'fr' | 'en', AgentObjectText> = {
  fr: {
    eyebrow: 'En clair',
    title: 'Qu’est-ce qu’un agent IA ?',
    body: 'Pas un simple chatbot. Un agent IA est un collaborateur numérique qui perçoit ce qui arrive, décide quoi faire selon vos règles, et agit dans vos outils — tout seul, en continu.',
    finale: 'Un agent ne se contente pas de répondre : il agit.',
    parts: {
      perceive: { k: '01 · Capteur', title: 'Perçoit', desc: 'Un e-mail, une demande, un appel arrive : il le capte, jour et nuit.' },
      decide: { k: '02 · Cœur', title: 'Décide', desc: 'Il analyse le contexte et applique vos règles.' },
      act: { k: '03 · Bras', title: 'Agit', desc: 'Il répond, met à jour le CRM, planifie — dans vos outils.' },
      connect: { k: '04 · Connecteurs', title: 'Se branche', desc: 'Sur vos outils existants, sans migration.' },
      report: { k: '05 · Écran', title: 'Rend compte', desc: 'Un tableau de bord clair : vous gardez la main.' },
      reply: { k: '06 · Voix', title: 'Répond', desc: 'Par écrit ou à la voix, avec le ton de votre entreprise.' },
    },
  },
  en: {
    eyebrow: 'In plain terms',
    title: 'What is an AI agent?',
    body: 'Not just a chatbot. An AI agent is a digital coworker that perceives what comes in, decides what to do based on your rules, and acts in your tools — on its own, around the clock.',
    finale: 'An agent doesn’t just reply — it acts.',
    parts: {
      perceive: { k: '01 · Sensor', title: 'Perceives', desc: 'An email, a request, a call comes in: it picks it up, day and night.' },
      decide: { k: '02 · Core', title: 'Decides', desc: 'It reads the context and applies your rules.' },
      act: { k: '03 · Arm', title: 'Acts', desc: 'It replies, updates the CRM, schedules — in your tools.' },
      connect: { k: '04 · Connectors', title: 'Connects', desc: 'To the tools you already use, no migration.' },
      report: { k: '05 · Screen', title: 'Reports', desc: 'A clear dashboard: you stay in control.' },
      reply: { k: '06 · Voice', title: 'Replies', desc: 'In writing or by voice, in your company’s tone.' },
    },
  },
};
```

- [ ] **Step 2: Créer `components/agent-object/layout.ts`**

```ts
export const PART_IDS = ['perceive', 'decide', 'act', 'connect', 'report', 'reply'] as const;
export type PartId = (typeof PART_IDS)[number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);

export interface Phases {
  /** 0 = assemblé, 1 = modules détachés (15 → 55 %) */
  explode: number;
  /** ouverture de la pierre et apparition du cœur (25 → 55 %) */
  open: number;
  /** opacité de chaque légende, une par une (55 → 85 %) */
  labels: Record<PartId, number>;
  /** opacité du bloc d'intro (s'efface 40 → 52 %) */
  intro: number;
  /** opacité de la phrase finale (85 → 91 %) */
  finale: number;
  /** rotation Y de l'objet (radians) */
  rotation: number;
}

export function phases(p: number): Phases {
  const labels = {} as Record<PartId, number>;
  PART_IDS.forEach((id, i) => {
    labels[id] = clamp01((p - (0.55 + i * 0.045)) / 0.05);
  });
  return {
    explode: easeInOutCubic(clamp01((p - 0.15) / 0.4)),
    open: easeInOutCubic(clamp01((p - 0.25) / 0.3)),
    labels,
    intro: 1 - clamp01((p - 0.4) / 0.12),
    finale: clamp01((p - 0.85) / 0.06),
    rotation: 0.85 - p * 0.75,
  };
}

export interface ScreenAnchor {
  id: PartId;
  x: number;
  y: number;
}

export interface CalloutBox {
  id: PartId;
  side: 'left' | 'right';
  /** position de la légende (px, relatif à la scène) */
  left: number;
  top: number;
  /** points de la ligne de rappel : ancrage → coude → bord de la légende */
  points: string;
  ax: number;
  ay: number;
}

const LABEL_WIDTH = 250;
const ROW_GAP = 118;
const TOP = 70;

/** Range les légendes en deux colonnes (gauche/droite selon l'ancrage), sans chevauchement vertical. */
export function layoutCallouts(anchors: ScreenAnchor[], width: number): CalloutBox[] {
  const out: CalloutBox[] = [];
  for (const side of ['left', 'right'] as const) {
    const column = anchors
      .filter((a) => (side === 'left' ? a.x < width / 2 : a.x >= width / 2))
      .sort((a, b) => a.y - b.y);
    let next = TOP;
    for (const a of column) {
      const y = Math.max(a.y, next);
      next = y + ROW_GAP;
      const colX = side === 'left' ? width * 0.07 : width * 0.93;
      const left = side === 'left' ? colX : colX - LABEL_WIDTH;
      const edge = side === 'left' ? colX + LABEL_WIDTH + 12 : colX - LABEL_WIDTH - 12;
      const knee = side === 'left' ? edge + 30 : edge - 30;
      out.push({
        id: a.id,
        side,
        left,
        top: y - 22,
        points: `${a.x},${a.y} ${knee},${y} ${edge},${y}`,
        ax: a.x,
        ay: a.y,
      });
    }
  }
  return out;
}
```

- [ ] **Step 3: Créer `components/agent-object/scene.ts`**

```ts
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  EdgesGeometry,
  ExtrudeGeometry,
  Group,
  IcosahedronGeometry,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  OrthographicCamera,
  Scene,
  Shape,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { PartId, ScreenAnchor } from './layout';

// Couleurs de la charte (three.js ne lit pas Tailwind) : green-primary, stroke-object, bg-primary.
const GREEN = 0x3ecf8e;
const WHITE = 0xdedede;
const BG = 0x080808;

export interface SceneState {
  explode: number;
  open: number;
  rotation: number;
  /** ms, pour le léger flottement ; 0 = figé */
  time: number;
  /** 0→1 : tracé initial des traits */
  draw: number;
}

export interface AgentScene {
  resize(width: number, height: number): void;
  render(state: SceneState): ScreenAnchor[];
  dispose(): void;
}

type Plane = 'xy' | 'xz' | 'yz';
const V = (x: number, y: number, z: number) => new Vector3(x, y, z);

function circlePts(r: number, n: number, plane: Plane, c: [number, number, number]): Vector3[] {
  const pts: Vector3[] = [];
  for (let i = 0; i < n; i++) {
    for (const k of [i, i + 1]) {
      const a = (k / n) * Math.PI * 2;
      const u = Math.cos(a) * r;
      const v = Math.sin(a) * r;
      pts.push(
        plane === 'xy' ? V(c[0] + u, c[1] + v, c[2]) : plane === 'xz' ? V(c[0] + u, c[1], c[2] + v) : V(c[0], c[1] + u, c[2] + v),
      );
    }
  }
  return pts;
}

function rectPts(x0: number, y0: number, x1: number, y1: number, z: number): Vector3[] {
  return [
    V(x0, y0, z), V(x1, y0, z),
    V(x1, y0, z), V(x1, y1, z),
    V(x1, y1, z), V(x0, y1, z),
    V(x0, y1, z), V(x0, y0, z),
  ];
}

interface Module {
  id: Exclude<PartId, 'decide'>;
  group: Group;
  rest: Vector3;
  dir: Vector3;
  /** -1 = moitié gauche de la pierre, 1 = droite, 0 = aucune */
  half: -1 | 0 | 1;
  socketCenter: Vector3;
  anchor: Vector3;
  socketMat: LineBasicMaterial;
  tether: Line;
  tetherMat: LineDashedMaterial;
}

export function createAgentScene(canvas: HTMLCanvasElement): AgentScene {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  camera.position.set(8, 5.2, 10);
  camera.lookAt(0, 0, 0);

  const disposables: Array<{ dispose(): void }> = [];
  const track = <T extends { dispose(): void }>(x: T): T => {
    disposables.push(x);
    return x;
  };
  /** traits concernés par le tracé initial */
  const drawn: LineSegments[] = [];
  const fill = track(
    new MeshBasicMaterial({ color: BG, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
  );
  const lineMat = (color: number, opacity: number) =>
    track(new LineBasicMaterial({ color, transparent: true, opacity }));

  /** Volume plein (masque les traits cachés) + ses arêtes. */
  function solid(geo: BufferGeometry, color = WHITE, opacity = 0.9, threshold = 20): Group {
    const g = new Group();
    g.add(new Mesh(track(geo), fill));
    const l = new LineSegments(track(new EdgesGeometry(geo, threshold)), lineMat(color, opacity));
    g.add(l);
    drawn.push(l);
    return g;
  }
  function segs(points: Vector3[], color = WHITE, opacity = 0.6): LineSegments {
    const l = new LineSegments(track(new BufferGeometry().setFromPoints(points)), lineMat(color, opacity));
    drawn.push(l);
    return l;
  }

  const root = new Group();
  scene.add(root);

  // ── Monolithe : deux moitiés chanfreinées qui s'écartent pour révéler le cœur ──
  const W = 2.0, H = 3.0, D = 1.3, b = 0.07, zf = D / 2 + 0.004;
  function halfBlock(x0: number, x1: number): Group {
    const s = new Shape();
    s.moveTo(x0 + b, -H / 2 + b);
    s.lineTo(x1 - b, -H / 2 + b);
    s.lineTo(x1 - b, H / 2 - b);
    s.lineTo(x0 + b, H / 2 - b);
    s.closePath();
    const geo = new ExtrudeGeometry(s, {
      depth: D - 2 * b,
      bevelEnabled: true,
      bevelThickness: b,
      bevelSize: b,
      bevelSegments: 1,
    });
    geo.translate(0, 0, -(D - 2 * b) / 2);
    return solid(geo, WHITE, 0.95, 15);
  }
  const leftHalf = new Group();
  leftHalf.add(halfBlock(-W / 2, 0));
  root.add(leftHalf);
  const rightHalf = new Group();
  rightHalf.add(halfBlock(0, W / 2));
  root.add(rightHalf);

  // Gravures façon glyphes (pseudo-aléatoire déterministe) sur la moitié droite
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const glyph: Vector3[] = [];
  for (let y = 1.25; y > -0.45; y -= 0.13) {
    let x = 0.14;
    while (x < 0.8) {
      const w = 0.05 + rnd() * 0.2;
      if (x + w > 0.82) break;
      glyph.push(V(x, y, zf), V(x + w, y, zf));
      if (rnd() > 0.7) glyph.push(V(x, y, zf), V(x, y - 0.06, zf));
      x += w + 0.05 + rnd() * 0.06;
    }
  }
  rightHalf.add(segs(glyph, WHITE, 0.35));
  rightHalf.add(segs(rectPts(0.07, -0.55, 0.88, 1.33, zf), WHITE, 0.25));
  const grooves: Vector3[] = [];
  for (const y of [-1.1, -0.95, 1.05, 1.2]) grooves.push(V(W / 2 + 0.004, y, -D / 2 + 0.15), V(W / 2 + 0.004, y, D / 2 - 0.15));
  rightHalf.add(segs(grooves, WHITE, 0.3));
  const leftLines: Vector3[] = [];
  for (const y of [-0.3, -0.42, -0.54]) leftLines.push(V(-0.85, y, zf), V(-0.15, y, zf));
  leftHalf.add(segs(leftLines, WHITE, 0.3));

  // ── Cœur vert (visible quand la pierre s'ouvre) ──
  const coreMats = [lineMat(GREEN, 0), lineMat(GREEN, 0)];
  const core = new Group();
  core.position.set(0, 0.1, 0);
  core.add(new LineSegments(track(new EdgesGeometry(track(new IcosahedronGeometry(0.42, 0)))), coreMats[0]));
  core.add(new LineSegments(track(new EdgesGeometry(track(new OctahedronGeometry(0.2, 0)))), coreMats[1]));
  root.add(core);

  // ── Câbles fixes sous l'objet ──
  const cables: Array<[number, number, number, number]> = [
    [0.3, -0.3, 1.6, -1.8],
    [-0.2, -0.4, -1.2, -2.2],
    [0.6, 0.1, 2.4, -0.4],
  ];
  for (const [x, z, ex, ez] of cables) {
    const pts = new CatmullRomCurve3([
      V(x, -H / 2, z),
      V(x + (ex - x) * 0.2, -H / 2 - 0.8, z + (ez - z) * 0.2),
      V(ex, -H / 2 - 1.6, ez),
    ]).getPoints(40);
    const pairs: Vector3[] = [];
    for (let i = 0; i < pts.length - 1; i++) pairs.push(pts[i], pts[i + 1]);
    root.add(segs(pairs, WHITE, 0.22));
  }

  // ── Modules : chacun est une capacité de l'agent ──
  const modules: Module[] = [];
  function addModule(
    id: Module['id'],
    group: Group,
    dir: [number, number, number],
    half: Module['half'],
    socketPts: Vector3[],
    socketCenter: Vector3,
    anchor: Vector3,
  ) {
    root.add(group);
    const socketMat = lineMat(GREEN, 0);
    const socket = new LineSegments(track(new BufferGeometry().setFromPoints(socketPts)), socketMat);
    (half === -1 ? leftHalf : half === 1 ? rightHalf : root).add(socket);
    const tetherMat = track(
      new LineDashedMaterial({ color: GREEN, dashSize: 0.06, gapSize: 0.05, transparent: true, opacity: 0 }),
    );
    const tether = new Line(track(new BufferGeometry().setFromPoints([V(0, 0, 0), V(0, 0, 0)])), tetherMat);
    root.add(tether);
    modules.push({ id, group, rest: group.position.clone(), dir: V(...dir), half, socketCenter, anchor, socketMat, tether, tetherMat });
  }

  // Capteur — face avant, haut gauche
  {
    const g = new Group();
    g.position.set(-0.45, 0.82, D / 2);
    const box = solid(new BoxGeometry(0.72, 0.72, 0.3), GREEN, 0.95);
    box.position.z = 0.15;
    g.add(box);
    const lens = solid(new CylinderGeometry(0.22, 0.22, 0.14, 48), GREEN, 0.95, 30);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.37;
    g.add(lens);
    g.add(segs(circlePts(0.13, 48, 'xy', [0, 0, 0.442]), GREEN, 0.8));
    g.add(segs(circlePts(0.05, 32, 'xy', [0, 0, 0.442]), GREEN, 0.8));
    addModule('perceive', g, [-0.2, 0.15, 1.9], -1, rectPts(-0.81, 0.46, -0.09, 1.18, zf), V(-0.45, 0.82, zf), V(0, 0.4, 0.3));
  }
  // Bras articulé — flanc gauche
  {
    const g = new Group();
    g.position.set(-W / 2, 0.05, 0.1);
    const shoulder = solid(new CylinderGeometry(0.2, 0.2, 0.22, 40), GREEN, 0.95, 30);
    shoulder.rotation.z = Math.PI / 2;
    shoulder.position.x = -0.11;
    g.add(shoulder);
    const p1 = new Group();
    p1.position.x = -0.22;
    p1.rotation.z = 0.5;
    g.add(p1);
    const upper = solid(new BoxGeometry(0.9, 0.12, 0.12), GREEN, 0.95);
    upper.position.x = -0.45;
    p1.add(upper);
    const p2 = new Group();
    p2.position.x = -0.9;
    p2.rotation.z = 0.75;
    p1.add(p2);
    const elbow = solid(new CylinderGeometry(0.12, 0.12, 0.2, 36), GREEN, 0.95, 30);
    elbow.rotation.x = Math.PI / 2;
    p2.add(elbow);
    const fore = solid(new BoxGeometry(0.7, 0.1, 0.1), GREEN, 0.95);
    fore.position.x = -0.35;
    p2.add(fore);
    for (const s of [-1, 1]) {
      const finger = solid(new BoxGeometry(0.2, 0.04, 0.09), GREEN, 0.95);
      finger.position.set(-0.78, s * 0.055, 0);
      p2.add(finger);
    }
    addModule('act', g, [-1.7, 0.1, 0.3], -1, circlePts(0.22, 40, 'yz', [-W / 2 - 0.004, 0.05, 0.1]), V(-W / 2 - 0.004, 0.05, 0.1), V(-0.6, 0.2, 0));
  }
  // Écran flottant — flanc droit
  {
    const g = new Group();
    g.position.set(W / 2, 0.5, 0.15);
    const mount = solid(new CylinderGeometry(0.05, 0.05, 0.6, 20), GREEN, 0.8, 30);
    mount.rotation.z = Math.PI / 2;
    mount.position.x = 0.3;
    g.add(mount);
    const screen = new Group();
    screen.position.x = 0.85;
    screen.rotation.y = 0.35;
    g.add(screen);
    screen.add(solid(new BoxGeometry(1.05, 1.45, 0.05), GREEN, 0.95));
    const z = 0.03;
    const ui = rectPts(-0.44, -0.64, 0.44, 0.64, z);
    ui.push(V(-0.36, 0.52, z), V(0.05, 0.52, z));
    [0.36, 0.28, 0.2].forEach((y, i) => ui.push(V(-0.36, y, z), V(-0.36 + [0.62, 0.48, 0.55][i], y, z)));
    [0.18, 0.3, 0.24, 0.42, 0.36, 0.5].forEach((h, i) => {
      const x = -0.3 + i * 0.12;
      ui.push(V(x, -0.5, z), V(x, -0.5 + h, z));
    });
    ui.push(V(-0.36, -0.5, z), V(0.36, -0.5, z));
    screen.add(segs(ui, GREEN, 0.7));
    addModule('report', g, [1.5, 0.35, 0.2], 1, circlePts(0.1, 24, 'yz', [W / 2 + 0.004, 0.5, 0.15]), V(W / 2 + 0.004, 0.5, 0.15), V(1.2, 0.75, 0.2));
  }
  // Couronne de connecteurs — dessus
  {
    const g = new Group();
    g.position.set(0, H / 2, 0);
    const disc = solid(new CylinderGeometry(0.55, 0.55, 0.14, 64), GREEN, 0.95, 30);
    disc.position.y = 0.07;
    g.add(disc);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const port = solid(new BoxGeometry(0.11, 0.1, 0.11), GREEN, 0.9);
      port.position.set(Math.cos(a) * 0.4, 0.19, Math.sin(a) * 0.4);
      port.rotation.y = -a;
      g.add(port);
    }
    const antenna = solid(new CylinderGeometry(0.02, 0.02, 0.75, 12), GREEN, 0.9, 30);
    antenna.position.set(0.2, 0.52, -0.1);
    g.add(antenna);
    addModule('connect', g, [0, 1.5, 0], 0, circlePts(0.55, 64, 'xz', [0, H / 2 + 0.004, 0]), V(0, H / 2 + 0.004, 0), V(0, 0.3, 0));
  }
  // Haut-parleur — face avant, bas droite
  {
    const g = new Group();
    g.position.set(0.48, -0.95, D / 2);
    const speaker = solid(new CylinderGeometry(0.34, 0.34, 0.1, 56), GREEN, 0.95, 30);
    speaker.rotation.x = Math.PI / 2;
    speaker.position.z = 0.05;
    g.add(speaker);
    for (const r of [0.25, 0.17, 0.09]) g.add(segs(circlePts(r, 48, 'xy', [0, 0, 0.102]), GREEN, 0.6));
    addModule('reply', g, [0.5, -0.35, 1.7], 1, circlePts(0.34, 48, 'xy', [0.48, -0.95, zf]), V(0.48, -0.95, zf), V(0, -0.1, 0.1));
  }

  for (const l of drawn) l.userData.count = l.geometry.attributes.position.count;

  let vw = 1;
  let vh = 1;
  const tmp = new Vector3();
  const project = (id: PartId, v: Vector3): ScreenAnchor => {
    v.project(camera);
    return { id, x: ((v.x + 1) / 2) * vw, y: ((1 - v.y) / 2) * vh };
  };

  return {
    resize(width, height) {
      vw = Math.max(1, width);
      vh = Math.max(1, height);
      renderer.setSize(vw, vh, false);
      const aspect = vw / vh;
      // Assez de champ pour la vue éclatée, en paysage comme en portrait
      const half = Math.max(4.1, 4.4 / aspect);
      camera.left = -half * aspect;
      camera.right = half * aspect;
      camera.top = half;
      camera.bottom = -half;
      camera.updateProjectionMatrix();
    },

    render({ explode, open, rotation, time, draw }) {
      root.rotation.y = rotation + Math.sin(time / 2600) * 0.02;
      root.rotation.x = -0.04 + explode * 0.06;
      root.position.y = -0.1 + Math.sin(time / 1800) * 0.04;

      const sep = open * 0.55;
      leftHalf.position.x = -sep;
      rightHalf.position.x = sep;
      core.rotation.y = time / 4000;
      coreMats[0].opacity = open * 0.95;
      coreMats[1].opacity = open * 0.6;

      for (const l of drawn) l.geometry.setDrawRange(0, Math.floor((l.userData.count * draw) / 2) * 2);

      for (const m of modules) {
        const shift = m.half * sep;
        m.group.position.copy(m.rest).addScaledVector(m.dir, explode);
        m.group.position.x += shift;
        m.socketMat.opacity = explode * 0.9;
        const pos = m.tether.geometry.attributes.position as BufferAttribute;
        pos.setXYZ(0, m.socketCenter.x + shift, m.socketCenter.y, m.socketCenter.z);
        pos.setXYZ(1, m.group.position.x, m.group.position.y, m.group.position.z);
        pos.needsUpdate = true;
        m.tether.computeLineDistances();
        m.tetherMat.opacity = explode * 0.55;
      }

      scene.updateMatrixWorld();
      const anchors = modules.map((m) => project(m.id, tmp.copy(m.anchor).applyMatrix4(m.group.matrixWorld)));
      anchors.push(project('decide', tmp.set(0, 0, 0).applyMatrix4(core.matrixWorld)));
      renderer.render(scene, camera);
      return anchors;
    },

    dispose() {
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
```

- [ ] **Step 4: Créer `components/agent-object/AgentStage.tsx` (sans légendes pour l'instant)**

```tsx
'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { animate } from 'animejs';
import { createAgentScene } from './scene';
import { phases } from './layout';
import type { AgentObjectText } from './content';

interface AgentStageProps {
  /** progression 0→1 de la section, écrite par AgentObjectSection */
  progress: MutableRefObject<number>;
  reduced: boolean;
  text: AgentObjectText;
}

export default function AgentStage({ progress, reduced }: AgentStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const scene = createAgentScene(canvas);
    const draw = { v: reduced ? 1 : 0 };
    let drawAnim: ReturnType<typeof animate> | null = null;
    let raf = 0;
    let visible = false;

    const size = () => scene.resize(wrap.clientWidth, wrap.clientHeight);
    size();
    const ro = new ResizeObserver(size);
    ro.observe(wrap);

    const frame = (t: number) => {
      raf = 0;
      if (!visible) return;
      const ph = phases(reduced ? 1 : progress.current);
      scene.render({ explode: ph.explode, open: ph.open, rotation: ph.rotation, time: reduced ? 0 : t, draw: draw.v });
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      // Le tracé initial démarre à la première apparition, pas au montage
      if (visible && !reduced && !drawAnim) drawAnim = animate(draw, { v: [0, 1], duration: 2600, ease: 'inOutQuart' });
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      drawAnim?.revert();
      scene.dispose();
    };
  }, [progress, reduced]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
    </div>
  );
}
```

- [ ] **Step 5: Créer `components/agent-object/AgentObjectSection.tsx` (version épinglée de base)**

```tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { prefersReducedMotion, useScrollProgress } from '@/lib/anim';
import { AGENT_OBJECT_TEXT } from './content';
import { phases } from './layout';

const AgentStage = dynamic(() => import('./AgentStage'), { ssr: false });

type Mode = 'pending' | 'animated' | 'reduced' | 'static';

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function AgentObjectSection() {
  const t = AGENT_OBJECT_TEXT[useLang()];
  const progress = useRef(0);
  const introRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('pending');
  const [near, setNear] = useState(false);

  useEffect(() => {
    setMode(!hasWebGL() ? 'static' : prefersReducedMotion() ? 'reduced' : 'animated');
  }, []);

  const pinRef = useScrollProgress<HTMLDivElement>(
    (p) => {
      progress.current = p;
      if (introRef.current) introRef.current.style.opacity = String(phases(p).intro);
    },
    { enter: 'top top', leave: 'bottom bottom', sync: 0.2 },
  );

  // three.js n'est chargé que lorsque la section est à moins d'un écran
  useEffect(() => {
    const el = pinRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '100% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pinRef]);

  const pinned = mode === 'pending' || mode === 'animated';

  return (
    <section aria-labelledby="agent-title" className="relative">
      <div ref={pinRef} className={pinned ? 'relative h-[300vh] md:h-[400vh]' : 'relative'}>
        <div className={pinned ? 'sticky top-0 h-screen overflow-hidden' : 'relative overflow-hidden py-24'}>
          <div ref={introRef} className="relative z-10 max-w-xl px-6 pt-24 lg:px-12 lg:pt-28">
            <span className="eyebrow">{t.eyebrow}</span>
            <h2 id="agent-title" className="h-section mt-4 !text-4xl md:!text-6xl">
              {t.title}
            </h2>
            <p className="mt-5 hidden text-base leading-relaxed text-text-secondary md:block md:text-lg">{t.body}</p>
          </div>

          {mode !== 'static' && near && (
            <div
              className={
                pinned
                  ? 'absolute inset-x-0 top-[30vh] h-[45vh] md:inset-0 md:h-auto'
                  : 'relative mx-auto mt-8 h-[70vh] max-w-6xl'
              }
            >
              <AgentStage progress={progress} reduced={mode === 'reduced'} text={t} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Brancher la section dans `components/home/WhatIsAnAgent.tsx`**

1. Imports : supprimer `Eye,`, `Brain,`, `Zap,` de l'import `lucide-react` ; supprimer les lignes `import { type AgentPhase } from '@/components/ui/AgentLoopSchema';` et `import { AgentExplainer } from '@/components/home/AgentExplainer';` ; ajouter `import { AgentObjectSection } from '@/components/agent-object/AgentObjectSection';`.
2. Dans `TEXT.fr` et `TEXT.en`, supprimer les clés `eyebrow`, `title`, `body`, `highlight`, `loopLabel` et `phases` (elles vivent désormais dans `content.ts` et ne sont pas lues ailleurs).
3. Dans le rendu, remplacer :
```tsx
  return (
    <section className="relative overflow-hidden px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <AgentExplainer />
```
par :
```tsx
  return (
    <>
    <AgentObjectSection />
    <section className="relative overflow-hidden px-6 pb-32 lg:px-8">
      <div className="mx-auto max-w-6xl">
```
et remplacer la fin :
```tsx
      </div>
    </section>
  );
}
```
par :
```tsx
      </div>
    </section>
    </>
  );
}
```

Vérifier que plus rien n'importe `AgentLoopSchema` ou `AgentExplainer` depuis ce fichier :
```bash
grep -n "AgentExplainer\|AgentLoopSchema\|t\.phases\|t\.title\b" components/home/WhatIsAnAgent.tsx
```
Expected: aucune sortie.

- [ ] **Step 7: Vérifier**

```bash
npm run build 2>&1 | tail -25
```
Expected: build OK, aucune erreur TypeScript.

Dans Chrome à 1440 px, `http://localhost:3001/fr` : descendre jusqu'à « Qu'est-ce qu'un agent IA ? ». Attendu, en capturant à ~5 %, ~35 %, ~60 % et ~95 % de la hauteur de la section :
- à l'arrivée, les traits de l'objet se dessinent en ~2,6 s ;
- l'écran reste fixe pendant qu'on descend (épinglage) ;
- entre ~15 et ~55 %, l'objet pivote, les 5 modules verts se détachent avec des pointillés vers leur logement vert, la pierre s'ouvre en deux et un cœur vert (icosaèdre) apparaît au centre ;
- le bloc titre s'efface vers ~45 % ;
- en remontant, tout se réassemble.
Dans l'onglet Réseau, recharger en haut de page : aucun fichier contenant `three` n'est chargé tant qu'on n'a pas approché la section. Console sans erreur.

- [ ] **Step 8: Commit**

```bash
git add components/agent-object components/home/WhatIsAnAgent.tsx
git commit -m "feat(refonte): objet agent au trait (three.js) épinglé et éclaté au scroll

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: L'objet — légendes, phrase finale, mobile, mouvement réduit, sans WebGL

**Files:**
- Modify: `components/agent-object/AgentStage.tsx` (légendes desktop + lignes de rappel)
- Modify: `components/agent-object/AgentObjectSection.tsx` (phrase finale, liste SSR, modes)
- Delete: `components/home/AgentExplainer.tsx`, `public/herakia-agent-explicatif.html`

**Interfaces:**
- Consumes: `layoutCallouts`, `PART_IDS`, `phases` (Task 3) ; `render()` retourne `ScreenAnchor[]` (Task 3).
- Produces: section complète conforme à la spec §3.

- [ ] **Step 1: Ajouter les légendes à `AgentStage.tsx`**

Remplacer le fichier entier par :

```tsx
'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { animate } from 'animejs';
import { createAgentScene } from './scene';
import { layoutCallouts, phases, PART_IDS, type PartId } from './layout';
import type { AgentObjectText } from './content';

interface AgentStageProps {
  /** progression 0→1 de la section, écrite par AgentObjectSection */
  progress: MutableRefObject<number>;
  reduced: boolean;
  text: AgentObjectText;
}

type RefMap<T> = Partial<Record<PartId, T | null>>;

export default function AgentStage({ progress, reduced, text }: AgentStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const labels = useRef<RefMap<HTMLDivElement>>({});
  const lines = useRef<RefMap<SVGPolylineElement>>({});
  const dots = useRef<RefMap<SVGCircleElement>>({});

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const svg = svgRef.current;
    if (!wrap || !canvas || !svg) return;

    const scene = createAgentScene(canvas);
    const desktop = window.matchMedia('(min-width: 768px)');
    const draw = { v: reduced ? 1 : 0 };
    let drawAnim: ReturnType<typeof animate> | null = null;
    let raf = 0;
    let visible = false;
    let width = 0;

    const size = () => {
      width = wrap.clientWidth;
      scene.resize(width, wrap.clientHeight);
      svg.setAttribute('viewBox', `0 0 ${width} ${wrap.clientHeight}`);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(wrap);

    const frame = (t: number) => {
      raf = 0;
      if (!visible) return;
      const ph = phases(reduced ? 1 : progress.current);
      const anchors = scene.render({ explode: ph.explode, open: ph.open, rotation: ph.rotation, time: reduced ? 0 : t, draw: draw.v });
      const show = desktop.matches;
      for (const box of layoutCallouts(anchors, width)) {
        const o = show ? ph.labels[box.id] : 0;
        const label = labels.current[box.id];
        const line = lines.current[box.id];
        const dot = dots.current[box.id];
        if (label) {
          label.style.left = `${box.left}px`;
          label.style.top = `${box.top}px`;
          label.style.textAlign = box.side === 'left' ? 'right' : 'left';
          label.style.opacity = String(o);
          label.style.transform = `translateY(${(1 - o) * 12}px)`;
        }
        if (line) {
          line.setAttribute('points', box.points);
          line.style.opacity = String(o);
        }
        if (dot) {
          dot.setAttribute('cx', String(box.ax));
          dot.setAttribute('cy', String(box.ay));
          dot.style.opacity = String(o);
        }
      }
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduced && !drawAnim) drawAnim = animate(draw, { v: [0, 1], duration: 2600, ease: 'inOutQuart' });
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      drawAnim?.revert();
      scene.dispose();
    };
  }, [progress, reduced]);

  return (
    // Décoratif : les capacités existent en HTML lisible dans AgentObjectSection (liste SSR)
    <div ref={wrapRef} className="absolute inset-0" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <svg ref={svgRef} className="pointer-events-none absolute inset-0 hidden h-full w-full md:block">
        {PART_IDS.map((id) => (
          <g key={id}>
            <polyline
              ref={(el) => {
                lines.current[id] = el;
              }}
              fill="none"
              strokeWidth={1}
              className="stroke-green-line"
              style={{ opacity: 0 }}
            />
            <circle
              ref={(el) => {
                dots.current[id] = el;
              }}
              r={3}
              className="fill-green-primary"
              style={{ opacity: 0 }}
            />
          </g>
        ))}
      </svg>
      {PART_IDS.map((id) => {
        const part = text.parts[id];
        return (
          <div
            key={id}
            ref={(el) => {
              labels.current[id] = el;
            }}
            className="pointer-events-none absolute hidden w-[250px] md:block"
            style={{ opacity: 0 }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-green-primary">{part.k}</p>
            <p className="mt-1.5 font-display text-[22px] font-bold tracking-tight text-text-primary">{part.title}</p>
            <p className="mt-1 text-[13px] leading-snug text-text-muted">{part.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Compléter `AgentObjectSection.tsx`**

1. Import : remplacer `import { phases } from './layout';` par `import { PART_IDS, phases } from './layout';`.
2. Après `const introRef = useRef<HTMLDivElement>(null);`, ajouter :
```tsx
  const finaleRef = useRef<HTMLParagraphElement>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
```
3. Remplacer le callback de `useScrollProgress` par :
```tsx
    (p) => {
      progress.current = p;
      const ph = phases(p);
      if (introRef.current) introRef.current.style.opacity = String(ph.intro);
      if (finaleRef.current) {
        finaleRef.current.style.opacity = String(ph.finale);
        finaleRef.current.style.transform = `translateY(${(1 - ph.finale) * 16}px)`;
      }
      PART_IDS.forEach((id, i) => {
        const li = itemRefs.current[i];
        if (li) li.style.opacity = String(0.3 + 0.7 * ph.labels[id]);
      });
    },
```
4. Juste avant la fermeture du bloc sticky (`</div>` qui suit le bloc `{mode !== 'static' && near && (...)}`), insérer :
```tsx
          <p
            ref={finaleRef}
            data-scroll-hidden={pinned ? '' : undefined}
            className={
              pinned
                ? 'absolute inset-x-6 bottom-10 z-10 hidden text-center font-display text-2xl font-bold tracking-tight text-text-primary md:block lg:text-3xl'
                : 'relative mt-8 px-6 text-center font-display text-2xl font-bold tracking-tight text-text-primary lg:text-3xl'
            }
          >
            {t.finale}
          </p>

          {/* Les six capacités en HTML rendu côté serveur : visibles sur mobile, lues par les lecteurs d'écran et Google partout */}
          <ol
            className={
              mode === 'static'
                ? 'relative z-10 mx-auto mt-10 grid max-w-4xl gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3'
                : pinned
                  ? 'absolute inset-x-6 bottom-6 z-10 grid grid-cols-2 gap-x-4 gap-y-3 md:sr-only'
                  : 'relative z-10 mx-auto mt-10 grid max-w-4xl gap-6 px-6 sm:grid-cols-2 md:sr-only'
            }
          >
            {PART_IDS.map((id, i) => (
              <li
                key={id}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
              >
                <p className="font-display text-base font-bold text-text-primary">{t.parts[id].title}</p>
                <p className="text-xs leading-snug text-text-muted">{t.parts[id].desc}</p>
              </li>
            ))}
          </ol>
```

- [ ] **Step 3: Supprimer l'ancienne iframe**

```bash
git rm components/home/AgentExplainer.tsx public/herakia-agent-explicatif.html
grep -rn "AgentExplainer\|herakia-agent-explicatif" app components lib || echo "aucune référence restante"
```
Expected: `aucune référence restante`.

- [ ] **Step 4: Vérifier (desktop, mobile, mouvement réduit)**

```bash
npm run build 2>&1 | tail -20
```
Expected: build OK.

Desktop 1440 px (captures à ~35 %, ~65 %, ~80 %, ~95 % de la section) :
- les légendes arrivent une par une à partir de ~55 % dans l'ordre Perçoit, Décide, Agit, Se branche, Rend compte, Répond, chacune reliée à sa pièce par une ligne verte ;
- aucune légende ne chevauche une autre ni le bloc titre (qui est effacé à ce moment) ; si une légende sort par le bas à 1440×900, réduire `ROW_GAP` à 108 dans `layout.ts` ;
- à ~90 %, la phrase « Un agent ne se contente pas de répondre : il agit. » apparaît en bas ;
- la liste `ol` n'est pas visible (sr-only) mais présente dans le DOM (vérifier dans l'inspecteur).

Mobile 390×844 (Chrome DevTools, mode appareil) :
- titre en haut sans le paragraphe, objet au milieu, liste de 6 capacités en 2 colonnes en bas, sans chevauchement avec l'objet ; chaque ligne passe de 30 % à 100 % d'opacité quand sa pièce se détache ; pas de légendes flottantes ni de lignes de rappel.
- si le titre chevauche l'objet en début de section, descendre la zone objet (`top-[30vh]` → `top-[34vh]`) et réduire sa hauteur d'autant (`h-[45vh]` → `h-[41vh]`).

Mouvement réduit (DevTools > Rendering > « Emulate CSS prefers-reduced-motion: reduce », puis recharger) :
- pas d'épinglage ; titre + paragraphe, puis l'objet directement éclaté avec toutes ses légendes, la phrase finale visible, aucune rotation.

Console sans erreur dans les trois cas.

- [ ] **Step 5: Commit**

```bash
git add components/agent-object
git commit -m "feat(refonte): légendes de l'objet, liste accessible, mobile et mouvement réduit ; retrait de l'iframe AgentExplainer

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Hero éditorial

**Files:**
- Rewrite: `components/home/Hero.tsx` (fichier entier)

**Interfaces:**
- Consumes: `useTextReveal`, `useReveal`, `useDrawPath`, `useScrollProgress` (Task 2) ; `.h-display`, `.eyebrow` (Task 1) ; `dict.hero.*` (inchangé).

- [ ] **Step 1: Réécrire `components/home/Hero.tsx`**

```tsx
'use client';

import { useRef } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDict, useLang, localize } from '@/components/i18n/LangProvider';
import { useDrawPath, useReveal, useScrollProgress, useTextReveal } from '@/lib/anim';

export function Hero() {
  const dict = useDict();
  const lang = useLang();
  const { titleLine1, titleLine2 } = dict.hero;
  const lastWord = titleLine2[titleLine2.length - 1];

  const titleRef = useTextReveal<HTMLHeadingElement>({ by: 'chars', onLoad: true, delay: 150 });
  const restRef = useReveal<HTMLDivElement>({ onLoad: true, delay: 900, stagger: 120 });
  const pathRef = useDrawPath<SVGPathElement>({ onLoad: true, delay: 400, duration: 2200 });
  const innerRef = useRef<HTMLDivElement>(null);

  // Sortie : le bloc glisse vers le haut et s'estompe pendant que le hero quitte l'écran
  const sectionRef = useScrollProgress<HTMLElement>(
    (p) => {
      const el = innerRef.current;
      if (!el) return;
      el.style.transform = `translate3d(0, ${-140 * p}px, 0)`;
      el.style.opacity = String(1 - 0.85 * p);
    },
    { enter: 'top top', leave: 'top bottom', sync: true },
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-end overflow-hidden px-6 pb-16 pt-32 lg:px-8"
    >
      <svg
        className="pointer-events-none absolute right-0 top-[14%] hidden w-[46vw] max-w-[680px] text-green-primary md:block"
        viewBox="0 0 680 420"
        fill="none"
        aria-hidden="true"
      >
        <path
          ref={pathRef}
          data-reveal
          d="M10 380 C 120 380, 150 120, 280 120 S 440 300, 520 220 S 640 40, 675 20"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>

      <div ref={innerRef} className="relative z-10 mx-auto w-full max-w-7xl">
        <div ref={restRef}>
          <p data-reveal className="eyebrow">
            — {dict.hero.badge}
          </p>

          <h1
            ref={titleRef}
            data-split
            className="h-display mt-6 text-[clamp(2.6rem,6.2vw,6.5rem)]"
          >
            {titleLine1.join(' ')}
            <br />
            {titleLine2.slice(0, -1).join(' ')} <span className="text-green-primary">{lastWord}</span>
          </h1>

          <div className="mt-10 grid gap-8 border-t border-border-subtle pt-8 md:grid-cols-[1fr_auto] md:items-end">
            <p data-reveal className="max-w-xl font-sans text-lg leading-relaxed text-text-secondary md:text-xl">
              {dict.hero.subtitleBody}
            </p>
            <div data-reveal className="flex flex-col gap-3 sm:flex-row">
              <Button href={localize(lang, '/contact')} variant="primary" size="lg">
                {dict.hero.ctaPrimary}
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button href={localize(lang, '/services')} variant="secondary" size="lg">
                {dict.hero.ctaSecondary}
              </Button>
            </div>
          </div>

          <div
            data-reveal
            className="mt-8 flex items-center gap-6 font-mono text-xs uppercase tracking-wider text-text-muted"
          >
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-green-primary" /> {dict.hero.chip1}
            </span>
            <span className="hidden h-px w-12 bg-border-subtle sm:block" />
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-green-primary" /> {dict.hero.chip2}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => document.getElementById('personae')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-6 right-6 text-text-muted transition-colors hover:text-green-primary motion-safe:animate-bounce lg:right-8"
        aria-label={dict.hero.scrollAria}
      >
        <ChevronDown className="h-6 w-6" />
      </button>
    </section>
  );
}
```

- [ ] **Step 2: Vérifier**

```bash
npm run build 2>&1 | tail -20
```
Expected: build OK (si TypeScript signale `titleLine2.slice` sur un tuple `readonly`, c'est autorisé : `slice` existe sur `readonly string[]`).

Chrome 1440 px, recharger `/fr` : pas de flash du titre avant animation ; les lettres montent depuis un masque (~1,5 s) ; la courbe verte se trace à droite ; eyebrow, texte, boutons et puces apparaissent ensuite ; en descendant, le bloc monte et s'estompe. Le titre tient sur au plus 3 lignes à 1440 px et ne touche pas les bords à 390 px (sinon ajuster la borne basse de `clamp(2.6rem, …)`). Vérifier `/en` (« AI automation for ambitious businesses. »). Console sans erreur.

- [ ] **Step 3: Commit**

```bash
git add components/home/Hero.tsx
git commit -m "feat(refonte): hero éditorial (titre révélé, courbe tracée, sortie au scroll), sans ParticleField

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: TrustedBy (bandeau lié au scroll) et MeetTia (onde vocale)

**Files:**
- Rewrite: `components/home/TrustedBy.tsx` (fichier entier)
- Modify: `components/home/MeetTia.tsx` (imports, deux `motion.div`, ajout de `Waveform`)

**Interfaces:**
- Consumes: `useScrollProgress`, `useReveal`, `useAnime` (Task 2).

- [ ] **Step 1: Réécrire `components/home/TrustedBy.tsx`**

```tsx
'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { useScrollProgress } from '@/lib/anim';

const logos = [
  { name: 'IPSSI', src: '/logos/ipssi.png', width: 592, height: 158, scale: 0.85 },
  { name: 'Jean Louis David', src: '/logos/jean-louis-david.png', width: 1913, height: 228, scale: 1.15 },
  { name: 'Privilux Riviera', src: '/logos/privilux-riviera.png', width: 788, height: 567, scale: 1 },
];

const REPEAT = 4;

export function TrustedBy() {
  const lang = useLang();
  const label = lang === 'en' ? 'Trusted by' : 'Ils nous ont fait confiance';
  const trackRef = useRef<HTMLDivElement>(null);

  // Le bandeau avance d'une répétition pendant que la section traverse l'écran
  const sectionRef = useScrollProgress<HTMLElement>(
    (p) => {
      if (trackRef.current) trackRef.current.style.transform = `translate3d(${-(100 / REPEAT) * p}%, 0, 0)`;
    },
    { enter: 'bottom top', leave: 'top bottom', sync: true },
  );

  return (
    <section ref={sectionRef} className="relative border-y border-border-subtle py-12" aria-label={label}>
      <p className="mb-8 text-center font-mono text-xs uppercase tracking-widest text-text-muted">{label}</p>
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div ref={trackRef} className="flex w-max items-center gap-20 will-change-transform">
          {Array.from({ length: REPEAT }).flatMap((_, r) =>
            logos.map((logo) => (
              <div
                key={`${r}-${logo.name}`}
                className="flex h-16 w-36 shrink-0 items-center justify-center md:h-20 md:w-44"
                aria-hidden={r > 0}
              >
                <Image
                  src={logo.src}
                  alt={r === 0 ? logo.name : ''}
                  width={logo.width}
                  height={logo.height}
                  className="h-full w-full object-contain opacity-80 brightness-0 invert"
                  style={{ transform: `scale(${logo.scale})` }}
                />
              </div>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Porter `components/home/MeetTia.tsx`**

1. Remplacer `import { motion, AnimatePresence } from 'framer-motion';` par :
```tsx
import { AnimatePresence } from 'framer-motion';
import { animate, onScroll, stagger } from 'animejs';
import { useAnime, useReveal } from '@/lib/anim';
```
(`AnimatePresence` reste : il gère l'animation de sortie de la modale `TiaCall`, hors périmètre.)

2. Ajouter, au-dessus de `export function MeetTia()` :
```tsx
const BARS = 28;

/** Onde vocale décorative : barres qui respirent en boucle, en pause hors écran. */
function Waveform() {
  const ref = useAnime<SVGSVGElement>((svg) => {
    animate(svg.querySelectorAll('rect'), {
      scaleY: [0.25, 1],
      duration: 700,
      delay: stagger(55, { from: 'center' }),
      ease: 'inOutSine',
      loop: true,
      alternate: true,
      autoplay: onScroll({ target: svg }),
    });
  });
  return (
    <svg ref={ref} viewBox={`0 0 ${BARS * 6} 32`} className="mt-6 h-8 w-44 text-green-primary" aria-hidden="true">
      {Array.from({ length: BARS }).map((_, i) => {
        const h = 8 + Math.round(20 * Math.abs(Math.sin(i * 0.9)));
        return (
          <rect
            key={i}
            x={i * 6}
            y={(32 - h) / 2}
            width={3}
            height={h}
            rx={1.5}
            fill="currentColor"
            opacity={0.35 + 0.65 * Math.abs(Math.sin(i * 0.9))}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        );
      })}
    </svg>
  );
}
```

3. Dans `MeetTia()`, après `const [open, setOpen] = useState(false);`, ajouter :
```tsx
  const revealRef = useReveal<HTMLDivElement>({ stagger: 120 });
```

4. Remplacer le premier bloc :
```tsx
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
```
par `<div ref={revealRef}>` suivi de `<div data-reveal className="text-center">`, et sa fermeture `</motion.div>` par `</div>`.

5. Remplacer le second bloc ouvrant :
```tsx
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative mt-8 overflow-hidden rounded-3xl border border-border-green bg-gradient-to-br from-green-primary/12 via-bg-secondary/70 to-bg-secondary/70 shadow-glow-green"
        >
```
par :
```tsx
        <div
          data-reveal
          className="relative mt-8 overflow-hidden rounded-3xl border border-border-green bg-gradient-to-br from-green-primary/10 via-bg-secondary/70 to-bg-secondary/70"
        >
```
et sa fermeture `</motion.div>` (juste avant `</div>` de `max-w-4xl`) par `</div>` puis une ligne `</div>` supplémentaire qui ferme `revealRef`.

6. Juste après le paragraphe `{t.pitch}` (`</p>`), insérer `<Waveform />`.

7. Dans le bouton « Parler à Tia », remplacer `text-bg-primary shadow-glow-green transition-transform hover:scale-[1.03]` par `text-on-green transition-transform motion-safe:hover:scale-[1.03]`.

Contrôle :
```bash
grep -n "motion\.\|whileInView" components/home/MeetTia.tsx || echo "plus de motion.* dans MeetTia"
```
Expected: `plus de motion.* dans MeetTia`.

- [ ] **Step 3: Vérifier**

```bash
npm run build 2>&1 | tail -20
```
Expected: build OK.

Chrome : le bandeau de logos avance vers la gauche quand on descend, recule quand on remonte, sans saut visible ; les bords sont fondus. La carte Tia apparaît ; l'onde respire en boucle sous le texte ; cliquer « Parler à Tia » ouvre toujours la modale, qui se ferme avec son animation. Mouvement réduit : onde figée, bandeau immobile. Console sans erreur.

- [ ] **Step 4: Commit**

```bash
git add components/home/TrustedBy.tsx components/home/MeetTia.tsx
git commit -m "feat(refonte): bandeau de logos lié au scroll ; onde vocale sur la carte Tia

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: WhatIsAnAgent (métiers, bénéfices, CTA) et About

**Files:**
- Modify: `components/home/WhatIsAnAgent.tsx` (imports ; rendu de la seconde section)
- Rewrite: `components/home/About.tsx` (imports et fonction `About()` ; `TEXT` inchangé)

**Interfaces:**
- Consumes: `useReveal`, `useTextReveal`, `useAnime` (Task 2) ; `AgentObjectSection` déjà rendu (Task 3).

- [ ] **Step 1: Porter la seconde section de `WhatIsAnAgent.tsx`**

1. Remplacer `import { motion, useReducedMotion } from 'framer-motion';` par :
```tsx
import { animate, onScroll } from 'animejs';
import { useAnime, useReveal } from '@/lib/anim';
```
2. Dans `WhatIsAnAgent()`, remplacer `const reduced = useReducedMotion();` par :
```tsx
  const revealRef = useReveal<HTMLDivElement>({ stagger: 140 });
  // Défilement continu des métiers, en pause hors écran
  const marqueeRef = useAnime<HTMLDivElement>((track) => {
    animate(track, { x: ['0%', '-50%'], duration: 24000, ease: 'linear', loop: true, autoplay: onScroll({ target: track }) });
  });
```
3. Remplacer `<div className="mx-auto max-w-6xl">` (dans la seconde section) par `<div ref={revealRef} className="mx-auto max-w-6xl">`.
4. Remplacer chacun des trois blocs ouvrants `<motion.div initial={{ opacity: 0, y: 20 }} whileInView=... viewport=... transition=... className="X">` par `<div data-reveal className="X">` (en gardant la valeur `X` de chaque bloc : `mt-16 border-t border-border-subtle pt-10 text-center`, `mt-16 border-t border-border-subtle pt-10`, `mt-12 flex justify-center`) et leurs fermetures `</motion.div>` par `</div>`.
5. Remplacer le défilé :
```tsx
            <motion.div
              className="flex w-max gap-6 md:gap-8"
              animate={reduced ? {} : { x: ['0%', '-50%'] }}
              transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            >
```
par `<div ref={marqueeRef} className="flex w-max gap-6 md:gap-8">` et sa fermeture `</motion.div>` par `</div>`.

Contrôle :
```bash
grep -n "motion\|useReducedMotion" components/home/WhatIsAnAgent.tsx || echo "WhatIsAnAgent sans framer"
```
Expected: `WhatIsAnAgent sans framer`.

- [ ] **Step 2: Réécrire `About()` dans `components/home/About.tsx`**

Remplacer `import { motion } from 'framer-motion';` par :
```tsx
import { animate } from 'animejs';
import { onceInView, useAnime, useReveal, useTextReveal } from '@/lib/anim';
```

Remplacer la fonction `About()` par :
```tsx
export function About() {
  const t = TEXT[useLang()];
  const titleRef = useTextReveal<HTMLHeadingElement>({ by: 'words' });
  const bodyRef = useReveal<HTMLDivElement>({ stagger: 90, delay: 200 });
  // Photo révélée par un masque qui descend
  const photoRef = useAnime<HTMLDivElement>((el) => {
    el.style.clipPath = 'inset(0 0 100% 0)';
    onceInView(el, () => {
      animate(el, { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'], duration: 900, ease: 'outExpo' });
    });
  });

  return (
    <section id="about" className="relative overflow-hidden px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <span className="eyebrow">{t.eyebrow}</span>
        <h2 ref={titleRef} data-split className="h-section mt-4">
          {t.titleLead}
          <span className="text-green-primary">{t.titleAccent}</span>.
        </h2>

        <div ref={bodyRef}>
          <div className="mt-8 space-y-5 font-sans text-lg leading-relaxed text-text-secondary">
            {t.paragraphs.map((p) => (
              <p key={p} data-reveal>
                {p}
              </p>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {t.values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  data-reveal
                  className="rounded-xl border border-border-subtle bg-bg-secondary/40 p-4 backdrop-blur-md"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-subtle">
                    <Icon className="h-4 w-4 text-green-primary" />
                  </span>
                  <h4 className="mt-3 font-display text-sm font-semibold text-text-primary">{value.title}</h4>
                  <p className="mt-1 font-sans text-xs leading-relaxed text-text-secondary">{value.description}</p>
                </div>
              );
            })}
          </div>

          <div data-reveal className="mt-10">
            <div className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-bg-secondary/60 p-4 backdrop-blur-md">
              <div ref={photoRef} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-border-green">
                <Image
                  src="/andy.jpg"
                  alt="Andy Duval, fondateur d'Herakia"
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: '50% 30%' }}
                />
              </div>
              <div>
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h3 className="font-display text-base font-bold text-text-primary">{t.name}</h3>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-green-primary">{t.role}</span>
                </div>
                <p className="mt-1 font-sans text-sm leading-snug text-text-secondary">« {t.line} »</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```
Note : `useAnime` n'exécute `setup` qu'en mouvement autorisé ; en mouvement réduit, aucun `clipPath` n'est posé et la photo est visible.

- [ ] **Step 3: Vérifier**

```bash
npm run build 2>&1 | tail -20
```
Expected: build OK.

Chrome : sous l'objet, les métiers défilent en continu, puis bénéfices et bouton « Voir un agent en action » apparaissent en cascade. Section About : les mots du titre montent depuis un masque, paragraphes et valeurs suivent en cascade, la photo se dévoile de haut en bas. Console sans erreur.

- [ ] **Step 4: Commit**

```bash
git add components/home/WhatIsAnAgent.tsx components/home/About.tsx
git commit -m "feat(refonte): métiers, bénéfices et À propos portés sur anime.js

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: HowItWorks — fil vert lié au scroll

**Files:**
- Rewrite: `components/home/HowItWorks.tsx` (imports et fonction `HowItWorks()` ; `Step` et `TEXT` inchangés)

**Interfaces:**
- Consumes: `useScrollProgress`, `useReveal`, `prefersReducedMotion`, `useAnime` (Task 2).

- [ ] **Step 1: Réécrire imports et composant**

Remplacer le bloc d'imports `framer-motion` et la ligne `import { useRef, useState } from 'react';` par :
```tsx
import { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { prefersReducedMotion, useReveal, useScrollProgress } from '@/lib/anim';
```
(les imports `lucide-react`, `LucideIcon` et `useLang` restent.)

Remplacer la fonction `HowItWorks()` par :
```tsx
export function HowItWorks() {
  const t = TEXT[useLang()];
  const steps = t.steps;
  const [activeStep, setActiveStep] = useState(0);
  const [reduced, setReduced] = useState(false);
  const threadRef = useRef<SVGLineElement>(null);
  const mobileFillRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headRef = useReveal<HTMLDivElement>();
  const listRef = useReveal<HTMLUListElement>({ stagger: 80 });

  useEffect(() => setReduced(prefersReducedMotion()), []);

  // Desktop : l'étape active et le fil suivent la progression dans la zone épinglée
  const stickyRef = useScrollProgress<HTMLDivElement>(
    (p) => {
      const next = Math.min(Math.floor(p * steps.length), steps.length - 1);
      setActiveStep((prev) => (prev === next ? prev : next));
      if (threadRef.current) threadRef.current.style.strokeDashoffset = String(1 - p);
    },
    { enter: 'top top', leave: 'bottom bottom', sync: true },
  );

  // Mobile : le fil vertical se remplit pendant la lecture de la liste
  const mobileRef = useScrollProgress<HTMLDivElement>(
    (p) => {
      if (mobileFillRef.current) mobileFillRef.current.style.transform = `scaleY(${p})`;
    },
    { enter: 'bottom top', leave: 'center bottom', sync: true },
  );

  // Changement d'étape : la carte remonte en fondu
  useEffect(() => {
    const el = cardRef.current;
    if (!el || prefersReducedMotion()) return;
    const anim = animate(el, { opacity: [0, 1], y: [28, 0], duration: 450, ease: 'outExpo' });
    return () => {
      anim.revert();
    };
  }, [activeStep]);

  const ActiveIcon = steps[activeStep].icon;

  return (
    <section id="process" className="relative">
      <div className="px-6 pb-16 pt-32 lg:px-8">
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
      </div>

      {/* Toujours rendue pour que useScrollProgress trouve l'élément au montage ; masquée en mouvement réduit */}
      <div
        ref={stickyRef}
        className={reduced ? 'hidden' : 'relative hidden md:block'}
        style={{ height: `${steps.length * 100}vh` }}
      >
          <div className="sticky top-0 flex h-screen items-center overflow-hidden">
            <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
              <div className="grid grid-cols-[280px_1fr] gap-16 lg:grid-cols-[320px_1fr] lg:gap-24">
                <div className="relative flex flex-col justify-center">
                  {/* Fil vert : se dessine du haut vers le bas au fil des étapes */}
                  <svg className="absolute bottom-3 left-[35px] top-3 w-px overflow-visible" aria-hidden="true">
                    <line x1="0" y1="0" x2="0" y2="100%" className="stroke-border-subtle" strokeWidth={1} />
                    <line
                      ref={threadRef}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="100%"
                      pathLength={1}
                      strokeDasharray="1"
                      strokeDashoffset="1"
                      className="stroke-green-primary"
                      strokeWidth={2}
                    />
                  </svg>
                  <div className="space-y-1">
                    {steps.map((step, i) => {
                      const Icon = step.icon;
                      const isActive = i === activeStep;
                      const isPast = i < activeStep;
                      return (
                        <div
                          key={step.number}
                          className="relative flex items-center gap-4 rounded-xl px-4 py-3 transition-opacity duration-300"
                          style={{ opacity: isActive ? 1 : isPast ? 0.45 : 0.25 }}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-bg-primary transition-colors duration-300 ${
                              isActive ? 'border-border-green' : 'border-border-subtle'
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 transition-colors duration-300 ${isActive ? 'text-green-primary' : 'text-text-muted'}`}
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="block font-mono text-xs text-text-muted">{step.number}</span>
                            <p
                              className={`truncate font-display text-sm font-semibold transition-colors duration-300 ${
                                isActive ? 'text-text-primary' : 'text-text-secondary'
                              }`}
                            >
                              {step.title}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-8 flex justify-between font-mono text-xs text-text-muted">
                    <span>
                      {t.stepWord} {activeStep + 1} / {steps.length}
                    </span>
                    <span>{Math.round(((activeStep + 1) / steps.length) * 100)} %</span>
                  </div>
                </div>

                <div
                  ref={cardRef}
                  className="relative overflow-hidden rounded-3xl border border-border-green bg-bg-secondary p-12"
                >
                  <span
                    className="pointer-events-none absolute right-8 top-2 select-none font-display text-[9rem] font-bold leading-none text-green-primary/[0.07]"
                    aria-hidden="true"
                  >
                    {steps[activeStep].number}
                  </span>
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border-green bg-bg-elevated">
                      <ActiveIcon className="h-8 w-8 text-green-primary" />
                    </div>
                    <h3 className="mt-8 font-display text-4xl font-bold leading-tight text-text-primary lg:text-5xl">
                      {steps[activeStep].title}
                    </h3>
                    <p className="mt-6 font-sans text-lg leading-relaxed text-text-secondary lg:text-xl">
                      {steps[activeStep].description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

      <div className={reduced ? 'px-6 pb-32 lg:px-8' : 'px-6 pb-32 md:hidden lg:px-8'}>
        <div ref={mobileRef} className="relative mx-auto mt-4 max-w-4xl">
          <div className="absolute left-[31px] top-0 h-full w-px bg-border-subtle" aria-hidden="true">
            <div
              ref={mobileFillRef}
              className="h-full w-full origin-top bg-green-primary"
              style={{ transform: reduced ? 'none' : 'scaleY(0)' }}
            />
          </div>
          <ul ref={listRef} className="space-y-12 md:space-y-20">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.number} data-reveal className="relative flex gap-6 md:gap-10">
                  <div className="relative shrink-0">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border-green bg-bg-elevated">
                      <Icon className="h-7 w-7 text-green-primary" />
                      <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-border-subtle bg-bg-primary font-mono text-xs font-bold text-green-primary">
                        {step.number}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="font-display text-2xl font-bold text-text-primary md:text-3xl">{step.title}</h3>
                    <p className="mt-3 font-sans text-base leading-relaxed text-text-secondary md:text-lg">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Vérifier**

```bash
npm run build 2>&1 | tail -20
grep -n "framer" components/home/HowItWorks.tsx || echo "HowItWorks sans framer"
```
Expected: build OK ; `HowItWorks sans framer`.

Chrome 1440 px : dans « Une méthode éprouvée en 4 étapes », la zone s'épingle ; le fil vert descend le long des 4 étapes au rythme du scroll ; l'étape active change à 25/50/75 % et la carte de droite remonte en fondu à chaque changement ; en remontant, le fil recule. Mobile 390 px : liste en cascade, fil vertical qui se remplit. Mouvement réduit : liste statique, fil plein. Console sans erreur.

- [ ] **Step 3: Commit**

```bash
git add components/home/HowItWorks.tsx
git commit -m "feat(refonte): méthode en 4 étapes avec fil vert lié au scroll

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: CTAFinal et titres de WhatWeHandle

**Files:**
- Rewrite: `components/home/CTAFinal.tsx` (imports et fonction `CTAFinal()` ; `TEXT` inchangé)
- Modify: `components/home/WhatWeHandle.tsx` (classes du bloc titre et halo de fond uniquement)

**Interfaces:**
- Consumes: `useTextReveal`, `useReveal` (Task 2) ; `.h-section`, `.h-display`, `.eyebrow` (Task 1).

- [ ] **Step 1: Réécrire `CTAFinal`**

Remplacer `import { motion, useReducedMotion } from 'framer-motion';` par `import { useReveal, useTextReveal } from '@/lib/anim';`.

Remplacer la fonction `CTAFinal()` par :
```tsx
export function CTAFinal() {
  const lang = useLang();
  const t = TEXT[lang];
  const titleRef = useTextReveal<HTMLHeadingElement>({ by: 'chars' });
  const restRef = useReveal<HTMLDivElement>({ delay: 500, stagger: 110 });

  return (
    <section className="relative overflow-hidden border-y border-border-subtle bg-bg-secondary px-6 py-40 lg:px-8">
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-primary to-transparent"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-5xl text-center">
        <div ref={restRef}>
          <div
            data-reveal
            className="inline-flex items-center gap-2 rounded-full border border-border-green bg-green-subtle px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-green-primary"
          >
            <Calendar className="h-3.5 w-3.5" />
            {t.badge}
          </div>

          <h2 ref={titleRef} data-split className="h-display mt-8 text-[clamp(2.75rem,7vw,7rem)]">
            {t.title}
          </h2>

          <p
            data-reveal
            className="mx-auto mt-8 max-w-2xl font-sans text-lg leading-relaxed text-text-secondary md:text-xl text-balance"
          >
            {t.body}
          </p>

          <div data-reveal className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href={localize(lang, '/contact')} variant="primary" size="lg">
              {t.ctaPrimary}
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button href={localize(lang, '/services')} variant="secondary" size="lg">
              {t.ctaSecondary}
            </Button>
          </div>

          <p data-reveal className="mt-8 font-mono text-xs uppercase tracking-wider text-text-muted">
            {t.footer}
          </p>
        </div>
      </div>
    </section>
  );
}
```
(Retirés : particules flottantes, halo flou, pulsation de la ligne haute — clichés « IA ».)

- [ ] **Step 2: Aligner les titres de `WhatWeHandle.tsx`**

Supprimer le halo de fond :
```tsx
      <div
        className="absolute left-1/2 top-0 -z-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-green-primary/5 blur-[160px]"
        aria-hidden="true"
      />
```
Remplacer `<span className="font-mono text-xs uppercase tracking-widest text-green-primary">` (celui qui affiche `{t.eyebrow}`) par `<span className="eyebrow">`.
Remplacer `className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl lg:text-6xl text-balance"` (le `motion.h2` qui affiche `{t.title}`) par `className="h-section mt-4"`.
Ne rien changer d'autre : les animations Framer de la démo restent.

- [ ] **Step 3: Vérifier**

```bash
npm run build 2>&1 | tail -20
```
Expected: build OK.

Chrome : dans « Vos corvées chronophages, absorbées. », le titre a la nouvelle typo et le badge compteur ne chevauche pas le titre à 1440 px ni à 390 px (sinon ajuster sa position dans `TitleBadge`). La démo fonctionne comme avant (bouton de résolution, animation d'absorption). CTA final : titre révélé lettre par lettre, puis texte et boutons ; plus de particules. Console sans erreur.

- [ ] **Step 4: Commit**

```bash
git add components/home/CTAFinal.tsx components/home/WhatWeHandle.tsx
git commit -m "feat(refonte): CTA final éditorial ; titres de la démo « corvées » à la charte

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Composants partagés sans Framer — Button, Badge, Card, Navbar, Footer

**Files:**
- Rewrite: `components/ui/Button.tsx`, `components/ui/Badge.tsx`, `components/ui/Card.tsx`
- Modify: `components/layout/Navbar.tsx`, `components/layout/Footer.tsx`

**Interfaces:**
- Produces: mêmes props publiques qu'avant pour `Button`, `Badge`, `Card` (aucun appelant à modifier).

- [ ] **Step 1: Réécrire `components/ui/Button.tsx`**

```tsx
import Link from 'next/link';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const variantClasses: Record<Variant, string> = {
  primary: 'bg-green-primary text-on-green font-semibold hover:bg-green-dark',
  secondary: 'bg-transparent text-text-primary border border-border-strong hover:border-green-primary/60 hover:bg-green-subtle',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary',
};

// Micro-interactions sobres : léger enfoncement au clic, l'icône glisse au survol
const base =
  'group inline-flex items-center justify-center gap-2 rounded-full font-medium font-sans transition-[background-color,border-color,color,transform] duration-300 motion-safe:active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:transition-transform [&_svg]:duration-300 motion-safe:group-hover:[&_svg]:translate-x-1';

export function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  className = '',
  ariaLabel,
}: ButtonProps) {
  const classes = `${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} aria-label={ariaLabel} className={classes}>
      {children}
    </button>
  );
}
```
Note : l'ancien `Button` enveloppait les liens dans un `<motion.div className="inline-block">`. Les appelants qui passent `className="w-full"` (menu mobile) obtiennent désormais un lien pleine largeur directement, ce qui est le comportement voulu.

- [ ] **Step 2: Réécrire `components/ui/Badge.tsx`**

```tsx
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  pulse?: boolean;
  variant?: 'default' | 'green';
  className?: string;
}

export function Badge({ children, pulse = false, variant = 'green', className = '' }: BadgeProps) {
  const variantClass =
    variant === 'green'
      ? 'border-border-green bg-green-subtle text-green-primary'
      : 'border-border-subtle bg-bg-elevated text-text-secondary';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-wide ${variantClass} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-primary opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-primary" />
        </span>
      )}
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Réécrire `components/ui/Card.tsx`**

```tsx
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  glow?: boolean;
}

export function Card({ children, className = '', hoverable = false, glow = false }: CardProps) {
  const hoverClass = hoverable ? 'motion-safe:hover:-translate-y-1.5' : '';
  const glowClass = glow ? 'shadow-glow-green-sm hover:shadow-glow-green' : '';
  return (
    <div
      className={`glass-card rounded-2xl p-8 transition-[transform,border-color,box-shadow] duration-300 hover:border-green-primary/30 ${hoverClass} ${glowClass} ${className}`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Porter `components/layout/Navbar.tsx`**

1. Remplacer l'import `framer-motion` et `import { useState } from 'react';` par :
```tsx
import { useEffect, useRef, useState } from 'react';
```
2. Remplacer :
```tsx
  const { scrollY, scrollYProgress } = useScroll();
  const prefersReducedMotion = useReducedMotion();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
  });
```
par :
```tsx
  const progressRef = useRef<HTMLDivElement>(null);

  // Fond au scroll + barre de progression de lecture (une mise à jour par frame)
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 20);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
```
3. Remplacer l'ouverture :
```tsx
      <motion.header
        initial={{ y: prefersReducedMotion ? 0 : -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
```
par :
```tsx
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
```
et la fermeture `</motion.header>` par `</header>`.
4. Remplacer le menu mobile :
```tsx
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-border-subtle bg-bg-primary/95 backdrop-blur-xl lg:hidden"
            >
```
par :
```tsx
        {mobileOpen && (
            <div className="overflow-hidden border-t border-border-subtle bg-bg-primary/95 backdrop-blur-xl lg:hidden">
```
et sa fermeture :
```tsx
            </motion.div>
          )}
        </AnimatePresence>
```
par :
```tsx
            </div>
        )}
```
5. Remplacer la barre de progression :
```tsx
        {!prefersReducedMotion && (
          <motion.div
            className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-green-primary"
            style={{ scaleX: scrollYProgress }}
          />
        )}
```
par :
```tsx
        <div
          ref={progressRef}
          className="absolute bottom-0 left-0 h-px w-full origin-left bg-green-primary"
          style={{ transform: 'scaleX(0)' }}
          aria-hidden="true"
        />
```

Contrôle :
```bash
grep -n "motion\|AnimatePresence\|useScroll" components/layout/Navbar.tsx || echo "Navbar sans framer"
```
Expected: `Navbar sans framer`.

- [ ] **Step 5: Porter `components/layout/Footer.tsx`**

Supprimer la ligne `import { motion, useReducedMotion } from 'framer-motion';` et la ligne `const prefersReducedMotion = useReducedMotion();` (dans le composant). Remplacer :
```tsx
      <motion.div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-primary to-transparent"
        animate={prefersReducedMotion ? {} : { opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-green-primary/5 to-transparent"
        aria-hidden="true"
      />
```
par :
```tsx
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-primary/60 to-transparent"
        aria-hidden="true"
      />
```

Contrôle :
```bash
grep -n "motion\|prefersReducedMotion" components/layout/Footer.tsx || echo "Footer sans framer"
```
Expected: `Footer sans framer`.

- [ ] **Step 6: Vérifier la home et les pages secondaires**

```bash
npm run build 2>&1 | tail -30
```
Expected: build OK, aucune erreur TypeScript.

Chrome, à 1440 px puis 390 px, ouvrir successivement `/fr`, `/fr/contact`, `/fr/demo`, `/fr/faq`, `/fr/offres`, `/fr/services`, `/fr/mentions-legales` :
- boutons en pilule, texte foncé sur le vert, flèche qui glisse au survol, léger enfoncement au clic ;
- navbar : fond flouté après 20 px de scroll, fine barre verte de progression ; menu mobile qui s'ouvre et se ferme, lien « Nous contacter » pleine largeur ;
- aucune mise en page cassée (en particulier les boutons dans les formulaires de `/contact` et les cartes de `/offres`) ;
- console sans erreur.

- [ ] **Step 7: Commit**

```bash
git add components/ui/Button.tsx components/ui/Badge.tsx components/ui/Card.tsx components/layout/Navbar.tsx components/layout/Footer.tsx
git commit -m "feat(refonte): Button, Badge, Card, Navbar et Footer sans Framer Motion, à la charte

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: Ménage et mesures finales

**Files:**
- Delete: `components/home/EmotionalAfter.tsx`, `HowAgentsWork.tsx`, `LiveDemo.tsx`, `LogosBand.tsx`, `PhoneFormField.tsx`, `ProblemSolution.tsx`, `ProductShowcase.tsx`, `Services.tsx`, `ServicesContent.tsx`, `Stats.tsx`, `Storytelling.tsx`, `TechStack.tsx` ; `components/ui/TiaContactForm.tsx`
- Modify: `docs/superpowers/plans/baseline.md` (mesures d'arrivée)

- [ ] **Step 1: Confirmer que ces fichiers ne sont importés nulle part, puis les supprimer**

```bash
for n in EmotionalAfter HowAgentsWork LiveDemo LogosBand PhoneFormField ProblemSolution ProductShowcase Services ServicesContent Stats Storytelling TechStack TiaContactForm; do
  hits=$(grep -rlE "import[^;]*\b$n\b" app components lib | grep -v "/$n.tsx" | wc -l | tr -d ' ')
  echo "$hits $n"
done
```
Expected: `0` devant chaque nom. Si un nom a un compte non nul, NE PAS le supprimer et le signaler.

```bash
git rm components/home/EmotionalAfter.tsx components/home/HowAgentsWork.tsx components/home/LiveDemo.tsx components/home/LogosBand.tsx components/home/PhoneFormField.tsx components/home/ProblemSolution.tsx components/home/ProductShowcase.tsx components/home/Services.tsx components/home/ServicesContent.tsx components/home/Stats.tsx components/home/Storytelling.tsx components/home/TechStack.tsx components/ui/TiaContactForm.tsx
```

- [ ] **Step 2: Repérer les fichiers devenus orphelins**

```bash
for f in components/ui/*.tsx components/home/*.tsx; do
  n=$(basename "$f" .tsx)
  hits=$(grep -rlE "import[^;]*\b$n\b" app components lib | grep -v "/$n.tsx" | wc -l | tr -d ' ')
  [ "$hits" = "0" ] && echo "orphelin : $f"
done
```
Expected (connu) : `components/ui/AgentLoopSchema.tsx` peut apparaître (il n'était importé que par l'ancien `WhatIsAnAgent` et `HowAgentsWork`). Supprimer chaque orphelin listé avec `git rm`, puis relancer la commande jusqu'à ce qu'elle ne liste plus rien. Ne pas toucher `components/home/*` utilisés par les pages secondaires (ils ont des imports, donc n'apparaissent pas).

- [ ] **Step 3: Build et mesures d'arrivée**

```bash
npm run build 2>&1 | tee /tmp/herakia-build-after.txt | grep -E "First Load|/\[lang\]" | head -10
```
Comparer la valeur « First Load JS » de `/[lang]` à celle de `baseline.md`. Expected: au plus +25 kB.

Vérifier que three.js n'est pas dans le chargement initial :
```bash
npx next start -p 3002 &
sleep 5
curl -s http://localhost:3002/fr | grep -o '/_next/static/chunks/[^"]*\.js' | sort -u > /tmp/initial-chunks.txt
for c in $(cat /tmp/initial-chunks.txt); do curl -s "http://localhost:3002$c" | grep -q "WebGLRenderer" && echo "three.js trouvé dans $c"; done; echo "contrôle terminé"
```
Expected: seulement `contrôle terminé` (aucune ligne « three.js trouvé »).

Lighthouse :
```bash
npx -y lighthouse http://localhost:3002/fr --only-categories=performance,accessibility --form-factor=mobile --quiet --chrome-flags="--headless=new" --output=json --output-path=/tmp/lh-after.json
node -e "const r=require('/tmp/lh-after.json');console.log('perf',r.categories.performance.score,'a11y',r.categories.accessibility.score)"
kill %1
```
Expected: performance et accessibilité ≥ valeurs de `baseline.md`. En cas de régression de performance, ouvrir le rapport (`--output=html`) et traiter le premier poste signalé avant de continuer.

Ajouter à `docs/superpowers/plans/baseline.md` :
```markdown

# Mesures d'arrivée (fin de la refonte)

- First Load JS `/[lang]` : <valeur> kB (écart : <±x> kB)
- three.js dans le chargement initial : non
- Lighthouse mobile performance : <score>
- Lighthouse mobile accessibilité : <score>
```

- [ ] **Step 4: Parcours complet**

Chrome, `/fr` puis `/en`, desktop 1440 px puis mobile 390 px, du haut en bas de la page, sans s'arrêter : chaque section a une seule animation signature, rien ne reste invisible, aucun saut de mise en page, l'objet se démonte et se remonte proprement. Répéter en mouvement réduit : tout est lisible et statique. Console sans erreur ni avertissement d'hydratation.

- [ ] **Step 5: Commit**

```bash
git add -A components docs/superpowers/plans/baseline.md
git commit -m "chore(refonte): suppression des composants morts ; mesures avant/après

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Couverture de la spec

| Exigence de la spec | Tâche |
|---|---|
| Mise de côté des modifications en cours | 1 |
| Charte couleurs (tokens, retrait du violet et des halos) | 1 |
| Fond éditorial statique | 1 |
| Échelle typographique | 1 (classes), 2–9 (application) |
| anime.js + hooks `lib/anim` | 2 |
| Hero éditorial, retrait du `ParticleField` | 5 |
| TrustedBy lié au scroll | 6 |
| Personae en cascade | 2 |
| MeetTia + onde | 6 |
| Objet : scène, chorégraphie, rotation, ouverture, cœur | 3 |
| Objet : légendes, phrase finale, liste SSR, mobile, mouvement réduit, sans WebGL, chargement à la demande | 3, 4 |
| Suppression d'`AgentExplainer` et de son HTML | 4 |
| Métiers / bénéfices | 7 |
| WhatWeHandle restylée (Framer conservé) | 9 |
| About (titre par mots, photo par masque) | 7 |
| Avis Google en cascade | 2 |
| HowItWorks : fil lié au scroll | 8 |
| CTAFinal | 9 |
| Navbar / Button / Badge / Card / Footer sans Framer | 10 |
| Ménage des composants morts, `.superpowers/` ignoré | 1, 11 |
| Mesures avant/après, three.js hors chargement initial, Lighthouse | 1, 11 |
