'use client';

import { Check } from 'lucide-react';
import { useLang } from '@/components/i18n/LangProvider';
import { AppWindow } from '@/components/ui/AppWindow';

export type BenefitPreviewKind = 'sent' | 'calls' | 'chat';

const TEXT = {
  fr: {
    sent: { window: 'Devis #0912 · Atelier Brun', doc: 'Devis', tag: 'Envoyé · il y a 2 min' },
    calls: { window: 'Téléphonie · Journal d’appels', done: 'Rappelé' },
    chat: {
      window: 'WhatsApp · Julie Renard',
      client: 'Bonjour, où en est ma commande ?',
      agent: 'Bonjour Julie ! Partie ce matin, livraison demain avant 13 h.',
    },
  },
  en: {
    sent: { window: 'Quote #0912 · Atelier Brun', doc: 'Quote', tag: 'Sent · 2 min ago' },
    calls: { window: 'Phone · Call log', done: 'Called back' },
    chat: {
      window: 'WhatsApp · Julie Renard',
      client: 'Hi, where is my order?',
      agent: 'Hi Julie! It shipped this morning, arriving tomorrow before 1 pm.',
    },
  },
} as const;

/** Données de démonstration reprises du film (exemples d'interface, pas des clients réels). */
const CALLS = [
  { name: 'Garage Martin', time: '11:02' },
  { name: 'Claire Moreau', time: '10:31' },
];

/**
 * La fenêtre qui montre un bénéfice : un devis parti, des appels rappelés, un client qui a sa
 * réponse. Décorative : le titre et le texte du bénéfice portent le sens.
 */
export function BenefitPreview({ kind }: { kind: BenefitPreviewKind }) {
  const t = TEXT[useLang()];

  if (kind === 'sent') {
    return (
      <AppWindow title={t.sent.window}>
        <div className="px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <span className="font-display text-base font-semibold">{t.sent.doc}</span>
            <span className="inline-flex items-center gap-1.5 rounded-[10px] bg-window-ok px-2.5 py-1.5 text-sm font-semibold text-white">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
              {t.sent.tag}
            </span>
          </div>
          {['90%', '72%', '84%'].map((w) => (
            <span key={w} className="mt-2.5 block h-2 rounded bg-window-line" style={{ width: w }} />
          ))}
        </div>
      </AppWindow>
    );
  }

  if (kind === 'calls') {
    return (
      <AppWindow title={t.calls.window}>
        <div className="px-4 py-1.5 text-[13px]">
          {CALLS.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between gap-2.5 border-b border-window-line py-2.5 last:border-b-0"
            >
              <span>
                <span className="block font-semibold">{c.name}</span>
                <span className="block font-mono text-[11px] text-window-muted">{c.time}</span>
              </span>
              <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-window-ok-soft px-2.5 py-1 text-[11px] font-semibold text-window-ok">
                <Check className="h-3 w-3" strokeWidth={3} />
                {t.calls.done}
              </span>
            </div>
          ))}
        </div>
      </AppWindow>
    );
  }

  return (
    <AppWindow title={t.chat.window}>
      <div className="px-4 py-3.5 text-[13px] leading-snug">
        <p className="max-w-[82%] rounded-xl bg-window-bubble px-3 py-2">{t.chat.client}</p>
        <p className="ml-auto mt-2 max-w-[82%] rounded-xl bg-window-ok-soft px-3 py-2">{t.chat.agent}</p>
      </div>
    </AppWindow>
  );
}
