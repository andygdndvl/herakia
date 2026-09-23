// Dictionnaire FR — source de vérité de la structure (le type Dictionary en est dérivé).
const fr = {
  nav: {
    home: 'Accueil',
    services: 'Services',
    offres: 'Offres',
    demo : 'Démos',
    faq: 'FAQ',
    cta: 'Démarrer un projet',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    switchTo: 'English',
    switchAria: 'Passer le site en anglais',
  },
  footer: {
    tagline:
      'Agence spécialisée en automatisation IA et solutions intelligence artificielle. Nous aidons les entreprises à scaler sans complexité technique.',
    emailAria: 'Envoyer un email à Herakia',
    colProduct: 'Produit',
    colContact: 'Contact',
    colLegal: 'Légal',
    linkServices: 'Services',
    linkOffres: 'Offres',
    linkMethod: 'Méthode',
    linkFaq: 'FAQ',
    linkStart: 'Démarrer un projet',
    linkLegalNotice: 'Mentions légales',
    linkPrivacy: 'Confidentialité',
    linkTerms: 'CGU',
    rights: 'Tous droits réservés.',
    slogan: 'Automatisez intelligemment, scalez rapidement.',
  },
  hero: {
    badge: 'Agence IA · France',
    // Titre fixe, en deux morceaux : le second porte le vert de la marque. Les deux se lisent
    // d'une traite — « On construit ce qui vous rend du temps. »
    titleLead: 'On construit ce qui vous rend',
    titleAccent: 'du temps.',
    // Ligne en petites capitales sous le titre : les trois moyens, réécrits l'un après l'autre.
    // Le premier est celui rendu côté serveur — la ligne a déjà du sens sans JavaScript.
    means: ['Agents IA', 'Applications sur-mesure', 'Automatisations'],
    subtitleBody:
      "On part de vos process, pas d'un produit sur étagère.",
    ctaPrimary: 'Démarrer un projet',
    ctaSecondary: 'Découvrir nos solutions',
    chip1: 'Diagnostic offert',
    chip2: '100 % sur-mesure',
    // Bande de preuve sous les boutons. La note est celle des avis Google affichés
    // plus bas (tous à 5 étoiles) : aucun nombre d'avis n'est annoncé, le site ne
    // peut en justifier que ceux qu'il montre.
    proofRating: '5,0 · avis Google',
    proofAria: 'Note Google et avis client',
    proofQuote: 'Un vrai gain de temps et une très belle découverte.',
    proofAuthor: 'Nadja Djordjevic · avis Google',
    scrollAria: 'Faire défiler vers la section suivante',
  },
  meta: {
    home: {
      title: 'Herakia — Automatisation IA & Solutions Intelligence Artificielle',
      description:
        "Herakia automatise vos workflows et déploie des agents IA sur mesure. Gagnez en productivité, réduisez les coûts, transformez votre entreprise avec l'IA.",
    },
    services: {
      title: 'Services — Automatisation & IA sur mesure',
      description:
        "Herakia conçoit des solutions IA sur-mesure pour automatiser vos tâches chronophages : planning, facturation, leads, support client, données. Un système pensé pour votre organisation, jamais un produit sur étagère.",
    },
    contact: {
      title: 'Contact — Démarrer votre projet IA',
      description:
        "Discutons de votre projet d'automatisation IA. Premier échange gratuit et sans engagement. Réponse sous 24h.",
    },
    offres: {
      title: 'Offres — Nos formules d\'automatisation IA',
      description:
        "Trois formules pour automatiser votre entreprise avec l'IA : audit & diagnostic, mise en place d'agents IA, ou système automatisé complet. Sur-mesure, sur devis.",
    },
  },
  faq: {
    eyebrow: 'FAQ',
    title: "Les questions qu'on nous pose.",
    subtitle: 'Une autre interrogation ? Écrivez-nous, nous répondons sous 24h.',
    items: [
      {
        question: 'Combien de temps pour mettre en place une solution avec Herakia ?',
        answer:
          "Cela dépend du périmètre. Une première automatisation simple peut être en production en quelques jours ; une solution sur-mesure plus large (plusieurs outils, règles métier, tests) prend généralement de deux à quatre semaines, prototype et validation compris.",
      },
      {
        question: "Quels outils s'intègrent avec vos automatisations ?",
        answer:
          "On se connecte à la plupart des outils que vous utilisez déjà : vos CRM (HubSpot, Salesforce, Pipedrive…), vos outils de facturation, vos boîtes mail, vos plateformes no-code (Make, n8n, Zapier) et vos logiciels internes. Si un outil n'a pas de connexion standard, on trouve une solution sur-mesure.",
      },
      {
        question: "Quel est le retour sur investissement d'une automatisation IA ?",
        answer:
          "Il dépend du processus automatisé et du temps qu'il vous coûte aujourd'hui. Plutôt que d'avancer une moyenne, on le chiffre pour votre cas précis lors du diagnostic initial — vous savez ce que vous gagnez avant de vous engager.",
      },
      {
        question: 'Mes données sont-elles sécurisées ?',
        answer:
          "Oui. Nous respectons le RGPD, hébergeons les données en Europe quand cela est requis, et signons systématiquement un accord de confidentialité avant toute mission. Pour les secteurs réglementés (santé, finance), nous proposons des architectures on-premise ou cloud privé.",
      },
      {
        question: 'Travaillez-vous avec les PME ou seulement les grands comptes ?',
        answer:
          "La taille compte moins que l'ambition du projet. On travaille avec des organisations décidées à traiter le sujet sérieusement, de la PME structurée au groupe. Chaque intervention est conçue sur-mesure, calibrée sur vos enjeux — jamais un pack standardisé.",
      },
      {
        question: 'Que se passe-t-il après le déploiement ?',
        answer:
          "Le déploiement n'est jamais la fin. On suit les performances, on ajuste en continu et on fait le point régulièrement pour repérer de nouvelles opportunités. Vos équipes sont formées pour gagner en autonomie au fil du temps.",
      },
    ],
  },
};

export default fr;
