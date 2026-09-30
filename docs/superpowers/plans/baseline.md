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
