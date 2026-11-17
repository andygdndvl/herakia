'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Phone, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLang, localize } from '@/components/i18n/LangProvider';
import { trackEvent } from '@/lib/gtag';
import { SmsExample } from '@/components/metiers/SmsExample';
import { PRICE_MONTHLY, demoHref, euros } from '@/lib/offreTia';

/**
 * Prix d'orientation des formules sur mesure (« projets typiques dès … »), en euros. Ce sont des
 * hypothèses : les ajuster ici selon ce qui est réellement facturé.
 */
const PRICE_AGENTS_FROM = 1500;
const PRICE_SYSTEM_FROM = 4000;
/** Mensualités d'orientation (hébergement, suivi, maintenance), affichées « dès ». */
const PRICE_AGENTS_MONTHLY = 99;
const PRICE_SYSTEM_MONTHLY = 250;
/** Repère salarié de la carte Agents : coût mensuel chargé d'un(e) assistant(e), calculé par nos soins. */
const EMPLOYEE_MONTHLY_COST = 2800;

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
  /** Montant principal (« Dès 1 500 € », « Offert »). */
  price: string;
  /** Mensualité, affichée sous le montant principal. */
  monthly?: string;
  /** Petite note sous les montants (HT, projets typiques…). */
  priceNote: string;
  /** Repère de comparaison (coût d'un salarié), sous le prix. */
  benchmark?: string;
  /** Preuve client, sous le prix. */
  proof?: string;
  highlighted: boolean;
}

const TEXT = {
  fr: {
    badge: 'Nos formules',
    titleLead: 'Un agent ',
    titleAccent: 'prêt à l’emploi',
    titleTail: ', ou un projet sur mesure.',
    subtitle:
      "De l'audit initial au système complet, chaque formule est calibrée sur votre organisation — jamais un produit sur étagère.",
    highlightBadge: 'Conseillé pour démarrer',
    cta: 'Réserver mon audit gratuit',
    readyTitle: 'Prêt à l’emploi',
    readyIntro: 'Un seul agent pour le téléphone, les messages, les rendez-vous et les relances.',
    customTitle: 'Sur mesure',
    customIntro: 'Pour aller plus loin : un projet conçu avec vous, à partir de votre organisation.',
    tia: {
      badge: 'Bientôt · liste d’attente ouverte',
      title: 'Tia',
      avatarAlt: 'Tia, le super-agent IA d’Herakia',
      pitch: 'Le super-agent IA qui répond, planifie et relance à votre place.',
      price: (monthly: string) => `Dès ${monthly}/mois`,
      priceNote: 'HT · sans frais d’installation, sans engagement',
      features: [
        'Répond au téléphone 24 h/24 et vous envoie un résumé de chaque appel',
        'Répond à vos messages : WhatsApp, e-mail, chat de votre site',
        'Prend les rendez-vous directement dans votre agenda',
        'Relance vos devis sans réponse et vos factures impayées',
        'Réglée pour votre métier : les bonnes questions, votre ton, vos horaires',
      ],
      waitlist: 'Rejoindre la liste d’attente',
      demo: 'Parler à Tia',
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
        price: 'Offert',
        priceNote: 'Sans engagement de la suite',
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
        price: `Dès ${euros(PRICE_AGENTS_FROM, 'fr')}`,
        monthly: `+ dès ${euros(PRICE_AGENTS_MONTHLY, 'fr')}/mois`,
        priceNote: 'HT · projets typiques',
        benchmark: `Pour comparer : un(e) assistant(e) salarié(e) coûte environ ${euros(EMPLOYEE_MONTHLY_COST, 'fr')} par mois, charges comprises.`,
        proof: "Chez IPSSI : des dizaines d'heures de saisie supprimées chaque semaine.",
        highlighted: true,
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
        price: `Dès ${euros(PRICE_SYSTEM_FROM, 'fr')}`,
        monthly: `+ dès ${euros(PRICE_SYSTEM_MONTHLY, 'fr')}/mois`,
        priceNote: 'HT · projets typiques',
        highlighted: false,
      },
    ],
  },
  en: {
    badge: 'Our plans',
    titleLead: 'An agent ',
    titleAccent: 'ready to use',
    titleTail: ', or a bespoke project.',
    subtitle:
      'From the initial assessment to the full system, every plan is calibrated to your organisation — never off-the-shelf.',
    highlightBadge: 'Suggested starting point',
    cta: 'Book my free audit',
    readyTitle: 'Ready to use',
    readyIntro: 'One agent for calls, messages, appointments and follow-ups.',
    customTitle: 'Bespoke',
    customIntro: 'To go further: a project designed with you, around your organisation.',
    tia: {
      badge: 'Coming soon · waiting list open',
      title: 'Tia',
      avatarAlt: 'Tia, Herakia’s AI super-agent',
      pitch: 'The AI super-agent that answers, schedules and follows up for you.',
      price: (monthly: string) => `From ${monthly}/month`,
      priceNote: 'excl. VAT · no setup fee, no commitment',
      features: [
        'Answers the phone 24/7 and sends you a summary of every call',
        'Answers your messages: WhatsApp, email, your website chat',
        'Books appointments straight into your calendar',
        'Follows up on unanswered quotes and unpaid invoices',
        'Set up for your line of work: the right questions, your tone, your hours',
      ],
      waitlist: 'Join the waiting list',
      demo: 'Talk to Tia',
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
        price: 'Free',
        priceNote: 'No commitment to go further',
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
        price: `From ${euros(PRICE_AGENTS_FROM, 'en')}`,
        monthly: `+ from ${euros(PRICE_AGENTS_MONTHLY, 'en')}/month`,
        priceNote: 'excl. VAT · typical projects',
        benchmark: `For comparison: a salaried assistant costs around ${euros(EMPLOYEE_MONTHLY_COST, 'en')} a month, employer charges included.`,
        proof: 'At IPSSI: dozens of hours of data entry removed every week.',
        highlighted: true,
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
        price: `From ${euros(PRICE_SYSTEM_FROM, 'en')}`,
        monthly: `+ from ${euros(PRICE_SYSTEM_MONTHLY, 'en')}/month`,
        priceNote: 'excl. VAT · typical projects',
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

      {/* Prêt à l'emploi : Tia, l'offre d'entrée (liste d'attente tant qu'elle n'est pas ouverte).
          Large et en deux colonnes sur ordinateur (promesse et prix à gauche, contenu et boutons à
          droite), empilée sur mobile. Prix et numéro de démo viennent de lib/offreTia.ts. */}
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
            {t.tia.badge}
          </span>

          {/* Mobile : en-tête, liste, boutons, puis l'exemple de SMS. Ordinateur : en-tête et SMS à
              gauche, liste et boutons à droite. */}
          <div className="[grid-area:head]">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 md:h-20 md:w-20">
                <Image
                  src="/tia-avatar.png"
                  alt={t.tia.avatarAlt}
                  fill
                  sizes="80px"
                  className="rounded-full object-cover object-top ring-2 ring-green-primary/60 ring-offset-2 ring-offset-bg-secondary"
                />
                <span
                  className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-bg-secondary bg-green-primary"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-display text-2xl font-semibold leading-tight tracking-[-0.015em] text-text-primary md:text-[2rem]">
                {t.tia.title}
              </h3>
            </div>
            <p className="mt-3 font-sans text-base leading-snug text-green-primary md:text-lg">{t.tia.pitch}</p>
            <div className="mt-6 border-y border-border-subtle py-4">
              <p className="whitespace-nowrap font-display text-[clamp(1.45rem,6.4vw,2.25rem)] font-bold leading-none tracking-[-0.02em] text-green-primary">
                {t.tia.price(euros(PRICE_MONTHLY, lang))}
              </p>
              <p className="mt-2 font-sans text-sm text-text-muted">{t.tia.priceNote}</p>
            </div>
          </div>

          <SmsExample className="[grid-area:sms]" />

          <div className="flex flex-col [grid-area:list]">
            <ul className="flex-1 space-y-3.5">
              {t.tia.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-green-primary" />
                  <span className="font-sans text-base leading-snug text-text-primary/85">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                href={`${localize(lang, '/contact')}?offre=tia`}
                variant="primary"
                size="md"
                className="whitespace-nowrap sm:flex-[1.4]"
                onClick={() => trackEvent('offer_click', { location: 'offres', offer: 'tia' })}
              >
                {t.tia.waitlist}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                href={demoHref(lang)}
                variant="secondary"
                size="md"
                className="sm:flex-1"
                onClick={() => trackEvent('demo_click', { location: 'offres' })}
              >
                <Phone className="h-4 w-4" />
                {t.tia.demo}
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Sur mesure : les trois formules d'origine. La carte Agents est « allumée » comme point de
          départ conseillé (`highlighted`) ; toutes mènent à l'audit gratuit, vrai point d'entrée. */}
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
                  ? 'border-green-primary/45 bg-bg-secondary bg-[radial-gradient(120%_70%_at_50%_0%,rgb(var(--green-primary)/0.16),rgb(var(--green-primary)/0.04)_60%)] px-6 py-8 shadow-[0_24px_60px_-28px_rgb(var(--green-primary)/0.35)] md:px-7'
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
                  {formule.price}
                </p>
                {formule.monthly && (
                  <p className="mt-2 font-display text-lg font-semibold leading-none tracking-[-0.01em] text-text-primary/85">
                    {formule.monthly}
                  </p>
                )}
                <p className="mt-2 font-sans text-xs text-text-muted">{formule.priceNote}</p>
              </div>

              {(formule.benchmark || formule.proof) && (
                <div className="mt-4 space-y-2.5">
                  {formule.benchmark && (
                    <p className="font-sans text-xs leading-snug text-text-muted">{formule.benchmark}</p>
                  )}
                  {formule.proof && (
                    <p className="flex items-start gap-2 rounded-xl border border-green-primary/25 bg-green-primary/[0.06] px-3 py-2 font-sans text-xs leading-snug text-text-primary/85">
                      <TrendingUp className="mt-px h-3.5 w-3.5 shrink-0 text-green-primary" />
                      {formule.proof}
                    </p>
                  )}
                </div>
              )}

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
                onClick={() => trackEvent('offer_click', { location: 'offres', offer: formule.id })}
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
