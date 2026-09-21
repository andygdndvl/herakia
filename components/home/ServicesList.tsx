'use client';

import { motion } from 'framer-motion';
import { useLang } from '@/components/i18n/LangProvider';

interface ServiceDetail {
  id: string;
  number: string;
  type: string;
  title: string;
  pitch: string;
  description: string;
  features: string[];
  imageSrc?: string;
  imageAlt?: string;
}

const IDS = ['workflows', 'agents', 'llm', 'data', 'conseil'];

const TEXT = {
  fr: {
    badge: 'Nos services',
    titleLead: 'On automatise vos tâches les plus ',
    titleAccent: 'chronophages',
    titleTail: '.',
    subtitle:
      "Cinq façons d'alléger vos équipes — chacune conçue pour votre organisation, branchée sur vos outils, jamais un produit sur étagère.",
    chip1: '100 % sur-mesure',
    chip2: 'Jamais un produit sur étagère',
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
        imageSrc: '/images/services/workflows.webp',
        imageAlt: 'Illustration automatisation des workflows',
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
        imageSrc: '/images/services/agents.webp',
        imageAlt: 'Illustration assistant IA sur-mesure',
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
        imageSrc: '/images/services/llm.webp',
        imageAlt: 'Illustration IA conversationnelle',
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
        imageSrc: '/images/services/data.webp',
        imageAlt: 'Illustration structuration de données',
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
        imageSrc: '/images/services/conseil.webp',
        imageAlt: 'Illustration diagnostic et audit IA',
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
    chip1: '100% bespoke',
    chip2: 'Never off-the-shelf',
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
        imageSrc: '/images/services/workflows.webp',
        imageAlt: 'Workflow automation illustration',
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
        imageSrc: '/images/services/agents.webp',
        imageAlt: 'Custom AI assistant illustration',
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
        imageSrc: '/images/services/llm.webp',
        imageAlt: 'Conversational AI illustration',
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
        imageSrc: '/images/services/data.webp',
        imageAlt: 'Data structuring illustration',
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
        imageSrc: '/images/services/conseil.webp',
        imageAlt: 'AI assessment illustration',
      },
    ],
  },
} as const;

export function ServicesList() {
  const lang = useLang();
  const t = TEXT[lang];

  const services: ServiceDetail[] = t.services.map((s, i) => ({
    ...s,
    features: [...s.features],
    id: IDS[i],
    type: t.types[i],
    number: String(i + 1).padStart(2, '0'),
  }));

  return (
    <>
      {/* Hero / En-tête */}
      <section className="relative overflow-hidden px-6 pt-36 pb-16 lg:px-8">
        <div className="absolute inset-0 bg-grid-pattern bg-grid-md opacity-30" aria-hidden="true" />
        <div
          className="absolute left-1/2 top-1/3 -z-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-green-primary/10 blur-[120px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-5xl text-center">

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-text-primary md:text-6xl lg:text-7xl text-balance"
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
            className="mt-10 flex items-center justify-center gap-6 font-mono text-xs uppercase tracking-wider text-text-muted"
          >
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-green-primary" /> {t.chip1}
            </span>
            <span className="hidden h-px w-12 bg-border-subtle sm:block" />
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-green-primary" /> {t.chip2}
            </span>
          </motion.div>

          {/* Ancre rapide vers les cartes */}
        </div>
      </section>

      {/* Liste des cartes de services en colonne */}
      <section className="relative px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-5xl flex flex-col gap-10">
          {services.map((service, index) => {
            return (
              <motion.div
                key={service.id}
                id={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="relative pt-8 scroll-mt-28"
              >
                <div className="group relative flex flex-col justify-between rounded-2xl border border-border-subtle bg-bg-elevated px-6 pb-8 pt-12 shadow-lg transition-all duration-300 hover:border-border-green hover:shadow-xl md:px-10 md:py-10">

                  <div className="max-w-3xl space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-green-primary">{service.number}</span>
                      <span className="h-px w-8 bg-border-subtle" />
                      <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
                        {service.type}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl font-bold text-text-primary transition-colors group-hover:text-green-primary md:text-3xl">
                      {service.title}
                    </h3>

                    <p className="font-display text-base font-medium text-green-primary">
                      {service.pitch}
                    </p>

                    <p className="font-sans text-sm text-text-secondary md:text-base leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}