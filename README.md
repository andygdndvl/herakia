# Herakia — Site vitrine

Site vitrine de **Herakia**, agence spécialisée en automatisation IA et solutions
intelligence artificielle sur mesure.

Stack : Next.js 14 (App Router), Framer Motion, Tailwind CSS, TypeScript.

---

## Installation

```bash
cd ~/herakia
npm install
```

## Lancement en local

```bash
npm run dev
```

Le site est disponible sur [http://localhost:3000](http://localhost:3000).

## Build production

```bash
npm run build
npm run start
```

## Lint

```bash
npm run lint
```

---

## Déploiement Vercel

Le projet est prêt pour un déploiement Vercel sans configuration supplémentaire :

1. Pousser le code sur un repo Git (GitHub, GitLab, Bitbucket)
2. Importer le repo dans [vercel.com/new](https://vercel.com/new)
3. Vercel détecte automatiquement Next.js
4. Configurer le domaine personnalisé `herakia.com` (DNS A → 76.76.21.21)
5. Build & deploy

Aucune variable d'environnement n'est requise pour la version actuelle.

> ⚠️ Le formulaire de contact (`/contact`) simule l'envoi avec un `setTimeout`.
> Avant la mise en production, brancher une route API ou un service externe
> (Resend, Formspree, SendGrid…). Voir `components/home/ContactContent.tsx`,
> fonction `handleSubmit`.

---

## Structure du projet

```
herakia/
├── app/
│   ├── layout.tsx             # Metadata globale + JSON-LD + fonts
│   ├── page.tsx               # Home (11 sections)
│   ├── services/page.tsx      # Page services détaillée
│   ├── contact/page.tsx       # Page contact + formulaire
│   ├── sitemap.ts             # Sitemap dynamique
│   ├── robots.ts              # robots.txt
│   └── globals.css            # Variables CSS + reset
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx         # Nav sticky avec blur
│   │   └── Footer.tsx         # Footer avec liens et réseaux
│   ├── home/
│   │   ├── Hero.tsx           # Canvas particules + grille animée
│   │   ├── LogosBand.tsx      # Marquee infini Framer Motion
│   │   ├── ProblemSolution.tsx
│   │   ├── Services.tsx       # 5 cards 3D au hover
│   │   ├── Storytelling.tsx   # Simulation interactive (cockpit)
│   │   ├── HowItWorks.tsx     # Timeline SVG path animé
│   │   ├── Stats.tsx          # Compteurs avec useSpring
│   │   ├── Testimonials.tsx   # Carrousel avec drag
│   │   ├── TechStack.tsx      # Grille de technos
│   │   ├── FAQ.tsx            # Accordéon AnimatePresence
│   │   ├── CTAFinal.tsx       # CTA full-width avec particules
│   │   ├── ServicesContent.tsx # Contenu de /services
│   │   └── ContactContent.tsx # Contenu de /contact (formulaire)
│   └── ui/
│       ├── Button.tsx         # Bouton réutilisable
│       ├── Card.tsx           # Card glassmorphisme
│       └── Badge.tsx          # Badge avec point pulsant
├── lib/
│   └── animations.ts          # Variants Framer Motion réutilisables
├── public/
│   ├── andy.jpg               # Photo du fondateur
│   ├── logo.png
│   ├── favicon_herakia.png
│   └── og-image.placeholder.txt # ⚠️ à remplacer par og-image.jpg
└── tailwind.config.ts         # Tokens charte Herakia
```

---

## Charte graphique

| Token | Valeur | Usage |
|---|---|---|
| `bg-primary` | `#0a0a0a` | Fond principal |
| `bg-secondary` | `#111111` | Sections alternées, cards |
| `bg-elevated` | `#1a1a1a` | Inputs, hover states |
| `green-primary` | `#3ecf8e` | CTA, accents forts |
| `green-dark` | `#2a9e6a` | Hover des CTA |
| `text-primary` | `#f0f0f0` | Titres |
| `text-secondary` | `#a0a0a0` | Corps de texte |
| `text-muted` | `#555555` | Labels, métadonnées |

Polices : **Syne** (titres), **DM Sans** (corps), **JetBrains Mono** (code/labels).

Toutes chargées via `next/font/google` (pas de CDN externe).

---

## Animations

- **Toutes** les animations sont en Framer Motion (zéro CSS keyframes custom).
- `useReducedMotion()` est implémenté dans chaque composant animé.
- Les variants partagés sont dans `lib/animations.ts`.
- Particules Hero : `requestAnimationFrame` sur canvas 2D.
- Timeline `/process` : `useScroll` + `useTransform` sur `pathLength`.

---

## SEO

- `generateMetadata` global dans `app/layout.tsx`
- JSON-LD Organization + WebSite + FAQPage dans le `<head>`
- `app/sitemap.ts` génère `/sitemap.xml`
- `app/robots.ts` génère `/robots.txt`
- Voir `SEO-TODO.md` pour la suite (Search Console, backlinks, contenu blog…)

---

## Personnalisation

Voir `PERSONNALISATION.md` pour la liste prioritaire des contenus à adapter
avant la mise en production.
