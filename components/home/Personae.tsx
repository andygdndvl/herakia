'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { prefersReducedMotion, useReveal } from '@/lib/anim';

interface Persona {
  role: string;
  quote: string;
  pains: readonly string[];
  /** La réponse d'Andy, en vert : ce qu'un agent change pour ce profil. */
  reply: string;
}

/** Portraits des profils, cadrés sur le visage (object-position). */
const FACES = [
  { src: '/personae-1.png', pos: '35% 25%' },
  // Photo sans visage (mains sur un clavier) : à remplacer par un portrait.
  { src: '/personae-2.png', pos: '50% 50%' },
  { src: '/personae-3.png', pos: '55% 20%' },
];
const ANDY = { src: '/andy.jpg', name: 'Andy · Herakia' };

const TEXT = {
  fr: {
    eyebrow: 'Vous reconnaissez-vous ?',
    // Espaces insécables dans « on les connaît » : la ligne se coupe à la virgule, jamais au milieu.
    title: 'Vos maux, on les connaît.',
    pick: 'Choisissez votre profil',
    personae: [
      {
        role: 'Dirigeant·e',
        quote: 'Ma boîte grandit, mais je passe mon énergie à faire tourner la machine au lieu de la développer.',
        pains: [
          'Chaque palier de croissance ajoute de la charge, pas de la valeur',
          'Je ne veux pas empiler les recrutements pour absorber du répétitif',
          'On laisse filer des opportunités, faute de temps pour les traiter',
        ],
        reply: 'Le répétitif, on le confie à des agents. Vous, vous gardez le cap. On en parle 30 min ?',
      },
      {
        role: 'Directeur·rice des opérations',
        quote: 'Mes équipes sont solides, mais elles s’épuisent sur des tâches qu’une machine ferait mieux.',
        pains: [
          'Une part énorme du temps part en ressaisie et en copier-coller',
          'Nos outils sont là, mais ils ne se parlent pas — tout repose sur les gens',
          'Nos process ne tiennent plus le rythme quand le volume augmente',
        ],
        reply: 'On branche vos outils entre eux, et la ressaisie disparaît. On regarde ensemble ?',
      },
      {
        role: 'Directeur·rice commercial·e',
        quote: 'Mon équipe vend deux fois moins qu’elle ne pourrait, noyée sous l’administratif.',
        pains: [
          'Les leads chauds refroidissent pendant qu’on traite le reste',
          'Le CRM n’est jamais à jour — impossible de piloter au réel',
          'On rate des deals sans même savoir lesquels',
        ],
        reply: 'Un agent qualifie et relance vos leads, le CRM se met à jour seul. Vos commerciaux vendent.',
      },
    ] as Persona[],
  },
  en: {
    eyebrow: 'Does this sound like you?',
    title: 'We know where it hurts.',
    pick: 'Pick your profile',
    personae: [
      {
        role: 'Founder / CEO',
        quote: 'My company is growing, but I spend my energy keeping the machine running instead of moving it forward.',
        pains: [
          'Every growth milestone adds workload, not value',
          'I don’t want to stack up hires just to absorb repetitive work',
          'We let opportunities slip for lack of time to handle them',
        ],
        reply: 'Hand the repetitive work to agents. You keep steering. Shall we talk for 30 minutes?',
      },
      {
        role: 'Head of Operations',
        quote: 'My teams are strong, but they burn out on tasks a machine would do better.',
        pains: [
          'A huge share of time goes into re-keying and copy-pasting',
          'Our tools are there, but they don’t talk to each other — it all rests on people',
          'Our processes can’t keep pace when volume goes up',
        ],
        reply: 'We connect your tools to each other, and re-keying disappears. Shall we take a look?',
      },
      {
        role: 'Head of Sales',
        quote: 'My team sells half of what it could, drowning in admin.',
        pains: [
          'Hot leads cool down while we deal with everything else',
          'The CRM is never up to date — impossible to steer on real data',
          'We miss deals without even knowing which ones',
        ],
        reply: 'An agent qualifies and follows up your leads, the CRM updates itself. Your reps sell.',
      },
    ] as Persona[],
  },
} as const;

/**
 * Étapes de la conversation, dans l'ordre : la personne tape, sa phrase arrive, ses douleurs
 * suivent coup sur coup, Andy tape, Andy répond. `step` compte les étapes déjà jouées.
 */
const SCRIPT_MS = [0, 1000, 1850, 2300, 2750, 3500, 4400];
const LAST_STEP = SCRIPT_MS.length;
/** Temps de lecture laissé une fois la conversation terminée, avant le profil suivant. */
const HOLD_MS = 4200;

function Avatar({ src, pos, size = 40 }: { src: string; pos?: string; size?: number }) {
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size, objectPosition: pos ?? '50% 20%' }}
    />
  );
}

function Typing({ me = false }: { me?: boolean }) {
  return (
    <span
      className={`inline-flex gap-1 rounded-[20px] px-[18px] py-4 ${me ? 'rounded-br-md bg-window-ok-soft' : 'rounded-bl-md bg-window-bubble'}`}
    >
      {[0, 200, 400].map((d) => (
        <i key={d} className="h-[7px] w-[7px] animate-pulse rounded-full bg-window-muted" style={{ animationDelay: `${d}ms` }} />
      ))}
    </span>
  );
}

/** Une ligne de la conversation, qui arrive en glissant (sauf en mouvement réduit). */
function Line({ me = false, children }: { me?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`flex items-end gap-3 motion-safe:animate-[chat-in_.5s_cubic-bezier(.2,.9,.25,1.1)_both] ${me ? 'flex-row-reverse' : ''}`}
    >
      {children}
    </div>
  );
}

/**
 * « Vos maux, on les connaît » : une conversation. À gauche, trois visages ; à droite, la
 * personne choisie écrit — sa phrase, puis ses douleurs (orange) — et Andy lui répond (vert).
 * Les profils tournent seuls quand le bloc est à l'écran ; un clic fixe le profil. En mouvement
 * réduit, la conversation s'affiche d'un coup et rien ne tourne.
 *
 * La conversation animée est masquée aux lecteurs d'écran (elle changerait sans cesse) : ils lisent
 * à la place la version complète, posée en texte (`sr-only`).
 */
export function Personae() {
  const t = TEXT[useLang()];
  const headRef = useReveal<HTMLDivElement>();
  const bodyRef = useReveal<HTMLDivElement>({ y: 32 });
  const roomRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(0);
  const [held, setHeld] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => setReduced(prefersReducedMotion()), []);

  useEffect(() => {
    const room = roomRef.current;
    if (!room) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.3 });
    io.observe(room);
    return () => io.disconnect();
  }, []);

  // Joue la conversation du profil actif quand le bloc est à l'écran, puis passe au suivant.
  useEffect(() => {
    if (reduced) {
      setStep(LAST_STEP);
      return;
    }
    if (!onScreen) return;
    setStep(0);
    const timers = SCRIPT_MS.map((ms, i) => setTimeout(() => setStep(i + 1), ms));
    if (!held) {
      const next = SCRIPT_MS[SCRIPT_MS.length - 1] + HOLD_MS;
      timers.push(setTimeout(() => setActive((a) => (a + 1) % t.personae.length), next));
    }
    return () => timers.forEach(clearTimeout);
  }, [active, held, onScreen, reduced, t.personae.length]);

  const p = t.personae[active];
  const face = FACES[active];

  return (
    // Palier 1, dans la continuité du bandeau de logos
    <section id="personae" className="tier-1 relative overflow-hidden px-6 py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div ref={headRef} className="mx-auto max-w-3xl text-center">
          <span data-reveal className="eyebrow">
            {t.eyebrow}
          </span>
          <h2 data-reveal className="h-section mt-4">
            {t.title}
          </h2>
        </div>

        <div ref={bodyRef} className="mt-12 lg:mt-14">
          <div ref={roomRef} data-reveal className="grid items-start gap-6 lg:grid-cols-[300px_1fr] lg:gap-11">
            {/* Les visages : une rangée en mobile, une colonne en bureau. */}
            <div role="group" aria-label={t.pick} className="flex justify-center gap-3 lg:flex-col lg:justify-start lg:gap-3.5">
              {t.personae.map((persona, i) => {
                const on = i === active;
                return (
                  <button
                    key={persona.role}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setHeld(true);
                      setActive(i);
                    }}
                    className={`flex flex-col items-center gap-2 rounded-[20px] border p-2.5 text-center transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-primary/40 lg:flex-row lg:gap-3.5 lg:text-left ${
                      on ? 'border-green-primary/25 bg-green-primary/[0.07]' : 'border-transparent hover:bg-white/[0.03]'
                    }`}
                  >
                    <Image
                      src={FACES[i].src}
                      alt=""
                      width={72}
                      height={72}
                      className={`h-14 w-14 shrink-0 rounded-full object-cover outline outline-2 outline-offset-[3px] transition-[filter,outline-color,transform] duration-500 lg:h-[72px] lg:w-[72px] ${
                        on ? 'scale-105 outline-green-primary [filter:none]' : 'outline-transparent [filter:grayscale(.85)_brightness(.75)]'
                      }`}
                      style={{ objectPosition: FACES[i].pos }}
                    />
                    <span
                      className={`max-w-[7.5rem] font-display text-xs font-semibold leading-tight transition-colors lg:max-w-none lg:text-base ${
                        on ? 'text-text-primary' : 'text-text-secondary'
                      }`}
                    >
                      {persona.role}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* La conversation, en fenêtre de messagerie claire posée sur le vert nuit : c'est le
                point lumineux de la section. Hauteur réservée : l'arrivée des messages ne fait rien
                bouger. */}
            <div
              aria-hidden="true"
              className="flex min-h-[640px] flex-col gap-3 rounded-[28px] bg-window p-5 text-window-ink shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/5 sm:min-h-[520px] sm:p-7 lg:min-h-[470px]"
            >
              <p className="ml-[52px] font-mono text-[10px] uppercase tracking-[0.12em] text-window-muted">{p.role}</p>
              {step === 1 && (
                <Line>
                  <Avatar src={face.src} pos={face.pos} />
                  <Typing />
                </Line>
              )}
              {step >= 2 && (
                <Line>
                  <Avatar src={face.src} pos={face.pos} />
                  <p className="max-w-[78%] rounded-[20px] rounded-bl-md bg-window-bubble px-[18px] py-3.5 font-display text-lg font-semibold leading-snug tracking-[-0.01em] sm:text-xl">
                    {`« ${p.quote} »`}
                  </p>
                </Line>
              )}
              {p.pains.map((pain, i) =>
                step >= 3 + i ? (
                  <Line key={pain}>
                    <Avatar src={face.src} pos={face.pos} />
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
                <p className="mr-[52px] mt-1 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-window-muted">
                  {ANDY.name}
                </p>
              )}
              {step === 6 && (
                <Line me>
                  <Avatar src={ANDY.src} />
                  <Typing me />
                </Line>
              )}
              {step >= 7 && (
                <Line me>
                  <Avatar src={ANDY.src} />
                  <p className="max-w-[78%] rounded-[20px] rounded-br-md bg-action px-[18px] py-3.5 text-[15px] font-medium leading-snug text-on-green">
                    {p.reply}
                  </p>
                </Line>
              )}
            </div>
          </div>

          {/* Version texte complète, pour les lecteurs d'écran. */}
          <div className="sr-only">
            {t.personae.map((persona) => (
              <div key={persona.role}>
                <h3>{persona.role}</h3>
                <blockquote>{persona.quote}</blockquote>
                <ul>
                  {persona.pains.map((pain) => (
                    <li key={pain}>{pain}</li>
                  ))}
                </ul>
                <p>
                  {ANDY.name} : {persona.reply}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
