'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Bot, Brain, CheckCircle2, Database, MessageSquare, Workflow } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLang, localize } from '@/components/i18n/LangProvider';

interface ServiceDetail {
  id: string;
  icon: LucideIcon;
  number: string;
  type: string;
  title: string;
  pitch: string;
  description: string;
  features: string[];
  example: { label: string; value: string }[];
}

const ICONS = [Workflow, Bot, MessageSquare, Database, Brain];
const IDS = ['workflows', 'agents', 'llm', 'data', 'conseil'];

const TEXT = {
  fr: {
    badge: 'Nos services',
    titleLead: 'On automatise vos tâches les plus ',
    titleAccent: 'chronophages',
    titleTail: '.',
    subtitle:
      "Cinq façons d'alléger vos équipes — chacune conçue pour votre organisation, branchée sur vos outils, jamais un produit sur étagère.",
    blockCta: 'Discuter de mon besoin',
    caseBadge: 'Cas type',
    active: 'Service actif',
    types: ['Automatisation', 'Assistant IA', 'IA conversationnelle', 'Données', 'Audit & conseil'],
    services: [
      {
        title: 'Vos process qui tournent seuls',
        pitch: 'Vos outils dialoguent, vos tâches répétitives disparaissent.',
        description:
          'On relie vos logiciels entre eux et on automatise les enchaînements que vos équipes font à la main. La donnée circule seule d’un outil à l’autre — plus de double saisie, plus d’oublis, plus d’erreurs de recopie.',
        features: [
          'Cartographie de vos process et repérage des tâches à automatiser',
          'Connexion de vos outils : CRM, facturation, mails, logiciels internes',
          'Enchaînements sur-mesure, calés sur votre façon de travailler',
          'Surveillance active : on est alerté avant vous en cas d’anomalie',
        ],
        example: [
          { label: 'Cas typique', value: 'Une vente signée → facture, relance et mise à jour du CRM déclenchées seules' },
          { label: 'Mise en place', value: 'De quelques jours à deux semaines' },
          { label: 'Sur-mesure', value: 'Conçu sur vos outils, jamais un modèle générique' },
        ],
      },
      {
        title: 'Un assistant taillé pour votre métier',
        pitch: 'La capacité d’un collaborateur, sans le recrutement.',
        description:
          'On conçoit un assistant IA qui prend en charge un pan entier de votre activité : qualifier vos leads, relancer, planifier des RDV, répondre aux demandes courantes. Il connaît vos règles, votre ton, et sait quand passer la main à un humain.',
        features: [
          'Un périmètre défini avec vous, jamais un agent générique',
          'Calé sur votre métier, votre ton et vos règles d’escalade',
          'Il travaille en continu, y compris le soir et le week-end',
          'Vous gardez le contrôle : il agit dans le cadre que vous fixez',
        ],
        example: [
          { label: 'Cas typique', value: 'Vos leads entrants qualifiés et relancés sans intervention' },
          { label: 'Mise en place', value: 'Sous quelques semaines après cadrage du périmètre' },
          { label: 'Sur-mesure', value: 'Un assistant par besoin, construit pour vous' },
        ],
      },
      {
        title: 'Vos clients répondus, 24/7',
        pitch: 'Une IA qui connaît votre entreprise et parle à vos clients.',
        description:
          'On déploie une IA conversationnelle nourrie de votre savoir interne : documents, procédures, catalogue. Elle répond à vos clients et à vos équipes, sur votre site, vos mails ou vos outils — et vos données restent chez vous, en sécurité.',
        features: [
          'Nourrie de vos documents et procédures internes',
          'Disponible là où vous en avez besoin : site, mail, messagerie interne',
          'Garde-fous et historique pour rester fiable et conforme',
          'Vos données restent privées, jamais réutilisées ailleurs',
        ],
        example: [
          { label: 'Cas typique', value: 'Un assistant qui répond aux questions clients récurrentes' },
          { label: 'Mise en place', value: 'Deux à trois semaines' },
          { label: 'Sécurité', value: 'Vos données restent chez vous' },
        ],
      },
      {
        title: 'Vos données enfin exploitables',
        pitch: 'Des données fiables, des décisions qui ne se prennent plus au doigt mouillé.',
        description:
          'On rassemble vos données éparpillées entre vos outils et vos fichiers, on les nettoie, on les dédoublonne et on les structure. Vous obtenez une base fiable, prête à alimenter vos tableaux de bord ou vos assistants IA.',
        features: [
          'Collecte depuis vos outils, vos fichiers et des sources externes',
          'Nettoyage, dédoublonnage et mise en cohérence',
          'Enrichissement pour compléter ce qui manque',
          'Livré là où vous travaillez, dans le respect du RGPD',
        ],
        example: [
          { label: 'Cas typique', value: 'Un fichier clients unique, propre et à jour' },
          { label: 'Mise en place', value: 'Selon le volume et le nombre de sources' },
          { label: 'Conformité', value: 'Traitement respectueux du RGPD' },
        ],
      },
      {
        title: 'On chiffre le gain avant que vous signiez',
        pitch: 'Un diagnostic clair avant le moindre investissement.',
        description:
          'Avant de déployer quoi que ce soit, on cartographie vos tâches chronophages, on estime le gain réel de chaque piste et on vous dit où l’IA vaut le coup — et où elle n’apporte rien. Vous repartez avec une feuille de route priorisée, sans engagement de la suite chez nous.',
        features: [
          'Diagnostic de vos process et de vos tâches chronophages',
          'Repérage des chantiers où l’IA a un vrai impact',
          'Estimation du gain attendu, piste par piste',
          'Feuille de route priorisée — vous décidez de la suite',
        ],
        example: [
          { label: 'Format', value: 'Mission courte de quelques semaines' },
          { label: 'Livrable', value: 'Feuille de route priorisée + restitution' },
          { label: 'Sans engagement', value: 'Libre à vous de déployer avec nous ou non' },
        ],
      },
    ],
  },
  en: {
    badge: 'Our services',
    titleLead: 'We automate your most ',
    titleAccent: 'time-consuming',
    titleTail: ' tasks.',
    subtitle:
      'Five ways to lighten the load on your teams — each designed for your organisation, wired into your tools, never off-the-shelf.',
    blockCta: 'Discuss my need',
    caseBadge: 'Typical case',
    active: 'Service active',
    types: ['Automation', 'AI assistant', 'Conversational AI', 'Data', 'Advisory'],
    services: [
      {
        title: 'Processes that run themselves',
        pitch: 'Your tools talk to each other, your repetitive tasks disappear.',
        description:
          'We connect your software and automate the chains of steps your teams do by hand. Data flows on its own from one tool to the next — no more double entry, no more slip-ups, no more copy errors.',
        features: [
          'Mapping your processes and spotting the tasks to automate',
          'Connecting your tools: CRM, invoicing, email, internal software',
          'Bespoke chains of steps, tuned to the way you work',
          'Active monitoring: we’re alerted before you if something goes wrong',
        ],
        example: [
          { label: 'Typical case', value: 'A signed sale → invoice, follow-up and CRM update triggered on their own' },
          { label: 'Setup time', value: 'A few days to two weeks' },
          { label: 'Bespoke', value: 'Built on your tools, never a generic template' },
        ],
      },
      {
        title: 'An assistant built for your business',
        pitch: 'The capacity of a hire, without the recruiting.',
        description:
          'We design an AI assistant that takes over a whole part of your operations: qualifying leads, following up, scheduling meetings, answering routine requests. It knows your rules, your tone, and when to hand over to a human.',
        features: [
          'A scope defined with you, never a generic agent',
          'Tuned to your business, your tone and your escalation rules',
          'It works around the clock, evenings and weekends included',
          'You stay in control: it acts within the boundaries you set',
        ],
        example: [
          { label: 'Typical case', value: 'Your inbound leads qualified and followed up without intervention' },
          { label: 'Setup time', value: 'Within a few weeks after scoping' },
          { label: 'Bespoke', value: 'One assistant per need, built for you' },
        ],
      },
      {
        title: 'Your customers answered, 24/7',
        pitch: 'An AI that knows your company and talks to your customers.',
        description:
          'We deploy a conversational AI fed with your internal knowledge: documents, procedures, catalogue. It answers your customers and your teams, on your site, your inbox or your tools — and your data stays with you, secure.',
        features: [
          'Fed with your internal documents and procedures',
          'Available wherever you need it: site, email, internal chat',
          'Guardrails and history to stay reliable and compliant',
          'Your data stays private, never reused elsewhere',
        ],
        example: [
          { label: 'Typical case', value: 'An assistant that answers recurring customer questions' },
          { label: 'Setup time', value: 'Two to three weeks' },
          { label: 'Security', value: 'Your data stays with you' },
        ],
      },
      {
        title: 'Your data finally usable',
        pitch: 'Reliable data, decisions no longer made on gut feel.',
        description:
          'We gather your data scattered across tools and files, clean it, de-duplicate it and structure it. You get a reliable base, ready to feed your dashboards or your AI assistants.',
        features: [
          'Collection from your tools, files and external sources',
          'Cleaning, de-duplication and consistency',
          'Enrichment to fill in what’s missing',
          'Delivered where you work, GDPR-compliant',
        ],
        example: [
          { label: 'Typical case', value: 'A single customer file, clean and up to date' },
          { label: 'Setup time', value: 'Depending on volume and number of sources' },
          { label: 'Compliance', value: 'GDPR-respecting processing' },
        ],
      },
      {
        title: 'We quantify the gain before you sign',
        pitch: 'A clear assessment before the slightest investment.',
        description:
          'Before deploying anything, we map your time-consuming tasks, estimate the real gain of each avenue and tell you where AI is worth it — and where it isn’t. You leave with a prioritised roadmap, with no obligation to continue with us.',
        features: [
          'An assessment of your processes and time-consuming tasks',
          'Spotting where AI has a real impact',
          'An estimate of the expected gain, avenue by avenue',
          'A prioritised roadmap — you decide what comes next',
        ],
        example: [
          { label: 'Format', value: 'A short engagement of a few weeks' },
          { label: 'Deliverable', value: 'Prioritised roadmap + presentation' },
          { label: 'No commitment', value: 'You’re free to deploy with us or not' },
        ],
      },
    ],
  },
} as const;

function ServiceBlock({
  service,
  index,
  labels,
  reducedMotion,
}: {
  service: ServiceDetail;
  index: number;
  labels: { blockCta: string; caseBadge: string; active: string; contactHref: string };
  reducedMotion: boolean;
}) {
  const Icon = service.icon;
  const isEven = index % 2 === 0;

  return (
    <section id={service.id} className="relative scroll-mt-24 px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className={`grid gap-12 lg:grid-cols-2 lg:gap-16 ${isEven ? '' : 'lg:[&>*:first-child]:order-2'}`}
        >
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-green-primary">{service.number}</span>
              <span className="h-px flex-1 bg-border-subtle" />
            </div>

            <div className="mt-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border-green bg-green-subtle shadow-glow-green-sm">
              <Icon className="h-7 w-7 text-green-primary" />
            </div>

            <span className="mt-6 block font-mono text-[11px] uppercase tracking-widest text-green-primary">
              {service.type}
            </span>

            <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-text-primary md:text-4xl lg:text-5xl text-balance">
              {service.title}
            </h2>

            <p className="mt-4 font-display text-xl text-green-primary text-balance">{service.pitch}</p>

            <p className="mt-6 font-sans text-base leading-relaxed text-text-secondary md:text-lg">
              {service.description}
            </p>

            <ul className="mt-8 space-y-3">
              {service.features.map((feature, idx) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-primary" />
                  <span className="font-sans text-text-secondary md:text-base">{feature}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-10">
              <Button href={labels.contactHref} variant="primary" size="md">
                {labels.blockCta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={reducedMotion ? undefined : { y: -4 }}
            className="relative"
          >
            <div className="rounded-2xl border border-border-subtle bg-bg-secondary/60 p-8 backdrop-blur-md md:p-10">
              <div className="mb-6 flex items-center justify-between">
                <Badge>{labels.caseBadge}</Badge>
                <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  Herakia · {service.id}
                </span>
              </div>

              <div className="space-y-5">
                {service.example.map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col gap-1 border-b border-border-subtle pb-4 last:border-0 last:pb-0"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
                      {row.label}
                    </span>
                    <span className="font-display text-lg font-semibold text-text-primary md:text-xl">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <motion.div
                animate={reducedMotion ? {} : { opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="mt-8 flex items-center gap-2 font-mono text-xs text-green-primary"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green-primary" />
                <span>{labels.active}</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function ServicesContent() {
  const prefersReducedMotion = useReducedMotion();
  const lang = useLang();
  const t = TEXT[lang];
  const services: ServiceDetail[] = t.services.map((s, i) => ({
    ...s,
    features: [...s.features],
    example: s.example.map((e) => ({ ...e })),
    id: IDS[i],
    icon: ICONS[i],
    type: t.types[i],
    number: String(i + 1).padStart(2, '0'),
  }));
  const labels = {
    blockCta: t.blockCta,
    caseBadge: t.caseBadge,
    active: t.active,
    contactHref: localize(lang, '/contact'),
  };

  return (
    <>
      <section className="relative overflow-hidden px-6 pt-40 pb-24 lg:px-8">
        <div className="absolute inset-0 bg-grid-pattern bg-grid-md opacity-30" aria-hidden="true" />
        <div
          className="absolute left-1/2 top-1/3 -z-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-green-primary/10 blur-[120px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge pulse>{t.badge}</Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 font-display text-5xl font-bold leading-[1.05] tracking-tight text-text-primary md:text-6xl lg:text-7xl text-balance"
          >
            {t.titleLead}
            <span className="text-green-primary">{t.titleAccent}</span>
            {t.titleTail}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-8 max-w-2xl font-sans text-lg leading-relaxed text-text-secondary md:text-xl text-balance"
          >
            {t.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            {services.map((service) => (
              <a
                key={service.id}
                href={`#${service.id}`}
                className="rounded-full border border-border-subtle bg-bg-secondary/40 px-4 py-2 font-mono text-xs uppercase tracking-wider text-text-secondary backdrop-blur-md transition-all hover:border-border-green hover:text-green-primary"
              >
                {service.title}
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="divide-y divide-border-subtle">
        {services.map((service, idx) => (
          <ServiceBlock
            key={service.id}
            service={service}
            index={idx}
            labels={labels}
            reducedMotion={!!prefersReducedMotion}
          />
        ))}
      </div>
    </>
  );
}
