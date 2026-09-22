'use client';

import { motion, AnimatePresence, useReducedMotion, useInView } from 'framer-motion';
import {
  Calendar,
  FileText,
  Filter,
  MessageCircle,
  MessageSquare,
  ArrowRight,
  Mail,
  Slack,
  Linkedin,
  Users,
  MousePointerClick,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { fadeInUp, staggerContainer, viewportSettings } from '@/lib/animations';
import { Button } from '@/components/ui/Button';
import { LogoMark } from '@/components/ui/Logo';
import { useLang, localize } from '@/components/i18n/LangProvider';

interface Domain {
  icon: LucideIcon;
  label: string;
  pain: string;
  solution: string;
}

// Apps (noms universels, identiques FR/EN)
const APPS = {
  mail: { name: 'Mail', color: '#2563eb', Icon: Mail },
  messages: { name: 'Messages', color: '#16a34a', Icon: MessageSquare },
  whatsapp: { name: 'WhatsApp', color: '#22c55e', Icon: MessageCircle },
  slack: { name: 'Slack', color: '#611f69', Icon: Slack },
  linkedin: { name: 'LinkedIn', color: '#0a66c2', Icon: Linkedin },
  teams: { name: 'Teams', color: '#4b53bc', Icon: Users },
} as const;
type AppKey = keyof typeof APPS;

// Bannières de notif : app + urgence (rouge/orange) + position + taille + rotation
const NOTIFS: Array<{
  app: AppKey;
  urgent: boolean;
  top: string;
  left: string;
  scale: number;
  rot: number;
}> = [
  { app: 'mail', urgent: true, top: '1%', left: '0%', scale: 1.9, rot: -4 },
  { app: 'slack', urgent: false, top: '4%', left: '17%', scale: 0.7, rot: 3 },
  { app: 'whatsapp', urgent: true, top: '0%', left: '26%', scale: 1.2, rot: -3 },
  { app: 'linkedin', urgent: false, top: '6%', left: '44%', scale: 0.65, rot: 4 },
  { app: 'messages', urgent: true, top: '1%', left: '54%', scale: 2.0, rot: -2 },
  { app: 'mail', urgent: false, top: '5%', left: '82%', scale: 0.9, rot: 3 },
  { app: 'teams', urgent: true, top: '9%', left: '93%', scale: 0.75, rot: -4 },
  { app: 'whatsapp', urgent: false, top: '15%', left: '3%', scale: 0.8, rot: 2 },
  { app: 'mail', urgent: true, top: '20%', left: '15%', scale: 1.05, rot: -3 },
  { app: 'slack', urgent: true, top: '17%', left: '35%', scale: 1.7, rot: 3 },
  { app: 'messages', urgent: false, top: '14%', left: '62%', scale: 0.68, rot: -2 },
  { app: 'linkedin', urgent: true, top: '19%', left: '72%', scale: 1.15, rot: 4 },
  { app: 'mail', urgent: false, top: '16%', left: '88%', scale: 0.85, rot: -3 },
  { app: 'teams', urgent: true, top: '32%', left: '1%', scale: 1.3, rot: 2 },
  { app: 'whatsapp', urgent: true, top: '36%', left: '20%', scale: 0.72, rot: -4 },
  { app: 'mail', urgent: false, top: '30%', left: '30%', scale: 0.95, rot: 3 },
  { app: 'slack', urgent: true, top: '34%', left: '48%', scale: 2.1, rot: -2 },
  { app: 'messages', urgent: false, top: '31%', left: '74%', scale: 0.78, rot: 4 },
  { app: 'linkedin', urgent: true, top: '37%', left: '85%', scale: 1.1, rot: -3 },
  { app: 'mail', urgent: true, top: '48%', left: '8%', scale: 1.6, rot: 3 },
  { app: 'whatsapp', urgent: false, top: '52%', left: '28%', scale: 0.66, rot: -2 },
  { app: 'teams', urgent: true, top: '46%', left: '40%', scale: 0.9, rot: 4 },
  { app: 'slack', urgent: false, top: '50%', left: '58%', scale: 1.2, rot: -4 },
  { app: 'mail', urgent: true, top: '47%', left: '78%', scale: 0.8, rot: 2 },
  { app: 'messages', urgent: true, top: '53%', left: '90%', scale: 1.0, rot: -3 },
  { app: 'whatsapp', urgent: true, top: '64%', left: '2%', scale: 1.15, rot: 3 },
  { app: 'mail', urgent: false, top: '68%', left: '18%', scale: 0.7, rot: -2 },
  { app: 'slack', urgent: true, top: '62%', left: '32%', scale: 1.8, rot: 4 },
  { app: 'linkedin', urgent: false, top: '66%', left: '58%', scale: 0.75, rot: -3 },
  { app: 'teams', urgent: true, top: '63%', left: '68%', scale: 1.05, rot: 2 },
  { app: 'mail', urgent: true, top: '67%', left: '86%', scale: 0.85, rot: -4 },
  { app: 'messages', urgent: false, top: '80%', left: '6%', scale: 0.9, rot: 3 },
  { app: 'whatsapp', urgent: true, top: '84%', left: '22%', scale: 1.25, rot: -2 },
  { app: 'mail', urgent: true, top: '78%', left: '42%', scale: 1.7, rot: 4 },
  { app: 'slack', urgent: false, top: '83%', left: '64%', scale: 0.68, rot: -3 },
  { app: 'linkedin', urgent: true, top: '80%', left: '74%', scale: 1.0, rot: 2 },
  { app: 'teams', urgent: false, top: '85%', left: '88%', scale: 0.8, rot: -4 },
  { app: 'mail', urgent: true, top: '26%', left: '55%', scale: 0.72, rot: 3 },
  { app: 'whatsapp', urgent: true, top: '55%', left: '46%', scale: 0.7, rot: -3 },
  { app: 'slack', urgent: false, top: '72%', left: '48%', scale: 0.75, rot: 4 },
];

// Grosses icônes d'app avec pastille rouge (la pastille qui s'envole)
const BADGE_APPS: Array<{ app: AppKey; urgent: boolean; top: string; left: string; scale: number; mult: number }> = [
  { app: 'mail', urgent: true, top: '28%', left: '10%', scale: 1.5, mult: 1 },
  { app: 'messages', urgent: false, top: '12%', left: '68%', scale: 1.1, mult: 0.8 },
  { app: 'slack', urgent: true, top: '66%', left: '38%', scale: 1.7, mult: 1.15 },
  { app: 'whatsapp', urgent: false, top: '46%', left: '82%', scale: 1.0, mult: 0.6 },
  { app: 'linkedin', urgent: true, top: '58%', left: '14%', scale: 1.2, mult: 0.9 },
];

const TEXT = {
  fr: {
    eyebrow: 'Vos chantiers chronophages',
    title: 'Vos corvées chronophages, absorbées.',
    subtitle:
      'Pas d’agent sur étagère. On conçoit le système sur-mesure qui absorbe vos tâches les plus chronophages.',
    designedLabel: 'Ce qu’on conçoit',
    absorbedLabel: 'Tout est absorbé · 0 en attente',
    revealHint: 'Voir le résultat',
    handleButton: 'Laissez Herakia gérer',
    clickHint: 'Cliquez pour tout absorber',
    times: ['maintenant', 'à l’instant', 'il y a 1 min', 'il y a 3 min', 'il y a 5 min'],
    domains: [
      {
        icon: Calendar,
        label: 'Planning & coordination',
        pain: 'Les agendas vous mangent vos journées.',
        solution: 'RDV & plannings gérés — sans vous.',
      },
      {
        icon: FileText,
        label: 'Facturation & administratif',
        pain: 'Devis, factures, relances : l’admin grignote tout.',
        solution: 'Devis → facture → relance, automatisé.',
      },
      {
        icon: Filter,
        label: 'Leads & développement commercial',
        pain: 'Les leads arrivent, personne ne suit.',
        solution: 'Chaque lead capté, qualifié, relancé.',
      },
      {
        icon: MessageCircle,
        label: 'Relation & support client',
        pain: 'Les mêmes questions saturent vos équipes.',
        solution: 'Les demandes récurrentes absorbées.',
      },
    ] as Domain[],
    notifs: [
      'Facture en retard · Fournisseur Nord',
      'toujours pas de réponse ??',
      'RDV dans 10 min — non confirmé',
      '47 mails non lus',
      '3 leads chauds non traités',
      'Relance oubliée · Devis #0912',
      'Ticket SAV sans réponse · 2 jours',
      'Paiement échu aujourd’hui',
      'Conflit de créneaux',
      '12 contacts à mettre à jour',
      'Devis à envoyer · 5 en attente',
      'Rappelez le client Durand',
      'Stock bientôt épuisé',
      'Vous avez été mentionné',
      'Réunion déplacée à 15h',
      'Note de frais à valider',
    ],
    offbeat: 'Un process bien à vous, chronophage ? C’est exactement ce qu’on adore construire.',
    offbeatCta: 'Parlons de votre cas',
  },
  en: {
    eyebrow: 'Your time-consuming work',
    title: 'Your time-consuming chores, absorbed.',
    subtitle:
      'No off-the-shelf agent. We design the bespoke system that absorbs your most time-consuming tasks.',
    designedLabel: 'What we build',
    absorbedLabel: 'All absorbed · 0 pending',
    revealHint: 'See the result',
    handleButton: 'Let Herakia handle it',
    clickHint: 'Click to absorb it all',
    times: ['now', 'just now', '1 min ago', '3 min ago', '5 min ago'],
    domains: [
      {
        icon: Calendar,
        label: 'Scheduling & coordination',
        pain: 'Calendars eat your whole day.',
        solution: 'Meetings & scheduling handled — without you.',
      },
      {
        icon: FileText,
        label: 'Invoicing & admin',
        pain: 'Quotes, invoices, chasing: admin eats it all.',
        solution: 'Quote → invoice → follow-up, automated.',
      },
      {
        icon: Filter,
        label: 'Leads & sales development',
        pain: 'Leads come in, no one follows up.',
        solution: 'Every lead captured, qualified, followed up.',
      },
      {
        icon: MessageCircle,
        label: 'Customer support & relations',
        pain: 'The same questions overwhelm your team.',
        solution: 'Recurring requests absorbed.',
      },
    ] as Domain[],
    notifs: [
      'Invoice overdue · Nord supplier',
      'still no reply ??',
      'Meeting in 10 min — unconfirmed',
      '47 unread emails',
      '3 hot leads untouched',
      'Follow-up forgotten · Quote #0912',
      'Support ticket ignored · 2 days',
      'Payment due today',
      'Slot conflict',
      '12 contacts to update',
      'Quotes to send · 5 pending',
      'Call client Durand back',
      'Stock running low',
      'You were mentioned',
      'Meeting moved to 3pm',
      'Expense report to approve',
    ],
    offbeat: 'A time-consuming process that’s uniquely yours? That’s exactly what we love to build.',
    offbeatCta: 'Let’s talk about your case',
  },
} as const;

function fmt(n: number) {
  return n > 99 ? '99+' : String(Math.max(1, Math.round(n)));
}

// Pastille rouge « +99 » collée au titre
function TitleBadge() {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const reduced = useReducedMotion();
  // Toujours 7 au rendu serveur/hydratation ; en mouvement réduit on saute à l'état final après montage
  const [count, setCount] = useState(7);

  useEffect(() => {
    if (reduced) setCount(100);
  }, [reduced]);

  useEffect(() => {
    if (!inView || reduced) return;
    const id = setInterval(() => setCount((c) => (c < 108 ? c + 1 : c)), 38);
    return () => clearInterval(id);
  }, [inView, reduced]);

  return (
    // Posé DANS le flux de la ligne (align-middle, aucun décalage négatif) :
    // sa boîte est réservée par la mise en ligne, il ne peut donc plus
    // recouvrir le texte, quelle que soit la largeur.
    <motion.span
      ref={ref}
      initial={{ scale: 0, opacity: 0, y: -8 }}
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 13, delay: 0.35 }}
      className="ml-2.5 inline-flex h-5 min-w-[2rem] items-center justify-center rounded-full bg-red-500 px-2 align-middle font-sans text-xs font-bold tabular-nums text-white shadow-[0_6px_20px_rgba(239,68,68,0.6)] md:ml-3 md:h-11 md:min-w-[3.4rem] md:px-3.5 md:text-xl"
      aria-hidden="true"
    >
      {count > 99 ? '+99' : count}
    </motion.span>
  );
}

// Mur de bannières : 40 nœuds animés qui ne dépendent QUE de `inView`.
// Isolé dans un composant mémoïsé pour qu'il ne soit plus re-rendu à chaque tick
// du compteur des pastilles (avant : ~125 re-rendus de 45 nœuds Framer Motion).
//
// Deux points de coût mesurés à l'entrée en vue (cf. chantiers-report.md) :
//  - `backdrop-blur-md` sur 40 cartes = 40 backdrop-filters recalculés dès que
//    le mur bouge (tremblement). Le fond derrière est un dégradé quasi uniforme :
//    on le remplace par des fonds plus opaques, l'effet visuel est le même.
//  - chaque carte anime `transform` : sans `will-change`, elles partagent la
//    couche du mur, qui est donc repeinte en entier à chaque image. Avec
//    `will-change: transform` chacune a sa couche et le compositeur suffit.
const NotifWall = memo(function NotifWall({
  inView,
  notifs,
  times,
}: {
  inView: boolean;
  notifs: readonly string[];
  times: readonly string[];
}) {
  return (
    <>
      {NOTIFS.map((n, i) => {
        const app = APPS[n.app];
        const AIcon = app.Icon;
        return (
          <motion.div
            key={`notif-${i}`}
            initial={{ opacity: 0, scale: 0.5, y: 24 }}
            animate={inView ? { opacity: 1, scale: n.scale, y: 0 } : {}}
            transition={{ duration: 0.32, delay: 0.02 + i * 0.03, ease: [0.22, 1, 0.36, 1] }}
            style={{ top: n.top, left: n.left, rotate: `${n.rot}deg`, transformOrigin: 'top left', willChange: 'transform' }}
            className={`absolute w-[220px] rounded-2xl border p-2.5 shadow-2xl ${
              n.urgent ? 'border-red-500/50 bg-red-950/85' : 'border-amber-500/50 bg-amber-950/80'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: n.urgent ? '#ef4444' : '#f59e0b' }}
              >
                <AIcon className="h-4 w-4 text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-sans text-xs font-semibold text-text-primary">{app.name}</span>
                  <span
                    className={`shrink-0 font-sans text-[10px] font-medium ${
                      n.urgent ? 'text-red-400' : 'text-amber-400'
                    }`}
                  >
                    {times[i % times.length]}
                  </span>
                </div>
                <p className="truncate font-sans text-[13px] leading-snug text-text-secondary">
                  {notifs[i % notifs.length]}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </>
  );
});

// Grosses icônes d'app + pastille rouge qui grimpe. Le compteur vit ici :
// seuls ces 5 nœuds se re-rendent toutes les 45 ms (et plus les 40 bannières).
const BadgeWall = memo(function BadgeWall({ inView }: { inView: boolean }) {
  const [count, setCount] = useState(14);

  useEffect(() => {
    if (!inView) return;
    const ct = setInterval(() => setCount((c) => (c < 140 ? c + 1 : c)), 45);
    return () => clearInterval(ct);
  }, [inView]);

  return (
    <>
      {BADGE_APPS.map((b, i) => {
        const app = APPS[b.app];
        const AIcon = app.Icon;
        return (
          <motion.div
            key={`badge-${i}`}
            initial={{ opacity: 0, scale: 0.3, y: 20 }}
            animate={inView ? { opacity: 1, scale: b.scale, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.05 + i * 0.08, type: 'spring', stiffness: 220, damping: 16 }}
            style={{ top: b.top, left: b.left, transformOrigin: 'top left', willChange: 'transform' }}
            className="absolute"
          >
            <div className="relative">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-[16px] shadow-xl"
                style={{ backgroundColor: b.urgent ? '#ef4444' : '#f59e0b' }}
              >
                <AIcon className="h-7 w-7 text-white" />
              </div>
              <span className="absolute -right-2 -top-2 flex h-6 min-w-[24px] items-center justify-center rounded-full border-2 border-bg-secondary bg-red-500 px-1 font-sans text-[11px] font-bold tabular-nums text-white shadow-lg">
                {fmt(count * b.mult)}
              </span>
            </div>
          </motion.div>
        );
      })}
    </>
  );
});

function ChaosBoard({
  notifs,
  times,
  buttonLabel,
  hintLabel,
  absorbing,
  onResolve,
}: {
  notifs: readonly string[];
  times: readonly string[];
  buttonLabel: string;
  hintLabel: string;
  absorbing: boolean;
  onResolve: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const bt = setTimeout(() => setShowButton(true), 850);
    return () => clearTimeout(bt);
  }, [inView]);

  // `-mb-32` annule le `pb-32` de la section : comme la bande pleine largeur de
  // TrustedBy, le mur borde directement la section suivante, qui apporte sa
  // propre respiration (py-24). Sans ça : 128 px + 96 px = 224 px de vide.
  return (
    <motion.div
      ref={ref}
      key="chaos"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`relative mt-16 ml-[calc(50%-50vw)] -mb-32 h-[600px] w-screen overflow-hidden border-y bg-bg-secondary/30 transition-colors duration-700 md:h-[560px] ${
        absorbing ? 'border-border-green' : 'border-red-500/25'
      }`}
    >
      {/* Halo rouge de tension → s'éteint quand Herakia absorbe */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-red-500/12 via-transparent to-transparent"
        animate={absorbing ? { opacity: 0 } : { opacity: [0.6, 1, 0.6] }}
        transition={absorbing ? { duration: 0.5 } : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />

      {/* Halo vert qui monte pendant l'absorption */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-green-primary/15 via-transparent to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: absorbing ? 1 : 0 }}
        transition={{ duration: 0.7 }}
        aria-hidden="true"
      />

      {/* Tremblement KO → aspiration vers le cœur Herakia */}
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: '50% 50%' }}
        animate={
          absorbing
            ? { scale: 0.04, opacity: 0 }
            : inView
            ? { x: [0, -2, 2, -1, 1, 0], y: [0, 1, -1, 1, 0] }
            : {}
        }
        transition={
          absorbing
            ? { duration: 0.85, ease: [0.5, 0, 0.15, 1] }
            : { duration: 0.5, repeat: Infinity, repeatDelay: 1.2 }
        }
      >
        {/* Grosses icônes d'app + pastille rouge qui grimpe */}
        <BadgeWall inView={inView} />

        {/* Bannières de notification */}
        <NotifWall inView={inView} notifs={notifs} times={times} />
      </motion.div>

      {/* Cœur Herakia : point d'aspiration */}
      <AnimatePresence>
        {absorbing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[24px] border border-border-green bg-green-subtle text-green-primary shadow-glow-green"
            aria-hidden="true"
          >
            <motion.span
              className="absolute inset-0 rounded-[24px]"
              animate={{ boxShadow: ['0 0 0 0 rgba(63,206,142,0.5)', '0 0 0 60px rgba(63,206,142,0)'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
            />
            <LogoMark className="h-9 w-9" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton « Laissez Herakia gérer » */}
      <AnimatePresence>
        {showButton && !absorbing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
            className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-border-subtle bg-bg-primary/90 px-8 py-7 shadow-2xl backdrop-blur-md">
            {/* Indice explicite : c'est cliquable */}
            <motion.span
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center gap-1.5 rounded-full border border-green-primary/40 bg-bg-primary/80 px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-green-primary backdrop-blur"
            >
              <MousePointerClick className="h-3.5 w-3.5" />
              {hintLabel}
            </motion.span>

            <motion.button
              type="button"
              onClick={onResolve}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              animate={{ boxShadow: ['0 0 0 0 rgba(62,207,142,0.5)', '0 0 0 26px rgba(62,207,142,0)'] }}
              transition={{ boxShadow: { duration: 1.8, repeat: Infinity, ease: 'easeOut' } }}
              className="pointer-events-auto inline-flex cursor-pointer items-center gap-2.5 rounded-2xl bg-green-primary px-9 py-4 font-display text-lg font-bold text-bg-primary shadow-glow-green ring-2 ring-green-primary/50 ring-offset-4 ring-offset-transparent transition-colors hover:bg-green-dark"
            >
              <LogoMark className="h-7 w-7" />
              {buttonLabel}
              <ArrowRight className="h-5 w-5" />
            </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DomainCard({
  domain,
  open,
  onOpen,
  onClose,
  designedLabel,
  revealHint,
}: {
  domain: Domain;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  designedLabel: string;
  revealHint: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = domain.icon;

  return (
    <motion.article
      variants={fadeInUp}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onClick={onOpen}
      aria-expanded={open}
      className={`group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-xl border px-5 py-4 backdrop-blur-md transition-colors duration-300 md:gap-5 md:px-6 md:py-5 ${
        open ? 'border-border-green bg-green-primary/[0.05]' : 'border-border-subtle bg-bg-secondary/40'
      }`}
    >
      {/* Icône domaine — passe en « activé » (vert plein) à l'ouverture */}
      <div
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${
          open ? 'border-green-primary bg-green-primary' : 'border-border-green bg-green-subtle'
        }`}
      >
        <Icon
          className={`h-5 w-5 transition-colors duration-300 ${open ? 'text-bg-primary' : 'text-green-primary'}`}
          aria-hidden="true"
        />
      </div>

      {/* Corps : label fixe + ligne qui se transforme (problème ↔ solution) */}
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[11px] uppercase tracking-widest text-green-primary">
          {domain.label}
        </p>

        <div className="relative mt-1 grid">
          {/* Problème */}
          <motion.p
            initial={false}
            animate={open ? { opacity: 0, y: prefersReducedMotion ? 0 : -6 } : { opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ gridArea: '1 / 1' }}
            aria-hidden={open}
            className="font-display text-base font-medium leading-snug text-text-primary md:text-lg text-balance"
          >
            {domain.pain}
          </motion.p>

          {/* Solution */}
          <motion.p
            initial={false}
            animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ gridArea: '1 / 1', pointerEvents: open ? 'auto' : 'none' }}
            aria-hidden={!open}
            className="flex items-start gap-1.5 font-sans text-sm font-medium leading-snug text-green-primary md:text-base text-balance"
          >
            <ArrowRight className="mt-[3px] h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{domain.solution}</span>
          </motion.p>
        </div>
      </div>

      {/* Indice / statut à droite */}
      <span
        className={`ml-1 hidden shrink-0 items-center gap-1.5 self-center font-mono text-[10px] uppercase tracking-wider transition-colors duration-300 sm:flex ${
          open ? 'text-green-primary' : 'text-text-muted'
        }`}
      >
        {open ? designedLabel : revealHint}
        {open ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ArrowRight className="h-3 w-3" />}
      </span>
    </motion.article>
  );
}

export function WhatWeHandle() {
  const lang = useLang();
  const t = TEXT[lang];
  const prefersReducedMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [absorbing, setAbsorbing] = useState(false);
  const [resolved, setResolved] = useState(false);
  // Le serveur ne connaît pas la préférence de mouvement : on ne bascule en version calme
  // qu'après le montage, sinon le premier rendu client diffère du HTML serveur (hydratation).
  const [calmByPreference, setCalmByPreference] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) setCalmByPreference(true);
  }, [prefersReducedMotion]);

  const calm = calmByPreference || resolved;

  const handleResolve = () => {
    if (prefersReducedMotion) {
      setResolved(true);
      return;
    }
    setAbsorbing(true);
    window.setTimeout(() => setResolved(true), 1050);
  };

  return (
    <section id="chantiers" className="relative overflow-hidden px-6 py-32 lg:px-8">
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportSettings}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={fadeInUp}>
            <span className="eyebrow">
              {t.eyebrow}
            </span>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="h-section mt-4 lg:!text-6xl"
          >
            {t.title}
            <TitleBadge />
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-6 font-sans text-lg leading-relaxed text-text-secondary md:text-xl text-balance"
          >
            {t.subtitle}
          </motion.p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!calm ? (
            <ChaosBoard
              notifs={t.notifs}
              times={t.times}
              buttonLabel={t.handleButton}
              hintLabel={t.clickHint}
              absorbing={absorbing}
              onResolve={handleResolve}
            />
          ) : (
            <motion.div
              key="calm"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mx-auto mt-14 max-w-3xl">
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="mb-6 flex justify-center"
                >
                  <span className="inline-flex items-center gap-2 rounded-full border border-border-green bg-green-subtle px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-green-primary shadow-glow-green">
                    <CheckCircle2 className="h-4 w-4" />
                    {t.absorbedLabel}
                  </span>
                </motion.div>

                <div className="flex flex-col gap-3">
                  {t.domains.map((domain, i) => (
                    <DomainCard
                      key={domain.label}
                      domain={domain}
                      open={openIndex === i}
                      onOpen={() => setOpenIndex(i)}
                      onClose={() => setOpenIndex(null)}
                      designedLabel={t.designedLabel}
                      revealHint={t.revealHint}
                    />
                  ))}
                </div>

                <div className="relative mt-4 flex flex-col items-center gap-4 overflow-hidden rounded-xl border border-border-green bg-bg-secondary px-6 py-6 text-center shadow-glow-green sm:flex-row sm:justify-between sm:text-left">
                  <div
                    className="absolute inset-0 bg-gradient-radial from-green-primary/10 to-transparent"
                    aria-hidden="true"
                  />
                  <p className="relative font-display text-base font-medium leading-snug text-text-primary md:text-lg text-balance">
                    {t.offbeat}
                  </p>
                  <div className="relative shrink-0">
                    <Button href={localize(lang, '/contact')} variant="primary" size="md">
                      {t.offbeatCta}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
