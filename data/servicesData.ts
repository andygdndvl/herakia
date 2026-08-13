
export interface ServiceContent {
  id: string;
  badge: string;
  heroTitleLead: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  ctaText: string;
  imageSrc: string;
  imageAlt: string;
  problemTitle: string;
  problemText: string;
  solutionTitle: string;
  solutionText: string;
  casesTitle: string;
  useCases: readonly { title: string; description: string }[];
  stepsTitle: string;
  steps: readonly { number: string; title: string; description: string }[];
  deliverablesTitle: string;
  deliverables: readonly string[];
}

export const SERVICES_DATA: Record<'fr' | 'en', Record<string, ServiceContent>> = {
  fr: {
    workflows: {
      id: 'workflows',
      badge: 'Automatisation des workflows',
      heroTitleLead: 'Connectez vos outils. ',
      heroTitleAccent: 'Automatisez vos process.',
      heroSubtitle: 'Éliminez les tâches manuelles répétitives et laissez vos données circuler seules entre vos logiciels.',
      ctaText: 'Automatiser mes process',
      imageSrc: '/images/services/workflows-detail.webp',
      imageAlt: 'Schéma d’automatisation des workflows',
      problemTitle: 'Le constat',
      problemText: 'Vos équipes perdent des heures à copier-coller des informations et à corriger des erreurs de saisie.',
      solutionTitle: 'La solution Herakia',
      solutionText: 'Nous créons des ponts intelligents entre tous vos logiciels pour exécuter vos séquences automatiquement.',
      casesTitle: 'Ce que nous automatisons',
      useCases: [
        { title: 'Ventes & Onboarding', description: 'Création du contrat, envoi de facture et création des accès client.' },
        { title: 'Devis & Relances', description: 'Mise à jour du CRM, notifications et programmation des relances.' },
        { title: 'RH & Opérations', description: 'Génération automatique des documents administratifs pour nouveaux arrivants.' },
      ],
      stepsTitle: 'Notre méthode',
      steps: [
        { number: '01', title: 'Cartographie', description: 'Audit des flux et repérage des points de friction.' },
        { number: '02', title: 'Connexion', description: 'Configuration des intégrations via API et scénarios.' },
        { number: '03', title: 'Tests', description: 'Gestion des cas d’erreur et alertes automatiques.' },
        { number: '04', title: 'Livraison', description: 'Formation des équipes et documentation.' },
      ],
      deliverablesTitle: 'Livrables',
      deliverables: [
        'Workflows opérationnels 24/7',
        'Zéro erreur de saisie manuelle',
        'Tableau de bord de suivi',
        'Documentation technique',
      ],
    },
    agents: {
      id: 'agents',
      badge: 'Assistants IA sur-mesure',
      heroTitleLead: 'Déployez des agents IA ',
      heroTitleAccent: 'taillés pour vos opérations.',
      heroSubtitle: 'Offrez à votre entreprise la capacité de traitement d’un collaborateur supplémentaire.',
      ctaText: 'Concevoir mon assistant IA',
      imageSrc: '/images/services/agents-detail.webp',
      imageAlt: 'Interface d’un assistant IA',
      problemTitle: 'Le constat',
      problemText: 'La qualification des demandes et la gestion des RDV prennent un temps précieux à vos experts.',
      solutionTitle: 'La solution Herakia',
      solutionText: 'Un agent autonome cadré sur vos règles métiers qui exécute des actions précises et sait passer la main.',
      casesTitle: 'Champs d’action',
      useCases: [
        { title: 'Agent Commercial', description: 'Qualifie les leads 24/7 et réserve les créneaux dans l’agenda.' },
        { title: 'Agent Opérationnel', description: 'Analyse les pièces jointes et pré-remplit les dossiers.' },
        { title: 'Agent Support Interne', description: 'Assiste vos équipes dans la recherche d’informations complexes.' },
      ],
      stepsTitle: 'Étapes du projet',
      steps: [
        { number: '01', title: 'Cadrage', description: 'Définition du rôle, du ton et des règles d’escalade.' },
        { number: '02', title: 'Entraînement', description: 'Configuration du modèle d’IA sur vos cas d’usage.' },
        { number: '03', title: 'Recette', description: 'Validation de la fiabilité des réponses.' },
        { number: '04', title: 'Déploiement', description: 'Mise en production dans vos outils.' },
      ],
      deliverablesTitle: 'Garanties',
      deliverables: [
        'Agent connecté à votre CRM/ERP',
        'Garde-fous et règles de sécurité',
        'Escalade humaine automatique',
        'Historique des conversations',
      ],
    },
    llm: {
      id: 'llm',
      badge: 'IA conversationnelle & RAG',
      heroTitleLead: 'Exploitez toute la connaissance ',
      heroTitleAccent: 'de votre entreprise.',
      heroSubtitle: 'Un assistant conversationnel sécurisé nourri de votre documentation interne.',
      ctaText: 'Tester sur nos données',
      imageSrc: '/images/services/llm-detail.webp',
      imageAlt: 'Assistant conversationnel connecté au savoir interne',
      problemTitle: 'Le constat',
      problemText: 'Vos informations sont dispersées dans des documents et vos équipes perdent du temps à chercher.',
      solutionTitle: 'La solution Herakia',
      solutionText: 'Une IA basée sur la technologie RAG qui lit et synthétise vos documents sans halluciner.',
      casesTitle: 'Cas d’usage',
      useCases: [
        { title: 'Support Client 24/7', description: 'Répond aux questions récurrentes en citant votre FAQ.' },
        { title: 'Base de Connaissance', description: 'Interrogation de la documentation interne en langage naturel.' },
        { title: 'Assistant de Recherche', description: 'Synthèse de contrats complexes et comptes-rendus.' },
      ],
      stepsTitle: 'Déploiement',
      steps: [
        { number: '01', title: 'Indexation', description: 'Connexion et structuration de vos documents.' },
        { number: '02', title: 'Config RAG', description: 'Paramétrage de l’architecture de recherche.' },
        { number: '03', title: 'Sécurisation', description: 'Filtrage pour garantir 0 hallucination.' },
        { number: '04', title: 'Intégration', description: 'Mise en place du widget chat sur vos outils.' },
      ],
      deliverablesTitle: 'Bénéfices',
      deliverables: [
        'Moteur de recherche IA interne',
        'Widget conversationnel sur-mesure',
        'Données privées et sécurisées',
        'Réduction des demandes support',
      ],
    },
    data: {
      id: 'data',
      badge: 'Données & Nettoyage',
      heroTitleLead: 'Transformez vos données brutes en ',
      heroTitleAccent: 'levier de croissance.',
      heroSubtitle: 'Centralisez, nettoyez et structurez vos données pour alimenter vos projets IA.',
      ctaText: 'Audit de nos données',
      imageSrc: '/images/services/data-detail.webp',
      imageAlt: 'Visualisation de données nettoyées',
      problemTitle: 'Le constat',
      problemText: 'Fichiers éparpillés, doublons, formats incohérents : impossible de lancer des projets IA fiables.',
      solutionTitle: 'La solution Herakia',
      solutionText: 'Nous unifions et nettoyons vos bases pour vous offrir une source unique de vérité.',
      casesTitle: 'Périmètre',
      useCases: [
        { title: 'Centralisation', description: 'Extraction automatique depuis vos outils métiers et API.' },
        { title: 'Nettoyage', description: 'Normalisation des formats et suppression des doublons.' },
        { title: 'Conformité', description: 'Enrichissement des fiches et mise en conformité RGPD.' },
      ],
      stepsTitle: 'Méthodologie',
      steps: [
        { number: '01', title: 'Diagnostic', description: 'Analyse des bases et repérage des anomalies.' },
        { number: '02', title: 'Pipeline', description: 'Création de scripts automatisés de nettoyage.' },
        { number: '03', title: 'Matching', description: 'Unification des fiches entre logiciels.' },
        { number: '04', title: 'Delivery', description: 'Mise à disposition pour vos dashboards et IA.' },
      ],
      deliverablesTitle: 'Ce que vous obtenez',
      deliverables: [
        'Base de données unique et propre',
        'Pipeline de mise à jour automatique',
        'Conformité RGPD',
        'Connecteurs Analytics et IA',
      ],
    },
    conseil: {
      id: 'conseil',
      badge: 'Audit & Conseil IA',
      heroTitleLead: 'Mesurez le ROI de l’IA ',
      heroTitleAccent: 'avant d’investir.',
      heroSubtitle: 'Un diagnostic court pour identifier vos opportunités rentables et chiffrer les gains.',
      ctaText: 'Demander un diagnostic',
      imageSrc: '/images/services/conseil-detail.webp',
      imageAlt: 'Rapport d’audit et feuille de route',
      problemTitle: 'Le constat',
      problemText: 'L’offre IA est vaste et floue. Vous ne savez pas par quoi commencer ni quel budget allouer.',
      solutionTitle: 'La solution Herakia',
      solutionText: 'Un accompagnement pragmatique pour sélectionner uniquement les projets à fort ROI.',
      casesTitle: 'Le diagnostic',
      useCases: [
        { title: 'Audit des Process', description: 'Repérage des tâches chronophages à forte valeur.' },
        { title: 'Chiffrage ROI', description: 'Estimation précise des gains de temps et de budget.' },
        { title: 'Sélection Tech', description: 'Recommandation neutre des meilleurs outils du marché.' },
      ],
      stepsTitle: 'Déroulement',
      steps: [
        { number: 'W1', title: 'Immersion', description: 'Entretiens avec vos équipes métiers.' },
        { number: 'W2', title: 'Analyse', description: 'Étude de faisabilité et calcul des gains.' },
        { number: 'W3', title: 'Restitution', description: 'Présentation de la feuille de route priorisée.' },
      ],
      deliverablesTitle: 'Livrables',
      deliverables: [
        'Rapport de maturité IA',
        'Feuille de route (Matrice Impact / Effort)',
        'Cahier des charges technique',
        'Liberté totale pour la suite',
      ],
    },
  },
  en: {
    /* Mettre ici les traductions EN si besoin */
    workflows: {} as any,
    agents: {} as any,
    llm: {} as any,
    data: {} as any,
    conseil: {} as any,
  },
};