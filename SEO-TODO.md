# SEO — Ce qui est fait, ce qui reste

## ✅ Fait dès le déploiement

| Item | Détail |
|---|---|
| **Metadata Next.js 14** | `app/layout.tsx` + `metadataBase` + `template` |
| **Open Graph** | Title, description, image, locale `fr_FR`, type `website` |
| **Twitter Cards** | `summary_large_image` |
| **Robots / Indexation** | `follow: true`, `index: true`, `max-image-preview: large` |
| **Canonical** | `alternates.canonical` sur chaque page |
| **JSON-LD Organization** | Logo, slogan, fondateur, areaServed, contactPoint |
| **JSON-LD WebSite** | Avec `inLanguage: fr-FR` |
| **JSON-LD FAQPage** | 5 questions/réponses (alignées sur la section FAQ) |
| **Sitemap dynamique** | `app/sitemap.ts` (3 URLs : /, /services, /contact) |
| **robots.txt** | `app/robots.ts` avec référence au sitemap |
| **Métadonnées par page** | `/services` et `/contact` ont leurs propres `title` + `description` |
| **Mots-clés H1/H2** | « automatisation IA » dans le H1 home, déclinaisons sur les autres titres |
| **Structure HTML sémantique** | `<main>`, `<section>`, `<nav>`, `<article>`, `<footer>`, hiérarchie h1→h3 |
| **Alt sur images** | Logos avec alt descriptifs |
| **`lang="fr"`** | Déclaré sur `<html>` |
| **Polices via next/font** | Pas de FOUT, perf optimale |
| **Reduced motion** | `useReducedMotion()` dans tous les composants animés (UX + SEO indirect) |

---

## ⏳ À faire avant le lancement

### 1. Image Open Graph
- [ ] Générer `public/og-image.jpg` (1200×630)
- [ ] Tester avec [opengraph.xyz](https://www.opengraph.xyz/)
- [ ] Tester avec [cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator)

### 2. Search Console & Analytics
- [ ] Créer la propriété `herakia.com` dans **Google Search Console**
- [ ] Vérifier la propriété (DNS TXT recommandé)
- [ ] Soumettre le sitemap `https://herakia.com/sitemap.xml`
- [ ] Créer la propriété **Bing Webmaster Tools** (souvent oublié, prend 5 min)
- [ ] Brancher **Plausible**, **GA4** ou **Umami** (analytics RGPD-friendly)

### 3. Validation Schema.org
- [ ] Tester le JSON-LD avec [validator.schema.org](https://validator.schema.org/)
- [ ] Tester avec [search.google.com/test/rich-results](https://search.google.com/test/rich-results)
- [ ] Vérifier que la **FAQPage** est éligible aux rich snippets (5 questions minimum présentes ✓)

### 4. Performance & Core Web Vitals
- [ ] Lancer `npm run build` puis `npm run start`
- [ ] Auditer avec **Lighthouse** : viser >90 sur Perf / SEO / Best Practices / A11y
- [ ] Auditer avec [pagespeed.web.dev](https://pagespeed.web.dev/)
- [ ] Si LCP dégradé : compresser l'image OG, vérifier que le canvas Hero ne bloque pas le main thread (il est en `useEffect`, donc asynchrone ✓)

---

## 📈 Stratégie de contenu (long terme)

### Pages à créer pour le longue traîne SEO
*(non incluses dans la version actuelle, qui se limite aux 3 pages du brief)*

- [ ] `/services/automatisation-workflows`
- [ ] `/services/agents-ia-sur-mesure`
- [ ] `/services/integration-llm-chatbot`
- [ ] `/services/scraping-traitement-donnees`
- [ ] `/services/audit-conseil-ia`
- [ ] **Pages secteurs** : `/automatisation-ia-saas`, `/automatisation-ia-ecommerce`,
  `/automatisation-ia-immobilier`, `/automatisation-ia-sante` (existaient
  dans l'ancien site, contenus disponibles dans `~/Downloads/project 20/`)
- [ ] **Pages tarifs** : `/tarifs` ou `/prix-automatisation-ia` avec les 3 packs
  Essentiel/Opérationnel/Sur-mesure (déjà rédigés)

### Blog
- [ ] Créer `app/blog/[slug]/page.tsx`
- [ ] Écrire 5 à 10 articles piliers ciblant des intentions :
  - « Comment automatiser [process X] avec l'IA »
  - « ROI d'un agent IA pour PME »
  - « Make vs n8n vs Zapier en 2026 »
  - « OpenAI vs Anthropic : lequel choisir »
  - « Cas d'usage IA en [secteur] »

### Backlinks
- [ ] Soumissions annuaires qualifiés (annuaire-ia, France Digitale, etc.)
- [ ] Articles invités sur sites tech FR (Frenchweb, Maddyness, blog Hubspot FR)
- [ ] Récolter les **liens depuis vos clients existants** (étude de cas + lien retour)
- [ ] LinkedIn : optimiser la page entreprise + activité régulière

### Maillage interne
- [ ] Ajouter des liens contextuels entre les pages services et la page contact
- [ ] Ajouter un fil d'Ariane (`Breadcrumb`) sur les pages internes
- [ ] Pousser le JSON-LD `BreadcrumbList`

---

## 🛠️ Quick wins immédiats

- [ ] Mettre en place une **redirection www → non-www** (ou inverse) dans Vercel
- [ ] Forcer **HTTPS** (automatique sur Vercel)
- [ ] Ajouter un **header `X-Robots-Tag`** sur les pages dev/preview pour
  éviter qu'elles soient indexées
- [ ] Créer une **404 personnalisée** : `app/not-found.tsx`
- [ ] Compresser & optimiser tous les PNG du `public/` (TinyPNG, Squoosh)
- [ ] Ajouter un `manifest.webmanifest` pour PWA-readiness (icônes mobiles
  à la maison de l'utilisateur)
