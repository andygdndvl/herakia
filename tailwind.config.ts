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
        'bg-primary': '#0a0a0a',
        'bg-secondary': '#111111',
        'bg-elevated': '#1a1a1a',
        // Vert signature
        'green-primary': '#3ecf8e',
        'green-dark': '#2a9e6a',
        'green-glow': 'rgba(62, 207, 142, 0.15)',
        'green-subtle': 'rgba(62, 207, 142, 0.08)',
        // Violet complémentaire (fond ambiant)
        'violet-primary': '#6d5bf6',
        'violet-glow': 'rgba(109, 91, 246, 0.38)',
        // Textes
        'text-primary': '#f0f0f0',
        'text-secondary': '#a0a0a0',
        'text-muted': '#555555',
        // Bordures
        'border-subtle': 'rgba(255, 255, 255, 0.08)',
        'border-green': 'rgba(62, 207, 142, 0.3)',
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
      },
      backgroundSize: {
        'grid-md': '60px 60px',
      },
      boxShadow: {
        'glow-green': '0 0 30px rgba(62, 207, 142, 0.2)',
        'glow-green-lg': '0 0 60px rgba(62, 207, 142, 0.35)',
        'glow-green-sm': '0 0 16px rgba(62, 207, 142, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
