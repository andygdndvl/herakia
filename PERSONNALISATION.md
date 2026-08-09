# Personnalisation — 10 éléments à modifier en priorité

Ces éléments sont actuellement renseignés avec des **placeholders réalistes**.
À remplacer avant tout lancement public.

---

## 1. Image Open Graph

**Fichier** : `public/og-image.jpg` (1200×630)
**Statut** : ❌ Manquant — voir `public/og-image.placeholder.txt`
**Référencé dans** : `app/layout.tsx`

À générer avec votre outil de design préféré (Figma, Canva, ou
`/api/og` avec `@vercel/og` pour une version dynamique).

---

## 2. Logos clients (bande horizontale)

**Fichier** : `components/home/LogosBand.tsx`
**Statut** : 10 noms fictifs en texte (Acme, Northwind, Globex…)

**À faire** : remplacer le tableau `logos` par les **vrais noms** ou,
encore mieux, par des **fichiers SVG** dans `public/clients/` puis
afficher avec `<img src={...} alt={...} />`.

---

## 3. Témoignages clients

**Fichier** : `components/home/Testimonials.tsx`
**Statut** : 5 témoignages anonymisés (Camille R., Maxime D., …)

**À faire** : remplacer le tableau `testimonials` par les vrais
témoignages clients :
- Citation
- Nom complet (avec accord du client)
- Rôle
- Entreprise
- Initiales (ou photo si vous ajoutez `photo: string`)

---

## 4. Email de contact

**Fichiers concernés** :
- `app/layout.tsx` (JSON-LD + métadonnées)
- `components/layout/Footer.tsx`
- `components/home/ContactContent.tsx`

**Statut** : `contact@herakia.com` partout

**À faire** : si l'email réel diffère, faire une recherche/remplacement
global sur `contact@herakia.com`.

---

## 5. Domaine canonical

**Fichiers concernés** :
- `app/layout.tsx` (`metadataBase`, `openGraph.url`, `alternates.canonical`)
- `app/sitemap.ts` (`baseUrl`)
- `app/robots.ts` (`sitemap`, `host`)
- JSON-LD : tous les `@id` et `url`

**Statut** : `https://herakia.com`

**À faire** : si le domaine définitif diffère, faire une recherche/remplacement
global. **Penser au protocole** (`https://`, sans slash final).

---

## 6. Réseaux sociaux

**Fichier** : `components/layout/Footer.tsx`
+ JSON-LD `sameAs` dans `app/layout.tsx`

**Statut** :
- LinkedIn : `https://linkedin.com/company/herakia-ai`
- Twitter : `https://twitter.com/herakia_ai`

**À faire** : confirmer ou corriger les URLs. Supprimer les liens des
réseaux non utilisés (et la balise `sameAs` correspondante).

---

## 7. Backend du formulaire de contact

**Fichier** : `components/home/ContactContent.tsx`
**Fonction** : `handleSubmit` ligne ~120

**Statut** : simule l'envoi avec `setTimeout(1200ms)`

**À faire** : brancher un vrai backend :
- Soit créer une route API `app/api/contact/route.ts` avec Resend, Postmark,
  SendGrid…
- Soit utiliser un service no-code (Formspree, Web3Forms, Tally…)
- Penser à la **protection anti-spam** (honeypot, rate-limit, captcha invisible)

---

## 8. Photo Andy + bio fondateur

**Fichier** : `public/andy.jpg` (déjà copié)
**Composant** : pas encore intégré dans la version actuelle

> 💡 La photo et la bio du fondateur sont disponibles dans `~/Downloads/project 20/`.
> Si vous souhaitez ajouter une section « À propos » sur la home ou dans
> `/services`, le contenu de référence est dans
> `Downloads/project 20/components/landing/About.tsx`.

---

## 9. Stack technologique — Logos officiels

**Fichier** : `components/home/TechStack.tsx`
**Statut** : initiales sur fond gris (« O » pour OpenAI, « A » pour Anthropic…)

**À faire** : pour un rendu professionnel, remplacer les initiales par les
**vrais SVG** des logos (déposer dans `public/tech/openai.svg`, etc.).
Garder les badges « Certifié partenaire » uniquement pour les certifications réelles.

---

## 10. Pages légales (mentions, confidentialité, CGU)

**Fichiers** : aucun pour l'instant — les liens dans `Footer.tsx` pointent
vers `/mentions-legales`, `/confidentialite` et `/cgu` qui **n'existent pas**.

**À faire** :
- Créer les 3 pages `app/mentions-legales/page.tsx`, etc.
- Y coller des contenus juridiques relus (gabarits sur economie.gouv.fr ou CNIL)
- Sinon, retirer ces liens du Footer en attendant

---

## Bonus — Storytelling : ajouter votre secteur

**Fichier** : `components/home/Storytelling.tsx`
**Constante** : `scenarios` (ligne ~23)

5 secteurs sont configurés (B2B, SaaS, e-commerce, santé, immobilier).
Pour ajouter un nouveau secteur :

1. Ajouter une entrée dans `sectors` (id + label)
2. Ajouter le scénario correspondant dans `scenarios` (3 étapes :
   avant / pendant / après) en suivant la structure existante.
