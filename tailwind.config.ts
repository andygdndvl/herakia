import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Fonds
        'bg-primary': '#080808',
        'bg-secondary': '#0f0f0f',
        'bg-elevated': '#161616',
        // Vert signature — unique accent, ~5 % de la surface
        'green-primary': '#3ecf8e',
        'green-dark': '#2a9e6a',
        'green-glow': 'rgba(62, 207, 142, 0.15)',
        'green-subtle': 'rgba(62, 207, 142, 0.08)',
        'green-line': 'rgba(62, 207, 142, 0.55)',
        'on-green': '#04120a',
        // Textes (contrastes sur #080808 : 17:1, 7,7:1, 5,8:1)
        'text-primary': '#ededed',
        'text-secondary': '#a0a0a0',
        'text-muted': '#8a8a8a',
        // Lignes
        'border-subtle': 'rgba(255, 255, 255, 0.08)',
        'border-strong': 'rgba(255, 255, 255, 0.14)',
        'border-green': 'rgba(62, 207, 142, 0.3)',
        'stroke-object': '#dedede',
        'stroke-deco': '#555555',
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
        'glow-green': '0 0 24px rgba(62, 207, 142, 0.12)',
        'glow-green-lg': '0 0 48px rgba(62, 207, 142, 0.2)',
        'glow-green-sm': '0 0 12px rgba(62, 207, 142, 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
