'use client';

import Image from 'next/image';
import { AnimatePresence } from 'framer-motion';
import { ArrowRight, Mic, ShieldCheck, Phone, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { TiaCall } from '@/components/ui/TiaCall';
import { TrustedBy } from '@/components/home/TrustedBy';
import { MeetTia } from '@/components/home/MeetTia';
import { GoogleReviews } from '@/components/home/GoogleReviews';
import { FAQAccordion } from '@/components/home/FAQ';
import { CallScene, type CallSceneText } from '@/components/metiers/CallScene';
import { LockScreen } from '@/components/metiers/LockScreen';
import { useLang, localize } from '@/components/i18n/LangProvider';
import { prefersReducedMotion, useReveal, useScrambleRotate, useTextReveal } from '@/lib/anim';
import { trackEvent } from '@/lib/gtag';
import { DEMO_PHONE, PRICE_MONTHLY, PRICE_SETUP, euros, isDemoPhonePlaceholder } from '@/lib/offreArtisans';

/** Textes d'une page « Zéro appel manqué » (une version par métier, en FR et en EN). */
export interface ZeroAppelText {
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  /** Ligne en petites capitales sous le titre, réécrite en boucle : les moments où l'on ne peut pas décrocher. */
  moments: readonly string[];
  subtitle: string;
  price: (setup: string, monthly: string) => string;
  priceNote: string;
  ctaDemo: string;
  ctaCallback: string;
  demoNumber: (phone: string) => string;
  personaEyebrow: string;
  personaTitle: string;
  /** La conversation façon « profils » de l'accueil : le métier parle, Andy répond. */
  persona: { role: string; quote: string; pains: readonly string[] };
  andyName: string;
  andyNote: string;
  howEyebrow: string;
  howTitleLead: string;
  howTitleAccent: string;
  steps: readonly { title: string; text: string }[];
  scene: CallSceneText;
  smsNote: string;
  tiaTitle: string;
  tiaText: string;
  roiEyebrow: string;
  roiTitle: string;
  roiText: (setup: string) => string;
  faqEyebrow: string;
  faqTitle: string;
  faq: (setup: string, monthly: string) => readonly { q: string; a: string }[];
  finalBadge: string;
  finalTitle: string;
  finalText: string;
  finalFooter: string;
}

/** Instants de la conversation : la personne tape, sa phrase, ses trois douleurs, Andy tape, Andy répond. */
const SCRIPT_MS = [0, 900, 1700, 2150, 2600, 3300, 4200];

/**
 * Page de prospection « Zéro appel manqué », commune à tous les métiers (lib/metiers.ts). Elle
 * reprend la grammaire de l'accueil (bandeau de logos, conversation
 * des profils, Tia, avis Google, FAQ en accordéon, bloc final en palier 2) avec un hero à elle. Prix, délai et numéro
 * de démo viennent de lib/offreArtisans.ts ; textes, identifiant de page (analytics) et offre
 * présélectionnée viennent de chaque métier.
 */
export function ZeroAppelLanding({
  text,
  page,
  offerId,
}: {
  text: { fr: ZeroAppelText; en: ZeroAppelText };
  page: string;
  offerId: string;
}) {
  const lang = useLang();
  const t = text[lang];
  const setup = euros(PRICE_SETUP, lang);
  const monthly = euros(PRICE_MONTHLY, lang);
  const callback = `${localize(lang, '/contact')}?offre=${offerId}`;
  const [tiaOpen, setTiaOpen] = useState(false);

  const onContact = (location: string) => () => trackEvent('contact_click', { location, page });
  // Tant que la ligne de démo n'a pas de vrai numéro, les boutons de démo ouvrent Tia sur la page.
  const demoProps = (location: string) => {
    const track = () => trackEvent('demo_click', { location, page });
    return isDemoPhonePlaceholder
      ? { onClick: () => (track(), setTiaOpen(true)) }
      : { href: `tel:${DEMO_PHONE.replace(/[^\d+]/g, '')}`, onClick: track };
  };

  return (
    <>
      <Navbar />
      <main>
        <Hero t={t} setup={setup} monthly={monthly} callback={callback} demoProps={demoProps} onContact={onContact} />
        <TrustedBy />
        <PersonaChat t={t} />
        <HowItWorks t={t} />
        <MeetTia title={t.tiaTitle} pitch={t.tiaText} standalone />
        <Roi t={t} setup={setup} monthly={monthly} />
        <GoogleReviews />
        <Faq t={t} setup={setup} monthly={monthly} />
        <Final t={t} callback={callback} demoProps={demoProps} onContact={onContact} />
      </main>
      <Footer />

      <AnimatePresence>
        {tiaOpen && <TiaCall lang={lang} onClose={() => setTiaOpen(false)} contactHref={callback} />}
      </AnimatePresence>
    </>
  );
}

type DemoProps = (location: string) => { href?: string; onClick: () => void };

/**
 * Hero propre aux pages métiers : texte aligné à gauche et, à droite, l'écran verrouillé du
 * téléphone où arrivent l'appel manqué puis le résumé. Volontairement distinct de celui de
 * l'accueil (pas de trame de points, pas de pastille d'avis) : on reste dans le même site, sans
 * en rejouer l'ouverture.
 */
function Hero({
  t,
  setup,
  monthly,
  callback,
  demoProps,
  onContact,
}: {
  t: ZeroAppelText;
  setup: string;
  monthly: string;
  callback: string;
  demoProps: DemoProps;
  onContact: (location: string) => () => void;
}) {
  const rotate = useRef<() => void>(() => {});
  const titleRef = useTextReveal<HTMLHeadingElement>({ by: 'words', onLoad: true, delay: 150, onSettled: () => rotate.current() });
  const momentRef = useRef<HTMLSpanElement>(null);
  rotate.current = useScrambleRotate({ resolve: () => momentRef.current, segments: [...t.moments] });
  const restRef = useReveal<HTMLDivElement>({ onLoad: true, delay: 500, stagger: 110 });

  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-32 lg:px-8 lg:pb-28 lg:pt-40">
      {/* Un seul halo, décalé à droite derrière le téléphone */}
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
          <h1
            ref={titleRef}
            data-split
            className="h-display mt-5 text-[clamp(2.25rem,5vw,4.75rem)] [&_[data-word]]:whitespace-nowrap"
          >
            {t.titleLead}
            <span className="text-green-primary">{t.titleAccent}</span>
          </h1>
          <p data-reveal className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-text-secondary">
            {t.subtitle}
          </p>
          <div data-reveal className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" size="lg" {...demoProps('hero')}>
              <Mic className="h-5 w-5" />
              {t.ctaDemo}
            </Button>
            <Button href={callback} variant="secondary" size="lg" onClick={onContact('hero')}>
              {t.ctaCallback}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          {!isDemoPhonePlaceholder && (
            <p data-reveal className="mt-4 font-mono text-sm text-text-muted">
              <Phone className="mr-1.5 inline h-3.5 w-3.5" />
              {t.demoNumber(DEMO_PHONE)}
            </p>
          )}
          <p data-reveal className="mt-8 border-l-2 border-green-primary pl-4 font-sans text-sm leading-relaxed text-text-secondary">
            <span className="font-display text-base font-semibold text-text-primary">{t.price(setup, monthly)}</span>
            <br />
            {t.priceNote}
          </p>
        </div>

        <LockScreen
          scene={t.scene}
          chip={
            <span ref={momentRef} className="whitespace-nowrap">
              {t.moments[0]}
            </span>
          }
        />
      </div>
    </section>
  );
}

function Typing({ me = false }: { me?: boolean }) {
  return (
    <span className={`inline-flex gap-1 rounded-[20px] px-[18px] py-4 ${me ? 'rounded-br-md bg-window-ok-soft' : 'rounded-bl-md bg-window-bubble'}`}>
      {[0, 200, 400].map((d) => (
        <i key={d} className="h-[7px] w-[7px] animate-pulse rounded-full bg-window-muted" style={{ animationDelay: `${d}ms` }} />
      ))}
    </span>
  );
}

function Line({ me = false, children }: { me?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-end gap-3 motion-safe:animate-[chat-in_.5s_cubic-bezier(.2,.9,.25,1.1)_both] ${me ? 'flex-row-reverse' : ''}`}>
      {children}
    </div>
  );
}

function MetierAvatar() {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-window-bubble text-window-muted">
      <UserRound className="h-5 w-5" />
    </span>
  );
}

function AndyAvatar() {
  return <Image src="/andy.jpg" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full object-cover" />;
}

/** « Vous reconnaissez-vous ? » : la conversation des profils de l'accueil, jouée une fois quand elle arrive à l'écran. */
function PersonaChat({ t }: { t: ZeroAppelText }) {
  const headRef = useReveal<HTMLDivElement>();
  const roomRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setStep(SCRIPT_MS.length);
      return;
    }
    const room = roomRef.current;
    if (!room) return;
    let timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        timers = SCRIPT_MS.map((ms, i) => setTimeout(() => setStep(i + 1), ms));
      },
      { threshold: 0.3 },
    );
    io.observe(room);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  const p = t.persona;
  return (
    // Palier 1, dans la continuité du bandeau de logos (comme sur l'accueil)
    <section id="persona" className="tier-1 relative overflow-hidden px-6 py-28 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div ref={headRef} className="mx-auto max-w-3xl text-center">
          <span data-reveal className="eyebrow">
            {t.personaEyebrow}
          </span>
          <h2 data-reveal className="h-section mt-4">
            {t.personaTitle}
          </h2>
        </div>

        <div
          ref={roomRef}
          aria-hidden="true"
          className="mt-12 flex min-h-[600px] flex-col gap-3 rounded-[28px] bg-window p-5 text-window-ink shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/5 sm:min-h-[500px] sm:p-7 lg:mt-14"
        >
          <p className="ml-[52px] font-mono text-[10px] uppercase tracking-[0.12em] text-window-muted">{p.role}</p>
          {step === 1 && (
            <Line>
              <MetierAvatar />
              <Typing />
            </Line>
          )}
          {step >= 2 && (
            <Line>
              <MetierAvatar />
              <p className="max-w-[78%] rounded-[20px] rounded-bl-md bg-window-bubble px-[18px] py-3.5 font-display text-lg font-semibold leading-snug tracking-[-0.01em] sm:text-xl">
                {`« ${p.quote} »`}
              </p>
            </Line>
          )}
          {p.pains.map((pain, i) =>
            step >= 3 + i ? (
              <Line key={pain}>
                <MetierAvatar />
                <p className="flex max-w-[78%] items-start gap-2 rounded-[20px] rounded-bl-md border border-signal-late/40 bg-signal-late/[0.12] px-4 py-3 text-sm leading-snug sm:text-[15px]">
                  <span className="mt-px grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-signal-late text-[11px] font-bold text-window-ink">
                    !
                  </span>
                  {pain}
                </p>
              </Line>
            ) : null,
          )}
          {step >= 6 && (
            <p className="mr-[52px] mt-1 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-window-muted">{t.andyName}</p>
          )}
          {step === 6 && (
            <Line me>
              <AndyAvatar />
              <Typing me />
            </Line>
          )}
          {step >= 7 && (
            <Line me>
              <AndyAvatar />
              <p className="max-w-[78%] rounded-[20px] rounded-br-md bg-action px-[18px] py-3.5 text-[15px] font-medium leading-snug text-on-green">
                {t.andyNote}
              </p>
            </Line>
          )}
        </div>

        <div className="sr-only">
          <h3>{p.role}</h3>
          <blockquote>{p.quote}</blockquote>
          <ul>
            {p.pains.map((pain) => (
              <li key={pain}>{pain}</li>
            ))}
          </ul>
          <p>
            {t.andyName} : {t.andyNote}
          </p>
        </div>
      </div>
    </section>
  );
}

/** L'appel raconté sur un téléphone, sous un titre éditorial aligné à gauche comme « À propos ». */
function HowItWorks({ t }: { t: ZeroAppelText }) {
  const titleRef = useTextReveal<HTMLHeadingElement>({ by: 'words' });
  const bodyRef = useReveal<HTMLDivElement>({ y: 32, delay: 200 });
  return (
    <section className="relative overflow-hidden px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <span className="eyebrow">{t.howEyebrow}</span>
        <h2 ref={titleRef} data-split className="h-section mt-4 max-w-4xl [&_[data-word]]:whitespace-nowrap">
          {t.howTitleLead}
          <span className="text-green-primary">{t.howTitleAccent}</span>
        </h2>
        <div ref={bodyRef} className="mt-14">
          <div data-reveal>
            <CallScene steps={t.steps} scene={t.scene} />
          </div>
          <p data-reveal className="mt-8 font-sans text-xs text-text-muted">
            {t.smsNote}
          </p>
        </div>
      </div>
    </section>
  );
}

/** Le calcul : un titre éditorial et le prix, sans chiffre de résultat inventé. */
function Roi({ t, setup, monthly }: { t: ZeroAppelText; setup: string; monthly: string }) {
  const titleRef = useTextReveal<HTMLHeadingElement>({ by: 'words' });
  const bodyRef = useReveal<HTMLDivElement>({ stagger: 90, delay: 200 });
  return (
    <section className="relative overflow-hidden px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <span className="eyebrow">{t.roiEyebrow}</span>
        <h2 ref={titleRef} data-split className="h-section mt-4 [&_[data-word]]:whitespace-nowrap">
          {t.roiTitle}
        </h2>
        <div ref={bodyRef}>
          <p data-reveal className="mt-8 font-sans text-lg leading-relaxed text-text-secondary">
            {t.roiText(setup)}
          </p>
          <div
            data-reveal
            className="mt-10 flex flex-col gap-1 rounded-2xl border border-border-green bg-green-primary/[0.06] p-6 sm:flex-row sm:items-baseline sm:justify-between"
          >
            <p className="font-display text-2xl font-bold text-green-primary md:text-3xl">{t.price(setup, monthly)}</p>
            <p className="font-mono text-xs uppercase tracking-wider text-text-muted">{t.priceNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** FAQ dans l'accordéon de l'accueil. */
function Faq({ t, setup, monthly }: { t: ZeroAppelText; setup: string; monthly: string }) {
  const headRef = useReveal<HTMLDivElement>();
  const [open, setOpen] = useState(0);
  return (
    <section className="relative px-6 py-32 lg:px-8">
      <div ref={headRef} className="mx-auto max-w-4xl">
        <div data-reveal className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">{t.faqEyebrow}</span>
          <h2 className="h-section mt-4">{t.faqTitle}</h2>
        </div>
        <div data-reveal className="mt-16">
          {t.faq(setup, monthly).map((item, i) => (
            <FAQAccordion
              key={item.q}
              item={{ question: item.q, answer: item.a }}
              open={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Bloc final en palier 2, comme CTAFinal sur l'accueil. */
function Final({
  t,
  callback,
  demoProps,
  onContact,
}: {
  t: ZeroAppelText;
  callback: string;
  demoProps: DemoProps;
  onContact: (location: string) => () => void;
}) {
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
            <ShieldCheck className="h-3.5 w-3.5" />
            {t.finalBadge}
          </div>
          <h2 ref={titleRef} data-split className="h-display mt-8 text-[clamp(2rem,4.4vw,4.25rem)] [&_[data-word]]:whitespace-nowrap">
            {t.finalTitle}
          </h2>
          <p data-reveal className="mx-auto mt-8 max-w-2xl font-sans text-lg leading-relaxed text-text-secondary md:text-xl text-balance">
            {t.finalText}
          </p>
          <div data-reveal className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="primary" size="lg" {...demoProps('final')}>
              <Mic className="h-5 w-5" />
              {t.ctaDemo}
            </Button>
            <Button href={callback} variant="secondary" size="lg" onClick={onContact('final')}>
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
