'use client';

import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { AppWindow } from '@/components/ui/AppWindow';
import { prefersReducedMotion } from '@/lib/anim';

const TEXT = {
  fr: {
    label: 'Exemple : un devis en retard, rédigé et envoyé par l’agent.',
    window: 'Devis #0912 · Atelier Brun',
    doc: 'Devis',
    status: 'Statut',
    late: 'En retard · 6 jours',
    sent: 'Envoyé · il y a 2 min',
    lines: ['Le client attend…', 'L’agent rédige le devis', 'Envoyé à Atelier Brun · relance programmée'],
    steps: ['Avant', 'L’agent agit', 'Après'],
  },
  en: {
    label: 'Example: an overdue quote, drafted and sent by the agent.',
    window: 'Quote #0912 · Atelier Brun',
    doc: 'Quote',
    status: 'Status',
    late: 'Overdue · 6 days',
    sent: 'Sent · 2 min ago',
    lines: ['The client is waiting…', 'The agent is drafting the quote', 'Sent to Atelier Brun · follow-up scheduled'],
    steps: ['Before', 'The agent acts', 'After'],
  },
} as const;

/** Durée de chaque état : avant → l'agent agit → après. */
const STEP_MS = 2200;
const LAST = 2;

/**
 * Le devis vivant du hero : un seul geste qui raconte la promesse du titre. Le devis est en
 * retard (orange `signal-late`), l'agent le rédige, il part (vert). En boucle tant que la carte
 * est à l'écran et l'onglet visible ; en mouvement réduit, figé sur l'état final.
 *
 * Illustration : un libellé pour les lecteurs d'écran, le contenu animé leur est masqué (il ne
 * doit pas être relu à chaque changement d'état).
 */
export function LiveDevis() {
  const t = TEXT[useLang()];
  const rootRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) {
      setStep(LAST);
      return;
    }
    let timer: ReturnType<typeof setInterval> | undefined;
    let onScreen = false;
    const sync = () => {
      const run = onScreen && document.visibilityState === 'visible';
      if (run && !timer) timer = setInterval(() => setStep((s) => (s + 1) % (LAST + 1)), STEP_MS);
      if (!run && timer) {
        clearInterval(timer);
        timer = undefined;
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    io.observe(root);
    document.addEventListener('visibilitychange', sync);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      if (timer) clearInterval(timer);
    };
  }, []);

  const done = step === LAST;

  return (
    <div ref={rootRef} role="img" aria-label={t.label} className="mx-auto w-full max-w-[560px]">
      <div aria-hidden="true">
        <AppWindow title={t.window}>
          <div className="grid sm:grid-cols-[1.3fr_1fr]">
            {/* Le faux document : décor, retiré sur mobile pour laisser la place au statut. */}
            <div className="hidden border-r border-window-line px-[18px] py-4 sm:block">
              <p className="flex items-baseline justify-between font-display text-lg font-semibold">
                {t.doc}
                <span className="font-mono text-xs font-normal text-window-muted">#0912</span>
              </p>
              {['90%', '70%', '80%', '50%'].map((w) => (
                <span key={w} className="mt-2.5 block h-2 rounded bg-window-line" style={{ width: w }} />
              ))}
            </div>
            <div className="px-[18px] py-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-window-muted">{t.status}</p>
              <span
                // Jamais estompée : du blanc sur un orange atténué tombe sous 4,5:1. L'état « l'agent
                // agit » se lit aux points qui clignotent, pas à l'étiquette.
                className={`mt-1.5 inline-block rounded-[10px] px-2.5 py-1.5 text-[15px] font-semibold text-white transition-colors duration-300 ${
                  done ? 'bg-window-ok' : 'bg-signal-late'
                }`}
              >
                {done ? t.sent : t.late}
              </span>
              {/* Hauteur réservée à deux lignes : le changement d'état ne fait rien bouger. */}
              <p className="mt-3 flex min-h-[2.5rem] items-start gap-2 text-[11px] leading-snug text-window-muted">
                <span className="mt-px h-[22px] w-[22px] shrink-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,#6ff0b4,rgb(var(--window-ok)))]" />
                <span className="pt-1">
                  {t.lines[step]}
                  {step === 1 && (
                    <span className="ml-1 inline-flex gap-[3px]">
                      {[0, 200, 400].map((d) => (
                        <span
                          key={d}
                          className="inline-block h-[5px] w-[5px] animate-pulse rounded-full bg-window-muted"
                          style={{ animationDelay: `${d}ms` }}
                        />
                      ))}
                    </span>
                  )}
                </span>
              </p>
            </div>
          </div>
        </AppWindow>
        <p className="mt-3.5 flex justify-center gap-5 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
          {t.steps.map((s, i) => (
            <span key={s} className={`transition-colors duration-300 ${i === step ? 'text-green-primary' : ''}`}>
              {s}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
