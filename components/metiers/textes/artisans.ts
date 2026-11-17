import type { TiaLandingText } from '@/components/metiers/TiaLanding';
import { COMMUN, FAQ_ARRET, FAQ_TIA } from '@/components/metiers/textes/commun';

export const ARTISANS: { fr: TiaLandingText; en: TiaLandingText } = {
  fr: {
    ...COMMUN.fr,
    eyebrow: 'Tia · pour les artisans du bâtiment',
    titleLead: 'Plus aucun appel perdu ',
    titleAccent: 'sur vos chantiers.',
    moments: ['SUR L’ÉCHELLE', 'SOUS UN ÉVIER', 'SUR LA ROUTE', 'EN RENDEZ-VOUS CLIENT'],
    persona: {
      role: 'Artisan du bâtiment',
      quote: 'Sur un chantier, je ne peux pas décrocher. Et le soir, je rappelle des numéros sans savoir qui c’est.',
      pains: [
        'Le client qui tombe sur la messagerie appelle le suivant sur sa liste',
        'Les messages laissés sur le répondeur sont rares, et souvent incomplets',
        'Je passe mes soirées à rappeler au lieu de souffler',
      ],
    },
    subtitle:
      'Quand vous avez les mains prises, Tia, votre assistante IA, décroche à votre place, note la demande et vous l’envoie par SMS ou WhatsApp.',
    steps: [
      { title: 'Un client appelle', text: 'Vous êtes sur un chantier, sur l’échelle ou en rendez-vous : vous ne pouvez pas répondre.' },
      {
        title: 'Tia décroche',
        text: 'Elle se présente comme votre assistante automatisée et note le nom, l’adresse du chantier, le type de travaux et l’urgence.',
      },
      { title: 'Vous recevez le résumé', text: 'Par SMS ou WhatsApp, en quelques secondes. Vous rappelez quand vous voulez, avec toutes les infos.' },
    ],
    scene: {
      context: 'Sur un chantier · Nice',
      ringing: 'Appel entrant',
      caller: '06 •• •• •• 18',
      ringingHint: 'Vous avez les mains prises.',
      assistant: 'Tia, assistante de l’entreprise',
      dialogue: [
        { who: 'tia', text: 'Entreprise Exemple, bonjour. Je suis Tia, l’assistante automatisée, je prends votre message.' },
        { who: 'client', text: 'Bonjour, j’ai une fuite sous l’évier de la cuisine.' },
        { who: 'tia', text: 'D’accord. À quelle adresse, et est-ce que l’eau coule encore ?' },
        { who: 'client', text: '12 rue des Lilas, à Nice. Oui, ça coule encore.' },
      ],
      smsApp: 'Messages',
      smsTime: 'Aujourd’hui 14:34',
      smsLines: [
        'Nouvel appel à 14 h 32',
        'Nom : M. Exemple',
        'Chantier : 12 rue des Lilas, Nice',
        'Travaux : fuite sous l’évier de la cuisine',
        'Urgence : oui, l’eau coule encore',
      ],
    },
    smsNote: 'Maquette d’illustration : le nom, l’adresse et le numéro sont fictifs.',
    tiaText:
      'Tia est l’assistante IA d’Herakia. Parlez-lui depuis cette page : vous entendrez sa voix, sa façon d’écouter et de reformuler. Chez vous, elle sera réglée sur vos travaux, votre secteur et vos horaires.',
    andyNote:
      'Je règle Tia avec vous : comment elle présente votre entreprise, les questions à poser selon les travaux, et où envoyer le résumé. Ensuite, c’est moi que vous appelez.',
    roiTitle: 'Un chantier récupéré paie Tia pour l’année',
    roiText: (monthly) =>
      `Un appel sans réponse, c’est souvent un client qui appelle le suivant sur sa liste. Il suffit qu’un seul de ces appels devienne un chantier pour payer plus d’un an de Tia à ${monthly} par mois.`,
    faq: (monthly) => [
      {
        q: 'Combien ça coûte ?',
        a: `Dès ${monthly} HT par mois, sans frais d’installation ni engagement. Tia ouvre bientôt : inscrivez-vous sur la liste d’attente pour être prévenu en premier. Le prix exact dépend de vos besoins et vous est donné avant de démarrer.`,
      },
      {
        q: 'Est-ce que ça s’installe sur mon numéro actuel ?',
        a: 'Oui, vous gardez votre numéro. On met en place un renvoi d’appel vers Tia quand vous ne répondez pas ou que vous êtes déjà en ligne. Vos clients composent le même numéro qu’avant.',
      },
      {
        q: 'Mes clients sauront-ils que c’est une IA ?',
        a: 'Oui. Tia se présente dès le début comme une assistante automatisée qui prend le message pour vous. Vos clients savent à qui ils parlent, et c’est vous qui les rappelez.',
      },
      FAQ_TIA.fr,
      FAQ_ARRET.fr,
    ],
    finalTitle: 'Le prochain appel, vous ne le manquerez pas.',
  },
  en: {
    ...COMMUN.en,
    eyebrow: 'Tia · for building tradespeople',
    titleLead: 'No more lost calls ',
    titleAccent: 'on your job sites.',
    moments: ['UP A LADDER', 'UNDER A SINK', 'ON THE ROAD', 'WITH A CLIENT'],
    persona: {
      role: 'Tradesperson',
      quote: 'On a job site, I can’t pick up. And in the evening, I call back numbers without knowing who they are.',
      pains: [
        'A customer who gets voicemail calls the next name on their list',
        'Voicemails are rare, and often incomplete',
        'I spend my evenings calling back instead of resting',
      ],
    },
    subtitle:
      'When your hands are full, Tia, your AI assistant, picks up for you, takes down the request and sends it to you by text message or WhatsApp.',
    steps: [
      { title: 'A customer calls', text: 'You are on a job site, up a ladder or with a client: you can’t answer.' },
      {
        title: 'Tia picks up',
        text: 'She introduces herself as your automated assistant and takes the name, the job site address, the type of work and the urgency.',
      },
      { title: 'You get the summary', text: 'By text message or WhatsApp, within seconds. You call back when it suits you, with all the details.' },
    ],
    scene: {
      context: 'On a job site · Nice',
      ringing: 'Incoming call',
      caller: '06 •• •• •• 18',
      ringingHint: 'Your hands are full.',
      assistant: 'Tia, company assistant',
      dialogue: [
        { who: 'tia', text: 'Example Ltd, hello. I’m Tia, the automated assistant, I’ll take your message.' },
        { who: 'client', text: 'Hello, I have a leak under the kitchen sink.' },
        { who: 'tia', text: 'Alright. What’s the address, and is the water still running?' },
        { who: 'client', text: '12 rue des Lilas, in Nice. Yes, it’s still running.' },
      ],
      smsApp: 'Messages',
      smsTime: 'Today 2:34 pm',
      smsLines: [
        'New call at 2:32 pm',
        'Name: Mr Example',
        'Job site: 12 rue des Lilas, Nice',
        'Work: leak under the kitchen sink',
        'Urgent: yes, water is still running',
      ],
    },
    smsNote: 'Illustration only: the name, address and number are fictitious.',
    tiaText:
      'Tia is Herakia’s AI assistant. Talk to her from this page: you’ll hear her voice and how she listens and rephrases. With you, she will be set up for your trade, your area and your hours.',
    andyNote:
      'I set up Tia with you: how she introduces your business, what to ask depending on the job, and where to send the summary. After that, I’m the one you call.',
    roiTitle: 'One recovered job pays for a year of Tia',
    roiText: (monthly) =>
      `An unanswered call is often a customer who moves on to the next name on their list. It only takes one of those calls turning into a job to pay for more than a year of Tia at ${monthly} a month.`,
    faq: (monthly) => [
      {
        q: 'How much does it cost?',
        a: `From ${monthly} per month excl. VAT, with no setup fee and no commitment. Tia opens soon: join the waiting list to be the first to know. The exact price depends on your needs and is given to you before we start.`,
      },
      {
        q: 'Does it work with my current number?',
        a: 'Yes, you keep your number. We set up call forwarding to Tia when you don’t answer or are already on a call. Your customers dial the same number as before.',
      },
      {
        q: 'Will my customers know it’s an AI?',
        a: 'Yes. Tia introduces herself from the start as an automated assistant taking a message for you. Your customers know who they are talking to, and you are the one who calls them back.',
      },
      FAQ_TIA.en,
      FAQ_ARRET.en,
    ],
    finalTitle: 'You won’t miss the next call.',
  },
};
