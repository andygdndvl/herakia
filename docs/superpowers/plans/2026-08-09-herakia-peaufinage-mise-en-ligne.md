# Herakia — Peaufinage et mise en ligne : plan d'implémentation

> **Pour les agents :** SOUS-SKILL REQUISE : utiliser superpowers:subagent-driven-development (recommandé) ou superpowers:executing-plans pour dérouler ce plan tâche par tâche. Les étapes utilisent la syntaxe case à cocher (`- [ ]`).

**Objectif :** rendre le site Herakia présentable et le mettre en ligne sur `herakia.com`, avec un formulaire de contact qui fonctionne réellement.

**Architecture :** site Next.js 14 App Router déjà en place, i18n FR/EN par segment `app/[lang]/`. Le travail consiste à retirer des sections de la home, porter deux `<iframe>` vers du React natif, corriger des textes et des espacements, puis brancher GitHub → Vercel → domaine. Aucun changement d'architecture.

**Stack :** Next.js 14.2, React 18, TypeScript 5.6, Tailwind CSS 3.4, Framer Motion 11, lucide-react, Resend (API contact), ElevenLabs (agent vocal), Vercel.

Spec de référence : `docs/superpowers/specs/2026-08-09-herakia-peaufinage-mise-en-ligne-design.md`

**Déjà fait :** le §3.1 de la spec (versioning) est réalisé. Le dépôt a été
initialisé et l'état de départ committé avant toute modification — commit
`232ba13 Initial commit — état du site Herakia avant peaufinage`. C'est le point
de retour si une tâche tourne mal : `git diff 232ba13 -- <fichier>` montre tout
ce qui a changé depuis. Il reste à publier ce dépôt sur GitHub (Tâche 10).

## Contraintes globales

- **Marque : « Herakia »**, jamais « Onyxia ». « onyxia » n'est que le nom du dossier local et de l'ancien projet Vercel.
- **Domaine canonique : `https://herakia.com`**, sans slash final. Déjà acheté.
- **Tout texte visible existe en FR et en EN.** Chaque composant porte son propre objet `const TEXT = { fr: {...}, en: {...} } as const` et lit la langue via `useLang()` (`@/components/i18n/LangProvider`). Ne jamais ajouter un texte dans une seule langue.
- **Tokens Tailwind uniquement** : `bg-primary`, `bg-secondary`, `bg-elevated`, `green-primary`, `green-dark`, `text-primary`, `text-secondary`, `text-muted`, `border-subtle`, `border-green`. Jamais `bg-white` ni `bg-gray-*`.
- **Polices** : `font-display` (Syne) pour les titres, `font-sans` (DM Sans) pour le corps, `font-mono` (JetBrains Mono) pour les labels. Chargées par `next/font`, jamais par CDN.
- **Toute animation respecte `useReducedMotion()`** de Framer Motion, comme le reste du code.
- **Aucun test automatisé n'existe sur ce projet** et le périmètre ne s'y prête pas. Le cycle de vérification de chaque tâche est : `npm run lint`, `npm run build`, puis capture d'écran comparée. Ne jamais commiter sans avoir lancé les deux commandes.
- **Le serveur de dev tourne sur le port 3001** (le 3000 est pris par un autre projet). Vérifier avec `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/fr` avant toute capture.

## Outil de vérification visuelle

Un script Playwright est déjà installé hors du repo, pour ne pas ajouter de dépendance lourde à un site vitrine :

```
/private/tmp/claude-501/-Users-andy/75b1804c-9cfd-4b18-8e3d-5ffce0608d41/scratchpad/
├── shot.mjs      # 3 pages × desktop 1440 + mobile 390, pleine hauteur
├── slices.mjs    # home desktop découpée en écrans de 850 px
└── mob.mjs       # home mobile, 8 positions de scroll + test de débordement
```

Lancement : `cd <scratchpad> && node slices.mjs`. Les scripts utilisent le Chrome installé sur la machine (`channel: 'chrome'`), pas un navigateur téléchargé.

**Mesures de départ, à comparer après chaque tâche :**

| Mesure | Valeur initiale |
|---|---|
| Hauteur home desktop (1440 px) | 16 561 px |
| Hauteur home mobile (390 px) | 23 943 px |
| Débordement horizontal mobile | aucun (`scrollWidth` = `innerWidth` = 390) |
| Pages générées au build | 18 |

---

## Structure des fichiers

**Modifiés :**

| Fichier | Responsabilité après modification |
|---|---|
| `app/[lang]/page.tsx` | Ordonnancement des 14 composants de la home |
| `app/[lang]/layout.tsx` | Metadata, JSON-LD, hreflang dépendant du chemin |
| `app/layout.tsx` *(si absent, voir Tâche 8)* | Injection de `<Analytics />` |
| `app/sitemap.ts` | 9 URLs au lieu de 6 |
| `components/home/WhatIsAnAgent.tsx` | Section complète en React, sans iframe |
| `components/ui/AgentLoopSchema.tsx` | Schéma perçoit/décide/agit + aperçu par phase |
| `components/home/Services.tsx` | Descriptions FR/EN non redondantes |
| `components/home/WhatWeHandle.tsx` | Badge de notifications qui ne chevauche plus le titre |
| `components/home/Hero.tsx` | Palier typographique H1 sous 400 px |
| `README.md` | Documentation à jour |

**Supprimés :** `components/home/HeroScene.tsx`, `components/home/MeetTia.tsx`, `components/home/AgentExplainer.tsx`, `components/home/LogosBand.tsx`, `components/home/Storytelling.tsx`, `components/home/HowItWorks.tsx`, `components/home/HowAgentsWork.tsx`, `components/home/ProblemSolution.tsx`, `components/home/LiveDemo.tsx`, `components/ui/Card.tsx`, `public/hero-scene.html`, `public/herakia-agent-explicatif.html`, `PERSONNALISATION.md`, `SEO-TODO.md`.

**Créé :** `ETAT-DES-LIEUX.md` (remplace les deux documents périmés).

---

## Tâche 1 : Restructurer la home

**Fichiers :**
- Modifier : `app/[lang]/page.tsx`

**Interfaces :**
- Consomme : les composants existants de `components/home/`, tous exportés en nommé (`export function Hero()`, etc.).
- Produit : une home de 14 composants dans l'ordre validé. Les tâches suivantes s'appuient sur le fait que `HeroScene` et `MeetTia` ne sont plus rendus.

`InlineCTA` accepte une prop `variant` valant `'scoping' | 'demo' | 'build'`. On ne garde que `demo`.

- [ ] **Étape 1 : Mesurer l'état de départ**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/fr
cd /private/tmp/claude-501/-Users-andy/75b1804c-9cfd-4b18-8e3d-5ffce0608d41/scratchpad && node slices.mjs
```

Attendu : `200`, puis `height 16561`. Noter la valeur.

- [ ] **Étape 2 : Réécrire `app/[lang]/page.tsx`**

```tsx
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { Personae } from '@/components/home/Personae';
import { WhatWeHandle } from '@/components/home/WhatWeHandle';
import { WhatIsAnAgent } from '@/components/home/WhatIsAnAgent';
import { AgentDemos } from '@/components/home/AgentDemos';
import { InlineCTA } from '@/components/home/InlineCTA';
import { Services } from '@/components/home/Services';
import { ProductShowcase } from '@/components/home/ProductShowcase';
import { EmotionalAfter } from '@/components/home/EmotionalAfter';
import { Stats } from '@/components/home/Stats';
import { About } from '@/components/home/About';
import { TechStack } from '@/components/home/TechStack';
import { FAQ } from '@/components/home/FAQ';
import { CTAFinal } from '@/components/home/CTAFinal';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Personae />
        <WhatWeHandle />
        <WhatIsAnAgent />
        <AgentDemos />
        <InlineCTA variant="demo" />
        <Services />
        <ProductShowcase />
        <EmotionalAfter />
        <Stats />
        <About />
        <TechStack />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Étape 3 : Vérifier**

```bash
cd /Users/andy/onyxia && npm run lint && npm run build
```

Attendu : aucune erreur, 18 pages générées. `HeroScene` et `MeetTia` ne sont plus importés mais existent encore — ils seront supprimés en Tâche 6, pas maintenant, pour garder les tâches indépendantes.

- [ ] **Étape 4 : Mesurer le gain**

```bash
cd /private/tmp/claude-501/-Users-andy/75b1804c-9cfd-4b18-8e3d-5ffce0608d41/scratchpad && node slices.mjs
```

Attendu : hauteur nettement inférieure à 16 561 px. Consigner la nouvelle valeur.

- [ ] **Étape 5 : Commit**

```bash
cd /Users/andy/onyxia
git add app/\[lang\]/page.tsx
git commit -m "refactor(home): retirer les doublons HeroScene et MeetTia, ne garder qu'un InlineCTA"
```

---

## Tâche 2 : Porter « Qu'est-ce qu'un agent IA ? » en React

**Fichiers :**
- Modifier : `components/ui/AgentLoopSchema.tsx`
- Modifier : `components/home/WhatIsAnAgent.tsx:101-109`

**Interfaces :**
- Consomme : `AgentPhase` (`{ icon: LucideIcon; label: string; desc: string }`) déjà exporté par `components/ui/AgentLoopSchema.tsx:7-11`, et `AgentLoopSchema({ phases, loopLabel })` déjà écrit mais jamais rendu.
- Produit : `AgentPhase` gagne un champ optionnel `preview?: { app: string; title: string; meta: string }`. `WhatIsAnAgent` rend l'intro et le schéma sans iframe.

Contexte : `WhatIsAnAgent` porte déjà tous les textes FR/EN nécessaires (`eyebrow`, `title`, `body`, `highlight`, `phases`, `loopLabel`) mais ne les affiche pas — il délègue tout à `<AgentExplainer />`, un iframe. Le contenu textuel existe donc déjà, il n'y a rien à rédiger.

- [ ] **Étape 1 : Étendre `AgentPhase` avec un aperçu optionnel**

Dans `components/ui/AgentLoopSchema.tsx`, remplacer l'interface :

```tsx
export interface AgentPhase {
  icon: LucideIcon;
  label: string;
  desc: string;
  preview?: { app: string; title: string; meta: string };
}
```

- [ ] **Étape 2 : Afficher l'aperçu dans le schéma**

Dans `AgentLoopSchema`, à l'intérieur du `<div className="pt-1">`, après le `<p>` qui rend `phase.desc`, ajouter :

```tsx
{phase.preview && (
  <div className="mt-3 flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-elevated/60 px-3 py-2.5">
    <span className="font-mono text-[10px] uppercase tracking-wider text-green-primary">
      {phase.preview.app}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate font-sans text-sm font-medium text-text-primary">
        {phase.preview.title}
      </span>
      <span className="block truncate font-sans text-xs text-text-muted">
        {phase.preview.meta}
      </span>
    </span>
  </div>
)}
```

Chaque phase porte désormais son propre aperçu : les étapes ne s'alignent plus sur la hauteur de la première, ce qui supprime les cartes à moitié vides.

- [ ] **Étape 3 : Donner un aperçu à chacune des trois phases, FR et EN**

Dans `components/home/WhatIsAnAgent.tsx`, remplacer les tableaux `phases` :

```tsx
// fr
phases: [
  { icon: Eye, label: 'Perçoit', desc: 'Un email, une demande, un événement arrive.',
    preview: { app: 'Gmail', title: 'Facture #1902 impayée', meta: 'Client relancé une fois · 15 j de retard' } },
  { icon: Brain, label: 'Décide', desc: 'Il analyse le contexte et applique vos règles.',
    preview: { app: 'Règle', title: 'Retard > 14 j → relance ferme', meta: 'Ton adapté · copie au commercial' } },
  { icon: Zap, label: 'Agit', desc: 'Il répond, met à jour le CRM, planifie — dans vos outils.',
    preview: { app: 'HubSpot', title: 'Relance envoyée, fiche mise à jour', meta: 'Rappel programmé dans 5 jours' } },
] as AgentPhase[],
```

```tsx
// en
phases: [
  { icon: Eye, label: 'Perceives', desc: 'An email, a request, an event comes in.',
    preview: { app: 'Gmail', title: 'Invoice #1902 unpaid', meta: 'Chased once · 15 days overdue' } },
  { icon: Brain, label: 'Decides', desc: 'It reads the context and applies your rules.',
    preview: { app: 'Rule', title: 'Overdue > 14 days → firm follow-up', meta: 'Tone adjusted · sales rep in copy' } },
  { icon: Zap, label: 'Acts', desc: 'It replies, updates the CRM, schedules — in your tools.',
    preview: { app: 'HubSpot', title: 'Follow-up sent, record updated', meta: 'Reminder set for 5 days' } },
] as AgentPhase[],
```

- [ ] **Étape 4 : Remplacer l'iframe par le rendu React**

Dans `components/home/WhatIsAnAgent.tsx`, supprimer l'import `import { AgentExplainer } from '@/components/home/AgentExplainer';`, ajouter `AgentLoopSchema` à l'import existant de `@/components/ui/AgentLoopSchema` :

```tsx
import { AgentLoopSchema, type AgentPhase } from '@/components/ui/AgentLoopSchema';
```

puis remplacer `<AgentExplainer />` (ligne 108) par :

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-80px' }}
  transition={{ duration: 0.6 }}
>
  <span className="font-mono text-xs uppercase tracking-widest text-green-primary">
    {t.eyebrow}
  </span>
  <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl text-balance">
    {t.title}
  </h2>
  <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-text-secondary">
    {t.body}{' '}
    <strong className="font-semibold text-text-primary">{t.highlight}</strong>
  </p>
  <div className="mt-10">
    <AgentLoopSchema phases={t.phases} loopLabel={t.loopLabel} />
  </div>
</motion.div>
```

L'import de type `import { type AgentPhase } from '@/components/ui/AgentLoopSchema';` en ligne 21 est remplacé par l'import combiné ci-dessus : ne pas laisser les deux.

- [ ] **Étape 5 : Vérifier que le contenu est bien dans le HTML servi**

```bash
cd /Users/andy/onyxia && npm run lint && npm run build
curl -s http://localhost:3001/fr | grep -c "Qu&#x2019;est-ce qu&#x2019;un agent IA"
```

Attendu : lint et build sans erreur, et le `grep -c` renvoie au moins `1`. C'est le point de la tâche : ce texte était auparavant invisible pour les moteurs de recherche car enfermé dans un iframe. Si le compte est `0`, essayer `curl -s http://localhost:3001/fr | grep -o "agent IA ?" | head -1` — l'apostrophe typographique peut être encodée autrement.

- [ ] **Étape 6 : Capture de contrôle**

```bash
cd /private/tmp/claude-501/-Users-andy/75b1804c-9cfd-4b18-8e3d-5ffce0608d41/scratchpad && node slices.mjs
```

Vérifier sur les tranches que la section n'a plus de vide au-dessus et que les trois étapes portent chacune un aperçu.

- [ ] **Étape 7 : Commit**

```bash
cd /Users/andy/onyxia
git add components/ui/AgentLoopSchema.tsx components/home/WhatIsAnAgent.tsx
git commit -m "feat(seo): porter la section « agent IA » de l'iframe vers React

Le contenu le plus pédagogique du site était enfermé dans un iframe HTML
statique, donc invisible pour les moteurs. Il est désormais rendu en React,
indexable, et chaque étape porte son propre aperçu — ce qui supprime les
cartes à moitié vides."
```

---

## Tâche 3 : Corriger les descriptions dupliquées de Services

**Fichiers :**
- Modifier : `components/home/Services.tsx:23-29` (FR) et `:44-50` (EN)

**Interfaces :**
- Consomme : rien des tâches précédentes.
- Produit : rien pour les suivantes.

Les entrées 3 et 5 du tableau `blurbs` recopient leur `title`. Les `blurbs` sont rendus avec la classe `truncate` (`Services.tsx:120`), donc **une seule ligne** : rester court, sous 60 caractères.

| Index | Titre | Description actuelle | Nouvelle description |
|---|---|---|---|
| 2 | Vos clients répondus, 24/7 | Vos clients répondus 24/7, vos données chez vous. | Branché sur vos canaux, il connaît vos offres. |
| 4 | On chiffre le gain avant que vous signiez | On chiffre le gain avant que vous signiez. | Audit, heures récupérées chiffrées, feuille de route. |

- [ ] **Étape 1 : Corriger le tableau FR**

Dans `components/home/Services.tsx`, remplacer le tableau `blurbs` de la section `fr` :

```tsx
blurbs: [
  'Vos outils reliés, le répétitif en pilote automatique.',
  'La capacité d’un collaborateur, sans le recrutement.',
  'Branché sur vos canaux, il connaît vos offres.',
  'Des données fiables, des décisions au clair.',
  'Audit, heures récupérées chiffrées, feuille de route.',
],
```

- [ ] **Étape 2 : Corriger le tableau EN**

```tsx
blurbs: [
  'Your tools connected, the repetitive work on autopilot.',
  'The capacity of a hire, without the recruiting.',
  'Plugged into your channels, it knows your offer.',
  'Reliable data, clear decisions.',
  'Audit, hours recovered quantified, roadmap.',
],
```

- [ ] **Étape 3 : Vérifier qu'aucune description ne répète son titre**

```bash
cd /Users/andy/onyxia && npm run lint && npm run build
```

Puis relire les deux tableaux : aucune entrée de `blurbs` ne doit reprendre les mots de l'entrée `services[i].title` de même index.

- [ ] **Étape 4 : Commit**

```bash
cd /Users/andy/onyxia
git add components/home/Services.tsx
git commit -m "fix(contenu): deux descriptions de Services recopiaient leur titre (FR et EN)"
```

---

## Tâche 4 : Badge de notifications et H1 mobile

**Fichiers :**
- Modifier : `components/home/WhatWeHandle.tsx:246`
- Modifier : `components/home/Hero.tsx:174`

**Interfaces :**
- Consomme : rien. Produit : rien.

Deux défauts visuels indépendants, regroupés parce qu'ils se vérifient sur la même capture mobile.

**Défaut 1** — dans `WhatWeHandle`, `TitleBadge` est un `inline-flex` posé après le titre avec `md:-top-7`, soit 28 px de remontée. Sur trois lignes de titre, le badge se retrouve à cheval sur la ligne précédente et masque le mot « chronophages, ».

**Défaut 2** — dans `Hero`, le H1 démarre à `text-5xl` (48 px). Sur un écran de 390 px, le mot « Automatisation » occupe toute la largeur disponible et touche les deux bords.

- [ ] **Étape 1 : Réduire la remontée du badge**

Dans `components/home/WhatWeHandle.tsx:246`, remplacer `-top-4` par `-top-2` et `md:-top-7` par `md:-top-3`. La classe complète devient :

```tsx
className="relative -top-2 ml-2.5 inline-flex h-10 min-w-[3rem] items-center justify-center rounded-full bg-red-500 px-3 align-top font-sans text-lg font-bold tabular-nums text-white shadow-[0_6px_20px_rgba(239,68,68,0.6)] md:-top-3 md:h-14 md:min-w-[4.2rem] md:px-4 md:text-2xl"
```

- [ ] **Étape 2 : Ajouter un palier typographique au H1**

Dans `components/home/Hero.tsx:174`, remplacer `text-5xl` par `text-[2.5rem] sm:text-5xl`. La classe complète devient :

```tsx
className="mt-8 font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight text-text-primary sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-balance"
```

- [ ] **Étape 3 : Vérifier**

```bash
cd /Users/andy/onyxia && npm run lint && npm run build
cd /private/tmp/claude-501/-Users-andy/75b1804c-9cfd-4b18-8e3d-5ffce0608d41/scratchpad && node mob.mjs && node slices.mjs
```

Attendu : `overflow {"doc":390,"win":390}` (aucun débordement). Ouvrir `m-00.png` : le H1 doit avoir une marge visible de chaque côté. Ouvrir la tranche qui contient « Vos corvées chronophages » : le badge rouge ne doit plus recouvrir de texte.

- [ ] **Étape 4 : Commit**

```bash
cd /Users/andy/onyxia
git add components/home/WhatWeHandle.tsx components/home/Hero.tsx
git commit -m "fix(ui): badge de notifications qui masquait le titre, et H1 collé aux bords en mobile"
```

---

## Tâche 5 : Harmoniser le rythme vertical

**Fichiers :**
- Modifier : les composants de `components/home/` dont le padding de section s'écarte de la valeur retenue.

**Interfaces :**
- Consomme : la home restructurée de la Tâche 1. Produit : rien.

Des trous de 300 à 500 px apparaissent entre certaines sections, dus au cumul du padding de section et d'une marge interne sur le dernier enfant.

- [ ] **Étape 1 : Relever les paddings de section existants**

```bash
cd /Users/andy/onyxia && grep -n "className=\"relative\|<section" components/home/*.tsx | grep -o "py-[0-9]*" | sort | uniq -c | sort -rn
```

Cela donne la valeur majoritaire. La retenir comme référence — ne pas en inventer une nouvelle.

- [ ] **Étape 2 : Aligner les sections qui s'en écartent**

Pour chaque composant rendu par la home dont le `<section>` porte un `py-` différent de la référence, l'aligner. `WhatIsAnAgent` utilise `py-32` (`WhatIsAnAgent.tsx:106`) là où la majorité utilise `py-24` : c'est un des écarts à corriger.

Ne pas toucher aux composants qui ne sont pas rendus par la home.

- [ ] **Étape 3 : Supprimer les marges qui se cumulent avec le padding**

Repérer les derniers enfants de section portant une marge basse (`mb-*`) qui s'ajoute au `py-` du parent, et la retirer. Le padding de section doit être la seule source d'espacement entre deux sections.

- [ ] **Étape 4 : Vérifier**

```bash
cd /Users/andy/onyxia && npm run lint && npm run build
cd /private/tmp/claude-501/-Users-andy/75b1804c-9cfd-4b18-8e3d-5ffce0608d41/scratchpad && node slices.mjs
```

Parcourir les tranches : aucun écran ne doit être vide ou quasi vide. Consigner la hauteur finale de la home — l'objectif de la spec est d'environ 10 000 px en desktop.

- [ ] **Étape 5 : Commit**

```bash
cd /Users/andy/onyxia
git add components/home/
git commit -m "style: rythme vertical unifié entre les sections de la home"
```

---

## Tâche 6 : Supprimer le code mort

**Fichiers :**
- Supprimer : 10 composants et 2 fichiers HTML (liste ci-dessous)

**Interfaces :**
- Consomme : les Tâches 1 et 2, qui ont retiré les dernières références à ces fichiers. **Ne pas lancer cette tâche avant que les deux soient terminées.**
- Produit : rien.

- [ ] **Étape 1 : Confirmer que chaque fichier est bien orphelin**

```bash
cd /Users/andy/onyxia
for n in HeroScene MeetTia AgentExplainer LogosBand Storytelling HowItWorks HowAgentsWork ProblemSolution LiveDemo Card; do
  echo "$n -> $(grep -rl --include='*.tsx' "\b$n\b" app components | grep -v "/$n.tsx$" | tr '\n' ' ')"
done
```

Attendu : chaque ligne se termine après la flèche, sans aucun fichier listé. Si un nom remonte une référence, **ne pas le supprimer** et signaler l'écart.

- [ ] **Étape 2 : Supprimer les fichiers**

```bash
cd /Users/andy/onyxia
git rm components/home/HeroScene.tsx components/home/MeetTia.tsx \
       components/home/AgentExplainer.tsx components/home/LogosBand.tsx \
       components/home/Storytelling.tsx components/home/HowItWorks.tsx \
       components/home/HowAgentsWork.tsx components/home/ProblemSolution.tsx \
       components/home/LiveDemo.tsx components/ui/Card.tsx \
       public/hero-scene.html public/herakia-agent-explicatif.html
```

Aucune image de `public/` n'est concernée : les deux fichiers HTML n'utilisent que des logos en data-URI, et toutes les images du dossier sont référencées par un composant conservé.

- [ ] **Étape 3 : Vérifier**

```bash
cd /Users/andy/onyxia && npm run lint && npm run build
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/fr
```

Attendu : build sans erreur, 18 pages, `200`.

- [ ] **Étape 4 : Commit**

```bash
cd /Users/andy/onyxia
git commit -m "chore: supprimer 10 composants morts et les 2 fichiers HTML des anciens iframes"
```

---

## Tâche 7 : Corriger le hreflang et compléter le sitemap

**Fichiers :**
- Modifier : `app/[lang]/layout.tsx:95-102`
- Modifier : `app/sitemap.ts:5`

**Interfaces :**
- Consomme : rien. Produit : rien.

`generateMetadata` déclare `alternates.languages` en dur sur `/fr` et `/en`. Comme cette metadata est héritée par tout le segment `[lang]`, la page `/fr/services` annonce `/fr` et `/en` comme versions alternatives — c'est faux, et cela envoie les moteurs vers la mauvaise page.

Next.js ne donne pas le chemin courant à `generateMetadata`. La correction consiste donc à déplacer les alternates spécifiques dans chaque page, et à ne garder dans le layout que celles de la home.

- [ ] **Étape 1 : Vérifier le comportement actuel**

```bash
curl -s http://localhost:3001/fr/services | grep -o '<link rel="alternate"[^>]*>'
```

Attendu : des `hreflang` pointant vers `/fr` et `/en` sans `/services` — c'est le défaut à corriger.

- [ ] **Étape 2 : Ajouter les alternates dans chaque page interne**

Dans `app/[lang]/services/page.tsx`, `app/[lang]/contact/page.tsx`, `app/[lang]/cgu/page.tsx`, `app/[lang]/confidentialite/page.tsx` et `app/[lang]/mentions-legales/page.tsx`, la `metadata` (ou `generateMetadata`) de chaque page doit déclarer ses propres alternates. Pour `/services` :

```tsx
alternates: {
  canonical: `/${lang}/services`,
  languages: {
    fr: '/fr/services',
    en: '/en/services',
    'x-default': '/fr/services',
  },
},
```

Adapter le segment pour chacune des quatre autres pages. Si une page exporte une `metadata` statique sans accès à `lang`, la convertir en `generateMetadata({ params })` en suivant le motif déjà utilisé dans `app/[lang]/layout.tsx:41-46`.

- [ ] **Étape 3 : Ajouter les pages légales au sitemap**

Dans `app/sitemap.ts:5` :

```ts
const paths = [
  '',
  '/services',
  '/contact',
  '/mentions-legales',
  '/confidentialite',
  '/cgu',
] as const;
```

La `priority` est calculée à partir de `path === ''`, donc les pages légales héritent de `0.9`. Les redescendre à `0.3` en remplaçant la ligne `priority` par :

```ts
priority: path === '' ? 1 : path === '/services' || path === '/contact' ? 0.9 : 0.3,
```

- [ ] **Étape 4 : Vérifier**

```bash
cd /Users/andy/onyxia && npm run lint && npm run build
curl -s http://localhost:3001/fr/services | grep -o '<link rel="alternate"[^>]*>'
curl -s http://localhost:3001/sitemap.xml | grep -c "<url>"
```

Attendu : les alternates de `/fr/services` contiennent bien `/services`, et le sitemap compte `12` entrées (6 chemins × 2 langues).

- [ ] **Étape 5 : Commit**

```bash
cd /Users/andy/onyxia
git add app/
git commit -m "fix(seo): hreflang par page et pages légales dans le sitemap"
```

---

## Tâche 8 : Brancher Vercel Analytics

**Fichiers :**
- Modifier : `package.json`
- Modifier : `app/[lang]/layout.tsx`

**Interfaces :**
- Consomme : rien. Produit : rien.

Analytics sans cookie : aucun bandeau de consentement n'est à construire.

- [ ] **Étape 1 : Installer le paquet**

```bash
cd /Users/andy/onyxia && npm install @vercel/analytics
```

- [ ] **Étape 2 : Injecter le composant**

Ce projet n'a pas de `app/layout.tsx` racine : la balise `<html>` est produite par `app/[lang]/layout.tsx`. Y ajouter l'import :

```tsx
import { Analytics } from '@vercel/analytics/react';
```

puis rendre `<Analytics />` juste avant la fermeture de `</body>`, après `{children}`.

- [ ] **Étape 3 : Vérifier**

```bash
cd /Users/andy/onyxia && npm run lint && npm run build
```

Attendu : build sans erreur. En local, le script d'analytics ne remonte rien — c'est normal, il ne s'active qu'une fois déployé sur Vercel. La vérification réelle se fait en Tâche 11.

- [ ] **Étape 4 : Commit**

```bash
cd /Users/andy/onyxia
git add package.json package-lock.json app/\[lang\]/layout.tsx
git commit -m "feat: brancher Vercel Analytics (sans cookie)"
```

---

## Tâche 9 : Remettre la documentation à jour

**Fichiers :**
- Modifier : `README.md`
- Créer : `ETAT-DES-LIEUX.md`
- Supprimer : `PERSONNALISATION.md`, `SEO-TODO.md`

**Interfaces :**
- Consomme : toutes les tâches précédentes. Produit : rien.

Les trois documents actuels décrivent un site qui n'existe plus : ils annoncent des témoignages clients, des logos fictifs, des pages légales manquantes et un formulaire simulé par `setTimeout` — tout cela a été traité depuis. Un document faux est pire que pas de document.

- [ ] **Étape 1 : Corriger les affirmations fausses du README**

Reprendre `README.md` pour qu'il décrive le site réel : chemin `~/onyxia` (et non `~/herakia`), architecture `app/[lang]/` avec i18n FR/EN et middleware de détection, liste réelle des composants de la home après restructuration, variables d'environnement réellement lues par le code (`RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `NEXT_PUBLIC_ELEVENLABS_TIYA_AGENT_ID`), port de dev 3001. Supprimer l'avertissement sur le formulaire simulé : la route API existe.

- [ ] **Étape 2 : Écrire `ETAT-DES-LIEUX.md`**

Un seul document qui remplace les deux autres, avec : ce qui est réellement en place, ce qui reste à faire côté contenu (logos clients réels, témoignages si un jour disponibles), et la suite SEO reportée après le lancement (pages `/services/*`, pages secteurs, `/tarifs`, blog). Reprendre depuis `SEO-TODO.md` uniquement les éléments encore valables.

- [ ] **Étape 3 : Supprimer les documents périmés**

```bash
cd /Users/andy/onyxia && git rm PERSONNALISATION.md SEO-TODO.md
```

- [ ] **Étape 4 : Vérifier**

Relire `README.md` et `ETAT-DES-LIEUX.md` en vérifiant chaque affirmation contre le code. Aucune ne doit décrire un fichier supprimé en Tâche 6.

- [ ] **Étape 5 : Commit**

```bash
cd /Users/andy/onyxia
git add README.md ETAT-DES-LIEUX.md
git commit -m "docs: documentation alignée sur le site réel"
```

---

## Tâche 10 : Publier sur GitHub et déployer sur Vercel

**Fichiers :** aucun fichier source modifié.

**Interfaces :**
- Consomme : toutes les tâches précédentes commitées.
- Produit : une URL `*.vercel.app` en ligne, dont dépendent les Tâches 11 et 12.

Cette tâche demande des actions de l'utilisateur : ne rien créer à sa place sans son accord explicite.

- [ ] **Étape 1 : Vérifier que rien de sensible ne partira sur GitHub**

```bash
cd /Users/andy/onyxia && git status --short && git ls-files | grep -E "\.env" || echo "aucun .env versionné"
```

Attendu : `aucun .env versionné`. `.gitignore` couvre déjà `.env*.local`, `.env` et `.vercel`.

- [ ] **Étape 2 : Créer le repo privé**

```bash
cd /Users/andy/onyxia && gh repo create herakia --private --source=. --remote=origin --push
```

Si `gh` n'est pas authentifié, demander à l'utilisateur de lancer `! gh auth login` dans la session.

- [ ] **Étape 3 : Créer le projet Vercel et déployer**

L'ancien projet Vercel `onyxia` n'existe plus sur le compte (seul `ipssi-hub` subsiste). Importer le nouveau repo depuis [vercel.com/new](https://vercel.com/new) : Next.js est détecté automatiquement, aucune configuration de build n'est nécessaire.

Le fichier `.vercel/project.json` local pointe encore vers le projet supprimé (`prj_qTs0SGrd8BC6mDz1NwVy4dgLE087`) : le supprimer avant tout usage de la CLI, sinon elle tentera de déployer vers un projet inexistant.

```bash
cd /Users/andy/onyxia && rm -rf .vercel
```

- [ ] **Étape 4 : Déclarer la variable de l'agent vocal**

Sans `NEXT_PUBLIC_ELEVENLABS_TIYA_AGENT_ID`, la modale « Parler à Tia » affiche « bientôt » au lieu de lancer l'appel. Reprendre la valeur depuis `.env.local` et la déclarer sur Vercel pour les trois environnements.

- [ ] **Étape 5 : Vérifier le déploiement**

Ouvrir l'URL `*.vercel.app` et contrôler : la home en FR et en EN, `/services`, `/contact`, les trois pages légales, le bouton « Parler à Tia ».

- [ ] **Étape 6 : Consigner l'URL**

Noter l'URL de production pour les tâches suivantes. Aucun commit — cette tâche ne modifie pas le code.

---

## Tâche 11 : Rendre le formulaire de contact fonctionnel

**Fichiers :** aucun fichier source modifié — `app/api/contact/route.ts` est déjà écrit.

**Interfaces :**
- Consomme : le déploiement de la Tâche 10.
- Produit : un formulaire qui délivre réellement les leads.

C'est le point le plus important de la mise en ligne : en l'état, `RESEND_API_KEY` est absente et **tout message envoyé par un visiteur est perdu**.

- [ ] **Étape 1 : Relire ce que le code attend**

```bash
cd /Users/andy/onyxia && sed -n '50,95p' app/api/contact/route.ts
```

Le code lit `RESEND_API_KEY`, `CONTACT_TO_EMAIL` (défaut `contact@herakia.com`) et `CONTACT_FROM_EMAIL` (défaut `Herakia <onboarding@resend.dev>`).

- [ ] **Étape 2 : Obtenir une clé API Resend**

Demander à l'utilisateur de créer un compte sur [resend.com](https://resend.com) et de générer une clé API. Ne jamais écrire cette clé dans un fichier versionné.

- [ ] **Étape 3 : Déclarer les variables sur Vercel**

`RESEND_API_KEY`, `CONTACT_TO_EMAIL` et `CONTACT_FROM_EMAIL` sur les trois environnements. Tant que le domaine n'est pas vérifié chez Resend, laisser `CONTACT_FROM_EMAIL` sur `Herakia <onboarding@resend.dev>` — un expéditeur non vérifié fait échouer l'envoi.

- [ ] **Étape 4 : Vérifier le domaine chez Resend**

Dans Resend, ajouter le domaine `herakia.com` et créer les enregistrements DNS demandés (DKIM et SPF). Une fois vérifié, basculer `CONTACT_FROM_EMAIL` sur `Herakia <contact@herakia.com>` et redéployer.

- [ ] **Étape 5 : Envoyer un vrai message de test**

Depuis `/fr/contact` en production, envoyer un message et confirmer sa réception dans la boîte `CONTACT_TO_EMAIL`. Répéter depuis `/en/contact`.

Si rien n'arrive : consulter les logs de la fonction dans Vercel — la cause la plus fréquente est un expéditeur sur un domaine non vérifié.

- [ ] **Étape 6 : Consigner le résultat**

Ne pas déclarer le formulaire opérationnel sans avoir reçu le message de test. Aucun commit.

---

## Tâche 12 : Domaine, référencement et contrôle final

**Fichiers :** aucun fichier source modifié.

**Interfaces :**
- Consomme : les Tâches 10 et 11.
- Produit : le site en ligne sur `herakia.com`.

- [ ] **Étape 1 : Rattacher le domaine**

Dans Vercel, ajouter `herakia.com` et `www.herakia.com` au projet, avec redirection de `www` vers l'apex. Créer les enregistrements DNS indiqués par Vercel chez le registrar. HTTPS est automatique.

- [ ] **Étape 2 : Vérifier que le domaine canonique répond**

```bash
curl -sI https://herakia.com/ | head -3
curl -sI https://www.herakia.com/ | head -5
curl -s https://herakia.com/robots.txt
curl -s https://herakia.com/sitemap.xml | grep -c "<url>"
```

Attendu : la home redirige vers `/fr` ou `/en` selon l'en-tête `Accept-Language` (comportement du middleware), `www` redirige vers l'apex, `robots.txt` cite `https://herakia.com/sitemap.xml`, et le sitemap compte 12 entrées.

- [ ] **Étape 3 : Google Search Console**

Créer la propriété `herakia.com`, la vérifier par enregistrement DNS TXT, puis soumettre `https://herakia.com/sitemap.xml`. Bing Webmaster Tools en option.

- [ ] **Étape 4 : Contrôle Lighthouse**

Auditer `https://herakia.com/fr` sur [pagespeed.web.dev](https://pagespeed.web.dev/). Consigner les quatre scores. La suppression des deux iframes et l'allègement de la home doivent se voir sur le LCP. Signaler tout score sous 90 sans le corriger dans cette tâche : ce serait un chantier distinct.

- [ ] **Étape 5 : Revue finale des deux langues**

Parcourir en production : home, `/services`, `/contact`, les trois pages légales, en FR et en EN. Vérifier le sélecteur de langue, le formulaire, l'agent vocal, et l'absence de mention « Onyxia ».

```bash
curl -s https://herakia.com/fr | grep -ci "onyxia"
```

Attendu : `0`.

- [ ] **Étape 6 : Vérifier que les analytics remontent**

Après quelques visites, confirmer que l'onglet Analytics du projet Vercel affiche des pages vues.

---

## Ordre d'exécution

Les Tâches 1 à 9 sont locales et peuvent s'enchaîner sans intervention extérieure. **La Tâche 6 exige que les Tâches 1 et 2 soient terminées.** Les Tâches 10 à 12 sont séquentielles et demandent des actions de l'utilisateur (compte GitHub, compte Resend, accès DNS).

## Critère d'achèvement

Le travail est terminé quand : `npm run lint` et `npm run build` passent, la home tient sous ~10 000 px en desktop sans écran vide, aucun débordement horizontal en mobile, le site répond sur `https://herakia.com` dans les deux langues, **un message de test envoyé depuis le formulaire de production a été reçu**, et le sitemap est soumis à Search Console.
