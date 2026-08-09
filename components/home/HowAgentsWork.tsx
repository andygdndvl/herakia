'use client';

import { motion } from 'framer-motion';
import { ArchitectureSchema } from '@/components/ui/ArchitectureSchema';
import { useLang } from '@/components/i18n/LangProvider';

const TEXT = {
  fr: {
    eyebrow: 'Comment ça fonctionne',
    titleLead: 'Une ',
    titleAccent: 'architecture simple',
    titleTail: ', des résultats mesurables.',
    subtitle:
      "Vos sources actuelles (email, API, chat) deviennent des points d'entrée. Un agent IA entraîné sur vos règles métier orchestre la décision. Les sorties s'injectent directement dans vos outils existants — sans changement pour vos équipes.",
    items: [
      { num: '01', title: 'Inputs branchés à votre stack', body: 'Connecteurs natifs vers vos boîtes mail, API, formulaires, CRM.' },
      { num: '02', title: "L'agent IA décide, exécute, escalade", body: 'LLM + règles métier + connaissances internes. Toujours dans le périmètre que vous avez défini.' },
      { num: '03', title: 'Outputs livrés à la bonne place', body: "Réponse client, mise à jour CRM, créneau d'agenda, alerte Slack — automatique." },
    ],
  },
  en: {
    eyebrow: 'How it works',
    titleLead: 'A ',
    titleAccent: 'simple architecture',
    titleTail: ', measurable results.',
    subtitle:
      'Your current sources (email, API, chat) become entry points. An AI agent trained on your business rules orchestrates the decision. Outputs are injected straight into your existing tools — with nothing to change for your teams.',
    items: [
      { num: '01', title: 'Inputs wired to your stack', body: 'Native connectors to your inboxes, APIs, forms and CRM.' },
      { num: '02', title: 'The AI agent decides, acts, escalates', body: 'LLM + business rules + internal knowledge. Always within the scope you define.' },
      { num: '03', title: 'Outputs delivered in the right place', body: 'Customer reply, CRM update, calendar slot, Slack alert — automatically.' },
    ],
  },
} as const;

export function HowAgentsWork() {
  const t = TEXT[useLang()];

  return (
    <section className="relative overflow-hidden px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <span className="block font-mono text-xs uppercase tracking-widest text-green-primary">
              {t.eyebrow}
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl text-balance">
              {t.titleLead}
              <span className="text-green-primary">{t.titleAccent}</span>
              {t.titleTail}
            </h2>
            <p className="mt-6 font-sans text-lg leading-relaxed text-text-secondary md:text-xl">
              {t.subtitle}
            </p>

            <ul className="mt-8 space-y-4">
              {t.items.map((item, idx) => (
                <motion.li
                  key={item.num}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-green bg-green-subtle font-mono text-xs font-bold text-green-primary">
                    {item.num}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-1 font-sans text-sm leading-relaxed text-text-secondary">
                      {item.body}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ArchitectureSchema />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
