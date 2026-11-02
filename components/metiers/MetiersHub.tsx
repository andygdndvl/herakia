'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Bot,
  Calculator,
  Check,
  Compass,
  Database,
  GraduationCap,
  HardHat,
  House,
  MessagesSquare,
  PhoneIncoming,
  Stethoscope,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LogoMark } from '@/components/ui/Logo';
import { Chantiers } from '@/components/home/Chantiers';
import { SAVOIR_FAIRE, type Savoir } from '@/components/metiers/textes/savoirFaire';
import { useLang, localize } from '@/components/i18n/LangProvider';
import { prefersReducedMotion, useReveal, useTextReveal } from '@/lib/anim';
import { trackEvent } from '@/lib/gtag';
import { METIERS, type MetierSlug } from '@/lib/metiers';
import { PRICE_SETUP, euros } from '@/lib/offreArtisans';

const METIER_ICONS: Record<MetierSlug, LucideIcon> = {
  artisans: HardHat,
  immobilier: House,
  comptables: Calculator,
  sante: Stethoscope,
  enseignement: GraduationCap,
};

const SAVOIR_ICONS: Record<Savoir | 'conseil', LucideIcon> = {
  telephone: PhoneIncoming,
  workflows: Workflow,
  agents: Bot,
  llm: MessagesSquare,
  data: Database,
  conseil: Compass,
};

const TEXT = {
  fr: {
    eyebrow: 'Par métier',
    titleLead: 'Ce qu’on construit ',
    titleAccent: 'pour votre métier.',
    subtitle:
      'Assistant téléphonique, agents IA, automatisations, réponses à vos clients, données remises d’aplomb : choisissez votre métier pour voir ce qu’on peut prendre en charge.',
    ctaPick: 'Choisir mon métier',
    ctaProject: 'Démarrer un projet',
    chips: ['Prêt à installer ou sur mesure', 'Diagnostic offert'],
    windowLabel: 'Pris en charge',
    showMetier: (label: string) => `Voir l’exemple : ${label}`,
    tabsEyebrow: 'Choisissez votre métier',
    tabsTitle: 'Il parle la langue de votre métier.',
    ready: (price: string) => `Prêt à installer · dès ${price}`,
    custom: 'Sur mesure',
    seeAssistant: 'Voir l’assistant téléphonique',
    seeService: 'Voir ce savoir-faire',
    talk: 'Parler de mon cas',
    savoirEyebrow: 'Nos savoir-faire',
    savoirTitle: 'Six façons de vous rendre du temps.',
    savoirs: [
      { id: 'telephone', title: 'Zéro appel manqué', text: 'Un assistant téléphonique prêt à installer, réglé pour votre métier.', href: '/offres' },
      { id: 'workflows', title: 'Vos process qui tournent seuls', text: 'Vos outils dialoguent, vos tâches répétitives disparaissent.', href: '/services/workflows' },
      { id: 'agents', title: 'Un assistant taillé pour votre métier', text: 'La capacité d’un collaborateur, sans le recrutement.', href: '/services/agents' },
      { id: 'llm', title: 'Vos clients répondus, 24/7', text: 'Une IA qui connaît votre entreprise et parle à vos clients.', href: '/services/llm' },
      { id: 'data', title: 'Vos données enfin exploitables', text: 'Des données fiables, des décisions qui ne se prennent plus au doigt mouillé.', href: '/services/data' },
      { id: 'conseil', title: 'On chiffre le gain avant que vous signiez', text: 'Un diagnostic clair avant le moindre investissement.', href: '/services/conseil' },
    ],
    finalBadge: 'Diagnostic offert',
    finalTitle: 'Votre métier n’est pas dans la liste ? On l’adapte.',
    finalText: 'Racontez-nous vos journées : on repère ensemble ce qui peut être pris en charge, et ce que ça vous rendrait.',
    finalSecondary: 'Voir les offres',
    finalFooter: 'contact@herakia.com · Réponse sous 24 h',
  },
  en: {
    eyebrow: 'By industry',
    titleLead: 'What we build ',
    titleAccent: 'for your line of work.',
    subtitle:
      'Phone assistant, AI agents, automations, answers for your customers, data put back in order: choose your line of work to see what we can take on.',
    ctaPick: 'Choose my line of work',
    ctaProject: 'Start a project',
    chips: ['Ready to install or bespoke', 'Free assessment'],
    windowLabel: 'Taken care of',
    showMetier: (label: string) => `Show the example: ${label}`,
    tabsEyebrow: 'Choose your line of work',
    tabsTitle: 'It speaks the language of your trade.',
    ready: (price: string) => `Ready to install · from ${price}`,
    custom: 'Bespoke',
    seeAssistant: 'See the phone assistant',
    seeService: 'See this expertise',
    talk: 'Talk about my case',
    savoirEyebrow: 'What we do',
    savoirTitle: 'Six ways to give you back your time.',
    savoirs: [
      { id: 'telephone', title: 'Zero missed calls', text: 'A ready-to-install phone assistant, set up for your line of work.', href: '/offres' },
      { id: 'workflows', title: 'Processes that run themselves', text: 'Your tools talk to each other, your repetitive tasks disappear.', href: '/services/workflows' },
      { id: 'agents', title: 'An assistant built for your business', text: 'The capacity of an extra team member, without the hiring.', href: '/services/agents' },
      { id: 'llm', title: 'Your customers answered, 24/7', text: 'An AI that knows your business and talks to your customers.', href: '/services/llm' },
      { id: 'data', title: 'Your data finally usable', text: 'Reliable data, decisions no longer made by guesswork.', href: '/services/data' },
      { id: 'conseil', title: 'We quantify the gain before you sign', text: 'A clear assessment before any investment.', href: '/services/conseil' },
    ],
    finalBadge: 'Free assessment',
    finalTitle: 'Your line of work isn’t listed? We adapt.',
    finalText: 'Tell us about your days: together we spot what can be taken off your hands, and what it would give you back.',
    finalSecondary: 'See the offers',
    finalFooter: 'contact@herakia.com · Reply within 24h',
  },
} as const;

type T = (typeof TEXT)[keyof typeof TEXT];

/** Lueur qui suit la souris sur une carte : la position est écrite en variables CSS. */
function spotlight(e: React.MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`);
}

function Glow() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{ background: 'radial-gradient(320px circle at var(--x, 50%) var(--y, 50%), rgb(var(--green-primary) / 0.13), transparent 65%)' }}
    />
  );
}

/** Temps d'affichage de chaque métier dans la fenêtre du hero. */
const ROTATE_MS = 5000;

/**
 * Page /metiers : tout ce qu'Herakia construit, lu par métier. Hero avec une fenêtre qui passe
 * d'un métier à l'autre, onglets par métier (l'assistant téléphonique prêt à installer, puis le
 * sur-mesure), les six savoir-faire, les chantiers réels de l'accueil et un bloc final.
 */
export function MetiersHub() {
  const lang = useLang();
  const t = TEXT[lang];
  const [tab, setTab] = useState<MetierSlug>(METIERS[0].slug);

  const pick = (slug: MetierSlug) => {
    setTab(slug);
    document.getElementById('metiers')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Hero t={t} onPick={pick} />
      <Tabs t={t} tab={tab} setTab={setTab} />
      <Savoirs t={t} />
      <Chantiers />
      <Final t={t} lang={lang} />
    </>
  );
}

function Hero({ t, onPick }: { t: T; onPick: (slug: MetierSlug) => void }) {
  const lang = useLang();
  const titleRef = useTextReveal<HTMLHeadingElement>({ by: 'words', onLoad: true, delay: 150 });
  const restRef = useReveal<HTMLDivElement>({ onLoad: true, delay: 500, stagger: 110 });
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(prefersReducedMotion()), []);
  const next = () => setActive((a) => (a + 1) % METIERS.length);

  const m = METIERS[active];

  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-32 lg:px-8 lg:pb-28 lg:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-200px] top-[-80px] h-[760px] w-[900px] max-w-none"
        style={{
          background:
            'radial-gradient(closest-side, rgb(var(--green-primary) / 0.2), rgb(var(--green-primary) / 0.05) 60%, transparent)',
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div ref={restRef}>
          <p data-reveal className="eyebrow">
            {t.eyebrow}
          </p>
          <h1 ref={titleRef} data-split className="h-display mt-5 text-[clamp(2.25rem,5vw,4.75rem)] [&_[data-word]]:whitespace-nowrap">
            {t.titleLead}
            <span className="text-green-primary">{t.titleAccent}</span>
          </h1>
          <p data-reveal className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-text-secondary">
            {t.subtitle}
          </p>
          <div data-reveal className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              onClick={() => document.getElementById('metiers')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.ctaPick}
              <ArrowDown className="h-5 w-5" />
            </Button>
            <Button href={localize(lang, '/contact')} variant="secondary" size="lg">
              {t.ctaProject}
            </Button>
          </div>
          <div data-reveal className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-wider text-text-muted">
            {t.chips.map((c) => (
              <span key={c} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-green-primary" /> {c}
              </span>
            ))}
          </div>
        </div>

        {/* Survoler la fenêtre met la rotation en pause : on lit à son rythme. */}
        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <TaskWindow t={t} slug={m.slug} label={m.label[lang]} onOpen={() => onPick(m.slug)} />
          <div className="mx-auto mt-6 flex max-w-md gap-2">
            {METIERS.map((x, i) => {
              const on = i === active;
              return (
                <button
                  key={x.slug}
                  type="button"
                  onClick={() => {
                    setHeld(true);
                    setActive(i);
                  }}
                  aria-label={t.showMetier(x.label[lang])}
                  aria-pressed={on}
                  className="group/bar flex-1 py-2"
                >
                  <span className="block h-1 overflow-hidden rounded-full bg-border-strong transition-colors group-hover/bar:bg-text-muted">
                    {on && (
                      <span
                        key={`${x.slug}-${held}`}
                        className="block h-full origin-left rounded-full bg-green-primary"
                        style={
                          held || reduced
                            ? undefined
                            : {
                                animation: `fill-bar ${ROTATE_MS}ms linear forwards`,
                                animationPlayState: paused ? 'paused' : 'running',
                              }
                        }
                        onAnimationEnd={next}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/** La fenêtre du hero : un métier et les quatre tâches qu'Herakia prend en charge, cochées une à une. */
function TaskWindow({ t, slug, label, onOpen }: { t: T; slug: MetierSlug; label: string; onOpen: () => void }) {
  const lang = useLang();
  const reduced = useReducedMotion();
  const Icon = METIER_ICONS[slug];
  const taches = SAVOIR_FAIRE[slug][lang].taches;

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="mx-auto min-h-[20rem] w-full max-w-md rounded-[28px] bg-window p-6 text-window-ink shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/5 sm:p-7"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slug}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button type="button" onClick={onOpen} className="flex w-full items-center gap-3 text-left">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-window-ink text-green-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold leading-tight">{label}</span>
              <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-window-muted">
                <LogoMark className="h-3 w-3" />
                {t.windowLabel}
              </span>
            </span>
          </button>
          <ul className="mt-5 space-y-2.5">
            {taches.map((task, i) => (
              <motion.li
                key={task}
                initial={reduced ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduced ? 0 : 0.35 + i * 0.45, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 rounded-2xl bg-window-bubble px-4 py-3 font-sans text-[15px] font-medium"
              >
                <motion.span
                  initial={reduced ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: reduced ? 0 : 0.5 + i * 0.45, type: 'spring', stiffness: 500, damping: 14 }}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-window-ok text-white"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </motion.span>
                {task}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/** Onglets par métier : l'assistant téléphonique prêt à installer, puis ce qu'on construit sur mesure. */
function Tabs({ t, tab, setTab }: { t: T; tab: MetierSlug; setTab: (s: MetierSlug) => void }) {
  const lang = useLang();
  const reduced = useReducedMotion();
  const headRef = useReveal<HTMLDivElement>();
  const sf = SAVOIR_FAIRE[tab][lang];
  const metier = METIERS.find((m) => m.slug === tab)!;

  return (
    <section id="metiers" className="tier-1 relative scroll-mt-16 px-6 py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div ref={headRef} className="max-w-3xl">
          <span data-reveal className="eyebrow">
            {t.tabsEyebrow}
          </span>
          <h2 data-reveal className="h-section mt-4">
            {t.tabsTitle}
          </h2>
        </div>

        <div
          role="tablist"
          aria-label={t.tabsEyebrow}
          className="-mx-6 mt-12 flex gap-2 overflow-x-auto px-6 pb-2 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {METIERS.map((m) => {
            const Icon = METIER_ICONS[m.slug];
            const on = m.slug === tab;
            return (
              <button
                key={m.slug}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setTab(m.slug);
                  trackEvent('metier_tab', { metier: m.slug });
                }}
                className={`relative flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 font-sans text-sm font-medium transition-colors duration-300 ${
                  on ? 'border-transparent text-on-green' : 'border-border-strong text-text-secondary hover:border-green-line hover:text-text-primary'
                }`}
              >
                {on && (
                  <motion.span
                    layoutId="metier-tab"
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-green-primary shadow-[0_0_24px_rgb(var(--green-primary)/0.45)]"
                    transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon className="relative h-4 w-4" aria-hidden="true" />
                <span className="relative">{m.label[lang]}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            role="tabpanel"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-10"
          >
            <p className="max-w-2xl font-display text-xl font-semibold leading-snug text-text-primary md:text-2xl">{sf.intro}</p>
            <motion.ul
              className="mt-8 grid gap-4 md:grid-cols-2"
              initial={reduced ? false : 'hidden'}
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }}
            >
              {sf.cas.map((c) => {
                const Icon = SAVOIR_ICONS[c.savoir];
                const ready = c.savoir === 'telephone';
                const href = ready ? `/${tab}` : `/services/${c.savoir}`;
                return (
                  <motion.li
                    key={c.title}
                    variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } }}
                  >
                    <Link
                      onMouseMove={spotlight}
                      href={localize(lang, href)}
                      onClick={() => trackEvent('metier_cas_click', { metier: tab, savoir: c.savoir })}
                      className={`group relative isolate flex h-full flex-col overflow-hidden rounded-[24px] border p-6 transition-[border-color,transform] duration-300 motion-safe:hover:-translate-y-1 ${
                        ready ? 'border-green-line bg-green-primary/[0.07]' : 'border-border-subtle bg-bg-secondary/60 hover:border-green-line'
                      }`}
                    >
                      <Glow />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-green-subtle text-green-primary">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${
                            ready ? 'bg-green-primary text-on-green' : 'border border-border-strong text-text-muted'
                          }`}
                        >
                          {ready ? t.ready(euros(PRICE_SETUP, lang)) : t.custom}
                        </span>
                        {c.proof && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-signal-late/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-signal-late">
                            <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                            {c.proof}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-5 font-display text-lg font-semibold text-text-primary">{c.title}</h3>
                      <p className="mt-2 font-sans text-sm leading-relaxed text-text-secondary">{c.text}</p>
                      <span className="mt-auto flex items-center gap-1.5 pt-5 font-sans text-sm font-medium text-green-primary">
                        {ready ? t.seeAssistant : t.seeService}
                        <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>
            <div className="mt-8">
              <Button href={`${localize(lang, '/contact')}?offre=${metier.offerId}`} variant="secondary" size="md">
                {t.talk}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/** Les six savoir-faire, chacun vers sa page. */
function Savoirs({ t }: { t: T }) {
  const lang = useLang();
  const titleRef = useTextReveal<HTMLHeadingElement>({ by: 'words' });
  const gridRef = useReveal<HTMLUListElement>({ stagger: 70, delay: 200 });
  return (
    <section className="relative overflow-hidden px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <span className="eyebrow">{t.savoirEyebrow}</span>
        <h2 ref={titleRef} data-split className="h-section mt-4 max-w-4xl [&_[data-word]]:whitespace-nowrap">
          {t.savoirTitle}
        </h2>
        <ul
          ref={gridRef}
          className="mt-14 grid gap-px overflow-hidden rounded-[28px] border border-border-subtle bg-border-subtle sm:grid-cols-2 lg:grid-cols-3"
        >
          {t.savoirs.map((s) => {
            const Icon = SAVOIR_ICONS[s.id];
            return (
              <li key={s.id} data-reveal className="bg-bg-primary">
                <Link
                  href={localize(lang, s.href)}
                  onMouseMove={spotlight}
                  className="group relative isolate flex h-full flex-col overflow-hidden p-7 transition-colors hover:bg-bg-secondary/60"
                >
                  <Glow />
                  <Icon className="h-6 w-6 text-green-primary transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:scale-110" aria-hidden="true" />
                  <h3 className="mt-5 font-display text-lg font-semibold leading-snug text-text-primary">{s.title}</h3>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-text-secondary">{s.text}</p>
                  <ArrowRight
                    className="mt-6 h-4 w-4 text-text-muted transition-[color,transform] group-hover:text-green-primary motion-safe:group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Bloc final en palier 2, comme sur l'accueil. */
function Final({ t, lang }: { t: T; lang: 'fr' | 'en' }) {
  const titleRef = useTextReveal<HTMLHeadingElement>({ by: 'chars' });
  const restRef = useReveal<HTMLDivElement>({ delay: 500, stagger: 110 });
  return (
    <section className="tier-2 relative overflow-hidden px-6 py-40 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-primary to-transparent" aria-hidden="true" />
      <div className="relative mx-auto max-w-5xl text-center">
        <div ref={restRef}>
          <div
            data-reveal
            className="inline-flex items-center gap-2 rounded-full border border-border-green bg-green-subtle px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-green-primary"
          >
            <Compass className="h-3.5 w-3.5" />
            {t.finalBadge}
          </div>
          <h2 ref={titleRef} data-split className="h-display mt-8 text-[clamp(2rem,4.4vw,4.25rem)] [&_[data-word]]:whitespace-nowrap">
            {t.finalTitle}
          </h2>
          <p data-reveal className="mx-auto mt-8 max-w-2xl font-sans text-lg leading-relaxed text-text-secondary md:text-xl text-balance">
            {t.finalText}
          </p>
          <div data-reveal className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href={localize(lang, '/contact')} variant="primary" size="lg">
              {t.ctaProject}
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button href={localize(lang, '/offres')} variant="secondary" size="lg">
              {t.finalSecondary}
            </Button>
          </div>
          <p data-reveal className="mt-8 font-mono text-xs uppercase tracking-wider text-text-muted">
            {t.finalFooter}
          </p>
        </div>
      </div>
    </section>
  );
}
