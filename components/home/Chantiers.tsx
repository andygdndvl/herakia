'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLang } from '@/components/i18n/LangProvider';
import { clientLogos } from '@/components/home/clientLogos';
import { prefersReducedMotion, useReveal } from '@/lib/anim';

interface Case {
  /** Numéro d'ordre, affiché tel quel en petites capitales. */
  num: string;
  client: string;
  sector: string;
  /** Index dans `clientLogos` — même source que le bandeau `TrustedBy`. */
  logo: number;
  before: string;
  delivered: string;
  result: string;
}

// Les trois cas sont publiables : les clients ont donné leur accord. Rien ici n'est extrapolé —
// chaque case tient dans la phrase validée avec eux, aucun chiffre n'est ajouté.
const TEXT = {
  fr: {
    title: 'Nos chantiers',
    labelBefore: 'Avant',
    labelAfter: 'Après',
    labelResult: 'Résultat',
    labelDelivered: 'Livré',
    prev: 'Chantier précédent',
    next: 'Chantier suivant',
    track: 'Nos chantiers, défilement horizontal',
    cases: [
      {
        num: '01',
        client: 'IPSSI',
        sector: 'Groupe de formation',
        logo: 0,
        before: 'Double saisie entre les outils, aucun tableau de bord, contrats et plannings montés à la main.',
        delivered:
          'Refonte complète : données unifiées, contractualisation et plannings automatisés, pilotage en temps réel.',
        result: "Des dizaines d'heures de saisie supprimées chaque semaine.",
      },
      {
        num: '02',
        client: "Jean Louis David Val d'Europe",
        sector: 'Salon franchisé',
        logo: 1,
        before: 'Commandes fournisseurs passées à la main, réceptions comptées une par une.',
        delivered:
          'Un outil de gestion de stock : commande déclenchée automatiquement, réception simplifiée.',
        result: 'Plus de comptage manuel, plus de rupture.',
      },
      {
        num: '03',
        client: 'Privilux Riviera',
        sector: 'Services haut de gamme',
        logo: 2,
        before: 'Des dizaines de mails, messages et appels à traiter chaque jour.',
        delivered: 'Des agents qui répondent sur les mails, les messages et le répondeur.',
        result: "Les demandes traitées en continu, l'équipe reprend la main sur le reste.",
      },
    ] as Case[],
  },
  en: {
    title: 'Our builds',
    labelBefore: 'Before',
    labelAfter: 'After',
    labelResult: 'Result',
    labelDelivered: 'Delivered',
    prev: 'Previous build',
    next: 'Next build',
    track: 'Our builds, horizontal scroll',
    cases: [
      {
        num: '01',
        client: 'IPSSI',
        sector: 'Training group',
        logo: 0,
        before: 'Double data entry between tools, no dashboard, contracts and schedules built by hand.',
        delivered:
          'A full rebuild: unified data, automated contracts and schedules, real-time steering.',
        result: 'Dozens of hours of data entry removed every week.',
      },
      {
        num: '02',
        client: "Jean Louis David Val d'Europe",
        sector: 'Franchised salon',
        logo: 1,
        before: 'Supplier orders placed by hand, deliveries counted one by one.',
        delivered: 'A stock management tool: orders triggered automatically, deliveries simplified.',
        result: 'No more manual counting, no more stock-outs.',
      },
      {
        num: '03',
        client: 'Privilux Riviera',
        sector: 'Premium services',
        logo: 2,
        before: 'Dozens of emails, messages and calls to handle every day.',
        delivered: 'Agents that answer on email, messaging and voicemail.',
        result: 'Requests handled continuously, the team takes back control of the rest.',
      },
    ] as Case[],
  },
} as const;

/** Bouton rond de navigation ; le vert n'apparaît qu'au survol ou au focus. */
function ArrowButton({ dir, label, disabled, onClick }: {
  dir: 'prev' | 'next';
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-full border border-border-strong text-text-primary transition-colors hover:border-green-line hover:text-green-primary focus:outline-none focus-visible:border-green-line focus-visible:text-green-primary disabled:pointer-events-none disabled:opacity-30"
    >
      <span aria-hidden="true">{dir === 'prev' ? '←' : '→'}</span>
    </button>
  );
}

export function Chantiers() {
  const t = TEXT[useLang()];
  const rootRef = useReveal<HTMLDivElement>({ y: 20, stagger: 110 });
  const trackRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [bar, setBar] = useState({ left: 0, width: 100 });

  // Tout se déduit de la position de défilement : flèches, trackpad, doigt et clavier passent
  // par le même chemin. Le dernier cas ne peut pas s'aligner à gauche (rien ne le suit), d'où
  // le « bout de piste = dernier cas ».
  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.children as HTMLCollectionOf<HTMLElement>;
    if (cards.length < 2) return;
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    const max = track.scrollWidth - track.clientWidth;
    const s = track.scrollLeft;
    const atEnd = s >= max - 4;
    setActive(atEnd ? cards.length - 1 : Math.round(s / step));
    setEdges({ start: s <= 4, end: atEnd });
    const visible = track.clientWidth / track.scrollWidth;
    setBar({ width: visible * 100, left: max > 0 ? (s / max) * (1 - visible) * 100 : 0 });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };
    sync();
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sync]);

  const go = (delta: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.children as HTMLCollectionOf<HTMLElement>;
    const target = cards[Math.min(Math.max(active + delta, 0), cards.length - 1)];
    track.scrollTo({ left: target.offsetLeft - cards[0].offsetLeft, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  return (
    // Palier 1, partagé avec le bandeau de logos qui précède : les trois cas racontés ici sont
    // exactement les trois logos de `TrustedBy` — les deux sections forment un seul bloc de
    // preuve, d'où le même niveau de fond. Le filet du haut est celui du bandeau ; celui du bas
    // ferme le bloc avant `Personae`.
    <section
      aria-labelledby="chantiers-title"
      aria-roledescription="carrousel"
      className="tier-1 relative border-b border-border-subtle px-6 py-20 lg:px-8 lg:py-24"
    >
      <div ref={rootRef} className="mx-auto max-w-7xl">
        <div data-reveal className="flex items-center gap-5">
          <h2 id="chantiers-title" className="eyebrow">
            {t.title}
          </h2>
          <span className="h-px flex-1 bg-border-subtle" aria-hidden="true" />
          <div className="flex items-center gap-2.5">
            <p className="mr-1 font-mono text-xs tracking-[0.12em] text-text-muted" aria-live="polite">
              <span className="text-text-primary">{t.cases[active].num}</span> / {String(t.cases.length).padStart(2, '0')}
            </p>
            <ArrowButton dir="prev" label={t.prev} disabled={edges.start} onClick={() => go(-1)} />
            <ArrowButton dir="next" label={t.next} disabled={edges.end} onClick={() => go(1)} />
          </div>
        </div>

        {/* Une carte à la fois, la suivante dépasse à droite pour dire qu'il y a une suite. Chaque
            carte oppose l'avant (hachuré, éteint, barré : un problème classé) à l'après (le
            résultat en grand, puis ce qu'on a livré). La piste est focalisable : les flèches du
            clavier la font défiler nativement. La cascade de révélation porte sur la piste entière :
            posée sur chaque carte, elle y laisserait une opacité en ligne qui écraserait
            l'atténuation des cartes inactives. */}
        <ol
          ref={trackRef}
          data-reveal
          tabIndex={0}
          aria-label={t.track}
          className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto [scrollbar-width:none] focus:outline-none focus-visible:ring-2 focus-visible:ring-green-primary/20 [&::-webkit-scrollbar]:hidden"
        >
          {t.cases.map((c, i) => {
            const logo = clientLogos[c.logo];
            return (
              <li
                key={c.num}
                aria-label={`${c.num} / ${String(t.cases.length).padStart(2, '0')} — ${c.client}`}
                className={`flex shrink-0 basis-[88%] snap-start flex-col overflow-hidden rounded border border-border-subtle transition-opacity duration-300 sm:basis-[75%] ${
                  i === active ? '' : 'opacity-[0.45]'
                }`}
              >
                <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-5 py-3.5 sm:px-6">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <span className="font-mono text-xs tracking-[0.2em] text-green-muted">{c.num}</span>
                    <h3 className="font-display text-base font-semibold leading-snug text-text-primary">{c.client}</h3>
                    <span className="font-sans text-sm text-text-muted">{c.sector}</span>
                  </div>
                  <Image
                    src={logo.src}
                    alt=""
                    width={logo.width}
                    height={logo.height}
                    className="hidden h-7 w-24 shrink-0 origin-right object-contain object-right opacity-60 brightness-0 invert sm:block"
                    // Même rattrapage optique que le bandeau `TrustedBy` : les fichiers ont des marges
                    // internes très différentes.
                    style={{ transform: `scale(${logo.scale})` }}
                  />
                </div>

                {/* `flex-1` : la carte s'étire à la hauteur de la plus haute de la piste, les deux
                    temps (et les hachures de l'avant) doivent descendre jusqu'en bas. */}
                <div className="grid flex-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
                  <div className="border-b border-border-subtle bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.012)_0_6px,transparent_6px_12px)] px-5 py-6 sm:border-b-0 sm:border-r sm:px-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">{t.labelBefore}</p>
                    <p className="mt-2.5 font-sans text-sm leading-relaxed text-text-muted line-through decoration-white/20">
                      {c.before}
                    </p>
                  </div>

                  <div className="relative px-5 py-6 sm:px-7">
                    {/* Charnière : ↓ quand les deux temps sont empilés, → quand ils sont côte à côte. */}
                    <span
                      aria-hidden="true"
                      className="absolute -top-3 left-5 grid h-6 w-6 place-items-center rounded-full border border-green-line bg-bg-primary text-xs text-green-primary sm:-left-3 sm:top-6"
                    >
                      <span className="sm:hidden">↓</span>
                      <span className="hidden sm:inline">→</span>
                    </span>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-green-muted">{t.labelAfter}</p>
                    <p className="mt-2.5 font-display text-xl font-semibold leading-[1.2] tracking-[-0.015em] text-text-primary [text-wrap:balance] lg:text-[1.4375rem]">
                      <span className="sr-only">{t.labelResult}. </span>
                      {c.result}
                    </p>
                    <p className="mt-3 font-sans text-sm leading-relaxed text-text-secondary">
                      <span className="sr-only">{t.labelDelivered}. </span>
                      {c.delivered}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Filet de progression : la part de piste visible, à sa position. */}
        <div className="relative mt-6 h-px bg-border-subtle" aria-hidden="true">
          <span
            className="absolute inset-y-0 bg-green-line transition-[left,width] duration-300"
            style={{ left: `${bar.left}%`, width: `${bar.width}%` }}
          />
        </div>
      </div>
    </section>
  );
}
