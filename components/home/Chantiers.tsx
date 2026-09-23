'use client';

import { useLang } from '@/components/i18n/LangProvider';
import { useReveal } from '@/lib/anim';

interface Case {
  /** Numéro d'ordre, affiché tel quel en petites capitales. */
  num: string;
  client: string;
  sector: string;
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
    labelDelivered: 'Livré',
    labelResult: 'Résultat',
    cases: [
      {
        num: '01',
        client: 'IPSSI',
        sector: 'Groupe de formation',
        before: 'Double saisie entre les outils, aucun tableau de bord, contrats et plannings montés à la main.',
        delivered:
          'Refonte complète : données unifiées, contractualisation et plannings automatisés, pilotage en temps réel.',
        result: "Des dizaines d'heures de saisie supprimées chaque semaine.",
      },
      {
        num: '02',
        client: "Jean Louis David Val d'Europe",
        sector: 'Salon franchisé',
        before: 'Commandes fournisseurs passées à la main, réceptions comptées une par une.',
        delivered:
          'Un outil de gestion de stock : commande déclenchée automatiquement, réception simplifiée.',
        result: 'Plus de comptage manuel, plus de rupture.',
      },
      {
        num: '03',
        client: 'Privilux Riviera',
        sector: 'Services haut de gamme',
        before: 'Des dizaines de mails, messages et appels à traiter chaque jour.',
        delivered: 'Des agents qui répondent sur les mails, les messages et le répondeur.',
        result: "Les demandes traitées en continu, l'équipe reprend la main sur le reste.",
      },
    ] as Case[],
  },
  en: {
    title: 'Our builds',
    labelBefore: 'Before',
    labelDelivered: 'Delivered',
    labelResult: 'Result',
    cases: [
      {
        num: '01',
        client: 'IPSSI',
        sector: 'Training group',
        before: 'Double data entry between tools, no dashboard, contracts and schedules built by hand.',
        delivered:
          'A full rebuild: unified data, automated contracts and schedules, real-time steering.',
        result: 'Dozens of hours of data entry removed every week.',
      },
      {
        num: '02',
        client: "Jean Louis David Val d'Europe",
        sector: 'Franchised salon',
        before: 'Supplier orders placed by hand, deliveries counted one by one.',
        delivered: 'A stock management tool: orders triggered automatically, deliveries simplified.',
        result: 'No more manual counting, no more stock-outs.',
      },
      {
        num: '03',
        client: 'Privilux Riviera',
        sector: 'Premium services',
        before: 'Dozens of emails, messages and calls to handle every day.',
        delivered: 'Agents that answer on email, messaging and voicemail.',
        result: 'Requests handled continuously, the team takes back control of the rest.',
      },
    ] as Case[],
  },
} as const;

/**
 * Un des deux temps du récit, sous le résultat : intitulé en petites capitales dans une
 * gouttière fixe, puis la phrase. Les deux temps s'alignent donc sur la même colonne de
 * libellés, et leur ordre se lit à la couleur : l'avant est en retrait (`text-text-muted`),
 * le livré revient au premier plan (`text-text-secondary`, libellé vert d'annotation).
 * Sous 640 px la gouttière passe au-dessus du texte — jamais deux colonnes serrées.
 */
function Step({ label, text, done = false }: { label: string; text: string; done?: boolean }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <span
        className={`font-mono text-[10px] uppercase leading-5 tracking-[0.18em] sm:w-[5.5rem] sm:shrink-0 ${
          done ? 'text-green-muted' : 'text-text-muted'
        }`}
      >
        {label}
      </span>
      <p
        className={`max-w-2xl font-sans text-sm leading-relaxed ${
          done ? 'text-text-secondary' : 'text-text-muted'
        }`}
      >
        {text}
      </p>
    </div>
  );
}

export function Chantiers() {
  const t = TEXT[useLang()];
  const rootRef = useReveal<HTMLDivElement>({ y: 20, stagger: 110 });

  return (
    // Palier 1, partagé avec le bandeau de logos qui suit : les trois cas nommés ici sont
    // exactement les trois logos de `TrustedBy` — les deux sections forment un seul bloc de
    // preuve, d'où le même niveau de fond, séparé de la suite par les filets.
    <section
      aria-labelledby="chantiers-title"
      className="tier-1 relative border-t border-border-subtle px-6 py-20 lg:px-8 lg:py-24"
    >
      <div ref={rootRef} className="mx-auto max-w-7xl">
        <div data-reveal className="flex items-center gap-5">
          <h2 id="chantiers-title" className="eyebrow">
            {t.title}
          </h2>
          <span className="h-px flex-1 bg-border-subtle" aria-hidden="true" />
        </div>

        {/* Une ligne par cas, filets horizontaux entre elles : le bloc se lit comme un relevé,
            pas comme trois cartes de plaquette. Mais à l'intérieur d'une ligne, les trois temps
            ne pèsent plus pareil : le RÉSULTAT est écrit en grand, la signature du client reste
            petite à gauche, l'avant/livré passe en dessous, en petit. Les trois résultats
            démarrent donc à la même abscisse, derrière le même filet vertical : on les lit en
            balayant la colonne de droite, le détail n'arrive qu'ensuite. */}
        <ol className="mt-10 divide-y divide-border-subtle border-t border-border-subtle">
          {t.cases.map((c) => (
            <li
              key={c.num}
              data-reveal
              className="grid gap-6 py-11 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:gap-12 lg:py-14"
            >
              {/* Signature du cas : numéro, client, secteur. Délibérément au registre du corps
                  de texte — c'est l'étiquette de la preuve, pas la preuve. */}
              <div className="lg:pt-0.5">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs tracking-[0.2em] text-green-muted">{c.num}</span>
                  <h3 className="font-display text-base font-semibold leading-snug text-text-primary">
                    {c.client}
                  </h3>
                </div>
                <p className="mt-1 pl-[2.1rem] font-sans text-sm text-text-muted lg:pl-0">
                  {c.sector}
                </p>
              </div>

              {/* Le filet vertical ne sert qu'à partir de lg : sous cette largeur les deux
                  blocs sont empilés, un trait de gauche n'y séparerait plus rien. */}
              <div className="lg:border-l lg:border-border-subtle lg:pl-12">
                <p className="max-w-[26ch] font-display text-[1.375rem] font-semibold leading-[1.15] tracking-[-0.02em] text-text-primary sm:text-2xl lg:text-[1.75rem] xl:text-[2rem] [text-wrap:balance]">
                  {/* Le libellé « Résultat » ne s'affiche plus : la taille le dit. Il reste pour
                      les lecteurs d'écran, qui n'ont pas accès à la hiérarchie typographique. */}
                  <span className="sr-only">{t.labelResult}. </span>
                  {c.result}
                </p>

                {/* Le filet du détail s'arrête avec les phrases qu'il coiffe : tiré jusqu'au bord
                    droit de la section, il soulignerait le vide plutôt que le texte. */}
                <div className="mt-7 max-w-3xl space-y-3 border-t border-border-subtle pt-5">
                  <Step label={t.labelBefore} text={c.before} />
                  <Step label={t.labelDelivered} text={c.delivered} done />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
