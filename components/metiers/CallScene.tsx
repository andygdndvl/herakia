'use client';

import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { MapPin, MessageSquareText, Phone, PhoneIncoming } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LogoMark } from '@/components/ui/Logo';
import { useLang } from '@/components/i18n/LangProvider';

/** Textes de la scène, propres à chaque métier. */
export interface CallSceneText {
  /** Où vous êtes quand le téléphone sonne (« En visite · appartement T4 »). */
  context: string;
  ringing: string;
  caller: string;
  ringingHint: string;
  assistant: string;
  /** L'échange affiché pendant que l'assistant décroche ; `tia` = l'assistant, `client` = l'appelant. */
  dialogue: readonly { who: 'tia' | 'client'; text: string }[];
  smsApp: string;
  smsTime: string;
  /** Le résumé reçu par SMS ; la première ligne est en gras. Données fictives. */
  smsLines: readonly string[];
}

const UI = {
  fr: { live: 'En ligne', example: 'Exemple' },
  en: { live: 'On call', example: 'Example' },
} as const;

/** Durée de chaque écran avant de passer au suivant, en millisecondes. */
const STEP_MS = [3200, 6400, 4800];

/**
 * Les trois étapes racontées sur un téléphone : il sonne, l'assistant décroche, le résumé arrive.
 * Défile seule quand elle est à l'écran ; chaque étape se choisit aussi au clic. En mouvement
 * réduit, rien ne défile : on choisit l'étape à la main.
 */
export function CallScene({
  steps,
  scene,
}: {
  steps: readonly { title: string; text: string }[];
  scene: CallSceneText;
}) {
  const lang = useLang();
  const ui = UI[lang];
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.4 });
  const [step, setStep] = useState(0);
  const [cycle, setCycle] = useState(0); // relance la minuterie après un clic

  useEffect(() => {
    if (reduced || !inView) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % 3), STEP_MS[step]);
    return () => window.clearTimeout(id);
  }, [step, inView, reduced, cycle]);

  const pick = (i: number) => {
    setStep(i);
    setCycle((c) => c + 1);
  };

  return (
    <div ref={rootRef} className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[1fr_minmax(0,20rem)] md:gap-14">
      {/* Les étapes : celle en cours s'allume et sa barre se remplit */}
      <ol className="order-2 space-y-3 md:order-1">
        {steps.map((s, i) => {
          const on = i === step;
          return (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => pick(i)}
                aria-pressed={on}
                className={`relative w-full overflow-hidden rounded-2xl border p-5 text-left transition-colors ${
                  on ? 'border-green-line bg-bg-secondary' : 'border-border-subtle bg-transparent hover:border-border-strong'
                }`}
              >
                <div className="flex items-baseline gap-3">
                  <span className={`font-mono text-xs tracking-[0.14em] ${on ? 'text-green-primary' : 'text-text-muted'}`}>
                    0{i + 1}
                  </span>
                  <h3 className={`font-display text-lg font-semibold ${on ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {s.title}
                  </h3>
                </div>
                <p className={`mt-2 pl-8 font-sans text-sm leading-relaxed ${on ? 'text-text-secondary' : 'text-text-muted'}`}>
                  {s.text}
                </p>
                {on && !reduced && (
                  <motion.span
                    key={`${step}-${cycle}-${inView}`}
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 h-0.5 bg-green-primary"
                    initial={{ width: '0%' }}
                    animate={{ width: inView ? '100%' : '0%' }}
                    transition={{ duration: STEP_MS[i] / 1000, ease: 'linear' }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {/* Le téléphone */}
      <div aria-hidden="true" className="order-1 mx-auto w-full max-w-[20rem] md:order-2">
        <div className="rounded-[3.6rem] border border-border-strong bg-bg-secondary p-3 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)]">
          <div className="relative flex h-[37rem] flex-col overflow-hidden rounded-[2.9rem] bg-window text-window-ink">
            <div className="flex items-center justify-between px-8 pt-5 font-mono text-[11px] text-window-muted">
              <span>{step === 2 ? '14:34' : '14:32'}</span>
              <span className="h-5 w-20 rounded-full bg-window-ink/90" />
              <span>5G</span>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {step === 0 && (
                <motion.div
                  key="ring"
                  className="flex flex-1 flex-col items-center px-6 pb-8 pt-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-window-bubble px-3 py-1 font-sans text-xs text-window-muted">
                    <MapPin className="h-3.5 w-3.5" />
                    {scene.context}
                  </span>
                  <div className="relative mt-12 grid h-24 w-24 place-items-center">
                    {!reduced &&
                      [0, 1].map((r) => (
                        <motion.span
                          key={r}
                          className="absolute inset-0 rounded-full border-2 border-window-ok"
                          initial={{ scale: 1, opacity: 0.6 }}
                          animate={{ scale: 1.7, opacity: 0 }}
                          transition={{ duration: 1.6, repeat: Infinity, delay: r * 0.8, ease: 'easeOut' }}
                        />
                      ))}
                    <span className="grid h-24 w-24 place-items-center rounded-full bg-window-ok text-white">
                      <PhoneIncoming className="h-10 w-10" />
                    </span>
                  </div>
                  <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-window-muted">{scene.ringing}</p>
                  <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.01em]">{scene.caller}</p>
                  <p className="mt-auto font-sans text-sm text-window-muted">{scene.ringingHint}</p>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="tia"
                  className="flex flex-1 flex-col px-5 pb-6 pt-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 border-b border-window-line pb-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-window-ink">
                      <LogoMark className="h-5 w-5 text-green-primary" />
                    </span>
                    <div>
                      <p className="font-display text-sm font-semibold">{scene.assistant}</p>
                      <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-window-ok">
                        <span className="h-1.5 w-1.5 rounded-full bg-window-ok" />
                        {ui.live}
                      </p>
                    </div>
                    <Phone className="ml-auto h-4 w-4 text-window-muted" />
                  </div>
                  <div className="mt-4 flex flex-col gap-2.5">
                    {scene.dialogue.map((line, i) => (
                      <motion.p
                        key={line.text}
                        initial={reduced ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: reduced ? 0 : 0.4 + i * 1.2, duration: 0.35 }}
                        className={`max-w-[85%] rounded-[18px] px-3.5 py-2.5 font-sans text-[13px] leading-snug ${
                          line.who === 'tia'
                            ? 'self-start rounded-bl-md bg-window-bubble'
                            : 'self-end rounded-br-md bg-window-ok text-white'
                        }`}
                      >
                        {line.text}
                      </motion.p>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="sms"
                  className="flex flex-1 flex-col px-5 pb-6 pt-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2 border-b border-window-line pb-3 font-display text-sm font-semibold">
                    <MessageSquareText className="h-4 w-4 text-window-ok" />
                    {scene.smsApp}
                    <span className="ml-auto rounded-full bg-signal-late px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white">
                      {ui.example}
                    </span>
                  </div>
                  <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-window-muted">
                    {scene.smsTime}
                  </p>
                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: reduced ? 0 : 0.35, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-3 self-start rounded-[18px] rounded-bl-md bg-window-bubble px-4 py-3 font-sans text-[13px] leading-relaxed"
                  >
                    {scene.smsLines.map((l, i) => (
                      <p key={l} className={i === 0 ? 'font-semibold' : undefined}>
                        {l}
                      </p>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
