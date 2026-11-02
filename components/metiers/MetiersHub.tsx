'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  Calculator,
  Calendar,
  GraduationCap,
  HardHat,
  House,
  MessageCircle,
  Mic,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { TiaCall } from '@/components/ui/TiaCall';
import { TrustedBy } from '@/components/home/TrustedBy';
import { MeetTia } from '@/components/home/MeetTia';
import { LockScreen } from '@/components/metiers/LockScreen';
import { TEXTES } from '@/components/metiers/textes';
import { useLang, localize } from '@/components/i18n/LangProvider';
import { prefersReducedMotion, useReveal, useTextReveal } from '@/lib/anim';
import { trackEvent } from '@/lib/gtag';
import { METIERS, type MetierSlug } from '@/lib/metiers';
import { DELAY_DAYS, PRICE_MONTHLY, PRICE_SETUP, euros } from '@/lib/offreArtisans';

const ICONS: Record<MetierSlug, LucideIcon> = {
  artisans: HardHat,
  immobilier: House,
  comptables: Calculator,
  sante: Stethoscope,
  enseignement: GraduationCap,
};

const TEXT = {
  fr: {
    eyebrow: 'Zéro appel manqué',
    titleLead: 'Un assistant téléphonique, ',
    titleAccent: 'réglé pour votre métier.',
    subtitle:
      'Quand personne ne peut décrocher, un assistant IA prend l’appel, pose les bonnes questions et vous envoie le résumé par SMS ou WhatsApp.',
    ctaDemo: 'Tester la démo',
    ctaPick: 'Choisir mon métier',
    price: (setup: string, monthly: string) => `Dès ${setup} + ${monthly}/mois`,
    priceNote: (days: number) => `Sans engagement · installé en ${days} jours`,
    example: 'Exemple',
    showMetier: (label: string) => `Voir l’exemple : ${label}`,
    gridEyebrow: 'Choisissez votre métier',
    gridTitle: 'Il parle la langue de votre métier.',
    see: 'Voir la page',
    otherTitle: 'Votre métier n’est pas dans la liste ?',
    otherText: 'Le principe s’adapte à toute activité qui reçoit des appels. Dites-nous la vôtre.',
    otherCta: 'Parlons de votre cas',
    tiaTitle: 'Parlez à Tia, comme le ferait un client',
    tiaText:
      'Tia est l’assistante vocale d’Herakia. Parlez-lui depuis cette page : vous entendrez sa voix, sa façon d’écouter et de reformuler. Celui de votre activité suivra le même principe, réglé sur votre métier et vos horaires.',
    finalBadge: (days: number) => `Installé en ${days} jours`,
    finalTitle: 'Le prochain appel, c’est vous qui le rappelez.',
    finalText: 'Testez la démo vous-même, ou laissez votre numéro : on vous rappelle pour en parler.',
    ctaCallback: 'Être rappelé',
    finalFooter: 'contact@herakia.com · Sans engagement',
  },
  en: {
    eyebrow: 'Zero missed calls',
    titleLead: 'A phone assistant, ',
    titleAccent: 'set up for your line of work.',
    subtitle:
      'When nobody can pick up, an AI assistant takes the call, asks the right questions and sends you the summary by text message or WhatsApp.',
    ctaDemo: 'Try the demo',
    ctaPick: 'Choose my line of work',
    price: (setup: string, monthly: string) => `From ${setup} + ${monthly}/month`,
    priceNote: (days: number) => `No commitment · set up in ${days} days`,
    example: 'Example',
    showMetier: (label: string) => `Show the example: ${label}`,
    gridEyebrow: 'Choose your line of work',
    gridTitle: 'It speaks the language of your trade.',
    see: 'See the page',
    otherTitle: 'Your line of work isn’t listed?',
    otherText: 'The idea works for any business that takes calls. Tell us about yours.',
    otherCta: 'Let’s talk about your case',
    tiaTitle: 'Talk to Tia, the way a client would',
    tiaText:
      'Tia is Herakia’s voice assistant. Talk to her from this page: you’ll hear her voice and how she listens and rephrases. Yours will work the same way, set up for your line of work and your hours.',
    finalBadge: (days: number) => `Set up in ${days} days`,
    finalTitle: 'The next call is the one you call back.',
    finalText: 'Try the demo yourself, or leave your number: we’ll call you back to talk it through.',
    ctaCallback: 'Get a call back',
    finalFooter: 'contact@herakia.com · No commitment',
  },
} as const;

/** Temps d'affichage de chaque métier sur le téléphone du hero. */
const ROTATE_MS = 6000;

/**
 * Page d'aiguillage /metiers, liée depuis le hero de l'accueil. Même grammaire que les pages
 * métiers : hero texte à gauche et écran verrouillé à droite (qui passe d'un métier à l'autre),
 * puis les cartes, le bandeau de logos, Tia et le bloc final.
 */
export function MetiersHub() {
  const lang = useLang();
  const t = TEXT[lang];
  const setup = euros(PRICE_SETUP, lang);
  const monthly = euros(PRICE_MONTHLY, lang);
  const [tiaOpen, setTiaOpen] = useState(false);
  const openTia = (location: string) => () => {
    trackEvent('demo_click', { location, page: 'metiers' });
    setTiaOpen(true);
  };

  return (
    <>
      <Hero t={t} setup={setup} monthly={monthly} onDemo={openTia('hero')} />
      <TrustedBy />
      <Grid t={t} />
      <MeetTia title={t.tiaTitle} pitch={t.tiaText} standalone />
      <Final t={t} onDemo={openTia('final')} />
      <AnimatePresence>
        {tiaOpen && <TiaCall lang={lang} onClose={() => setTiaOpen(false)} contactHref={localize(lang, '/contact')} />}
      </AnimatePresence>
    </>
  );
}

type T = (typeof TEXT)[keyof typeof TEXT];

function Hero({ t, setup, monthly, onDemo }: { t: T; setup: string; monthly: string; onDemo: () => void }) {
  const lang = useLang();
  const titleRef = useTextReveal<HTMLHeadingElement>({ by: 'words', onLoad: true, delay: 150 });
  const restRef = useReveal<HTMLDivElement>({ onLoad: true, delay: 500, stagger: 110 });
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);

  // Le téléphone passe d'un métier à l'autre, sauf si l'on en a choisi un ou en mouvement réduit.
  useEffect(() => {
    if (held || prefersReducedMotion()) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % METIERS.length), ROTATE_MS);
    return () => window.clearTimeout(id);
  }, [active, held]);

  const m = METIERS[active];
  const scene = TEXTES[m.slug][lang];

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
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
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
            <Button variant="primary" size="lg" onClick={onDemo}>
              <Mic className="h-5 w-5" />
              {t.ctaDemo}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => document.getElementById('metiers')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.ctaPick}
              <ArrowDown className="h-5 w-5" />
            </Button>
          </div>
          <p data-reveal className="mt-8 border-l-2 border-green-primary pl-4 font-sans text-sm leading-relaxed text-text-secondary">
            <span className="font-display text-base font-semibold text-text-primary">{t.price(setup, monthly)}</span>
            <br />
            {t.priceNote(DELAY_DAYS)}
          </p>
        </div>

        <div>
          <LockScreen
            scene={scene.scene}
            notifKey={m.slug}
            chip={
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={m.slug}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap"
                >
                  {scene.moments[0]}
                </motion.span>
              </AnimatePresence>
            }
          />
          {/* Le métier montré, et de quoi en choisir un autre */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">
              {t.example} · <span className="text-text-secondary">{m.label[lang]}</span>
            </p>
            <div className="flex gap-2">
              {METIERS.map((x, i) => (
                <button
                  key={x.slug}
                  type="button"
                  onClick={() => {
                    setHeld(true);
                    setActive(i);
                  }}
                  aria-label={t.showMetier(x.label[lang])}
                  aria-pressed={i === active}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active ? 'w-6 bg-green-primary' : 'w-2 bg-border-strong hover:bg-text-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Les métiers : chaque carte fait entendre l'appelant de sa page, en une bulle. */
function Grid({ t }: { t: T }) {
  const lang = useLang();
  const headRef = useReveal<HTMLDivElement>();
  const gridRef = useReveal<HTMLUListElement>({ stagger: 80 });
  const firstCaller = (slug: MetierSlug) => TEXTES[slug][lang].scene.dialogue.find((d) => d.who === 'client')?.text ?? '';

  return (
    <section id="metiers" className="relative scroll-mt-20 px-6 py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div ref={headRef} className="max-w-3xl">
          <span data-reveal className="eyebrow">
            {t.gridEyebrow}
          </span>
          <h2 data-reveal className="h-section mt-4">
            {t.gridTitle}
          </h2>
        </div>

        <ul ref={gridRef} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {METIERS.map((m) => {
            const Icon = ICONS[m.slug];
            return (
              <li key={m.slug} data-reveal>
                <Link
                  href={localize(lang, `/${m.slug}`)}
                  onClick={() => trackEvent('metier_click', { metier: m.slug })}
                  className="group flex h-full flex-col rounded-[28px] border border-border-subtle bg-bg-secondary/60 p-6 backdrop-blur-md transition-[border-color,transform] duration-300 hover:border-green-line motion-safe:hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-green-subtle text-green-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-xl font-semibold text-text-primary">{m.label[lang]}</h3>
                  </div>
                  <p className="mt-4 font-sans text-sm leading-relaxed text-text-secondary">{m.pitch[lang]}</p>
                  <p className="mt-5 rounded-[18px] rounded-bl-md bg-window px-4 py-3 font-sans text-[13px] leading-snug text-window-ink">
                    « {firstCaller(m.slug)} »
                  </p>
                  <span className="mt-auto flex items-center gap-1.5 pt-6 font-sans text-sm font-medium text-green-primary">
                    {t.see}
                    <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            );
          })}
          <li data-reveal>
            <Link
              href={localize(lang, '/contact')}
              className="group flex h-full flex-col rounded-[28px] border border-dashed border-border-strong p-6 transition-colors duration-300 hover:border-green-line"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-border-strong text-text-secondary">
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="font-display text-xl font-semibold text-text-primary">{t.otherTitle}</h3>
              </div>
              <p className="mt-4 font-sans text-sm leading-relaxed text-text-secondary">{t.otherText}</p>
              <span className="mt-auto flex items-center gap-1.5 pt-6 font-sans text-sm font-medium text-green-primary">
                {t.otherCta}
                <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}

/** Bloc final en palier 2, comme sur l'accueil et les pages métiers. */
function Final({ t, onDemo }: { t: T; onDemo: () => void }) {
  const lang = useLang();
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
            <Calendar className="h-3.5 w-3.5" />
            {t.finalBadge(DELAY_DAYS)}
          </div>
          <h2 ref={titleRef} data-split className="h-display mt-8 text-[clamp(2rem,4.4vw,4.25rem)] [&_[data-word]]:whitespace-nowrap">
            {t.finalTitle}
          </h2>
          <p data-reveal className="mx-auto mt-8 max-w-2xl font-sans text-lg leading-relaxed text-text-secondary md:text-xl text-balance">
            {t.finalText}
          </p>
          <div data-reveal className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="primary" size="lg" onClick={onDemo}>
              <Mic className="h-5 w-5" />
              {t.ctaDemo}
            </Button>
            <Button href={localize(lang, '/contact')} variant="secondary" size="lg">
              {t.ctaCallback}
              <ArrowRight className="h-5 w-5" />
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
