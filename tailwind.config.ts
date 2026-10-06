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
        // Vert signature = couleur de la marque ; il rayonne (fond, halo du hero) depuis le
        // spec vert-nuit. Autres accents : le jaune Google (--google-star) et l'orange « problème » (--signal-late).
        'green-primary': 'rgb(var(--green-primary) / <alpha-value>)',
        'green-muted': 'rgb(var(--green-muted) / <alpha-value>)',
        'green-dark': 'rgb(var(--green-dark) / <alpha-value>)',
        'green-deep': 'rgb(var(--green-deep) / <alpha-value>)',
        'green-glow': 'rgba(var(--green-primary-legacy), 0.15)',
        'green-subtle': 'rgba(var(--green-primary-legacy), 0.08)',
        'green-line': 'rgba(var(--green-primary-legacy), 0.55)',
        'on-green': 'rgb(var(--on-green) / <alpha-value>)',
        // Orange « problème » (touches seulement) et fenêtres d'application claires (AppWindow)
        'signal-late': 'rgb(var(--signal-late) / <alpha-value>)',
        window: 'rgb(var(--window-bg) / <alpha-value>)',
        'window-ink': 'rgb(var(--window-ink) / <alpha-value>)',
        'window-muted': 'rgb(var(--window-muted) / <alpha-value>)',
        'window-line': 'rgb(var(--window-line) / <alpha-value>)',
        'window-ok': 'rgb(var(--window-ok) / <alpha-value>)',
        'window-ok-soft': 'rgb(var(--window-ok-soft) / <alpha-value>)',
        'window-bubble': 'rgb(var(--window-bubble) / <alpha-value>)',
        // Textes (contrastes sur #06100b : 16:1, 7,4:1, 5,6:1)
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
        // Bouton d'action : un dégradé vertical très court (15 % de luminance
        // entre le haut et le bas), pas une lueur. La lueur, elle, est portée
        // par `shadow-action` (spec vert-nuit). Le survol reprend la même pente,
        // un cran plus bas, pour que le bouton ne s'aplatisse pas au contact.
        action: 'linear-gradient(180deg, rgb(var(--green-primary)), rgb(var(--green-deep)))',
        'action-hover': 'linear-gradient(180deg, rgb(var(--green-dark)), rgb(var(--green-deep-hover)))',
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
        // Lueur du bouton d'action (spec vert-nuit) : le vert rayonne sous le bouton.
        action: '0 10px 40px -4px rgba(var(--green-primary-legacy), 0.7)',
        'action-hover': '0 12px 46px -2px rgba(var(--green-primary-legacy), 0.8)',
        // Relief des cartes : neutre sur fond sombre, ombre encre sur `.surface-light`
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
      },
    },
  },
  plugins: [],
};

export default config;
