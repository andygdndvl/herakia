# Herakia — « Vert nuit » : lumière verte et surfaces douces

Date : 2026-10-06
Statut : en relecture
Branche : `refonte-visuelle`

## Contexte

La refonte « éditorial noir » a donné un site propre mais sans âme : fond quasi
noir, vert réduit à un accent rare, aucune lumière, surfaces plates. Andy prend
pour référence **limova.ai** : son fond est aussi sombre, mais une couleur de
marque y *rayonne* (halo tramé de points derrière le hero, horizon embrasé,
boutons qui brillent) et les surfaces sont douces (grands arrondis, verre sombre,
pastilles colorées).

Ingrédients retenus par Andy : **la lumière colorée** et **les surfaces douces**.
Non retenus : les visages d'agents, le produit montré en cartes flottantes.

Maquette validée : option **C « Vert nuit, généreux »** de
`.superpowers/brainstorm/91313-1791274259/content/ame-v2.html`, **titre centré**.

## Objectif

Donner de la chaleur au site en faisant rayonner le vert Herakia, sans changer le
propos ni la structure des sections. Critère de réussite : à l'ouverture, le haut
de page « respire » comme la maquette C, le reste de la page garde une présence
verte, et rien ne régresse (contrastes, Lighthouse mobile ≈ 0,88, a11y 0,98).

## Hors périmètre

- Textes et ordre des sections (inchangés).
- Visages / avatars d'agents, cartes d'interface flottantes.
- Mise en page des pages secondaires : elles héritent seulement des jetons, de
  `Card` et de `Button`.
- L'objet 3D lui-même (seule sa couleur de fond suit le nouveau fond).

## Décisions

### 1. Jetons de couleur (`app/globals.css`, `:root`)

| Jeton | Avant | Après |
|---|---|---|
| `--bg-primary` | `12 12 11` (#0c0c0b) | `6 16 11` (#06100b) |
| `--bg-secondary` | `20 20 18` | `11 24 17` (#0b1811) |
| `--bg-elevated` | `28 28 26` | `17 32 24` (#112018) |
| `--tier-tint` | `212, 212, 211` | `150, 230, 190` (voile teinté vert) |

Les textes ne changent pas. Contrastes attendus sur #06100b : `text-primary`
≈ 16:1, `text-secondary` ≈ 7,4:1, `text-muted` ≈ 5,6:1 — à mesurer.

Le vignettage de `AmbientBackground` suit la règle existante (« fond moins 4 par
canal ») : `rgba(2, 12, 7, …)`.

### 2. Couleurs de fond écrites en dur — doivent suivre `--bg-primary`

- `components/agent-object/scene.ts` : `BG = 0x06100b` (volumes pleins et
  brouillard de la scène, sinon l'objet découpe un fond noir sur le vert).
- `app/[lang]/layout.tsx` : `themeColor: '#06100b'`.
- Commentaires de `globals.css` et `tailwind.config.ts` qui citent #0c0c0b et
  les contrastes : mis à jour.
- `opengraph-image.tsx` (#0a0a0a) : image de partage, laissée telle quelle.

### 3. Lumière

**Fond global fixe (`AmbientBackground`)** : les trois nappes de « lumière de
studio » restent (même dérive lente, mêmes cycles), recolorées et renforcées :
grande nappe verte en haut à droite, nappe verte à gauche, petite nappe jaune
très discrète (rappel des étoiles Google, alpha ≈ 0,06). Grain et vignettage
conservés.

**Halo du hero (dans la section, défile avec elle)** : nouveau calque décoratif
dans `Hero.tsx`, derrière le contenu :
- un grand halo radial vert centré en haut (≈ 1300 × 800 px, alpha ≈ 0,26 au
  centre) ;
- une trame de points verts (pas 14 px, rayon 1 px) masquée par un dégradé
  elliptique : dense au centre derrière le titre, éteinte vers les bords.
Pur CSS, statique, `aria-hidden`, `pointer-events-none`.

### 4. Hero centré (`Hero.tsx`, `HeroProof.tsx`)

- Contenu centré horizontalement (`text-center`, `items-center`) ; le hero garde
  `min-h-screen`, le bloc est centré verticalement au lieu d'être posé en bas.
- Surtitre « Agence IA · France » → **pastille** : fond vert 8 %, filet vert
  22 %, point vert lumineux, texte mono vert.
- Titre, ligne des moyens (rotation conservée), sous-titre, boutons : centrés.
  Le filet horizontal entre titre et sous-titre est retiré (il n'a pas de sens
  dans une composition centrée).
- `HeroProof` → **pastille** centrée : logo G, étoiles jaunes, « 5,0 », puis
  l'extrait d'avis et sa signature.
- Engagements (« Diagnostic offert », « 100 % sur-mesure ») centrés dessous.
- Le sous-titre reste hors de la cascade `data-reveal` (LCP).

### 5. Surfaces douces

- **Bouton principal** (`Button`, variante primaire) : lueur verte portée
  (`0 10px 40px -4px rgba(62,207,142,.7)` au repos, un peu plus au survol). La
  règle « aucune ombre, aucun halo » du bouton d'action est abandonnée
  explicitement (commentaire de `tailwind.config.ts` mis à jour).
- **Verre teinté** : la classe `.glass-card` (utilisée par `Card` seulement)
  devient un dégradé vertical vert 8 % → 2 % avec un filet vert 16 % ; `Card`
  passe à `rounded-3xl` (24 px). Les cartes de la home qui ne passent pas par
  `Card` (chantiers, personae) reçoivent les mêmes valeurs directement. Les autres
  `rounded-2xl` de la home ne bougent pas.
- **Film** (`VideoPitch`) : arrondi 28 px.
- Pastilles de surtitre : la classe `.eyebrow` reste (sections), une nouvelle
  classe `.eyebrow-pill` sert au hero.

## Vérification

- Captures 1440 × 900 et 390 × 844 : hero, film, logos, chantiers, personae,
  objet 3D (vue éclatée), avis, CTA final ; une page secondaire (`/fr/offres`).
- Contrastes mesurés des trois gris sur #06100b (≥ 4,5:1).
- Objet 3D : aucun rectangle de fond visible autour de la scène.
- `npm run build`, `npx next lint`, Lighthouse mobile 3 runs (≈ 0,88, a11y 0,98).
- Mouvement réduit : nappes figées, halo statique.

## Risques

- **Trop de vert** : si la page vire au « tout vert », baisser d'abord les
  alphas des nappes globales, pas le halo du hero.
- **Lisibilité des textes gris** sur un fond teinté : la mesure tranche.
- **Pages secondaires** : héritent du nouveau fond sans avoir été pensées pour ;
  capture de contrôle prévue, retouches éventuelles hors de cette spec.
