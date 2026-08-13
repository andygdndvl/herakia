'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  FileText,
  Filter,
  MessageCircle,
  Calendar,
  ArrowDownLeft,
  Loader2,
  Check,
  X,
  ArrowRight,
  RotateCw,
  Play,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { fadeInUp, staggerContainer, viewportSettings } from '@/lib/animations';
import { Button } from '@/components/ui/Button';
import { InvoiceAgentDemo } from '@/components/ui/InvoiceAgentDemo';
import { LeadsAgentDemo } from '@/components/ui/LeadsAgentDemo';
import { SupportAgentDemo } from '@/components/ui/SupportAgentDemo';
import { PlanningAgentDemo } from '@/components/ui/PlanningAgentDemo';
import { useLang, localize } from '@/components/i18n/LangProvider';
import type { Locale } from '@/dictionaries';

type StepKind = 'trigger' | 'process' | 'result';
interface Step {
  kind: StepKind;
  text: string;
}
interface Agent {
  icon: LucideIcon;
  type: string;
  title: string;
  pitch: string;
  intro: string;
  steps: Step[];
  outro: string;
  demo?: 'invoice' | 'leads' | 'support' | 'planning';
}

const TEXT = {
  fr: {
    eyebrow: 'En démonstration',
    title: 'Essayez nos agents.',
    subtitle:
      'Cliquez sur « Essayer » : regardez l’agent traiter un cas réel, de bout en bout.',
    secondaryLabel: 'Regardez nos agents à l’œuvre',
    tryLabel: 'Essayer',
    stepLabels: { trigger: 'Déclencheur', process: 'Traitement', result: 'Résultat' },
    replay: 'Rejouer',
    close: 'Fermer',
    modalCta: 'Cet agent, en vrai ? Parlons-en',
    agents: [
      {
        icon: FileText,
        type: 'Facturation',
        title: 'Max',
        demo: 'invoice',
        pitch: 'Vos factures traitées et payées à l’heure, sans ressaisie.',
        intro: 'Une facture fournisseur arrive dans la boîte mail.',
        steps: [
          { kind: 'trigger', text: 'Facture reçue — Fournisseur Nord SAS (PDF)' },
          { kind: 'process', text: 'Lecture et extraction des données…' },
          { kind: 'result', text: 'Montant 1 240 € · échéance 15/08 · TVA 20 % — reconnu' },
          { kind: 'result', text: 'Rapproché du bon de commande #BC-0912' },
          { kind: 'result', text: 'Écriture comptable créée, sans saisie' },
          { kind: 'result', text: 'Paiement programmé à l’échéance (15/08)' },
        ] as Step[],
        outro: '0 ressaisie · 0 oubli d’échéance.',
      },
      {
        icon: Filter,
        type: 'Commercial',
        title: 'Nora',
        demo: 'leads',
        pitch: 'Chaque lead capté, qualifié et relancé — à temps.',
        intro: 'Un lead arrive depuis votre site.',
        steps: [
          { kind: 'trigger', text: 'Nouveau lead — Jeanne D. (formulaire site)' },
          { kind: 'process', text: 'Enrichissement du profil…' },
          { kind: 'result', text: 'Directrice Ops · PME 80 personnes · secteur SaaS' },
          { kind: 'result', text: 'Score 82/100 — lead chaud' },
          { kind: 'result', text: 'Créneau proposé : jeudi 14h · email envoyé' },
          { kind: 'result', text: 'Fiche CRM créée et à jour' },
        ] as Step[],
        outro: 'Plus un seul lead chaud qui refroidit.',
      },
      {
        icon: MessageCircle,
        type: 'Support',
        title: 'Sacha',
        demo: 'support',
        pitch: 'Les demandes récurrentes traitées, 24/7.',
        intro: 'Un client pose une question, un dimanche soir.',
        steps: [
          { kind: 'trigger', text: 'Client : « Où en est ma commande #4821 ? »' },
          { kind: 'process', text: 'Vérification CRM et transporteur…' },
          { kind: 'result', text: 'Commande expédiée hier · livraison prévue demain' },
          { kind: 'result', text: 'Réponse envoyée avec le lien de suivi' },
          { kind: 'result', text: 'Cas simple clôturé — un cas complexe serait escaladé' },
        ] as Step[],
        outro: 'Une réponse en secondes, à toute heure.',
      },
      {
        icon: Calendar,
        type: 'Planning',
        title: 'Elio',
        demo: 'planning',
        pitch: 'Fini les allers-retours d’agenda.',
        intro: 'Trois personnes doivent se caler un RDV.',
        steps: [
          { kind: 'trigger', text: 'Demande de RDV — 3 participants' },
          { kind: 'process', text: 'Recherche d’un créneau commun…' },
          { kind: 'result', text: 'Créneau trouvé : jeudi 10h (dispo de tous)' },
          { kind: 'result', text: 'Invitations agenda envoyées' },
          { kind: 'result', text: 'Rappels programmés J-1 et H-1' },
        ] as Step[],
        outro: 'Un RDV calé, zéro échange inutile.',
      },
    ] as Agent[],
  },
  en: {
    eyebrow: 'Live demo',
    title: 'Try our agents.',
    subtitle: 'Click “Try”: watch the agent handle a real case, end to end.',
    secondaryLabel: 'Watch our agents at work',
    tryLabel: 'Try it',
    stepLabels: { trigger: 'Trigger', process: 'Processing', result: 'Result' },
    replay: 'Replay',
    close: 'Close',
    modalCta: 'Want an agent like this? Let’s talk',
    agents: [
      {
        icon: FileText,
        type: 'Invoicing',
        title: 'Max',
        demo: 'invoice',
        pitch: 'Your invoices processed and paid on time, no re-keying.',
        intro: 'A supplier invoice lands in the inbox.',
        steps: [
          { kind: 'trigger', text: 'Invoice received — Nord SAS supplier (PDF)' },
          { kind: 'process', text: 'Reading and extracting the data…' },
          { kind: 'result', text: 'Amount €1,240 · due 15/08 · VAT 20% — recognised' },
          { kind: 'result', text: 'Matched to purchase order #BC-0912' },
          { kind: 'result', text: 'Accounting entry created, no data entry' },
          { kind: 'result', text: 'Payment scheduled for the due date (15/08)' },
        ] as Step[],
        outro: '0 re-keying · 0 missed due date.',
      },
      {
        icon: Filter,
        type: 'Sales',
        title: 'Nora',
        demo: 'leads',
        pitch: 'Every lead captured, qualified and followed up — in time.',
        intro: 'A lead comes in from your website.',
        steps: [
          { kind: 'trigger', text: 'New lead — Jane D. (website form)' },
          { kind: 'process', text: 'Enriching the profile…' },
          { kind: 'result', text: 'Head of Ops · 80-person SME · SaaS sector' },
          { kind: 'result', text: 'Score 82/100 — hot lead' },
          { kind: 'result', text: 'Slot proposed: Thursday 2pm · email sent' },
          { kind: 'result', text: 'CRM record created and up to date' },
        ] as Step[],
        outro: 'No more hot leads going cold.',
      },
      {
        icon: MessageCircle,
        type: 'Support',
        title: 'Sacha',
        demo: 'support',
        pitch: 'Recurring requests handled, 24/7.',
        intro: 'A customer asks a question, on a Sunday evening.',
        steps: [
          { kind: 'trigger', text: 'Customer: “Where is my order #4821?”' },
          { kind: 'process', text: 'Checking CRM and carrier…' },
          { kind: 'result', text: 'Order shipped yesterday · delivery expected tomorrow' },
          { kind: 'result', text: 'Reply sent with the tracking link' },
          { kind: 'result', text: 'Simple case closed — a complex one would be escalated' },
        ] as Step[],
        outro: 'An answer in seconds, at any hour.',
      },
      {
        icon: Calendar,
        type: 'Scheduling',
        title: 'Elio',
        demo: 'planning',
        pitch: 'No more calendar back-and-forth.',
        intro: 'Three people need to book a meeting.',
        steps: [
          { kind: 'trigger', text: 'Meeting request — 3 participants' },
          { kind: 'process', text: 'Finding a common slot…' },
          { kind: 'result', text: 'Slot found: Thursday 10am (everyone free)' },
          { kind: 'result', text: 'Calendar invites sent' },
          { kind: 'result', text: 'Reminders scheduled 1 day and 1 hour before' },
        ] as Step[],
        outro: 'A meeting booked, zero pointless emails.',
      },
    ] as Agent[],
  },
} as const;

function StepRow({
  step,
  label,
  reducedMotion,
}: {
  step: Step;
  label: string;
  reducedMotion: boolean;
}) {
  const color =
    step.kind === 'result' ? 'text-green-primary' : step.kind === 'process' ? 'text-cyan-300' : 'text-text-muted';
  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-3"
    >
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
          step.kind === 'result'
            ? 'border-border-green bg-green-subtle'
            : step.kind === 'process'
              ? 'border-cyan-300/30 bg-cyan-300/10'
              : 'border-border-subtle bg-bg-elevated'
        } ${color}`}
      >
        {step.kind === 'trigger' && <ArrowDownLeft className="h-3.5 w-3.5" />}
        {step.kind === 'process' && (
          <motion.span
            animate={reducedMotion ? {} : { rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="flex"
          >
            <Loader2 className="h-3.5 w-3.5" />
          </motion.span>
        )}
        {step.kind === 'result' && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <div className="min-w-0">
        <span className={`font-mono text-[9px] uppercase tracking-widest ${color}`}>{label}</span>
        <p className="font-sans text-sm leading-snug text-text-primary">{step.text}</p>
      </div>
    </motion.div>
  );
}

function DemoModal({
  agent,
  labels,
  onClose,
  contactHref,
  lang,
}: {
  agent: Agent;
  labels: {
    stepLabels: Record<StepKind, string>;
    replay: string;
    close: string;
    modalCta: string;
  };
  onClose: () => void;
  contactHref: string;
  lang: Locale;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(0);
  const [runId, setRunId] = useState(0);
  const Icon = agent.icon;
  const isCustom = !!agent.demo;
  const done = visible >= agent.steps.length;

  useEffect(() => {
    if (isCustom) return;
    setVisible(0);
    if (prefersReducedMotion) {
      setVisible(agent.steps.length);
      return;
    }
    const id = setInterval(() => {
      setVisible((v) => {
        if (v >= agent.steps.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, 950);
    return () => clearInterval(id);
  }, [agent, prefersReducedMotion, runId, isCustom]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const replay = () => setRunId((r) => r + 1);

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
        aria-label={agent.title}
        className={`relative w-full overflow-hidden rounded-2xl border border-border-subtle bg-bg-secondary shadow-glow-green ${
          isCustom ? 'max-w-2xl' : 'max-w-lg'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-green bg-green-subtle">
              <Icon className="h-4 w-4 text-green-primary" />
            </span>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-green-primary">
                {agent.type}
              </p>
              <p className="font-display text-sm font-bold text-text-primary">{agent.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition-colors hover:border-green-primary/40 hover:text-green-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        {isCustom ? (
          <div className="px-5 py-6">
            {agent.demo === 'invoice' && (
              <InvoiceAgentDemo key={runId} lang={lang} reducedMotion={!!prefersReducedMotion} />
            )}
            {agent.demo === 'leads' && (
              <LeadsAgentDemo key={runId} lang={lang} reducedMotion={!!prefersReducedMotion} />
            )}
            {agent.demo === 'support' && (
              <SupportAgentDemo key={runId} lang={lang} reducedMotion={!!prefersReducedMotion} />
            )}
            {agent.demo === 'planning' && (
              <PlanningAgentDemo key={runId} lang={lang} reducedMotion={!!prefersReducedMotion} />
            )}
          </div>
        ) : (
          <div className="px-5 py-5">
            <p className="mb-5 font-sans text-sm text-text-secondary">« {agent.intro} »</p>
            <div className="space-y-3">
              {agent.steps.slice(0, visible).map((step, i) => (
                <StepRow
                  key={i}
                  step={step}
                  label={labels.stepLabels[step.kind]}
                  reducedMotion={!!prefersReducedMotion}
                />
              ))}
            </div>

            <AnimatePresence>
              {done && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6 rounded-xl border border-border-green bg-green-subtle px-4 py-3 text-center font-display text-sm font-semibold text-text-primary"
                >
                  {agent.outro}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border-subtle px-5 py-4">
          <button
            type="button"
            onClick={replay}
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-text-secondary transition-colors hover:text-green-primary"
          >
            <RotateCw className="h-3.5 w-3.5" />
            {labels.replay}
          </button>
          <Button href={contactHref} variant="primary" size="sm">
            {labels.modalCta}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AgentDemos() {
  const lang = useLang();
  const t = TEXT[lang];
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden border-y border-border-subtle bg-bg-secondary/40 px-6 py-32 lg:px-8">
      <div
        className="absolute left-1/2 top-1/2 -z-0 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-primary/5 blur-[140px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={fadeInUp}>
            <span className="font-mono text-xs uppercase tracking-widest text-green-primary">
              {t.eyebrow}
            </span>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl lg:text-6xl text-balance"
          >
            {t.title}
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-6 font-sans text-lg leading-relaxed text-text-secondary md:text-xl text-balance"
          >
            {t.subtitle}
          </motion.p>
        </motion.div>

        {/* Grille des agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportSettings}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-14"
        >
          <p className="text-center font-mono text-xs uppercase tracking-widest text-text-muted">
            {t.secondaryLabel}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.agents.map((agent, i) => {
              return (
                <div
                  key={agent.title}
                  className="group flex flex-col rounded-2xl border border-border-subtle bg-bg-secondary/60 p-5 backdrop-blur-md transition-colors duration-300 hover:border-border-green"
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-green-primary">
                    {agent.type}
                  </p>
                  <h4 className="mt-1 font-display text-lg font-bold text-text-primary">
                    {agent.title}
                  </h4>
                  <p className="mt-2 flex-1 font-sans text-sm leading-relaxed text-text-secondary">
                    {agent.pitch}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-border-green bg-green-subtle px-4 py-2.5 font-display text-sm font-semibold text-green-primary transition-all hover:bg-green-primary hover:text-bg-primary"
                  >
                    <Play className="h-3.5 w-3.5" />
                    {t.tryLabel}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {active !== null && (
          <DemoModal
            agent={t.agents[active]}
            labels={t}
            onClose={() => setActive(null)}
            contactHref={localize(lang, '/contact')}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </section>
  );
}