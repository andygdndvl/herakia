'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MessageSquareText, PhoneMissed } from 'lucide-react';
import type { ReactNode } from 'react';
import type { CallSceneText } from '@/components/metiers/CallScene';

/**
 * L'écran verrouillé des heros métiers : la grande heure, une pastille de situation, puis l'appel
 * qu'on ne peut pas prendre et le résumé de l'assistant, qui arrivent l'un après l'autre.
 * `notifKey` : changer la clé rejoue l'arrivée des notifications (page /metiers, qui fait défiler
 * les métiers). Données fictives, écran décoratif (masqué aux lecteurs d'écran).
 */
export function LockScreen({ scene, chip, notifKey = 'x' }: { scene: CallSceneText; chip: ReactNode; notifKey?: string }) {
  const reduced = useReducedMotion();
  const enter = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 18, scale: 0.97 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
          transition: { delay, duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
        };
  const time = scene.smsTime.match(/\d{1,2}:\d{2}/)?.[0];

  return (
    <div aria-hidden="true" className="mx-auto w-full max-w-[19rem] lg:max-w-[19.5rem]">
      <motion.div
        {...(reduced ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3, duration: 0.6 } })}
        className="rounded-[3.6rem] border border-border-strong bg-bg-secondary p-3 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)]"
      >
        <div className="relative flex h-[37rem] flex-col overflow-hidden rounded-[2.9rem] bg-gradient-to-b from-[#123524] via-[#0b1f15] to-[#07130d] px-4 pb-7 pt-5">
          <div className="flex items-center justify-between px-4 font-mono text-[11px] text-white/60">
            <span>{time}</span>
            <span className="h-5 w-20 rounded-full bg-black/70" />
            <span>5G</span>
          </div>
          <p className="mt-8 text-center font-display text-6xl font-semibold tracking-tight text-white/90">{time}</p>
          <p className="mt-3 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/75">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-late" />
              {chip}
            </span>
          </p>

          <div className="mt-auto">
            <AnimatePresence mode="wait">
              <motion.div key={notifKey} className="flex flex-col gap-2.5">
                <motion.div {...enter(reduced ? 0 : 0.8)} className="rounded-2xl bg-white/[0.08] px-4 py-3 backdrop-blur">
                  <p className="flex items-center gap-2 font-sans text-[11px] text-white/55">
                    <PhoneMissed className="h-3.5 w-3.5 text-signal-late" />
                    {scene.ringing} · {scene.caller}
                  </p>
                  <p className="mt-1 font-sans text-[13px] text-white/80">{scene.ringingHint}</p>
                </motion.div>
                <motion.div {...enter(reduced ? 0 : 1.6)} className="rounded-2xl bg-window px-4 py-3 text-window-ink shadow-lg">
                  <p className="flex items-center gap-2 font-sans text-[11px] text-window-muted">
                    <MessageSquareText className="h-3.5 w-3.5 text-window-ok" />
                    {scene.assistant}
                  </p>
                  <div className="mt-1.5 font-sans text-[13px] leading-snug">
                    {scene.smsLines.map((l, i) => (
                      <p key={l} className={i === 0 ? 'font-semibold' : undefined}>
                        {l}
                      </p>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
