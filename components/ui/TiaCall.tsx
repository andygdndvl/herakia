'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { Mic, PhoneOff, X, Loader2, ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { TiaContactForm } from './TiaContactForm';
import type { Locale } from '@/dictionaries';

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_TIYA_AGENT_ID ?? '';

type Phase = 'idle' | 'connecting' | 'live' | 'ended' | 'error' | 'unconfigured';
type Mode = 'listening' | 'speaking';

const TEXT = {
  fr: {
    name: 'Tia',
    role: 'Agent d’accueil Herakia',
    intro:
      'Parlez à Tia comme à une vraie interlocutrice. Elle cerne votre besoin, vous oriente, et peut caler un échange.',
    micHint: 'Tia a besoin de votre micro.',
    start: 'Parler à Tia',
    connecting: 'Connexion à Tia…',
    listening: 'Tia vous écoute…',
    speaking: 'Tia parle…',
    hangup: 'Raccrocher',
    endedTitle: 'Conversation terminée',
    endedBody: 'Envie d’aller plus loin sur votre cas précis ?',
    restart: 'Reparler à Tia',
    errorTitle: 'La connexion a échoué',
    errorBody: 'Vérifiez votre micro et réessayez.',
    micDenied: 'Micro refusé. Autorisez l’accès au microphone pour parler à Tia.',
    retry: 'Réessayer',
    soonTitle: 'Tia arrive très bientôt',
    soonBody:
      'Notre agent d’accueil vocal est en cours de finalisation. En attendant, parlons directement de votre cas.',
    cta: 'Réserver un échange',
  },
  en: {
    name: 'Tia',
    role: 'Herakia’s intake agent',
    intro:
      'Talk to Tia like a real person. She scopes your need, points you in the right direction, and can book a call.',
    micHint: 'Tia needs your microphone.',
    start: 'Talk to Tia',
    connecting: 'Connecting to Tia…',
    listening: 'Tia is listening…',
    speaking: 'Tia is speaking…',
    hangup: 'Hang up',
    endedTitle: 'Conversation ended',
    endedBody: 'Want to go deeper on your specific case?',
    restart: 'Talk to Tia again',
    errorTitle: 'Connection failed',
    errorBody: 'Check your microphone and try again.',
    micDenied: 'Microphone denied. Allow mic access to talk to Tia.',
    retry: 'Try again',
    soonTitle: 'Tia is coming very soon',
    soonBody:
      'Our voice intake agent is being finalised. In the meantime, let’s talk about your case directly.',
    cta: 'Book a call',
  },
} as const;

export function TiaCall({
  lang,
  onClose,
  contactHref,
}: {
  lang: Locale;
  onClose: () => void;
  contactHref: string;
}) {
  const t = TEXT[lang];
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('idle');
  const [mode, setMode] = useState<Mode>('listening');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const convRef = useRef<{ endSession: () => unknown } | null>(null);

  // Déclenché par l'outil vocal show_contact_form — la logique du formulaire
  // lui-même vit entièrement dans TiaContactForm.
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactName, setContactName] = useState('');

  const stop = useCallback(async () => {
    try {
      await convRef.current?.endSession();
    } catch {
      /* no-op */
    }
    convRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (!AGENT_ID) {
      setPhase('unconfigured');
      return;
    }
    setErrorMsg('');
    setPhase('connecting');
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setErrorMsg(t.micDenied);
      setPhase('error');
      return;
    }
    try {
      const { Conversation } = await import('@elevenlabs/client');
      convRef.current = await Conversation.startSession({
        agentId: AGENT_ID,
        connectionType: 'webrtc',
        onConnect: () => setPhase('live'),
        onDisconnect: () => setPhase((p) => (p === 'live' ? 'ended' : p)),
        onError: (message: string) => {
          setErrorMsg(message || t.errorBody);
          setPhase('error');
        },
        onModeChange: ({ mode: m }: { mode: string }) =>
          setMode(m === 'speaking' ? 'speaking' : 'listening'),
        clientTools: {
          show_contact_form: async (parameters: { first_name?: string; last_name?: string }) => {
            const fullName = [parameters?.first_name, parameters?.last_name]
              .filter(Boolean)
              .join(' ')
              .trim();
            setContactName(fullName);
            setShowContactForm(true);
            return 'Le formulaire de contact est affiché à l’écran, la personne peut le compléter.';
          },
        },
      });
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : t.errorBody);
      setPhase('error');
    }
  }, [t]);

  const hangup = useCallback(async () => {
    await stop();
    setPhase('ended');
  }, [stop]);

  // Coupe la session si la modale se ferme / démonte
  useEffect(() => {
    return () => {
      void stop();
    };
  }, [stop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const live = phase === 'live';
  const statusText = live ? (mode === 'speaking' ? t.speaking : t.listening) : '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm" aria-hidden="true" />
      <motion.div
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t.name}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border-green bg-bg-secondary shadow-glow-green"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${
                  live ? 'animate-ping bg-green-primary/70' : 'bg-transparent'
                }`}
              />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-primary" />
            </span>
            <div>
              <p className="font-display text-sm font-bold text-text-primary">{t.name}</p>
              <p className="font-mono text-[9px] uppercase tracking-widest text-green-primary">
                {t.role}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition-colors hover:border-green-primary/40 hover:text-green-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {showContactForm ? (
          <TiaContactForm lang={lang} initialName={contactName} />
        ) : (
          <>
            {/* Body */}
            <div className="flex flex-col items-center px-6 py-8 text-center">
              {/* Orbe */}
              <div className="relative flex h-40 w-40 items-center justify-center">
                {(live || phase === 'connecting') && !prefersReducedMotion && (
                  <>
                    <motion.span
                      className="absolute rounded-full bg-green-primary/20"
                      animate={{
                        width: mode === 'speaking' && live ? [140, 168, 140] : [140, 150, 140],
                        height: mode === 'speaking' && live ? [140, 168, 140] : [140, 150, 140],
                        opacity: [0.5, 0.15, 0.5],
                      }}
                      transition={{ duration: mode === 'speaking' ? 1.1 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.span
                      className="absolute rounded-full bg-green-primary/10"
                      animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
                      style={{ width: 140, height: 140 }}
                    />
                  </>
                )}
                <motion.div
                  className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-border-green bg-bg-elevated"
                  animate={
                    live && mode === 'speaking' && !prefersReducedMotion
                      ? { scale: [1, 1.06, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Image
                    src="/agent-ia-vocal.png"
                    alt="Tia, agent d’accueil vocal Herakia"
                    fill
                    sizes="112px"
                    className="scale-125 object-cover"
                  />
                  {phase === 'connecting' && (
                    <span className="absolute inset-0 flex items-center justify-center bg-bg-primary/60">
                      <Loader2 className="h-9 w-9 animate-spin text-green-primary" />
                    </span>
                  )}
                </motion.div>
              </div>

              {/* Statut / textes selon la phase */}
              <div className="mt-6 min-h-[4.5rem]">
                {phase === 'idle' && (
                  <>
                    <p className="font-sans text-sm leading-relaxed text-text-secondary">{t.intro}</p>
                    <p className="mt-2 flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      <Mic className="h-3 w-3" />
                      {t.micHint}
                    </p>
                  </>
                )}
                {phase === 'connecting' && (
                  <p className="font-display text-lg font-semibold text-text-primary">{t.connecting}</p>
                )}
                {live && (
                  <motion.p
                    key={statusText}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-display text-lg font-semibold text-text-primary"
                  >
                    {statusText}
                  </motion.p>
                )}
                {phase === 'ended' && (
                  <>
                    <p className="font-display text-lg font-semibold text-text-primary">{t.endedTitle}</p>
                    <p className="mt-1 font-sans text-sm text-text-secondary">{t.endedBody}</p>
                  </>
                )}
                {phase === 'error' && (
                  <>
                    <p className="font-display text-lg font-semibold text-text-primary">{t.errorTitle}</p>
                    <p className="mt-1 font-sans text-sm text-text-secondary">{errorMsg || t.errorBody}</p>
                  </>
                )}
                {phase === 'unconfigured' && (
                  <>
                    <p className="font-display text-lg font-semibold text-text-primary">{t.soonTitle}</p>
                    <p className="mt-1 font-sans text-sm leading-relaxed text-text-secondary">{t.soonBody}</p>
                  </>
                )}
              </div>
            </div>

            {/* Footer — action selon la phase */}
            <div className="flex flex-col items-center gap-3 border-t border-border-subtle px-6 py-5">
              {phase === 'idle' && (
                <button
                  type="button"
                  onClick={start}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-green-primary px-7 py-3.5 font-display text-base font-bold text-bg-primary shadow-glow-green transition-transform hover:scale-[1.03]"
                >
                  <Mic className="h-5 w-5" />
                  {t.start}
                </button>
              )}
              {phase === 'connecting' && (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-2.5 rounded-xl border border-border-subtle px-7 py-3.5 font-display text-base font-semibold text-text-muted"
                >
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t.connecting}
                </button>
              )}
              {live && (
                <button
                  type="button"
                  onClick={hangup}
                  className="inline-flex items-center gap-2.5 rounded-xl border border-red-500/50 bg-red-500/10 px-7 py-3.5 font-display text-base font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <PhoneOff className="h-5 w-5" />
                  {t.hangup}
                </button>
              )}
              {(phase === 'ended' || phase === 'error') && (
                <>
                  <button
                    type="button"
                    onClick={start}
                    className="inline-flex items-center gap-2 rounded-xl bg-green-primary px-6 py-3 font-display text-sm font-bold text-bg-primary transition-transform hover:scale-[1.03]"
                  >
                    <Mic className="h-4 w-4" />
                    {phase === 'error' ? t.retry : t.restart}
                  </button>
                  <Button href={contactHref} variant="ghost" size="sm">
                    {t.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              {phase === 'unconfigured' && (
                <Button href={contactHref} variant="primary" size="md">
                  {t.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}