'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ChevronRight, X, Mic } from 'lucide-react';

type SubmissionRow = {
  id: string;
  date: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  need: string;
  message: string | null;
  read: boolean;
  processed: boolean;
  emailSent: boolean;
};

const NEED_LABELS: Record<string, string> = {
  automatisation: 'Automatisation',
  'assistant-ia': 'Assistant IA',
  'ia-conversationnelle': 'IA conversationnelle',
  donnees: 'Données',
  'audit-conseil': 'Audit & conseil',
  'demo-vocale-tia': 'Appel avec Tia',
};

const GRID = 'grid-cols-[28px_110px_1fr_1fr_130px_1fr_150px_32px]';

function NeedBadge({ need }: { need: string }) {
  const label = NEED_LABELS[need] ?? need;
  if (need === 'demo-vocale-tia') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border-green bg-green-subtle px-2 py-0.5 font-mono text-xs font-medium text-green-dark">
        <Mic className="h-3 w-3" />
        {label}
      </span>
    );
  }
  return <span className="text-bg-primary/60">{label}</span>;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wide text-bg-primary/40">{label}</p>
      <p className="mt-0.5 text-sm text-bg-primary/80">{value}</p>
    </div>
  );
}

export function SubmissionsTable({ submissions }: { submissions: SubmissionRow[] }) {
  const [items, setItems] = useState(submissions);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showProcessed, setShowProcessed] = useState(false);
  const selected = items.find((s) => s.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected) return;
    const handleKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setSelectedId(null);
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selected]);

  const openRow = (row: SubmissionRow) => {
    setSelectedId(row.id);
    if (row.read) return;
    setItems((prev) => prev.map((s) => (s.id === row.id ? { ...s, read: true } : s)));
    fetch(`/api/admin/submissions/${row.id}`, { method: 'PATCH' }).catch(() => {});
  };

  const toggleProcessed = (row: SubmissionRow, next: boolean) => {
    setItems((prev) => prev.map((s) => (s.id === row.id ? { ...s, processed: next } : s)));
    fetch(`/api/admin/submissions/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ processed: next }),
    }).catch(() => {});
  };

  const pending = items.filter((s) => !s.processed);
  const done = items.filter((s) => s.processed);

  const Header = () => (
    <div
      className={`grid ${GRID} gap-2 border-b border-bg-primary/10 bg-text-primary px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-bg-primary/50`}
    >
      <span />
      <span>Date</span>
      <span>Nom</span>
      <span>Email</span>
      <span>Téléphone</span>
      <span>Entreprise</span>
      <span>Service</span>
      <span />
    </div>
  );

  const Row = ({ s }: { s: SubmissionRow }) => (
    <div
      onClick={() => openRow(s)}
      className={`grid ${GRID} cursor-pointer items-center gap-2 border-b border-bg-primary/10 px-4 py-3 text-sm transition-colors duration-300 hover:bg-text-primary ${
        s.read ? 'bg-white' : 'border-l-2 border-l-green-primary bg-green-subtle'
      }`}
    >
      <input
        type="checkbox"
        checked={s.processed}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => toggleProcessed(s, e.target.checked)}
        className="h-4 w-4 cursor-pointer rounded border-bg-primary/30 text-green-primary focus:ring-green-primary/40"
        aria-label="Marquer comme traité"
      />
      <span className="whitespace-nowrap text-bg-primary/60">{s.date}</span>
      <span className="truncate font-medium text-bg-primary">{s.name}</span>
      <a
        href={`mailto:${s.email}`}
        onClick={(e) => e.stopPropagation()}
        className="truncate text-bg-primary/60 transition hover:text-green-dark hover:underline"
      >
        {s.email}
      </a>
      <a
        href={`tel:${s.phone}`}
        onClick={(e) => e.stopPropagation()}
        className="whitespace-nowrap text-bg-primary/60 transition hover:text-green-dark hover:underline"
      >
        {s.phone}
      </a>
      <span className="truncate text-bg-primary/60">{s.company ?? '—'}</span>
      <NeedBadge need={s.need} />
      <ChevronRight className="h-4 w-4 text-bg-primary/30" />
    </div>
  );

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-bg-primary/10 bg-white font-sans">
        <Header />
        {pending.length === 0 ? (
          <div className="p-6 text-center text-sm text-bg-primary/50">
            Aucun message en attente de traitement.
          </div>
        ) : (
          pending.map((s) => <Row key={s.id} s={s} />)
        )}
      </div>

      {done.length > 0 && (
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => setShowProcessed((v) => !v)}
            className="font-mono text-xs uppercase tracking-wide text-bg-primary/40 underline-offset-2 transition hover:text-bg-primary hover:underline"
          >
            {showProcessed ? 'Masquer' : 'Afficher'} les messages traités — {done.length}
          </button>
          {showProcessed && (
            <div className="overflow-hidden rounded-lg border border-bg-primary/10 bg-white font-sans opacity-60">
              <Header />
              {done.map((s) => <Row key={s.id} s={s} />)}
            </div>
          )}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/50 px-4 backdrop-blur-sm"
          onClick={() => setSelectedId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-xl border border-bg-primary/10 bg-white p-6 font-sans shadow-2xl"
          >
            <button
              onClick={() => setSelectedId(null)}
              aria-label="Fermer"
              className="absolute right-4 top-4 text-bg-primary/40 transition hover:text-bg-primary"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="pr-8 font-display text-lg font-semibold text-bg-primary">
              {selected.name}
            </h2>
            <p className="mt-1 font-mono text-xs text-bg-primary/40">{selected.date}</p>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <DetailRow
                label="Email"
                value={
                  <a href={`mailto:${selected.email}`} className="transition hover:text-green-dark hover:underline">
                    {selected.email}
                  </a>
                }
              />
              <DetailRow
                label="Téléphone"
                value={
                  <a href={`tel:${selected.phone}`} className="transition hover:text-green-dark hover:underline">
                    {selected.phone}
                  </a>
                }
              />
              <DetailRow label="Entreprise" value={selected.company ?? '—'} />
              <DetailRow label="Service" value={<NeedBadge need={selected.need} />} />
            </div>

            <div className="mt-4">
              <p className="font-mono text-xs uppercase tracking-wide text-bg-primary/40">
                Message
              </p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-bg-primary/80">
                {selected.message ?? 'Aucun message.'}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span
                className={`inline-flex w-fit rounded-full border px-2 py-0.5 font-mono text-xs font-medium ${
                  selected.emailSent
                    ? 'border-border-green bg-green-subtle text-green-dark'
                    : 'border-amber-300 bg-amber-50 text-amber-700'
                }`}
              >
                {selected.emailSent ? 'Email envoyé' : 'Email non envoyé'}
              </span>

              <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-bg-primary/60">
                <input
                  type="checkbox"
                  checked={selected.processed}
                  onChange={(e) => toggleProcessed(selected, e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-bg-primary/30 text-green-primary focus:ring-green-primary/40"
                />
                Traité
              </label>
            </div>
          </div>
        </div>
      )}
    </>
  );
}