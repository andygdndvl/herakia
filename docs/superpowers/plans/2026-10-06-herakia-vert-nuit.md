# Vert nuit — lumière verte et surfaces douces — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire rayonner le vert Herakia (fond vert nuit, halo tramé dans le hero, nappes vertes) et adoucir les surfaces (hero centré en pastilles, cartes en verre teinté arrondies, bouton qui brille).

**Architecture:** Tout passe par les jetons CSS de `app/globals.css` (`:root`) branchés dans `tailwind.config.ts` ; les rares couleurs de fond écrites en dur sont alignées sur le nouveau jeton. La lumière vit à deux endroits : le fond global fixe (`AmbientBackground`) et un calque décoratif propre au hero. Les surfaces douces passent par `.glass-card` (une seule définition) réutilisée par `Card`, les cartes des chantiers et des personae.

**Tech Stack:** Next.js 14 App Router, Tailwind 3.4, CSS custom properties, React 18. Pas de framework de test dans ce dépôt : la vérification se fait par `tsc`, `next lint`, `next build`, un script de contraste (Node) et des captures Playwright (Chrome installé, `channel: 'chrome'`).

**Spec:** `docs/superpowers/specs/2026-10-06-herakia-vert-nuit-design.md`

## Global Constraints

- `--bg-primary: 6 16 11` (#06100b), `--bg-secondary: 11 24 17`, `--bg-elevated: 17 32 24`, `--tier-tint: 150, 230, 190`.
- Toute couleur de fond écrite en dur doit valoir #06100b (`scene.ts` `BG`, `themeColor`) ; le vignettage = fond − 4 par canal → `rgba(2,12,7,…)`.
- Textes inchangés ; contraste ≥ 4,5:1 pour `text-muted` (138) sur #06100b.
- Le sous-titre du hero reste HORS de la cascade `data-reveal` (LCP).
- Mouvement réduit : la règle globale `prefers-reduced-motion` fige déjà les animations CSS ; le halo du hero est statique.
- Aucune nouvelle dépendance. Couleurs via jetons (`rgb(var(--green-primary) / a)`), sauf le jaune Google `rgb(251 188 4)` déjà en usage.
- Serveur de dev : `npx next dev -p 3010`. `npm run build` casse le `.next` du dev : arrêter le dev → build → `rm -rf .next` → relancer.
- Commits en français, trailer `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

## Review Focus

- **Hero centré à 390 px** : le titre, la ligne des moyens et la pastille d'avis doivent passer à la ligne proprement, sans débordement horizontal — capture 390 × 844 dans la Task 3.
- **Objet 3D sur le nouveau fond** : aucun rectangle ni brouillard noir autour de l'objet (BG de `scene.ts` = fond CSS) — capture vue éclatée dans la Task 1.
- **Pages secondaires** (`/fr/offres`, `/fr/contact`) : lisibles et sans aplat noir résiduel sur le vert — capture dans la Task 5.
- **Mouvement réduit** : halo et nappes visibles mais immobiles, aucune erreur d'hydratation — capture `reducedMotion: 'reduce'` dans la Task 2.
- **Performance** : le `backdrop-filter` de `.glass-card` posé sur les cartes du carrousel et des personae ne doit pas faire chuter Lighthouse mobile sous ≈ 0,85 — mesure dans la Task 5.

---

### Task 1: Jetons vert nuit et couleurs de fond en dur

**Files:**
- Modify: `app/globals.css` (`:root` l. 17-60, commentaire des paliers l. 127-156)
- Modify: `components/agent-object/scene.ts:31`
- Modify: `app/[lang]/layout.tsx:34`
- Modify: `components/layout/AmbientBackground.tsx` (vignettage)
- Modify: `tailwind.config.ts:33` (commentaire des contrastes)
- Create (hors dépôt) : `$SCRATCH/contrast.mjs` (`$SCRATCH` = dossier scratchpad de session)

**Interfaces:**
- Consumes: rien.
- Produces: jetons `--bg-primary` = `6 16 11`, `--bg-secondary` = `11 24 17`, `--bg-elevated` = `17 32 24`, `--tier-tint` = `150, 230, 190` ; constante `BG = 0x06100b` dans `scene.ts`.

- [ ] **Step 1: Écrire le contrôle de contraste (doit échouer sur une valeur trop sombre, passer sur les vraies)**

```js
// $SCRATCH/contrast.mjs — usage : node contrast.mjs "6 16 11"
const lum = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const L = ([r, g, b]) => 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const bg = process.argv[2].split(/[ ,]+/).map(Number);
const texts = { primary: [237, 237, 237], secondary: [160, 160, 160], muted: [138, 138, 138] };
let ok = true;
for (const [k, c] of Object.entries(texts)) {
  const r = ratio(c, bg);
  console.log(k, r.toFixed(2));
  if (r < 4.5) ok = false;
}
process.exit(ok ? 0 : 1);
```

- [ ] **Step 2: Lancer le contrôle sur une valeur volontairement mauvaise puis sur la cible**

Run: `node $SCRATCH/contrast.mjs "90 90 90"` → Expected: exit 1 (muted < 4,5).
Run: `node $SCRATCH/contrast.mjs "6 16 11"` → Expected: exit 0, muted ≈ 5,6, secondary ≈ 7,4, primary ≈ 16.

- [ ] **Step 3: Changer les jetons dans `:root`**

Dans `app/globals.css`, remplacer le bloc des fonds et le ton des paliers :

```css
  /* Fonds — vert nuit (2026-10-06, spec vert-nuit). Le vert de la marque doit
     rayonner : le fond lui-même en prend la teinte, très sombre. Contrastes
     mesurés sur #06100b : texte 16:1, secondaire 7,4:1, discret 5,6:1. */
  --bg-primary: 6 16 11;
  --bg-secondary: 11 24 17;
  --bg-elevated: 17 32 24;
```

```css
  --tier-tint: 150, 230, 190;
```

Mettre à jour le commentaire des paliers (l. 127-156) : remplacer `#0c0c0b` par `#06100b`, `(12,12,11)` par `(6,16,11)`, `(8,8,7)` par `(2,12,7)`, `#111110` par `#0a150f`, `#161615` par `#0d1b14`, `+5/+5/+5` par `+4/+5/+5`, `+10/+10/+10` par `+7/+11/+9`, et la phrase sur le ton : « Le ton est teinté vert depuis le passage au vert nuit : un voile gris aurait grisé les sections. »

- [ ] **Step 4: Aligner les couleurs en dur**

`components/agent-object/scene.ts:31` :
```ts
const BG = 0x06100b; // --bg-primary: 6 16 11
```
`app/[lang]/layout.tsx:34` :
```ts
  themeColor: '#06100b',
```
`components/layout/AmbientBackground.tsx`, dans le dégradé de vignettage, remplacer les deux `rgba(8,8,7,` par `rgba(2,12,7,` et le commentaire par :
```ts
            // Noir du vignettage = `--bg-primary` moins 4 par canal : même
            // amplitude, même teinte que le fond qu'il assombrit.
```
`tailwind.config.ts:33` :
```ts
        // Textes (contrastes sur #06100b : 16:1, 7,4:1, 5,6:1)
```

- [ ] **Step 5: Vérifier — types, lint, objet 3D sur le nouveau fond**

Run: `npx tsc --noEmit -p . && npx next lint`
Expected: aucune erreur.

Capture de la vue éclatée (serveur dev sur 3010) :
```js
// $SCRATCH/eclate.mjs
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:3010/fr', { waitUntil: 'networkidle', timeout: 120000 });
await p.waitForTimeout(5000);
await p.evaluate(() => { const s = document.querySelector('section[aria-labelledby=agent-title]'); const top = s.getBoundingClientRect().top + scrollY; window.scrollTo({ top: top + (s.offsetHeight - innerHeight) * 0.8, behavior: 'instant' }); });
await p.waitForTimeout(7000);
await p.screenshot({ path: 'shots/vn-eclate.png' });
await b.close();
```
Run: `cd $SCRATCH && node eclate.mjs` puis lire `shots/vn-eclate.png`.
Expected: fond vert nuit uniforme derrière l'objet, aucun rectangle ni halo noir autour des pièces.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css components/agent-object/scene.ts "app/[lang]/layout.tsx" components/layout/AmbientBackground.tsx tailwind.config.ts
git commit -m "charte : fond vert nuit (#06100b), paliers et vignettage reteintés, scène 3D alignée"
```

---

### Task 2: Lumière — nappes vertes et halo tramé du hero

**Files:**
- Modify: `components/layout/AmbientBackground.tsx` (tableau `POOLS`)
- Modify: `components/home/Hero.tsx` (ajout d'un calque décoratif)

**Interfaces:**
- Consumes: jetons de la Task 1 (`--green-primary`).
- Produces: un calque `<div aria-hidden data-hero-halo>` premier enfant de la `<section>` du hero (la Task 3 garde ce calque intact).

- [ ] **Step 1: Recolorer et renforcer les nappes**

Dans `AmbientBackground.tsx`, remplacer les trois `background` de `POOLS` et leurs commentaires :

```ts
  // Grande nappe verte, en haut à droite : la source principale.
  {
    className: 'left-[42%] top-[-34%] h-[80vh] w-[70vw] animate-[studio-drift-1_38s_ease-in-out_infinite_alternate]',
    background: 'radial-gradient(closest-side, rgb(var(--green-primary) / 0.12), transparent)',
  },
  // Nappe verte au milieu à gauche.
  {
    className: 'left-[-12%] top-[30%] h-[65vh] w-[55vw] animate-[studio-drift-2_46s_ease-in-out_infinite_alternate]',
    background: 'radial-gradient(closest-side, rgb(var(--green-primary) / 0.09), transparent)',
  },
  // Petite nappe jaune très discrète, en bas à droite : rappel des étoiles Google.
  {
    className: 'left-[70%] top-[55%] h-[55vh] w-[40vw] animate-[studio-drift-3_52s_ease-in-out_infinite_alternate]',
    background: 'radial-gradient(closest-side, rgb(251 188 4 / 0.06), transparent)',
  },
```

Mettre à jour la doc du composant : « Lumière verte : trois nappes dérivent sous le grain… ».

- [ ] **Step 2: Ajouter le halo tramé dans le hero**

Dans `Hero.tsx`, juste après l'ouverture de `<section …>` et avant `<div ref={innerRef} …>` :

```tsx
      {/* Halo du hero (spec vert-nuit) : un grand halo vert et une trame de points lumineux,
          dense derrière le titre, éteinte vers les bords. Statique, pur CSS ; il défile avec le
          hero, contrairement aux nappes du fond global qui restent fixes. */}
      <div aria-hidden="true" data-hero-halo className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-[-60px] h-[800px] w-[1300px] max-w-none -translate-x-1/2"
          style={{
            background:
              'radial-gradient(closest-side, rgb(var(--green-primary) / 0.26), rgb(var(--green-primary) / 0.08) 60%, transparent)',
          }}
        />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'radial-gradient(rgb(var(--green-primary) / 0.55) 1px, transparent 1.4px)',
            backgroundSize: '14px 14px',
            maskImage: 'radial-gradient(ellipse 55% 46% at 50% 42%, #000, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 55% 46% at 50% 42%, #000, transparent 80%)',
          }}
        />
      </div>
```

- [ ] **Step 3: Vérifier — lint, capture normale et en mouvement réduit**

Run: `npx tsc --noEmit -p . && npx next lint` → Expected: aucune erreur.

```js
// $SCRATCH/vn-hero.mjs
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h, tag, rm] of [[1440, 900, 'd', 'no-preference'], [390, 844, 'm', 'no-preference'], [1440, 900, 'rm', 'reduce']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, reducedMotion: rm });
  const errs = []; p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:3010/fr', { waitUntil: 'networkidle', timeout: 120000 });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: `shots/vn-hero-${tag}.png` });
  console.log(tag, errs.length ? errs : 'console propre');
}
await b.close();
```
Run: `cd $SCRATCH && node vn-hero.mjs` et lire les trois PNG.
Expected: halo vert tramé derrière le titre dans les trois cas ; `rm` identique visuellement, « console propre » partout.

- [ ] **Step 4: Commit**

```bash
git add components/layout/AmbientBackground.tsx components/home/Hero.tsx
git commit -m "lumière : nappes vertes (+ rappel jaune) et halo tramé de points dans le hero"
```

---

### Task 3: Hero centré, surtitre et avis en pastilles

**Files:**
- Modify: `app/globals.css` (`@layer components` : nouvelle classe `.eyebrow-pill`)
- Modify: `components/home/Hero.tsx` (mise en page du contenu)
- Modify: `components/home/HeroProof.tsx` (pastille)

**Interfaces:**
- Consumes: calque `data-hero-halo` de la Task 2 (ne pas le déplacer).
- Produces: classe CSS `.eyebrow-pill`.

- [ ] **Step 1: Ajouter `.eyebrow-pill`**

Dans `app/globals.css`, dans `@layer components`, après `.eyebrow` :

```css
  /* Surtitre en pastille (hero) : fond et filet verts, point lumineux. */
  .eyebrow-pill {
    @apply inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em];
    color: rgb(var(--green-primary));
    background: rgb(var(--green-primary) / 0.08);
    border: 1px solid rgb(var(--green-primary) / 0.22);
  }
  .eyebrow-pill::before {
    content: '';
    @apply h-1.5 w-1.5 rounded-full;
    background: rgb(var(--green-primary));
    box-shadow: 0 0 10px rgb(var(--green-primary));
  }
```

- [ ] **Step 2: Centrer le hero**

Dans `Hero.tsx` :
1. `<section … className="relative flex min-h-screen items-end overflow-hidden px-6 pb-16 pt-32 lg:px-8">` → `items-center`.
2. `<div ref={innerRef} className="relative z-10 mx-auto w-full max-w-7xl">` → `"relative z-10 mx-auto w-full max-w-7xl text-center"`.
3. Le surtitre :
```tsx
          <p data-reveal className="eyebrow-pill">
            {dict.hero.badge}
          </p>
```
4. Le `<h1>` : ajouter `mx-auto max-w-6xl` à sa `className` (le reste inchangé).
5. Remplacer le bloc `<div className="mt-10 grid gap-8 border-t border-border-subtle pt-8 md:grid-cols-[1fr_auto] md:items-end"> … </div>` par :
```tsx
          <div className="mt-8 flex flex-col items-center gap-8">
            {/* Hors de la cascade : c'est le plus grand bloc de texte de l'écran d'accueil, donc
                l'élément LCP. Affiché d'emblée, il est peint avec la page. */}
            <p className="mx-auto max-w-xl font-sans text-lg leading-relaxed text-text-secondary md:text-xl">
              {dict.hero.subtitleBody}
            </p>
            <div data-reveal className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button href={localize(lang, '/contact')} variant="primary" size="lg">
                {dict.hero.ctaPrimary}
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button href={localize(lang, '/services')} variant="secondary" size="lg">
                {dict.hero.ctaSecondary}
              </Button>
            </div>
          </div>
```
6. Bloc des engagements : `className="mt-6 flex items-center gap-6 …"` → ajouter `justify-center`.

- [ ] **Step 3: HeroProof en pastille centrée**

Dans `HeroProof.tsx`, remplacer le conteneur racine et sa structure :

```tsx
    <div
      className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-3xl border border-border-subtle bg-white/[0.03] px-4 py-2.5 sm:rounded-full"
      aria-label={hero.proofAria}
      role="group"
    >
      <span className="flex items-center gap-2">
        <GoogleG className="h-4 w-4" />
        {/* Jaune des étoiles Google (#FBBC04), pas le vert de la charte : à côté du « G »,
            c'est la note telle qu'on la voit sur Google qui fait foi. */}
        <span className="flex gap-[3px]" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-[#FBBC04] text-[#FBBC04]" />
          ))}
        </span>
        <span className="font-mono text-xs uppercase tracking-wider text-text-muted">{hero.proofRating}</span>
      </span>
      <figure className="m-0 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5">
        <blockquote className="m-0 font-sans text-sm text-text-secondary">
          {/* CONSERVER TELLES QUELLES le commentaire et la ligne de citation existants : les
              espaces autour de {hero.proofQuote} sont des U+00A0, ne pas les recopier à la main. */}
        </blockquote>
        <figcaption className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
          {hero.proofAuthor}
        </figcaption>
      </figure>
    </div>
```
Ne modifier dans le `<blockquote>` que sa `className` (retrait de `md:text-base`) ; son contenu actuel reste. Mettre à jour la doc du composant : « pastille centrée ».

- [ ] **Step 4: Vérifier à 1440 et 390**

Run: `npx tsc --noEmit -p . && npx next lint` → aucune erreur.
Run: `cd $SCRATCH && node vn-hero.mjs` et lire `shots/vn-hero-d.png` et `shots/vn-hero-m.png`.
Expected: tout centré ; à 390 px aucun débordement horizontal (vérifier aussi `document.documentElement.scrollWidth === 390` :
```js
// ajouter dans vn-hero.mjs pour tag 'm' :
console.log('scrollWidth', await p.evaluate(() => document.documentElement.scrollWidth));
```
Expected: `scrollWidth 390`), la pastille d'avis passe sur deux lignes proprement.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css components/home/Hero.tsx components/home/HeroProof.tsx
git commit -m "hero : composition centrée, surtitre et note Google en pastilles"
```

---

### Task 4: Surfaces douces — verre teinté, arrondis, bouton qui brille

**Files:**
- Modify: `app/globals.css` (`--glass-bg`, `.glass-card`)
- Modify: `tailwind.config.ts` (`boxShadow.action`, `boxShadow['action-hover']`, commentaire du bouton)
- Modify: `components/ui/Button.tsx` (variante `primary`, transition)
- Modify: `components/ui/Card.tsx` (arrondi)
- Modify: `components/home/Chantiers.tsx:223` (carte du carrousel)
- Modify: `components/home/Personae.tsx:127` (`<article>`)
- Modify: `components/home/VideoPitch.tsx:100` (cadre du film)

**Interfaces:**
- Consumes: jetons de la Task 1.
- Produces: classes Tailwind `shadow-action`, `shadow-action-hover` ; `.glass-card` = verre teinté vert.

- [ ] **Step 1: Verre teinté**

`app/globals.css`, dans `:root` :
```css
  /* Verre teinté des cartes .glass-card : un dégradé vertical vert, plus dense en haut. */
  --glass-bg: linear-gradient(180deg, rgb(var(--green-primary) / 0.08), rgb(var(--green-primary) / 0.02));
  --glass-border: rgb(var(--green-primary) / 0.16);
```
`.glass-card` :
```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
}
```
Dans `.surface-light` (l. ~227), ajouter à côté de `--glass-bg: #ffffff;` : `--glass-border: var(--border-subtle);`.

- [ ] **Step 2: Lueur du bouton d'action**

`tailwind.config.ts`, dans `boxShadow` :
```ts
        // Lueur du bouton d'action (spec vert-nuit) : le vert rayonne sous le bouton.
        action: '0 10px 40px -4px rgba(var(--green-primary-legacy), 0.7)',
        'action-hover': '0 12px 46px -2px rgba(var(--green-primary-legacy), 0.8)',
```
Remplacer dans le commentaire de `backgroundImage.action` la phrase « Aucune ombre, aucun halo — le relief vient de la seule pente. » par « La lueur, elle, est portée par `shadow-action` (spec vert-nuit). »

`components/ui/Button.tsx` :
```ts
  primary: 'bg-green-primary bg-action text-on-green font-semibold shadow-action hover:bg-action-hover hover:shadow-action-hover',
```
et dans la chaîne `base`, `transition-[background-color,background-image,border-color,color,transform]` → `transition-[background-color,background-image,border-color,color,transform,box-shadow]`.

- [ ] **Step 3: Arrondis et cartes**

- `components/ui/Card.tsx` : `glass-card rounded-2xl p-8` → `glass-card rounded-3xl p-8`.
- `components/home/Chantiers.tsx:223` : dans la classe de `<li>`, `overflow-hidden rounded border border-border-subtle` → `overflow-hidden glass-card rounded-3xl`.
- `components/home/Personae.tsx:127` : `rounded-2xl border border-border-subtle bg-bg-secondary/60 backdrop-blur-md` → `glass-card rounded-3xl`.
- `components/home/VideoPitch.tsx:100` : `rounded-2xl border border-border-subtle bg-bg-secondary` → `rounded-[28px] border border-green-primary/15 bg-bg-secondary`.

- [ ] **Step 4: Vérifier**

Run: `npx tsc --noEmit -p . && npx next lint` → aucune erreur.
Run: `grep -n "shadow-action" components/ui/Button.tsx` → Expected: une ligne.
Capture des sections (dev sur 3010) :
```js
// $SCRATCH/vn-sections.mjs
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
await p.goto('http://localhost:3010/fr', { waitUntil: 'networkidle', timeout: 120000 });
await p.waitForTimeout(3000);
for (const sel of ['section[aria-labelledby=chantiers-title]', '#personae', 'section[aria-label] video']) {
  const el = await p.$(sel); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
  await p.screenshot({ path: `shots/vn-${sel.replace(/[^a-z]/gi, '').slice(0, 20)}.png` });
}
await b.close();
```
Run: `cd $SCRATCH && node vn-sections.mjs` et lire les PNG.
Expected: cartes chantiers et personae en verre teinté vert, arrondi 24 px ; film arrondi 28 px ; boutons primaires avec lueur verte.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css tailwind.config.ts components/ui/Button.tsx components/ui/Card.tsx components/home/Chantiers.tsx components/home/Personae.tsx components/home/VideoPitch.tsx
git commit -m "surfaces : verre teinté vert, grands arrondis, lueur du bouton d'action"
```

---

### Task 5: Vérification d'ensemble, mesures, mise en ligne de la préview

**Files:**
- Modify: `docs/superpowers/plans/baseline.md` (ajout d'une section de mesures)

**Interfaces:**
- Consumes: tout ce qui précède.
- Produces: mesures consignées, branche poussée.

- [ ] **Step 1: Parcours complet + pages secondaires**

```js
// $SCRATCH/vn-parcours.mjs
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const [w, h, tag] of [[1440, 900, 'd'], [390, 844, 'm']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('http://localhost:3010/fr', { waitUntil: 'networkidle', timeout: 120000 });
  await p.waitForTimeout(4000);
  const H = await p.evaluate(() => document.body.scrollHeight);
  for (let i = 0; i < 8; i++) {
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round((H - h) * i / 7));
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `shots/vn-parcours-${tag}-${i}.png` });
  }
  for (const path of ['/fr/offres', '/fr/contact']) {
    await p.goto('http://localhost:3010' + path, { waitUntil: 'networkidle', timeout: 120000 });
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `shots/vn${path.replace(/\//g, '-')}-${tag}.png` });
  }
}
await b.close();
```
Run: `cd $SCRATCH && node vn-parcours.mjs`, lire toutes les captures.
Expected: aucune section en aplat noir résiduel, textes lisibles, pas de « tout vert » écrasant (sinon baisser les alphas des nappes globales en premier, cf. spec « Risques »).

- [ ] **Step 2: Contrastes**

Run: `node $SCRATCH/contrast.mjs "6 16 11"` → exit 0. Run aussi sur les paliers : `node $SCRATCH/contrast.mjs "10 21 15"` et `"13 27 20"` → exit 0.

- [ ] **Step 3: Build et Lighthouse mobile**

```bash
lsof -tiTCP:3010 -sTCP:LISTEN | xargs -r kill
npm run build
npx next start -p 3020   # en arrière-plan
cd $SCRATCH && for r in 1 2 3; do npx lighthouse http://localhost:3020/fr --only-categories=performance,accessibility --output=json --output-path=lh-vn-$r.json --chrome-flags="--headless=new" --quiet; done
```
Expected: build OK ; médiane performance ≥ 0,85 (référence 0,88), accessibilité 0,98.
Puis : arrêter le port 3020, `rm -rf .next`, relancer `npx next dev -p 3010`.

- [ ] **Step 4: Consigner les mesures**

Ajouter à `docs/superpowers/plans/baseline.md` :
```markdown

# Vert nuit (2026-10-06)

- Lighthouse mobile performance : <médiane> (3 runs : <r1>, <r2>, <r3>)
- Lighthouse mobile accessibilité : <a11y>
- Contrastes sur #06100b : texte <p>:1 · secondaire <s>:1 · discret <m>:1
```
(Remplacer chaque `<…>` par la valeur mesurée aux Steps 2-3 — aucune valeur ne reste entre chevrons.)

- [ ] **Step 5: Commit et push**

```bash
git add docs/superpowers/plans/baseline.md
git commit -m "docs(mesures): vert nuit — Lighthouse et contrastes"
git push
```
Expected: push sur `refonte-visuelle`, préview Vercel reconstruite (vérifier `vercel ls` → Ready).
