# Herakia — Peaufinage et mise en ligne

Date : 2026-08-09
Statut : validé

## Contexte

`~/onyxia` héberge le site vitrine de **Herakia**, agence d'automatisation IA.
Le dossier et l'ancien projet Vercel portent le nom « onyxia » ; la marque reste
**Herakia** et le domaine canonique **herakia.com**, déjà acheté.

Stack : Next.js 14 (App Router), TypeScript, Tailwind CSS 3, Framer Motion 11,
agent vocal ElevenLabs. i18n FR/EN via `app/[lang]/` et un middleware de
détection de langue. Aucun test.

État de départ : le build passe (18 pages), le design est cohérent, le SEO de
base est en place. Mais le projet n'était pas versionné, le projet Vercel a
disparu du compte, et la home a dérivé vers 18 blocs pour 16 500 px de haut.

## Objectif

Rendre le site présentable et le mettre en ligne sur `herakia.com`, avec un
formulaire de contact qui fonctionne réellement.

Hors périmètre : refonte éditoriale, pages SEO longue traînée
(`/services/*`, pages secteurs, `/tarifs`), blog. À traiter après le lancement.

## Décisions

| Sujet | Décision |
|---|---|
| Marque | Herakia (« onyxia » n'était qu'un nom de dossier) |
| Domaine | `herakia.com`, déjà acheté, DNS à pointer |
| Déploiement | Repo GitHub privé → import Vercel, déploiement automatique |
| Analytics | Vercel Analytics (sans cookie, pas de bandeau à construire) |
| Formulaire | Resend, déjà codé dans `app/api/contact/route.ts` |

---

## Volet 1 — Restructuration de la home

### Problème

La home enchaîne 18 blocs, soit 16 500 px en desktop et 23 900 px en mobile
(~28 écrans). Le message se dilue et deux contenus font doublon :

- **`HeroScene`** est un `<iframe>` vers `public/hero-scene.html` qui rejoue la
  scène « notifications chronophages absorbées » — exactement le propos de la
  section `WhatWeHandle`, qui le fait mieux (interactive, indexable). Un iframe
  n'est ni indexable ni bon pour le LCP.
- **`MeetTia`** présente la carte de l'agent vocal Tia avec un bouton « Parler à
  Tia » ; `AgentDemos` rouvre la même carte, en plus grand, avec le même bouton.

### Structure cible

| # | Bloc | Rôle |
|---|---|---|
| 1 | `Hero` | accroche |
| 2 | `Personae` | « vous reconnaissez-vous ? » — le problème |
| 3 | `WhatWeHandle` | les corvées absorbées (démo interactive) |
| 4 | `WhatIsAnAgent` | pédagogie : un agent n'est pas un chatbot |
| 5 | `AgentDemos` | Tia + les 4 agents à essayer — la preuve |
| 6 | `InlineCTA` | conversion à mi-parcours |
| 7 | `Services` | les 5 savoir-faire |
| 8 | `ProductShowcase` | le cockpit |
| 9 | `EmotionalAfter` + `Stats` | la projection + les engagements |
| 10 | `About` | Andy — la confiance |
| 11 | `TechStack` + `FAQ` | l'écosystème + les objections |
| 12 | `CTAFinal` | conversion |

Les étapes 9 et 11 regroupent chacune deux composants qui se suivent sans
respiration entre eux : on passe donc de 18 composants à 14, pour 12 temps de
lecture.

Suppressions : `HeroScene`, `MeetTia`, et 2 des 3 `InlineCTA` (on garde la
variante `demo`, la mieux placée dans le parcours).

Objectif de hauteur : environ 10 000 px en desktop, une fois les espacements
repris (volet 2).

---

## Volet 2 — Corrections contenu et visuel

### 2.1 Descriptions dupliquées dans `Services.tsx`

Deux des cinq entrées ont un `blurb` qui recopie son `title`, en FR comme en EN :

| Titre | Description actuelle |
|---|---|
| « Vos clients répondus, 24/7 » | « Vos clients répondus 24/7, vos données chez vous. » |
| « On chiffre le gain avant que vous signiez » | « On chiffre le gain avant que vous signiez. » |

Les deux descriptions sont réécrites pour apporter une information absente du
titre, dans les deux langues.

### 2.2 Badge « 39 » qui chevauche le titre

Dans `WhatWeHandle`, le compteur rouge de notifications se superpose au H2
« Vos corvées chronophages, absorbées. » Il est repositionné sur la zone de
notifications, hors de la trajectoire du titre, à toutes les largeurs.

### 2.3 `WhatIsAnAgent` : sortir de l'iframe

La section « Qu'est-ce qu'un agent IA ? » délègue ses trois cartes à
`AgentExplainer`, un `<iframe>` vers `public/herakia-agent-explicatif.html` dont
la hauteur est négociée par `postMessage` (valeur de repli : 560 px).

Trois conséquences : un vide important au-dessus du contenu quand la hauteur
réelle n'est pas encore remontée ; les cartes `02 Décide` et `03 Agit` aux deux
tiers vides, leur hauteur étant calée sur `01 Perçoit` et son aperçu Gmail ; et
surtout un contenu **invisible pour les moteurs de recherche**, alors que c'est
la section la plus pédagogique du site et celle qui porte le vocabulaire
« agent IA » que l'on cherche à référencer.

Le HTML est donc porté en composant React natif : contenu indexable, hauteur
naturelle, plus de `postMessage`. Chaque carte reçoit son propre mini-aperçu,
cohérent avec son étape, ce qui supprime les demi-cartes vides.

C'est le seul poste du volet 2 qui demande une réécriture plutôt qu'un
ajustement ; il est retenu parce qu'il sert à la fois le visuel et le SEO, les
deux objectifs de la session.

### 2.4 Rythme vertical

Des trous de 300 à 500 px apparaissent entre plusieurs sections (après la carte
Tia, après la liste Services), dus au cumul du padding de section et des marges
internes. Un padding de section unique est appliqué et les marges qui se
cumulent sont retirées.

### 2.5 H1 mobile

Sous 400 px, « Automatisation » touche les deux bords de l'écran. Un palier
typographique supplémentaire est ajouté pour préserver une gouttière latérale.

### 2.6 Ménage

Suppression des composants morts — `LogosBand`, `Storytelling`, `HowItWorks`,
`ProblemSolution`, `LiveDemo`, `HowAgentsWork`, `ui/Card` — puis de
`public/hero-scene.html` (volet 1), de `public/herakia-agent-explicatif.html` et
de `AgentExplainer.tsx` une fois le portage 2.3 terminé.

Aucune image de `public/` n'est concernée : les deux fichiers HTML n'utilisent
que des logos en data-URI, et toutes les images du dossier sont référencées par
un composant conservé.

### 2.7 Documentation

`README.md` est remis à jour. `PERSONNALISATION.md` et `SEO-TODO.md` décrivent
un site qui n'existe plus (témoignages, logos clients fictifs, pages légales
absentes, formulaire en `setTimeout` — tout cela a été traité depuis) : ils sont
remplacés par un unique état des lieux à jour.

---

## Volet 3 — Mise en ligne

### 3.1 Versioning

`git init` et commit de l'état de départ **avant toute modification**, puis
publication sur un repo GitHub privé.

### 3.2 hreflang par page

`app/[lang]/layout.tsx` déclare `alternates.languages` en dur sur `/fr` et
`/en`. Résultat : `/fr/services` annonce `/fr` et `/en` comme alternatives, ce
qui est faux. Les alternates deviennent dépendantes du chemin courant.

### 3.3 Sitemap

Ajout des trois pages légales (`/mentions-legales`, `/confidentialite`, `/cgu`)
aux six URLs déjà listées.

### 3.4 Formulaire de contact

`app/api/contact/route.ts` appelle Resend mais `RESEND_API_KEY` est absente :
en l'état, le formulaire renvoie une erreur en production et tous les leads sont
perdus. À faire, avec l'utilisateur :

1. compte Resend et clé API ;
2. vérification du domaine `herakia.com` chez Resend (enregistrements DNS) ;
3. `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` sur Vercel ;
4. envoi de test réel avant d'annoncer la mise en ligne.

Tant que le domaine n'est pas vérifié chez Resend, l'expéditeur reste
`onboarding@resend.dev`.

### 3.5 Analytics

Ajout de `@vercel/analytics` dans le layout racine. Sans cookie, donc aucun
bandeau de consentement à construire.

### 3.6 Déploiement

Import du repo dans Vercel, premier déploiement, puis rattachement de
`herakia.com` avec redirection `www` vers l'apex. HTTPS est automatique.

### 3.7 Référencement

Propriété Google Search Console vérifiée par DNS TXT, soumission du sitemap.
Bing Webmaster Tools en option.

### 3.8 Contrôle final

Audit Lighthouse sur l'URL de production, et vérification manuelle des deux
langues, du formulaire et de l'agent vocal, avant de considérer le site en
ligne.

---

## Vérification

Aucun test automatisé n'existe sur ce projet et le périmètre (contenu, mise en
page, déploiement) ne s'y prête pas. La vérification est donc :

- `npm run build` et `npm run lint` sans erreur ;
- captures desktop (1440 px) et mobile (390 px) des trois pages, dans les deux
  langues, comparées à l'état de départ ;
- hauteur de la home mesurée avant/après ;
- absence de débordement horizontal en mobile ;
- envoi réel d'un message via le formulaire en production ;
- Lighthouse sur l'URL de production.

## Risques

| Risque | Parade |
|---|---|
| La vérification DNS chez Resend prend du temps | Déployer avec `onboarding@resend.dev`, basculer ensuite |
| La propagation DNS du domaine retarde le lancement | Le site est en ligne sur l'URL `*.vercel.app` entre-temps |
| Une suppression de section retire un contenu voulu | Le commit initial permet de revenir en arrière à tout moment |
| L'agent vocal dépend d'un `agentId` ElevenLabs public | Vérifier que la variable est bien définie sur Vercel, sinon la modale affiche « bientôt » |
