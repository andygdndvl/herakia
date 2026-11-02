'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLang, localize } from '@/components/i18n/LangProvider';
import { trackEvent } from '@/lib/gtag';
import { SmsExample } from '@/components/metiers/SmsExample';
import { METIERS } from '@/lib/metiers';
import { DELAY_DAYS, PRICE_MONTHLY, PRICE_SETUP, SHOW_QUOTE_FOLLOWUP, demoHref, euros } from '@/lib/offreArtisans';

/**
 * Prix d'orientation des formules sur mesure (« projets typiques dès … »), en euros. Ce sont des
 * hypothèses : les ajuster ici selon ce qui est réellement facturé.
 */
const PRICE_AGENTS_FROM = 1500;
const PRICE_SYSTEM_FROM = 4000;

interface Formule {
  id: string;
  title: string;
  pitch: string;
  /** Phrase de repère : à qui s'adresse la formule, pour distinguer les deux formules sur devis. */
  fit?: string;
  /** Texte long de la formule. Plus affiché dans les cartes (accroche + liste suffisent) ;
   *  conservé ici tant qu'Andy n'a pas tranché entre le supprimer et le replacer ailleurs. */
  description: string;
  features: string[];
  priceLines: string[];
  highlighted: boolean;
}

const TEXT = {
  fr: {
    badge: 'Nos formules',
    titleLead: 'Des formules ',
    titleAccent: 'prêtes à installer',
    titleTail: ', ou construites sur mesure.',
    subtitle:
      "De l'audit initial au système complet, chaque formule est calibrée sur votre organisation — jamais un produit sur étagère.",
    highlightBadge: 'Recommandé',
    cta: 'Démarrer un projet',
    readyTitle: 'Prêt à installer',
    readyIntro: 'Une solution déjà au point, installée chez vous en quelques jours.',
    customTitle: 'Sur mesure',
    customIntro: 'Pour aller plus loin : un projet conçu avec vous, à partir de votre organisation.',
    zam: {
      badge: 'Nouveauté',
      title: 'Zéro appel manqué',
      pitch: 'Quand vous ne pouvez pas répondre, votre téléphone est décroché.',
      price: (setup: string, monthly: string) => `Dès ${setup} + ${monthly}/mois`,
      priceNote: 'installation + abonnement, sans engagement',
      features: (days: number) => [
        "Un assistant IA décroche quand vous ne pouvez pas répondre",
        "Il pose les bonnes questions selon votre métier : qui appelle, pourquoi, quand rappeler",
        `Déjà réglé pour : ${METIERS.map((m) => m.label.fr.toLowerCase()).join(', ')}`,
        'Vous recevez un résumé par SMS ou WhatsApp',
        ...(SHOW_QUOTE_FOLLOWUP ? ['En option : relance automatique des devis sans réponse'] : []),
        `Installé en ${days} jours`,
      ],
      demo: 'Écouter la démo',
      more: 'Voir par métier',
    },
    includedTitle: 'Inclus dans toutes les formules',
    included: [
      'Diagnostic offert avant tout engagement',
      'Conformité RGPD, hébergement en Europe',
      '100 % sur-mesure, jamais un produit générique',
      'Accompagnement humain du début à la fin',
    ],
    formules: [
      {
        id: 'audit',
        title: 'Audit & Diagnostic',
        pitch: 'On chiffre le gain avant que vous investissiez.',
        description:
          "Cartographie de vos process, repérage des tâches chronophages et estimation du gain réel de chaque piste d'automatisation. Vous repartez avec une feuille de route priorisée, sans engagement de la suite.",
        features: [
          'Cartographie de vos process et outils actuels',
          'Repérage des tâches à automatiser en priorité',
          'Estimation chiffrée du gain, piste par piste',
          'Feuille de route priorisée, remise en main propre',
        ],
        priceLines: ['Offert', 'Sans engagement de la suite'],
        highlighted: false,
      },
      {
        id: 'agents',
        title: "Mise en place d'agents IA",
        pitch: 'La capacité d’un collaborateur, sans le recrutement.',
        fit: 'Vous avez un ou deux processus précis à automatiser.',
        description:
          "Conception et déploiement d'un ou plusieurs agents IA sur un périmètre défini avec vous : qualification de leads, support client, prise de RDV. Calé sur votre métier, votre ton et vos règles d'escalade.",
        features: [
          'Un périmètre défini avec vous, jamais un agent générique',
          "Intégré à vos outils existants (CRM, mail, téléphonie…)",
          'Fonctionne en continu, y compris le soir et le week-end',
          'Vous gardez le contrôle : il agit dans le cadre que vous fixez',
        ],
        priceLines: [`Dès ${euros(PRICE_AGENTS_FROM, 'fr')}`, 'Projets typiques, + mensualités'],
        highlighted: false,
      },
      {
        id: 'systeme',
        title: "Création d'un système automatisé complet",
        pitch: 'Un outil sur-mesure, conçu et développé de A à Z pour votre activité.',
        fit: 'Vous avez besoin d’un outil complet, pensé pour votre activité.',
        description:
          "On ne se contente pas de connecter des outils existants : on conçoit et on développe un système sur-mesure, pensé pour votre activité — de l'architecture au déploiement. Une solution taillée pour vos process.",
        features: [
          'Conception et développement sur-mesure, de A à Z',
          'Architecture pensée pour votre activité et vos volumes',
          'Intégration avec vos outils existants si nécessaire (CRM, facturation, mails…)',
          'Suivi, maintenance et évolutions après la mise en production',
        ],
        priceLines: [`Dès ${euros(PRICE_SYSTEM_FROM, 'fr')}`, 'Projets typiques, + mensualités'],
        highlighted: false,
      },
    ],
  },
  en: {
    badge: 'Our plans',
    titleLead: 'Plans ',
    titleAccent: 'ready to install',
    titleTail: ', or built to measure.',
    subtitle:
      'From the initial assessment to the full system, every plan is calibrated to your organisation — never off-the-shelf.',
    highlightBadge: 'Recommended',
    cta: 'Start a project',
    readyTitle: 'Ready to install',
    readyIntro: 'A proven solution, set up for you in a few days.',
    customTitle: 'Bespoke',
    customIntro: 'To go further: a project designed with you, around your organisation.',
    zam: {
      badge: 'New',
      title: 'Zero missed calls',
      pitch: 'When you can’t answer, your phone still gets picked up.',
      price: (setup: string, monthly: string) => `From ${setup} + ${monthly}/month`,
      priceNote: 'setup + subscription, no commitment',
      features: (days: number) => [
        "An AI assistant picks up when you can't answer",
        'It asks the right questions for your line of work: who is calling, why, when to call back',
        `Already set up for: ${METIERS.map((m) => m.label.en.toLowerCase()).join(', ')}`,
        'You get a summary by text message or WhatsApp',
        ...(SHOW_QUOTE_FOLLOWUP ? ['Optional: automatic follow-up of unanswered quotes'] : []),
        `Set up in ${days} days`,
      ],
      demo: 'Hear the demo',
      more: 'See by line of work',
    },
    includedTitle: 'Included in every plan',
    included: [
      'Free assessment before any commitment',
      'GDPR-compliant, hosted in Europe',
      '100% bespoke, never a generic product',
      'Human support from start to finish',
    ],
    formules: [
      {
        id: 'audit',
        title: 'Audit & Assessment',
        pitch: 'We quantify the gain before you invest.',
        description:
          'Mapping of your processes, spotting time-consuming tasks and estimating the real gain of each automation avenue. You leave with a prioritised roadmap, with no obligation to continue.',
        features: [
          'Mapping of your current processes and tools',
          'Spotting the tasks to automate first',
          'A costed estimate of the gain, avenue by avenue',
          'A prioritised roadmap, handed over to you',
        ],
        priceLines: ['Free', 'No commitment to go further'],
        highlighted: false,
      },
      {
        id: 'agents',
        title: 'AI Agent Implementation',
        pitch: 'The capacity of a hire, without the recruiting.',
        fit: 'You have one or two specific processes to automate.',
        description:
          'Design and deployment of one or more AI agents on a scope defined with you: lead qualification, customer support, appointment scheduling. Tuned to your business, your tone and your escalation rules.',
        features: [
          'A scope defined with you, never a generic agent',
          'Integrated with your existing tools (CRM, email, telephony…)',
          'Works around the clock, evenings and weekends included',
          'You stay in control: it acts within the boundaries you set',
        ],
        priceLines: [`From ${euros(PRICE_AGENTS_FROM, 'en')}`, 'Typical projects, + monthly fee'],
        highlighted: false,
      },
      {
        id: 'systeme',
        title: 'Complete Automated System',
        pitch: 'A bespoke tool, designed and built from the ground up for your business.',
        fit: 'You need a complete tool, designed around your business.',
        description:
          "We don't just connect existing tools: we design and build a bespoke system, thought through for your business — from architecture to deployment. A solution tailored to your processes.",
        features: [
          'Bespoke design and development, from the ground up',
          'An architecture built for your business and your volumes',
          'Integration with your existing tools where useful (CRM, invoicing, email…)',
          'Ongoing support, maintenance and improvements after launch',
        ],
        priceLines: [`From ${euros(PRICE_SYSTEM_FROM, 'en')}`, 'Typical projects, + monthly fee'],
        highlighted: false,
      },
    ],
  },
} as const;

export function OffresList() {
  const lang = useLang();
  const t = TEXT[lang];
  const formules: Formule[] = t.formules.map((f) => ({
    ...f,
    features: [...f.features],
    priceLines: [...f.priceLines],
  }));

  return (
    <>
      {/* Hero / En-tête */}
      <section className="relative overflow-hidden px-6 pb-8 pt-28 md:pt-32 lg:px-8">
        <div className="absolute inset-0 bg-grid-pattern bg-grid-md opacity-30" aria-hidden="true" />
        <div
          className="absolute left-1/2 top-1/3 -z-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-green-primary/10 blur-[120px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Badge>{t.badge}</Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-text-primary md:text-6xl lg:text-7xl text-balance"
          >
            {t.titleLead}
            <span className="text-green-primary">{t.titleAccent}</span>
            {t.titleTail}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-5 max-w-2xl font-sans text-base leading-relaxed text-text-secondary md:mt-6 md:text-xl text-balance"
          >
            {t.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Prêt à installer : l'offre d'entrée, déclinée par métier (lib/metiers.ts). Large et
          en deux colonnes sur ordinateur (promesse et prix à gauche, contenu et boutons à droite),
          empilée sur mobile. Les valeurs (prix, délai, numéro) viennent de lib/offreArtisans.ts. */}
      <section aria-labelledby="offres-ready" className="relative px-6 pb-20 pt-4 lg:px-8">
        <SectionHeading id="offres-ready" title={t.readyTitle} intro={t.readyIntro} compact />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto grid max-w-5xl gap-8 rounded-3xl border border-green-primary/45 [grid-template-areas:'head'_'list'_'sms'] md:[grid-template-areas:'head_list'_'sms_list'] bg-bg-secondary bg-[radial-gradient(120%_70%_at_50%_0%,rgb(var(--green-primary)/0.16),rgb(var(--green-primary)/0.04)_60%)] px-5 py-9 shadow-[0_24px_60px_-28px_rgb(var(--green-primary)/0.35)] sm:px-7 md:grid-cols-[1fr_1.1fr] md:gap-x-12 md:gap-y-8 md:px-10"
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-green-primary px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-on-green">
            {t.zam.badge}
          </span>

          {/* Mobile : en-tête, liste, boutons, puis l'exemple de SMS. Ordinateur : en-tête et SMS à
              gauche, liste et boutons à droite. */}
          <div className="[grid-area:head]">
            <h3 className="font-display text-2xl font-semibold leading-tight tracking-[-0.015em] text-text-primary md:text-[2rem]">
              {t.zam.title}
            </h3>
            <p className="mt-3 font-sans text-base leading-snug text-green-primary md:text-lg">{t.zam.pitch}</p>
            <div className="mt-6 border-y border-border-subtle py-4">
              <p className="whitespace-nowrap font-display text-[clamp(1.45rem,6.4vw,2.25rem)] font-bold leading-none tracking-[-0.02em] text-green-primary">
                {t.zam.price(euros(PRICE_SETUP, lang), euros(PRICE_MONTHLY, lang))}
              </p>
              <p className="mt-2 font-sans text-sm text-text-muted">{t.zam.priceNote}</p>
            </div>
          </div>

          <SmsExample className="[grid-area:sms]" />

          <div className="flex flex-col [grid-area:list]">
            <ul className="flex-1 space-y-3.5">
              {t.zam.features(DELAY_DAYS).map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-green-primary" />
                  <span className="font-sans text-base leading-snug text-text-primary/85">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                href={demoHref(lang)}
                variant="primary"
                size="md"
                className="sm:flex-1"
                onClick={() => trackEvent('demo_click', { location: 'offres' })}
              >
                <Phone className="h-4 w-4" />
                {t.zam.demo}
              </Button>
              <Button
                href={localize(lang, '/metiers')}
                variant="secondary"
                size="md"
                className="sm:flex-1"
                onClick={() => trackEvent('offer_click', { location: 'offres', offer: 'zero-appel-manque' })}
              >
                {t.zam.more}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Sur mesure : les trois formules d'origine, à égalité depuis que le badge « Recommandé »
          est passé à l'offre prête à installer. Le style « allumé » reste disponible via
          `highlighted` si une formule redevient la recommandée. */}
      <section aria-labelledby="offres-custom" className="relative px-6 pb-16 lg:px-8">
        <SectionHeading id="offres-custom" title={t.customTitle} intro={t.customIntro} />
        <div className="mx-auto grid max-w-6xl items-stretch gap-6 md:grid-cols-3">
          {formules.map((formule, index) => (
            <motion.div
              key={formule.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col rounded-3xl border transition-colors duration-300 ${
                formule.highlighted
                  ? 'border-green-primary/45 bg-bg-secondary bg-[radial-gradient(120%_70%_at_50%_0%,rgb(var(--green-primary)/0.16),rgb(var(--green-primary)/0.04)_60%)] px-7 py-10 shadow-[0_24px_60px_-28px_rgb(var(--green-primary)/0.35)] md:px-8'
                  : 'border-border-subtle bg-white/[0.02] px-6 py-8 hover:border-border-strong md:px-7'
              }`}
            >
              {formule.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-green-primary px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-on-green">
                  {t.highlightBadge}
                </span>
              )}

              <h3 className="font-display text-xl font-semibold leading-tight tracking-[-0.015em] text-text-primary md:min-h-[3.5rem] md:text-[1.375rem]">
                {formule.title}
              </h3>

              <p className="mt-2.5 font-sans text-sm leading-snug text-green-primary md:min-h-[2.5rem]">
                {formule.pitch}
              </p>

              {/* Repère « pour qui » des deux formules sur devis. La hauteur réservée sur ordinateur
                  garde les prix alignés avec l'audit, qui n'en a pas. */}
              <div className="md:min-h-[4.65rem]">
                {formule.fit && (
                  <p className="mt-4 rounded-xl border border-border-subtle bg-white/[0.03] px-3.5 py-2.5 font-sans text-sm leading-snug text-text-primary/85">
                    {formule.fit}
                  </p>
                )}
              </div>

              <div className="mt-5 border-y border-border-subtle py-4">
                <p
                  className={`font-display text-[2rem] font-bold leading-none tracking-[-0.02em] ${
                    formule.highlighted ? 'text-green-primary' : 'text-text-primary'
                  }`}
                >
                  {formule.priceLines[0]}
                </p>
                {formule.priceLines[1] && (
                  <p className="mt-1.5 font-sans text-xs text-text-muted">{formule.priceLines[1]}</p>
                )}
              </div>

              <ul className="mt-5 flex-1 space-y-3">
                {formule.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-primary" />
                    <span className="font-sans text-sm text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                href={localize(lang, '/contact')}
                variant={formule.highlighted ? 'primary' : 'secondary'}
                size="md"
                className="mt-8 w-full"
              >
                {t.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bandeau "inclus dans toutes les formules" */}
      <section className="relative px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-border-subtle bg-bg-secondary px-6 py-8 md:px-10">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-text-primary">
            {t.includedTitle}
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {t.included.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-primary" />
                <span className="font-sans text-sm text-text-secondary">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

/** Titre d'un des deux blocs de la page (« Prêt à installer », « Sur mesure »). */
function SectionHeading({ id, title, intro, compact = false }: { id: string; title: string; intro: string; compact?: boolean }) {
  return (
    <div className={`mx-auto max-w-5xl text-center ${compact ? 'mb-8' : 'mb-10'}`}>
      <h2 id={id} className="font-display text-2xl font-semibold tracking-[-0.015em] text-text-primary md:text-3xl">
        {title}
      </h2>
      <p className="mt-3 font-sans text-base text-text-secondary">{intro}</p>
    </div>
  );
}
