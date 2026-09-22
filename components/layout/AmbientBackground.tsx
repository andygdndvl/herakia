const NOISE_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

/** Fond éditorial : grain léger + vignettage. Statique, sans JS. */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-bg-primary" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-soft-light"
        style={{ backgroundImage: `url("${NOISE_URL}")` }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            // Noir du vignettage = `--bg-primary` moins 4 par canal, comme avant
            // le passage au noir tiède (c'était (6,9,8) sous (10,13,12)) : même
            // amplitude, même teinte que le fond qu'il assombrit.
            'radial-gradient(ellipse 90% 70% at 50% 0%, transparent 0%, rgba(8,8,7,0.4) 60%, rgba(8,8,7,0.85) 100%)',
        }}
      />
    </div>
  );
}
