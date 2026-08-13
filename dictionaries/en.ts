import type { Dictionary } from './index';

// Dictionnaire EN — doit respecter la même forme que fr.ts (vérifié par TypeScript).
const en: Dictionary = {
  nav: {
    home: 'Home',
    services: 'Services',
    demo : 'Demos',
    faq: 'FAQ',
    cta: 'Start a project',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    switchTo: 'Français',
    switchAria: 'Switch the site to French',
  },
  footer: {
    tagline:
      'Agency specialised in AI automation and bespoke artificial intelligence solutions. We help companies scale without technical complexity.',
    emailAria: 'Send an email to Herakia',
    colProduct: 'Product',
    colContact: 'Contact',
    colLegal: 'Legal',
    linkServices: 'Services',
    linkMethod: 'Method',
    linkFaq: 'FAQ',
    linkStart: 'Start a project',
    linkLegalNotice: 'Legal notice',
    linkPrivacy: 'Privacy',
    linkTerms: 'Terms',
    rights: 'All rights reserved.',
    slogan: 'Automate intelligently, scale fast.',
  },
  hero: {
    badge: 'AI agency · France',
    titleLine1: ['AI', 'automation', 'for'],
    titleLine2: ['ambitious', 'companies.'],
    subtitleBody:
      'Herakia deploys AI agents that take over the repetitive work — so your teams get their time back for what truly matters.',
    ctaPrimary: 'Start a project',
    ctaSecondary: 'Explore our solutions',
    chip1: 'Free assessment',
    chip2: '100% bespoke',
    scrollAria: 'Scroll to the next section',
  },
  meta: {
    home: {
      title: 'Herakia — AI Automation & Artificial Intelligence Solutions',
      description:
        'Herakia automates your workflows and deploys bespoke AI agents. Boost productivity, cut costs, and transform your business with AI.',
    },
    services: {
      title: 'Services — Bespoke Automation & AI',
      description:
        'Herakia builds bespoke AI solutions to automate your most time-consuming tasks: scheduling, invoicing, leads, customer support, data. A system designed for your organisation, never off-the-shelf.',
    },
    contact: {
      title: 'Contact — Start your AI project',
      description:
        "Let's talk about your AI automation project. First conversation free and with no commitment. Reply within 24h.",
    },
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'The questions we get asked.',
    subtitle: 'Another question? Drop us a line, we reply within 24h.',
    items: [
      {
        question: 'How long does it take to set up a solution with Herakia?',
        answer:
          'It depends on the scope. A first simple automation can be in production within a few days; a broader bespoke solution (several tools, business rules, testing) usually takes two to four weeks, prototype and validation included.',
      },
      {
        question: 'Which tools integrate with your automations?',
        answer:
          "We connect to most of the tools you already use: your CRMs (HubSpot, Salesforce, Pipedrive…), your invoicing tools, your inboxes, your no-code platforms (Make, n8n, Zapier) and your internal software. If a tool has no standard connection, we find a bespoke solution.",
      },
      {
        question: "What's the return on investment of an AI automation?",
        answer:
          'It depends on the process automated and how much time it costs you today. Rather than quote an average, we quantify it for your specific case during the initial assessment — you know what you gain before committing.',
      },
      {
        question: 'Is my data secure?',
        answer:
          'Yes. We comply with GDPR, host data in Europe when required, and always sign a confidentiality agreement before any engagement. For regulated sectors (healthcare, finance), we offer on-premise or private cloud architectures.',
      },
      {
        question: 'Do you work with SMEs or only large accounts?',
        answer:
          'Size matters less than the ambition of the project. We work with organisations that are serious about tackling the topic, from structured SMEs to large groups. Every engagement is designed bespoke, calibrated to your stakes — never a standardised package.',
      },
      {
        question: 'What happens after deployment?',
        answer:
          'Deployment is never the end. We monitor performance, tune continuously and check in regularly to spot new opportunities. Your teams are trained to gain autonomy over time.',
      },
    ],
  },
};

export default en;
