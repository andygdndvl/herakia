import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Les valeurs vivent dans app/globals.css (`:root`), en canaux RVB ;
      // ici on ne fait que les brancher. Une section peut donc s'inverser en
      // redéclarant les jetons (cf. `.surface-light`).
      // `rgb(var(--jeton) / <alpha-value>)` garde le support des modificateurs
      // d'opacité (`bg-bg-primary/80`, `text-green-primary/[0.07]`…).
      // Les jetons qui portaient déjà un alpha gardent l'écriture historique
      // `rgba(…, a)` : Chrome l'arrondit différemment de `rgb(… / a)` (±1/255),
      // et le rendu sombre doit rester identique au pixel près.
      colors: {
        // Fonds
        'bg-primary': 'rgb(var(--bg-primary) / <alpha-value>)',
        'bg-secondary': 'rgb(var(--bg-secondary) / <alpha-value>)',
        'bg-elevated': 'rgb(var(--bg-elevated) / <alpha-value>)',
        // Vert signature — unique accent, ~5 % de la surface
        'green-primary': 'rgb(var(--green-primary) / <alpha-value>)',
        'green-dark': 'rgb(var(--green-dark) / <alpha-value>)',
        'green-glow': 'rgba(var(--green-primary-legacy), 0.15)',
        'green-subtle': 'rgba(var(--green-primary-legacy), 0.08)',
        'green-line': 'rgba(var(--green-primary-legacy), 0.55)',
        'on-green': 'rgb(var(--on-green) / <alpha-value>)',
        // Textes (contrastes sur #0a0d0c : 17:1, 7,7:1, 5,8:1)
        'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        'text-muted': 'rgb(var(--text-muted) / <alpha-value>)',
        // Lignes
        'border-subtle': 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',
        'border-green': 'rgba(var(--green-primary-legacy), var(--border-green-alpha,0.3))',
        'stroke-object': 'rgb(var(--stroke-object) / <alpha-value>)',
        'stroke-deco': 'rgb(var(--stroke-deco) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern':
          'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        rules: 'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-md': '60px 60px',
        'rules-72': '100% 72px',
      },
      boxShadow: {
        'glow-green': '0 0 24px rgba(var(--green-primary-legacy), 0.12)',
        'glow-green-lg': '0 0 48px rgba(var(--green-primary-legacy), 0.2)',
        'glow-green-sm': '0 0 12px rgba(var(--green-primary-legacy), 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
