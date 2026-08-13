// app/admin/login/page.tsx
'use client';

import { useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn('credentials', {
      name,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError('Nom d\'utilisateur ou mot de passe incorrect.');
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-primary px-4">
      {/* Grille de fond */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid-md opacity-40" />

      {/* Glow radial derrière la card */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-glow blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-green bg-green-subtle">
            <span className="font-mono text-sm text-green-primary">&gt;_</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">
            Espace admin
          </h1>
          <p className="mt-2 font-mono text-sm text-text-secondary">
            Connecte-toi pour voir les messages reçus
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-border-subtle bg-bg-secondary p-6 shadow-glow-green-sm backdrop-blur-sm"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-2 block font-mono text-xs uppercase tracking-wide text-text-secondary"
            >
              Nom d&apos;utilisateur
            </label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-border-subtle bg-bg-elevated px-3 py-2.5 font-sans text-sm text-text-primary placeholder:text-text-muted outline-none transition focus:border-border-green focus:shadow-glow-green-sm"
              placeholder="ton_nom_utilisateur"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-mono text-xs uppercase tracking-wide text-text-secondary"
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-border-subtle bg-bg-elevated px-3 py-2.5 pr-10 font-sans text-sm text-text-primary placeholder:text-text-muted outline-none transition focus:border-border-green focus:shadow-glow-green-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition hover:text-text-secondary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="font-mono text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-green-primary py-2.5 font-sans text-sm font-medium text-bg-primary transition hover:bg-green-dark hover:shadow-glow-green disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}