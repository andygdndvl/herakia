'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ChevronRight, ChevronDown, X } from 'lucide-react';

type TranscriptTurn = { role: 'agent' | 'user'; message: string | null };

type CallRow = {
  id: string;
  conversationId: string;
  date: string;
  durationSecs: number | null;
  callSuccessful: string | null;
  summary: string | null;
  transcript: TranscriptTurn[];
  read: boolean;
  processed: boolean;
};

const GRID = 'grid-cols-[28px_110px_80px_1fr_32px]';

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wide text-bg-primary/40">{label}</p>
      <p className="mt-0.5 text-sm text-bg-primary/80">{value}</p>
    </div>
  );
}

function formatDuration(secs: number | null) {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function CallsTable({ calls }: { calls: CallRow[] }) {
  const [items, setItems] = useState(calls);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showProcessed, setShowProcessed] = useState(false);
  const selected = items.find((c) => c.id === selectedId) ?? null;

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

  const closeModal = () => {
    setSelectedId(null);
    setShowTranscript(false);
  };

  const openRow = (row: CallRow) => {
    setSelectedId(row.id);
    if (row.read) return;
    setItems((prev) => prev.map((c) => (c.id === row.id ? { ...c, read: true } : c)));
    fetch(`/api/admin/tia-calls/${row.conversationId}`, { method: 'PATCH' }).catch(() => {});
  };

  const toggleProcessed = (row: CallRow, next: boolean) => {
    setItems((prev) => prev.map((c) => (c.id === row.id ? { ...c, processed: next } : c)));
    fetch(`/api/admin/tia-calls/${row.conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ processed: next }),
    }).catch(() => {});
  };

  const pending = items.filter((c) => !c.processed);
  const done = items.filter((c) => c.processed);

  const Header = () => (
    <div
      className={`grid ${GRID} gap-2 border-b border-bg-primary/10 bg-text-primary px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-bg-primary/50`}
    >
      <span />
      <span>Date</span>
      <span>Durée</span>
      <span>Résumé</span>
      <span />
    </div>
  );

  const Row = ({ c }: { c: CallRow }) => (
    <div
      onClick={() => openRow(c)}
      className={`grid ${GRID} cursor-pointer items-center gap-2 border-b border-bg-primary/10 px-4 py-3 text-sm transition-colors duration-300 hover:bg-text-primary ${
        c.read ? 'bg-white' : 'border-l-2 border-l-green-primary bg-green-subtle'
      }`}
    >
      <input
        type="checkbox"
        checked={c.processed}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => toggleProcessed(c, e.target.checked)}
        className="h-4 w-4 cursor-pointer rounded border-bg-primary/30 text-green-primary focus:ring-green-primary/40"
        aria-label="Marquer comme traité"
      />
      <span className="whitespace-nowrap text-bg-primary/60">{c.date}</span>
      <span className="whitespace-nowrap text-bg-primary/60">{formatDuration(c.durationSecs)}</span>
      <span className="truncate text-bg-primary/60">{c.summary ?? '—'}</span>
      <ChevronRight className="h-4 w-4 text-bg-primary/30" />
    </div>
  );

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-bg-primary/10 bg-white font-sans">
        <Header />
        {pending.length === 0 ? (
          <div className="p-6 text-center text-sm text-bg-primary/50">
            Aucun appel en attente de traitement.
          </div>
        ) : (
          pending.map((c) => <Row key={c.id} c={c} />)
        )}
      </div>

      {done.length > 0 && (
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => setShowProcessed((v) => !v)}
            className="font-mono text-xs uppercase tracking-wide text-bg-primary/40 underline-offset-2 transition hover:text-bg-primary hover:underline"
          >
            {showProcessed ? 'Masquer' : 'Afficher'} les appels traités — {done.length}
          </button>
          {showProcessed && (
            <div className="overflow-hidden rounded-lg border border-bg-primary/10 bg-white font-sans opacity-60">
              <Header />
              {done.map((c) => <Row key={c.id} c={c} />)}
            </div>
          )}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/50 px-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-bg-primary/10 bg-white p-6 font-sans shadow-2xl"
          >
            <button
              onClick={closeModal}
              aria-label="Fermer"
              className="absolute right-4 top-4 text-bg-primary/40 transition hover:text-bg-primary"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start justify-between pr-8">
              <div>
                <h2 className="font-display text-lg font-semibold text-bg-primary">Appel avec Tia</h2>
                <p className="mt-1 font-mono text-xs text-bg-primary/40">{selected.date}</p>
              </div>
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

            <div className="mt-5 grid grid-cols-2 gap-4">
              <DetailRow label="Durée" value={formatDuration(selected.durationSecs)} />
            </div>

            <div className="mt-4">
              <p className="font-mono text-xs uppercase tracking-wide text-bg-primary/40">Résumé</p>
              <p className="mt-0.5 text-sm text-bg-primary/80">{selected.summary ?? 'Aucun résumé.'}</p>
            </div>

            <div className="mt-4">
              <p className="mb-2 font-mono text-xs uppercase tracking-wide text-bg-primary/40">Enregistrement</p>
              <audio
                controls
                preload="none"
                className="w-full"
                src={`/api/admin/tia-calls/${selected.conversationId}/audio`}
              />
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowTranscript((v) => !v)}
                className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-bg-primary/60 transition hover:text-bg-primary"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${showTranscript ? 'rotate-180' : ''}`}
                />
                {showTranscript ? 'Masquer la transcription' : 'Afficher la transcription'}
              </button>

              {showTranscript && (
                <div className="mt-2 space-y-2 rounded-lg border border-bg-primary/10 p-3">
                  {selected.transcript.map((turn, i) => (
                    <div key={i} className={turn.role === 'agent' ? 'text-left' : 'text-right'}>
                      <span
                        className={`inline-block max-w-[85%] rounded-lg px-3 py-1.5 text-sm ${
                          turn.role === 'agent' ? 'bg-green-subtle text-bg-primary' : 'bg-text-primary text-bg-primary'
                        }`}
                      >
                        {turn.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}