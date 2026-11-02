import type { ZeroAppelText } from '@/components/metiers/ZeroAppelLanding';
import { COMMUN, FAQ_ARRET } from '@/components/metiers/textes/commun';

export const IMMOBILIER: { fr: ZeroAppelText; en: ZeroAppelText } = {
  fr: {
    ...COMMUN.fr,
    eyebrow: 'Pour les agences immobilières',
    titleLead: 'Chaque appel décroché, ',
    titleAccent: 'même en visite.',
    moments: ['EN VISITE', 'EN RENDEZ-VOUS D’ESTIMATION', 'SUR LA ROUTE', 'CHEZ LE NOTAIRE'],
    persona: {
      role: 'Agent immobilier',
      quote: 'Pendant une visite, mon téléphone vibre dans ma poche. Je ne peux pas décrocher, et c’est peut-être un mandat.',
      pains: [
        'Un vendeur appelle plusieurs agences, et retient celle qui répond',
        'À l’agence, le standard sonne pendant que tout le monde est dehors',
        'Le soir, je rappelle sans savoir si c’est un vendeur ou un curieux',
      ],
    },
    subtitle:
      'Quand vous êtes en visite ou en rendez-vous, un assistant IA décroche à votre place, note la demande du vendeur ou de l’acquéreur et vous l’envoie par SMS ou WhatsApp.',
    steps: [
      {
        title: 'Un client appelle',
        text: 'Vous êtes en visite, en rendez-vous d’estimation ou déjà en ligne : personne ne peut décrocher.',
      },
      {
        title: 'L’assistant décroche',
        text: 'Il se présente comme l’assistant automatisé de l’agence, demande s’il s’agit d’une vente, d’un achat ou d’une location, et note le bien, le secteur et le moment où rappeler.',
      },
      {
        title: 'Vous recevez le résumé',
        text: 'Par SMS ou WhatsApp, en quelques secondes. Vous rappelez quand vous voulez, avec toutes les infos.',
      },
    ],
    scene: {
      context: 'En visite · appartement T4',
      ringing: 'Appel entrant',
      caller: '06 •• •• •• 47',
      ringingHint: 'Vous ne pouvez pas décrocher.',
      assistant: 'Assistant de l’agence',
      dialogue: [
        { who: 'tia', text: 'Agence Exemple, bonjour. Je suis l’assistant automatisé, je prends votre message.' },
        { who: 'client', text: 'Bonjour, je voudrais faire estimer mon appartement.' },
        { who: 'tia', text: 'Très bien. Quel type de bien, et dans quel quartier ?' },
        { who: 'client', text: 'Un T3, à Libération. Rappelez-moi avant 18 h.' },
      ],
      smsApp: 'Messages',
      smsTime: 'Aujourd’hui 14:34',
      smsLines: [
        'Nouvel appel à 14 h 32',
        'Nom : Mme Exemple',
        'Projet : vente, souhaite une estimation',
        'Bien : appartement T3, Nice Libération',
        'Rappel souhaité : aujourd’hui avant 18 h',
      ],
    },
    smsNote: 'Maquette d’illustration : le nom, le bien et le numéro sont fictifs.',
    tiaText:
      'Tia est l’assistante vocale d’Herakia. Parlez-lui depuis cette page : vous entendrez sa voix, sa façon d’écouter et de reformuler. Celui de votre agence suivra le même principe, réglé sur vos biens, vos secteurs et vos horaires.',
    andyNote:
      'Je règle l’assistant avec vous : comment il présente l’agence, les questions à poser à un vendeur ou à un acquéreur, et à qui envoyer le résumé. Ensuite, c’est moi que vous appelez.',
    roiTitle: 'Un mandat récupéré rembourse l’installation',
    roiText: (setup) =>
      `Un propriétaire qui veut faire estimer son bien appelle souvent plusieurs agences. S’il tombe sur la messagerie, il appelle la suivante. Il suffit qu’un seul de ces appels devienne un mandat pour couvrir les ${setup} d’installation.`,
    faq: (setup, monthly) => [
      {
        q: 'Combien ça coûte ?',
        a: `Dès ${setup} d’installation, puis ${monthly} par mois, sans engagement. Le prix exact dépend de votre agence (nombre de lignes, nombre d’agents) et vous est donné avant de démarrer.`,
      },
      {
        q: 'Est-ce que ça s’installe sur le numéro de l’agence ?',
        a: 'Oui, vous gardez vos numéros : celui de l’agence comme les portables des agents. On met en place un renvoi d’appel vers l’assistant quand personne ne répond ou que la ligne est occupée. Vos clients composent le même numéro qu’avant.',
      },
      {
        q: 'Nous sommes plusieurs agents : qui reçoit les résumés ?',
        a: 'C’est vous qui choisissez à l’installation : l’accueil, l’agent de permanence, ou chaque agent pour sa propre ligne.',
      },
      {
        q: 'Vos clients sauront-ils que c’est une IA ?',
        a: 'Oui. L’assistant se présente dès le début comme un assistant automatisé qui prend le message pour l’agence. Vos clients savent à qui ils parlent, et c’est vous qui les rappelez.',
      },
      FAQ_ARRET.fr,
    ],
    finalTitle: 'Le prochain vendeur qui appelle, c’est vous qui le rappelez.',
  },
  en: {
    ...COMMUN.en,
    eyebrow: 'For estate agencies',
    titleLead: 'Every call answered, ',
    titleAccent: 'even at a viewing.',
    moments: ['AT A VIEWING', 'AT A VALUATION', 'ON THE ROAD', 'AT THE SOLICITOR’S'],
    persona: {
      role: 'Estate agent',
      quote: 'During a viewing, my phone buzzes in my pocket. I can’t pick up, and it might be a new listing.',
      pains: [
        'A seller calls several agencies and goes with the one that answers',
        'At the office, the phone rings while everyone is out',
        'In the evening, I call back without knowing if it’s a seller or a browser',
      ],
    },
    subtitle:
      'When you are at a viewing or a meeting, an AI assistant picks up for you, takes down the seller’s or buyer’s request and sends it to you by text message or WhatsApp.',
    steps: [
      {
        title: 'A client calls',
        text: 'You are at a viewing, at a valuation appointment or already on the phone: nobody can pick up.',
      },
      {
        title: 'The assistant picks up',
        text: 'It introduces itself as the agency’s automated assistant, asks whether it is a sale, a purchase or a rental, and takes down the property, the area and when to call back.',
      },
      {
        title: 'You get the summary',
        text: 'By text message or WhatsApp, within seconds. You call back when it suits you, with all the details.',
      },
    ],
    scene: {
      context: 'At a viewing · 3-bed flat',
      ringing: 'Incoming call',
      caller: '06 •• •• •• 47',
      ringingHint: 'You can’t pick up.',
      assistant: 'Agency assistant',
      dialogue: [
        { who: 'tia', text: 'Example Estates, hello. I’m the automated assistant, I’ll take your message.' },
        { who: 'client', text: 'Hello, I’d like a valuation for my flat.' },
        { who: 'tia', text: 'Of course. What type of property, and in which area?' },
        { who: 'client', text: 'A 2-bed, in Libération. Call me back before 6 pm.' },
      ],
      smsApp: 'Messages',
      smsTime: 'Today 2:34 pm',
      smsLines: [
        'New call at 2:32 pm',
        'Name: Mrs Example',
        'Project: selling, wants a valuation',
        'Property: 2-bedroom flat, Nice Libération',
        'Call back: today before 6 pm',
      ],
    },
    smsNote: 'Illustration only: the name, property and number are fictitious.',
    tiaText:
      'Tia is Herakia’s voice assistant. Talk to her from this page: you’ll hear her voice and how she listens and rephrases. Your agency’s will work the same way, set up for your properties, your areas and your hours.',
    andyNote:
      'I set up the assistant with you: how it introduces the agency, what to ask a seller or a buyer, and who gets the summary. After that, I’m the one you call.',
    roiTitle: 'One recovered listing pays for the setup',
    roiText: (setup) =>
      `An owner who wants a valuation often calls several agencies. If they reach voicemail, they call the next one. It only takes one of those calls turning into a listing to cover the ${setup} setup.`,
    faq: (setup, monthly) => [
      {
        q: 'How much does it cost?',
        a: `From ${setup} setup, then ${monthly} per month, with no commitment. The exact price depends on your agency (number of lines, number of agents) and is given to you before we start.`,
      },
      {
        q: 'Does it work with the agency’s number?',
        a: 'Yes, you keep your numbers: the agency line as well as the agents’ mobiles. We set up call forwarding to the assistant when nobody answers or the line is busy. Your clients dial the same number as before.',
      },
      {
        q: 'We have several agents: who gets the summaries?',
        a: 'You choose at setup: the front desk, the agent on duty, or each agent for their own line.',
      },
      {
        q: 'Will your clients know it’s an AI?',
        a: 'Yes. The assistant introduces itself from the start as an automated assistant taking a message for the agency. Your clients know who they are talking to, and you are the one who calls them back.',
      },
      FAQ_ARRET.en,
    ],
    finalTitle: 'The next seller who calls is the one you call back.',
  },
};
