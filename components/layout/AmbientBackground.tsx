const NOISE_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

/**
 * Lumière de studio : trois nappes très douces dérivent sous le grain, comme un fond de studio
 * photo éclairé en douce. Aucun motif, seulement du volume. Tailles en unités d'écran pour tenir
 * du mobile au grand écran. Les dégradés radiaux (`closest-side`) sont déjà flous par nature :
 * pas de `filter: blur`, qui coûterait cher sur un calque fixe plein écran. Seul `transform` est
 * animé (keyframes `studio-drift-*` dans app/globals.css), donc tout reste sur le compositeur.
 * En mouvement réduit, la règle globale fige les animations : la lumière reste, immobile.
 */
const POOLS = [
  // Grande nappe grise, en haut à droite : la source principale.
  {
    className: 'left-[42%] top-[-34%] h-[80vh] w-[70vw] animate-[studio-drift-1_38s_ease-in-out_infinite_alternate]',
    background: 'radial-gradient(closest-side, rgba(var(--tier-tint), 0.12), transparent)',
  },
  // Nappe à peine verte, au milieu à gauche : la teinte de la marque, dans l'air.
  {
    className: 'left-[-12%] top-[30%] h-[65vh] w-[55vw] animate-[studio-drift-2_46s_ease-in-out_infinite_alternate]',
    background: 'radial-gradient(closest-side, rgb(var(--green-muted) / 0.08), transparent)',
  },
  // Petite nappe de rappel, en bas à droite.
  {
    className: 'left-[70%] top-[55%] h-[55vh] w-[40vw] animate-[studio-drift-3_52s_ease-in-out_infinite_alternate]',
    background: 'radial-gradient(closest-side, rgba(var(--tier-tint), 0.04), transparent)',
  },
] as const;

/** Fond éditorial : lumière de studio + grain léger + vignettage. Statique côté JS. */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg-primary" aria-hidden="true">
      {POOLS.map((pool) => (
        <div
          key={pool.className}
          className={`absolute rounded-full will-change-transform ${pool.className}`}
          style={{ background: pool.background }}
        />
      ))}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-soft-light"
        style={{ backgroundImage: `url("${NOISE_URL}")` }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            // Noir du vignettage = `--bg-primary` moins 4 par canal : même
            // amplitude, même teinte que le fond qu'il assombrit.
            'radial-gradient(ellipse 90% 70% at 50% 0%, transparent 0%, rgba(2,12,7,0.4) 60%, rgba(2,12,7,0.85) 100%)',
        }}
      />
    </div>
  );
}
