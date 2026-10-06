'use client';

import { Check } from 'lucide-react';
import { useLang } from '@/components/i18n/LangProvider';
import { AppWindow } from '@/components/ui/AppWindow';

export type BenefitPreviewKind = 'sent' | 'calls' | 'chat';

const TEXT = {
  fr: {
    sent: { window: 'Devis #0912', tag: 'Envoyé · il y a 2 min' },
    calls: { window: 'Journal d’appels', done: 'Rappelé' },
    chat: { window: 'WhatsApp', client: 'Où en est ma commande ?', agent: 'Partie ce matin, livrée demain.' },
  },
  en: {
    sent: { window: 'Quote #0912', tag: 'Sent · 2 min ago' },
    calls: { window: 'Call log', done: 'Called back' },
    chat: { window: 'WhatsApp', client: 'Where is my order?', agent: 'Shipped this morning, arriving tomorrow.' },
  },
} as const;

/** Noms de démonstration repris du film (exemples d'interface, pas des clients réels). */
const CALLERS = ['Garage Martin', 'Claire Moreau'];

/**
 * Mini-fenêtre qui montre un bénéfice au lieu de l'illustrer par une icône : un devis parti,
 * des appels rappelés, un client qui a sa réponse. Décorative : le titre et le texte de la carte
 * portent le sens, l'aperçu est masqué aux lecteurs d'écran.
 */
export function BenefitPreview({ kind }: { kind: BenefitPreviewKind }) {
  const t = TEXT[useLang()];

  return (
    // Hauteur commune aux trois aperçus dès qu'ils sont côte à côte (celle du plus haut) : les titres des
    // cartes s'alignent d'une carte à l'autre.
    <div aria-hidden="true" className="sm:min-h-[128px]">
      {kind === 'sent' && (
        <AppWindow title={t.sent.window}>
          <div className="px-3.5 py-3">
            <span className="inline-block rounded-[10px] bg-window-ok px-2.5 py-1.5 text-[15px] font-semibold text-white">
              {t.sent.tag}
            </span>
          </div>
        </AppWindow>
      )}
      {kind === 'calls' && (
        <AppWindow title={t.calls.window}>
          <div className="px-3.5 py-1.5 text-xs">
            {CALLERS.map((name) => (
              <div
                key={name}
                className="flex items-center justify-between gap-2.5 border-b border-window-line py-2 last:border-b-0"
              >
                <span className="font-semibold">{name}</span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-window-ok-soft px-2 py-0.5 text-[10px] font-semibold text-window-ok">
                  <Check className="h-3 w-3" strokeWidth={3} />
                  {t.calls.done}
                </span>
              </div>
            ))}
          </div>
        </AppWindow>
      )}
      {kind === 'chat' && (
        <AppWindow title={t.chat.window}>
          <div className="px-3.5 py-3 text-xs leading-snug">
            <p className="max-w-[85%] rounded-[10px] bg-window-bubble px-2.5 py-2">{t.chat.client}</p>
            <p className="ml-auto mt-1.5 max-w-[85%] rounded-[10px] bg-window-ok-soft px-2.5 py-2">{t.chat.agent}</p>
          </div>
        </AppWindow>
      )}
    </div>
  );
}
