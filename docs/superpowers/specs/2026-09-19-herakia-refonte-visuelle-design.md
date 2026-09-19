# Herakia — Refonte visuelle « éditorial noir »

Date : 2026-09-19
Statut : en relecture

## Contexte

Le site vitrine Herakia (Next.js 14 App Router, Tailwind 3, React 18,
Framer Motion 11, i18n FR/EN via `app/[lang]/`) est en ligne et complet
fonctionnellement. Il doit devenir **la vitrine de l'entreprise** : le rendu
actuel est propre mais sage, et doit gagner en énergie et en caractère.

Contrainte directrice : **premium, léger, sans superflu**. Aucun effet ne doit
donner l'impression d'un site « vibecodé » : pas d'empilement d'effets, pas
d'imagerie IA cliché (robots, cerveaux lumineux, néons).

Point de départ : le dernier commit de `main` (`69c8833`). Les modifications
non commitées présentes au démarrage (fond à halos, `ScrambleText`, retouches
About / FAQ / Stats / WhatIsAnAgent…) sont mises de côté dans un `git stash`,
pas supprimées.

## Objectif

Refondre l'identité visuelle et le mouvement de la page d'accueil autour d'une
direction « éditorial noir » et d'une pièce maîtresse unique : un **agent
Herakia représenté comme un objet mécanique au trait, qui se déconstruit au
scroll** pour expliquer ce qu'est un agent IA.

Critère de réussite : un visiteur comprend ce que fait Herakia et ce qu'est un
agent en parcourant la home, et garde en tête un moment visuel marquant — sans
que la page soit plus lente qu'aujourd'hui.

## Hors périmètre

- **Contenu éditorial** : les 10 sections et leurs textes sont conservés. On
  refait le visuel, pas le propos. Seuls les libellés de l'objet sont nouveaux.
- **Stack** : pas de montée de version (Next 16, React 19, Tailwind 4). La stack
  actuelle couvre tous les besoins.
- **Pages secondaires** (`/contact`, `/demo`, `/faq`, `/offres`, `/services`,
  `/services/[id]`, pages légales, `/admin`) : elles héritent de la nouvelle
  charte et des composants partagés (Navbar, Footer, Button, Badge), mais leur
  mise en page et leurs animations ne sont pas retravaillées.
- **Suppression complète de Framer Motion** : les pages secondaires l'utilisent
  encore (via `ContactContent`, `AgentDemos`, `OffresList`, `ServicesList`, les
  démos d'agents…). La dépendance est conservée ; sa suppression définitive est
  un chantier ultérieur.
- **Rendu 3D photoréaliste** : écarté au profit du rendu au trait. Un rendu
  photoréaliste commandé plus tard pourrait remplacer l'objet sans toucher au
  reste.

## Décisions

| Sujet | Décision |
|---|---|
| Direction artistique | « Éditorial noir » : typo Syne très grande et serrée, noir profond, vert en accent rare, filets fins |
| Directions écartées | « Lumière vivante » (fond WebGL) ; « Contraste franc » (fond clair) |
| Moteur d'animation | **anime.js v4** pour toutes les animations de la home |
| React Bits | Au cas par cas uniquement, si un composant sert un besoin précis ; aucun n'est prévu à ce stade |
| Framer Motion | Retiré de tous les composants de la home et du layout ; conservé ailleurs (cf. hors périmètre) |
| Pièce maîtresse | Objet « agent Herakia » au trait, en 3D (three.js), dans la section « Qu'est-ce qu'un agent IA ? » — **pas en hero** |
| Rendu de l'objet | Traits (arêtes) sur fond noir, lignes cachées masquées ; pas de photoréalisme |

---

## 1. Charte couleurs

Tokens centralisés dans `tailwind.config.ts` et `app/globals.css`. Aucune
couleur en dur dans les composants.

### Fonds

| Token | Valeur | Usage |
|---|---|---|
| `bg-primary` | `#080808` | fond de page (était `#0a0a0a`) |
| `bg-secondary` | `#0F0F0F` | cartes, blocs |
| `bg-elevated` | `#161616` | survol, menus |

### Textes

| Token | Valeur | Contraste sur `#080808` |
|---|---|---|
| `text-primary` | `#EDEDED` | 17:1 |
| `text-secondary` | `#A0A0A0` | 7,7:1 |
| `text-muted` | `#8A8A8A` | 5,8:1 (était `#555555`, 2,7:1, non conforme AA) |

### Accent

| Token | Valeur | Usage |
|---|---|---|
| `green-primary` | `#3ECF8E` | CTA, mots clés, modules de l'objet (10:1) |
| `green-dark` | `#2A9E6A` | survol, état pressé |
| `green-line` | `rgba(62,207,142,.55)` | lignes de rappel, tracés |
| `green-subtle` | `rgba(62,207,142,.08)` → `.12` | surfaces teintées |
| `on-green` | `#04120A` | texte posé sur du vert |

### Lignes

| Token | Valeur | Usage |
|---|---|---|
| `border-subtle` | `rgba(255,255,255,.08)` | filets de fond, séparateurs |
| `border-strong` | `rgba(255,255,255,.14)` | bordures de cartes |
| `stroke-object` | `#DEDEDE` | traits du monolithe |
| `stroke-deco` | `#555555` | traits purement décoratifs, jamais du texte |

### Retraits

- Violet `#6d5bf6` (`violet-primary`, `violet-glow`) : supprimé.
- Halos flous du fond ambiant : supprimés.

**Règle d'usage** : le vert couvre environ 5 % de la surface visible. Le vert
print de la charte d'origine (`#3d9271`) reste réservé à l'imprimé.

---

## 2. Structure de la page et traitement par section

Ordre inchangé (`app/[lang]/page.tsx`). Chaque section reçoit **une** animation
signature ; une seule section a droit au grand spectacle.

| # | Section | Traitement |
|---|---|---|
| 1 | `Hero` | Titre géant révélé lettre par lettre (masque, `splitText`) ; courbe verte tracée au chargement ; bloc qui glisse et s'estompe au scroll. **Suppression du `ParticleField`** (canvas). |
| 2 | `TrustedBy` | Bandeau de logos dont le défilement horizontal est lié au scroll vertical. |
| 3 | `Personae` | Cartes révélées en cascade à l'entrée dans l'écran. |
| 4 | `MeetTia` | Logique d'appel inchangée ; onde vocale SVG animée pendant que Tia parle. |
| 5 | `WhatIsAnAgent` | ⭐ **Pièce maîtresse** (section 3 ci-dessous). Métiers et bénéfices conservés en dessous, révélations légères. |
| 6 | `WhatWeHandle` | Démo interactive conservée ; restylée à la charte, animations Framer portées en anime.js. |
| 7 | `About` | Titre en grande typo révélé par mots ; photo révélée par masque. |
| 8 | `GoogleReviews` | Avis révélés en cascade. |
| 9 | `HowItWorks` | Fil vert qui se dessine d'étape en étape, lié au scroll (`createDrawable`). |
| 10 | `CTAFinal` | Grande typo, révélation forte : dernier moment marquant. |

### Transversal

- **Fond** (`AmbientBackground`) : filets horizontaux fins + grain léger. Plus de
  halos, plus d'animation de fond.
- **Typographie** : l'échelle des titres monte d'un cran (Syne, interlettrage
  serré, interlignage ~0,9 sur les H1/H2).
- **Navbar / boutons** : micro-interactions sobres au survol (soulignement tracé,
  flèche qui glisse). Pas d'effet de brouillage de texte.
- **Mouvement réduit** : avec `prefers-reduced-motion`, aucune animation ; tout
  le contenu est affiché dans son état final.

---

## 3. La pièce maîtresse : l'agent Herakia au trait

### Concept

Un **monolithe de pierre gravé**, augmenté de **modules mécaniques** : l'IA
représentée comme une mécanique de précision. Au scroll, les modules se
détachent de la pierre et chacun est légendé par ce qu'il fait. L'anatomie de
l'objet est l'explication : le visiteur comprend ce qu'est un agent en le
regardant se démonter.

Référence d'esprit : la vue éclatée synchronisée au scroll de animejs.com
(objet technique au trait, légendes à lignes de rappel). Esquisse validée :
`.superpowers/brainstorm/…/content/objet-trait-v2.html`.

### Anatomie

| Pièce | Trait | Légende FR | Légende EN |
|---|---|---|---|
| Monolithe gravé (+ cœur vert révélé à l'intérieur) | blanc | **Décide** — analyse le contexte et applique vos règles | **Decides** |
| Capteur (face avant) | vert | **Perçoit** — un e-mail, une demande, un appel arrive | **Perceives** |
| Bras articulé (flanc) | vert | **Agit** — répond, met à jour le CRM, planifie, dans vos outils | **Acts** |
| Couronne de connecteurs (dessus) | vert | **Se branche** — sur vos outils existants, sans migration | **Connects** |
| Écran flottant | vert | **Rend compte** — un tableau de bord clair, vous gardez la main | **Reports** |
| Haut-parleur (face avant) | vert | **Répond** — par écrit ou à la voix | **Replies** |

Les trois premiers libellés reprennent les phases existantes du bloc
(Perçoit / Décide / Agit). Textes définitifs FR et EN dans les dictionnaires ;
les descriptions ci-dessus sont une base à relire.

### Composition

- Section épinglée (`position: sticky`) sur environ 3 hauteurs d'écran.
- Colonne gauche : eyebrow « En clair », titre « Qu'est-ce qu'un agent IA ? »,
  paragraphe existant.
- Droite : l'objet ; les légendes se placent en colonnes de part et d'autre,
  reliées à leur pièce par une ligne de rappel.
- Les légendes sont du **HTML réel** (indexable, traduisible) ; le canvas 3D est
  `aria-hidden`.
- Remplace le composant `AgentExplainer` (iframe vers
  `public/herakia-agent-explicatif.html`), qui est supprimé avec son fichier HTML.

### Chorégraphie (progression de scroll dans la section, réversible)

| Progression | Effet |
|---|---|
| Entrée dans la section | Les traits de l'objet assemblé se dessinent (une fois). |
| 0 → 15 % | Objet assemblé, léger flottement ; texte d'intro lisible. |
| 15 → 55 % | Rotation de l'objet ; les modules s'écartent le long de leur axe ; pointillés entre chaque module et son logement, qui s'allume en vert ; la pierre s'entrouvre et révèle le cœur vert. |
| 55 → 85 % | Légendes une à une : Perçoit, Décide, Agit, puis Se branche, Rend compte, Répond. |
| 85 → 100 % | Vue éclatée complète tenue ; phrase « Un agent ne se contente pas de répondre : il agit. » ; puis libération de la section. |

La progression est lissée (`onScroll({ sync: ~0.2 })`) ; remonter la page
réassemble l'objet.

### Peaufinage par rapport à l'esquisse

- Proportions du monolithe et des modules ; bras plus fin (segments étroits,
  rotules nettes).
- Gravures plus fines et plus régulières.
- Cœur vert à l'intérieur de la pierre : seule touche « lumineuse » de l'objet.
- Angles de rotation réglés pour que chaque pièce soit lisible une fois éclatée.
- Aucun chevauchement entre légendes, lignes de rappel et texte de la colonne
  gauche, à toutes les largeurs desktop.

### Mobile (< 768 px)

- Épinglage plus court (~2 écrans).
- Objet centré dans la moitié haute de l'écran, sans lignes de rappel.
- Sous l'objet, les six capacités en liste ; chaque ligne s'allume quand sa
  pièce se détache.

### Robustesse et poids

- three.js chargé via `next/dynamic` (`ssr: false`) **uniquement quand la section
  approche** (marge d'environ un écran). Il ne fait pas partie du bundle
  initial de la page.
- `prefers-reduced-motion` : objet affiché directement éclaté, légendes
  visibles, aucune rotation.
- WebGL indisponible : pas de canvas ; les six capacités s'affichent en liste.
- Rendu : `devicePixelRatio` plafonné à 2 ; boucle de rendu suspendue quand la
  section est hors écran.
- Limite connue : en WebGL, tous les traits font 1 px d'épaisseur.

---

## 4. Architecture technique

### Briques d'animation (`lib/anim/`)

Hooks React fins autour d'anime.js v4, chacun encapsulant `createScope` pour un
nettoyage complet au démontage (changement de page ou de langue) et court-
circuitant l'animation quand `prefers-reduced-motion` est actif :

| Hook | Rôle |
|---|---|
| `useTextReveal` | Découpe un titre (`splitText`) et révèle lettres ou mots par masque, à l'entrée à l'écran ou au chargement. |
| `useStaggerReveal` | Révèle une liste d'éléments en cascade à l'entrée à l'écran. |
| `useDrawPath` | Trace un chemin SVG (`createDrawable`), au chargement ou lié au scroll. |
| `useScrollProgress` | Expose la progression 0→1 d'une section via `onScroll({ sync })`. |

Chaque section consomme ces hooks plutôt que d'appeler anime.js directement.

### Objet (`components/agent-object/`)

| Fichier | Responsabilité |
|---|---|
| `AgentObjectSection.tsx` | Section épinglée, colonne texte, chargement différé de la scène, bascules mobile / mouvement réduit / sans WebGL. |
| `scene.ts` | Construction de la géométrie (monolithe, modules, gravures, câbles, logements) ; aucun React. Expose `update(progress)` et `dispose()`. |
| `AgentObjectCanvas.tsx` | Monte le renderer three.js, relie `useScrollProgress` à `scene.update`, projette les points d'ancrage vers l'écran. |
| `Callouts.tsx` | Légendes HTML et lignes de rappel SVG, positionnées depuis les ancrages projetés ; version liste pour mobile. |

Contenu des légendes : `dictionaries/fr.ts` et `dictionaries/en.ts`.

### Dépendances

- Ajout : `animejs` (v4), `three` (+ `@types/three`).
- Conservée : `framer-motion` (pages secondaires).

### Ménage

Composants non importés nulle part, supprimés : `EmotionalAfter`,
`HowAgentsWork`, `LiveDemo`, `LogosBand`, `PhoneFormField`, `ProblemSolution`,
`ProductShowcase`, `Services`, `ServicesContent`, `Stats`, `Storytelling`,
`TechStack`, `TiaContactForm`. Plus `AgentExplainer` et
`public/herakia-agent-explicatif.html` une fois remplacés. `.superpowers/` est
ajouté au `.gitignore`.

---

## 5. Déroulé et vérification

### Ordre

1. Mise de côté des modifications en cours (`git stash`), charte (tokens), fond,
   typographie, briques `lib/anim/`.
2. **L'objet** : le plus risqué, donc validé tôt.
3. Hero.
4. Les autres sections de la home, une par une.
5. Navbar, Footer, Button, Badge (partagés avec les pages secondaires).
6. Ménage et mesures finales.

Un commit par étape, pour que chacune soit visible et réversible.

### Vérification à chaque étape

- `npm run build` passe (inclut la vérification TypeScript) ; `npm run lint`
  propre.
- Contrôle visuel dans Chrome en desktop (≈1440 px) et mobile (≈390 px), avec
  captures à plusieurs hauteurs de scroll pour les sections liées au scroll.
- Mode `prefers-reduced-motion` vérifié.
- Console sans erreur.
- Pages secondaires ouvertes après chaque changement d'un composant partagé.

### Vérification finale

- three.js absent du chargement initial de la home (vérifié dans le réseau).
- Poids JS du premier chargement de la home inférieur ou égal à l'état actuel
  (le retrait du `ParticleField` et de Framer Motion sur la home compense
  l'ajout d'anime.js).
- Lighthouse (mobile) performance et accessibilité comparés à l'état de départ :
  aucune régression.

Le projet n'a pas de tests automatisés ; la refonte étant visuelle, on n'en
ajoute pas.

## Risques

| Risque | Parade |
|---|---|
| L'objet peaufiné n'atteint pas le niveau attendu | Il est traité en 2ᵉ étape, avec validation visuelle avant de toucher au reste. |
| Section épinglée désagréable au trackpad ou sur mobile | Lissage `sync`, épinglage raccourci sur mobile, test sur appareil réel. |
| Régression de performance | three.js chargé à la demande ; mesures avant/après. |
| Composants partagés cassant les pages secondaires | Vérification visuelle de ces pages à l'étape 5. |
