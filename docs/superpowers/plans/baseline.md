# Mesures de départ (commit e1ea706)

- First Load JS `/[lang]` : 225 kB
- Lighthouse mobile performance : 0.64
- Lighthouse mobile accessibilité : 0.95

# Mesures d'arrivée (fin de la refonte)

- First Load JS `/[lang]` : 247 kB (écart : +22 kB)
- three.js dans le chargement initial : non
- Lighthouse mobile performance : 0.79 (médiane sur 3 runs : 0.80, 0.79, 0.79)
- Lighthouse mobile accessibilité : 0.98 (3 runs : 0.98, 0.98, 0.98)

# Remesure du 2026-09-30 (après les retouches hors plan, commit 6e88897)

- First Load JS `/[lang]` : 250 kB (+3 kB depuis la fin du plan)
- Lighthouse mobile performance : 0.79 (3 runs : 0.56, 0.79, 0.79 — le premier à froid, TBT 1 090 ms)
- Lighthouse mobile accessibilité : 0.98 (3 runs : 0.98, 0.98, 0.98)
- FCP 1,2 s · LCP 5,7 s · TBT 30–40 ms · CLS 0 · Speed Index 1,6–1,7 s
- Élément LCP : le sous-titre du hero (`p.max-w-xl`, « On part de vos process… »). Il part à
  opacité 0 (`data-reveal`) : le LCP attend la fin de l'animation d'entrée (délai de rendu de
  l'élément ≈ 1,25 s non throttlé), pas le réseau (TTFB 10 ms).

# Après correctif LCP du hero (2026-09-30)

Le sous-titre du hero sort de la cascade `data-reveal` : il est peint avec la page.

- Lighthouse mobile performance : **0.89** (4 runs : 0.90, 0.89, 0.89, 0.89)
- Lighthouse mobile accessibilité : 0.98
- LCP 3,6–3,8 s (au lieu de 5,7 s) · FCP 1,2 s · TBT 10–60 ms · CLS 0
- Délai de rendu de l'élément LCP non throttlé : 45 ms (au lieu de 1 250 ms). Les ~3,8 s restantes
  sont la projection du 4G lent simulé (CSS bloquant ~0,4 s, polices, JS) — piste suivante si besoin :
  alléger le chargement, pas l'animation.
