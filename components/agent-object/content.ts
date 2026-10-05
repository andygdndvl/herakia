import type { PartId } from './layout';

export interface AgentObjectText {
  eyebrow: string;
  title: string;
  body: string;
  finale: string;
  /** mention du cartouche d'ingénieur (visible seulement ≥ 1200 px, pendant l'ouverture) */
  plate: string;
  /** `k` : nom de l'organe. Son numéro d'ordre vient de sa place dans `PART_IDS`. */
  parts: Record<PartId, { k: string; title: string; desc: string }>;
}

export const AGENT_OBJECT_TEXT: Record<'fr' | 'en', AgentObjectText> = {
  fr: {
    eyebrow: 'En clair',
    title: 'Qu’est-ce qu’un agent IA ?',
    body: 'Pas un simple chatbot. Un agent IA est un collaborateur numérique qui perçoit ce qui arrive, décide quoi faire selon vos règles, et agit dans vos outils — tout seul, en continu.',
    finale: 'Un agent ne se contente pas de répondre : il agit.',
    plate: 'Vue éclatée · 06 organes',
    parts: {
      perceive: { k: 'Capteur', title: 'Perçoit', desc: 'Un e-mail, une demande, un appel arrive : il le capte, jour et nuit.' },
      decide: { k: 'Cœur', title: 'Décide', desc: 'Il analyse le contexte et applique vos règles.' },
      act: { k: 'Bras', title: 'Agit', desc: 'Il répond, met à jour le CRM, planifie — dans vos outils.' },
      report: { k: 'Écran', title: 'Rend compte', desc: 'Un tableau de bord clair : vous gardez la main.' },
      reply: { k: 'Voix', title: 'Répond', desc: 'Par écrit ou à la voix, avec le ton de votre entreprise.' },
      connect: { k: 'Connecteurs', title: 'Se branche', desc: 'Sur vos outils existants, sans migration.' },
    },
  },
  en: {
    eyebrow: 'In plain terms',
    title: 'What is an AI agent?',
    body: 'Not just a chatbot. An AI agent is a digital coworker that perceives what comes in, decides what to do based on your rules, and acts in your tools — on its own, around the clock.',
    finale: 'An agent doesn’t just reply — it acts.',
    plate: 'Exploded view · 06 parts',
    parts: {
      perceive: { k: 'Sensor', title: 'Perceives', desc: 'An email, a request, a call comes in: it picks it up, day and night.' },
      decide: { k: 'Core', title: 'Decides', desc: 'It reads the context and applies your rules.' },
      act: { k: 'Arm', title: 'Acts', desc: 'It replies, updates the CRM, schedules — in your tools.' },
      report: { k: 'Screen', title: 'Reports', desc: 'A clear dashboard: you stay in control.' },
      reply: { k: 'Voice', title: 'Replies', desc: 'In writing or by voice, in your company’s tone.' },
      connect: { k: 'Connectors', title: 'Connects', desc: 'To the tools you already use, no migration.' },
    },
  },
};
