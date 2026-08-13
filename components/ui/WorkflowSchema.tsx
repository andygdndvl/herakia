'use client';

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Filter, Send, Bell,
  Globe, User, Star, FileText, BookOpen,
  Calendar, ShoppingCart, MessageSquare, Mail, Database,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useLang } from '@/components/i18n/LangProvider';

type NodeType = 'input' | 'process' | 'output';

interface NodeContent {
  icon: LucideIcon;
  label: string;
  sublabel: string;
  type: NodeType;
}

interface Scenario {
  id: string;
  label: string;
  file: string;
  content: Record<string, NodeContent>;
  footer: string;
}

const NODE_W = 132;
const NODE_H = 64;
const VIEWBOX_W = 800;
const VIEWBOX_H = 280;
const ROTATION_MS = 9000;

const LAYOUT: Record<string, { x: number; y: number }> = {
  in1:   { x: 60,  y: 80  },
  in2:   { x: 60,  y: 200 },
  proc1: { x: 280, y: 140 },
  proc2: { x: 460, y: 140 },
  out1:  { x: 640, y: 80  },
  out2:  { x: 640, y: 200 },
};

const LAYOUT_ORDER = ['in1', 'in2', 'proc1', 'proc2', 'out1', 'out2'];

const EDGES = [
  { from: 'in1',   to: 'proc1', delay: 0    },
  { from: 'in2',   to: 'proc1', delay: 0.1  },
  { from: 'proc1', to: 'proc2', delay: 0.25 },
  { from: 'proc2', to: 'out1',  delay: 0.4  },
  { from: 'proc2', to: 'out2',  delay: 0.5  },
];

// Icônes + fichier (invariants par langue)
const SCENARIO_META = [
  { id: 'lead', file: 'qualification-lead.json', icons: { in1: Globe, in2: User, proc1: Cpu, proc2: Filter, out1: Calendar, out2: Send } },
  { id: 'review', file: 'gestion-avis.json', icons: { in1: Star, in2: Database, proc1: Cpu, proc2: Filter, out1: Bell, out2: MessageSquare } },
  { id: 'invoice', file: 'traitement-facture.json', icons: { in1: FileText, in2: BookOpen, proc1: Cpu, proc2: Filter, out1: BookOpen, out2: Send } },
  { id: 'cv', file: 'tri-candidatures.json', icons: { in1: Mail, in2: FileText, proc1: Cpu, proc2: Filter, out1: Calendar, out2: Send } },
  { id: 'order', file: 'traitement-commande.json', icons: { in1: ShoppingCart, in2: Database, proc1: Cpu, proc2: Filter, out1: Send, out2: FileText } },
] as const;

type NodeText = { label: string; sublabel: string };
interface ScenarioText {
  label: string;
  footer: string;
  nodes: Record<string, NodeText>;
}

const SCENARIO_TEXT: Record<'fr' | 'en', ScenarioText[]> = {
  fr: [
    {
      label: 'Qualification de lead',
      footer: '2 sources · analyse du profil · 0 appel inutile',
      nodes: {
        in1: { label: 'Formulaire site', sublabel: 'Déclencheur' },
        in2: { label: 'Profil LinkedIn', sublabel: 'Enrichissement' },
        proc1: { label: 'Agent IA', sublabel: 'Analyse du profil' },
        proc2: { label: 'Score ≥ 60 ?', sublabel: 'Qualification' },
        out1: { label: 'RDV Calendly', sublabel: 'Créé automatiquement' },
        out2: { label: 'Email nurturing', sublabel: 'Lead froid' },
      },
    },
    {
      label: 'Avis client négatif',
      footer: 'Détection < 30s · réponse automatique · SAV informé',
      nodes: {
        in1: { label: 'Google Reviews', sublabel: 'Déclencheur' },
        in2: { label: 'Historique client', sublabel: 'Contexte' },
        proc1: { label: 'Agent IA', sublabel: 'Lecture & sentiment' },
        proc2: { label: 'Urgence ?', sublabel: 'Priorité définie' },
        out1: { label: 'Alerte Slack', sublabel: 'Équipe SAV notifiée' },
        out2: { label: 'Réponse publiée', sublabel: 'Ton adapté' },
      },
    },
    {
      label: 'Facture fournisseur',
      footer: "OCR + extraction · zéro ressaisie · paiement à l'échéance",
      nodes: {
        in1: { label: 'PDF facture', sublabel: 'Déclencheur' },
        in2: { label: 'Plan comptable', sublabel: 'Référentiel' },
        proc1: { label: 'Agent IA', sublabel: 'Extraction données' },
        proc2: { label: 'Validation', sublabel: 'Montant & fournisseur' },
        out1: { label: 'Écriture compta', sublabel: 'Saisie automatique' },
        out2: { label: 'Ordre de virement', sublabel: "À date d'échéance" },
      },
    },
    {
      label: 'CV reçu par email',
      footer: 'Tri automatique · réponse < 2 min · 0 candidature ignorée',
      nodes: {
        in1: { label: 'Email candidat', sublabel: 'Déclencheur' },
        in2: { label: 'Fiche de poste', sublabel: 'Critères RH' },
        proc1: { label: 'Agent IA', sublabel: 'Lecture du CV' },
        proc2: { label: 'Compatible ?', sublabel: 'Score & critères' },
        out1: { label: 'Entretien planifié', sublabel: 'Agenda mis à jour' },
        out2: { label: 'Réponse candidat', sublabel: 'Email personnalisé' },
      },
    },
    {
      label: 'Commande e-commerce',
      footer: 'Traitement < 3s · stock en temps réel · 0 rupture surprise',
      nodes: {
        in1: { label: 'Nouvelle commande', sublabel: 'Déclencheur' },
        in2: { label: 'Stock entrepôt', sublabel: 'Disponibilité' },
        proc1: { label: 'Agent IA', sublabel: 'Vérification stock' },
        proc2: { label: 'Traitement', sublabel: 'Préparation validée' },
        out1: { label: 'Email confirmation', sublabel: 'Client informé' },
        out2: { label: 'Bon préparation', sublabel: 'Entrepôt notifié' },
      },
    },
  ],
  en: [
    {
      label: 'Lead qualification',
      footer: '2 sources · profile analysis · 0 wasted calls',
      nodes: {
        in1: { label: 'Website form', sublabel: 'Trigger' },
        in2: { label: 'LinkedIn profile', sublabel: 'Enrichment' },
        proc1: { label: 'AI agent', sublabel: 'Profile analysis' },
        proc2: { label: 'Score ≥ 60?', sublabel: 'Qualification' },
        out1: { label: 'Calendly meeting', sublabel: 'Created automatically' },
        out2: { label: 'Nurturing email', sublabel: 'Cold lead' },
      },
    },
    {
      label: 'Negative customer review',
      footer: 'Detection < 30s · automatic reply · support informed',
      nodes: {
        in1: { label: 'Google Reviews', sublabel: 'Trigger' },
        in2: { label: 'Customer history', sublabel: 'Context' },
        proc1: { label: 'AI agent', sublabel: 'Reading & sentiment' },
        proc2: { label: 'Urgent?', sublabel: 'Priority set' },
        out1: { label: 'Slack alert', sublabel: 'Support team notified' },
        out2: { label: 'Reply posted', sublabel: 'Tone adapted' },
      },
    },
    {
      label: 'Supplier invoice',
      footer: 'OCR + extraction · zero re-keying · payment on due date',
      nodes: {
        in1: { label: 'Invoice PDF', sublabel: 'Trigger' },
        in2: { label: 'Chart of accounts', sublabel: 'Reference' },
        proc1: { label: 'AI agent', sublabel: 'Data extraction' },
        proc2: { label: 'Validation', sublabel: 'Amount & supplier' },
        out1: { label: 'Accounting entry', sublabel: 'Automatic posting' },
        out2: { label: 'Payment order', sublabel: 'On due date' },
      },
    },
    {
      label: 'CV received by email',
      footer: 'Automatic sorting · reply < 2 min · 0 application ignored',
      nodes: {
        in1: { label: 'Candidate email', sublabel: 'Trigger' },
        in2: { label: 'Job description', sublabel: 'HR criteria' },
        proc1: { label: 'AI agent', sublabel: 'CV reading' },
        proc2: { label: 'Match?', sublabel: 'Score & criteria' },
        out1: { label: 'Interview scheduled', sublabel: 'Calendar updated' },
        out2: { label: 'Candidate reply', sublabel: 'Personalised email' },
      },
    },
    {
      label: 'E-commerce order',
      footer: 'Processing < 3s · real-time stock · 0 surprise stockouts',
      nodes: {
        in1: { label: 'New order', sublabel: 'Trigger' },
        in2: { label: 'Warehouse stock', sublabel: 'Availability' },
        proc1: { label: 'AI agent', sublabel: 'Stock check' },
        proc2: { label: 'Processing', sublabel: 'Picking validated' },
        out1: { label: 'Confirmation email', sublabel: 'Customer informed' },
        out2: { label: 'Picking slip', sublabel: 'Warehouse notified' },
      },
    },
  ],
};

function nodeType(key: string): NodeType {
  if (key.startsWith('in')) return 'input';
  if (key.startsWith('proc')) return 'process';
  return 'output';
}

function getEdgePath(fromId: string, toId: string): string {
  const from = LAYOUT[fromId];
  const to = LAYOUT[toId];
  const startX = from.x + NODE_W;
  const startY = from.y + NODE_H / 2;
  const endX = to.x;
  const endY = to.y + NODE_H / 2;
  const midX = (startX + endX) / 2;
  return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
}

const EDGE_PATHS = EDGES.map((e) => ({ ...e, d: getEdgePath(e.from, e.to) }));

export function WorkflowSchema() {
  const prefersReducedMotion = useReducedMotion();
  const lang = useLang();
  const [activeIdx, setActiveIdx] = useState(0);

  const ui =
    lang === 'en'
      ? { live: 'Live', diagram: (l: string) => `Workflow diagram: ${l}`, scenario: (l: string) => `Scenario: ${l}` }
      : { live: 'Live', diagram: (l: string) => `Schéma du workflow : ${l}`, scenario: (l: string) => `Scénario : ${l}` };

  const scenarios: Scenario[] = SCENARIO_META.map((meta, i) => {
    const txt = SCENARIO_TEXT[lang][i];
    const content: Record<string, NodeContent> = {};
    (Object.keys(meta.icons) as Array<keyof typeof meta.icons>).forEach((key) => {
      content[key] = {
        icon: meta.icons[key],
        label: txt.nodes[key].label,
        sublabel: txt.nodes[key].sublabel,
        type: nodeType(key),
      };
    });
    return { id: meta.id, label: txt.label, file: meta.file, content, footer: txt.footer };
  });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % scenarios.length);
    }, ROTATION_MS);
    return () => clearTimeout(timer);
  }, [activeIdx, prefersReducedMotion, scenarios.length]);

  const scenario = scenarios[activeIdx];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border-subtle bg-bg-secondary/50 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-primary/60" />
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={scenario.file}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="font-mono text-xs text-text-muted"
          >
            workflow · {scenario.file}
          </motion.span>
        </AnimatePresence>
        <span className="flex items-center gap-1.5 font-mono text-xs text-green-primary">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-green-primary"
            animate={prefersReducedMotion ? {} : { opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {ui.live}
        </span>
      </div>

      <div
        className="relative bg-grid-pattern bg-grid-md"
        style={{ aspectRatio: `${VIEWBOX_W} / ${VIEWBOX_H}` }}
      >
        <div className="absolute left-3 top-3 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-primary/80 px-3 py-1.5 backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-primary" />
              <span className="font-display text-xs font-semibold text-text-primary">
                {scenario.label}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <svg
              viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="xMidYMid meet"
              aria-label={ui.diagram(scenario.label)}
            >
              <defs>
                <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(62, 207, 142, 0)" />
                  <stop offset="50%" stopColor="rgba(62, 207, 142, 1)" />
                  <stop offset="100%" stopColor="rgba(62, 207, 142, 0)" />
                </linearGradient>
              </defs>

              {EDGE_PATHS.map((edge) => (
                <g key={`${edge.from}-${edge.to}`}>
                  <motion.path
                    d={edge.d}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1.5"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: edge.delay, ease: [0.22, 1, 0.36, 1] }}
                  />
                  {!prefersReducedMotion && (
                    <motion.path
                      d={edge.d}
                      stroke="url(#edge-gradient)"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="0 60 60 1000"
                      initial={{ strokeDashoffset: 1120 }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{
                        duration: 2.4,
                        delay: edge.delay + 0.8,
                        repeat: Infinity,
                        repeatDelay: 1.5,
                        ease: 'linear',
                      }}
                    />
                  )}
                </g>
              ))}
            </svg>

            {LAYOUT_ORDER.map((id, idx) => {
              const pos = LAYOUT[id];
              const content = scenario.content[id];
              const Icon = content.icon;
              const isProcess = content.type === 'process';
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: idx * 0.06, type: 'spring', stiffness: 200, damping: 18 }}
                  className={`absolute flex items-center gap-2.5 rounded-xl border px-3 py-2 backdrop-blur-md ${
                    isProcess
                      ? 'border-border-green bg-green-subtle shadow-glow-green-sm'
                      : 'border-border-subtle bg-bg-elevated/90'
                  }`}
                  style={{
                    left: `${(pos.x / VIEWBOX_W) * 100}%`,
                    top: `${(pos.y / VIEWBOX_H) * 100}%`,
                    width: `${(NODE_W / VIEWBOX_W) * 100}%`,
                    height: `${(NODE_H / VIEWBOX_H) * 100}%`,
                  }}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isProcess ? 'bg-green-primary/15 text-green-primary' : 'bg-bg-primary text-text-secondary'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-xs font-semibold text-text-primary">
                      {content.label}
                    </div>
                    <div className="truncate font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {content.sublabel}
                    </div>
                  </div>
                  {isProcess && !prefersReducedMotion && (
                    <motion.span
                      className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-primary"
                      animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="border-t border-border-subtle px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AnimatePresence mode="wait">
            <motion.span
              key={scenario.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 font-mono text-[11px] text-text-muted"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-primary" />
              {scenario.footer}
            </motion.span>
          </AnimatePresence>

          <div className="flex items-center gap-2">
            {scenarios.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveIdx(i)}
                aria-label={ui.scenario(s.label)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIdx ? 'w-6 bg-green-primary' : 'w-1.5 bg-border-subtle hover:bg-text-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {!prefersReducedMotion && (
        <div className="h-px bg-border-subtle">
          <motion.div
            key={activeIdx}
            className="h-full bg-green-primary"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: ROTATION_MS / 1000, ease: 'linear' }}
            style={{ transformOrigin: 'left' }}
          />
        </div>
      )}
    </div>
  );
}
