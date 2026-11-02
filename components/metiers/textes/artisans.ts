import type { ZeroAppelText } from '@/components/metiers/ZeroAppelLanding';
import { COMMUN, FAQ_ARRET } from '@/components/metiers/textes/commun';
import { SHOW_QUOTE_FOLLOWUP } from '@/lib/offreArtisans';

export const ARTISANS: { fr: ZeroAppelText; en: ZeroAppelText } = {
  fr: {
    ...COMMUN.fr,
    eyebrow: 'Pour les artisans du bâtiment',
    titleLead: 'Zéro appel manqué ',
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
      'Quand vous avez les mains prises, un assistant IA décroche à votre place, note la demande et vous l’envoie par SMS ou WhatsApp.',
    steps: [
      { title: 'Un client appelle', text: 'Vous êtes sur un chantier, sur l’échelle ou en rendez-vous : vous ne pouvez pas répondre.' },
      {
        title: 'L’assistant décroche',
        text: 'Il se présente comme votre assistant automatisé et note le nom, l’adresse du chantier, le type de travaux et l’urgence.',
      },
      { title: 'Vous recevez le résumé', text: 'Par SMS ou WhatsApp, en quelques secondes. Vous rappelez quand vous voulez, avec toutes les infos.' },
    ],
    scene: {
      context: 'Sur un chantier · Nice',
      ringing: 'Appel entrant',
      caller: '06 •• •• •• 18',
      ringingHint: 'Vous avez les mains prises.',
      assistant: 'Assistant de l’entreprise',
      dialogue: [
        { who: 'tia', text: 'Entreprise Exemple, bonjour. Je suis l’assistant automatisé, je prends votre message.' },
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
      'Tia est l’assistante vocale d’Herakia. Parlez-lui depuis cette page : vous entendrez sa voix, sa façon d’écouter et de reformuler. Celui de votre entreprise suivra le même principe, réglé sur vos travaux, votre secteur et vos horaires.',
    andyNote:
      'Je règle l’assistant avec vous : comment il présente votre entreprise, les questions à poser selon les travaux, et où envoyer le résumé. Ensuite, c’est moi que vous appelez.',
    roiTitle: 'Un chantier récupéré rembourse l’installation',
    roiText: (setup) =>
      `Un appel sans réponse, c’est souvent un client qui appelle le suivant sur sa liste. Il suffit qu’un seul de ces appels devienne un chantier pour couvrir les ${setup} d’installation.`,
    faq: (setup, monthly) => [
      {
        q: 'Combien ça coûte ?',
        a: `Dès ${setup} d’installation, puis ${monthly} par mois, sans engagement. Le prix exact dépend de vos besoins${SHOW_QUOTE_FOLLOWUP ? ' (par exemple la relance automatique des devis)' : ''} et vous est donné avant de démarrer.`,
      },
      {
        q: 'Est-ce que ça s’installe sur mon numéro actuel ?',
        a: 'Oui, vous gardez votre numéro. On met en place un renvoi d’appel vers l’assistant quand vous ne répondez pas ou que vous êtes déjà en ligne. Vos clients composent le même numéro qu’avant.',
      },
      {
        q: 'Mes clients sauront-ils que c’est une IA ?',
        a: 'Oui. L’assistant se présente dès le début comme un assistant automatisé qui prend le message pour vous. Vos clients savent à qui ils parlent, et c’est vous qui les rappelez.',
      },
      FAQ_ARRET.fr,
    ],
    finalTitle: 'Le prochain appel, vous ne le manquerez pas.',
  },
  en: {
    ...COMMUN.en,
    eyebrow: 'For building tradespeople',
    titleLead: 'Zero missed calls ',
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
      'When your hands are full, an AI assistant picks up for you, takes down the request and sends it to you by text message or WhatsApp.',
    steps: [
      { title: 'A customer calls', text: 'You are on a job site, up a ladder or with a client: you can’t answer.' },
      {
        title: 'The assistant picks up',
        text: 'It introduces itself as your automated assistant and takes the name, the job site address, the type of work and the urgency.',
      },
      { title: 'You get the summary', text: 'By text message or WhatsApp, within seconds. You call back when it suits you, with all the details.' },
    ],
    scene: {
      context: 'On a job site · Nice',
      ringing: 'Incoming call',
      caller: '06 •• •• •• 18',
      ringingHint: 'Your hands are full.',
      assistant: 'Company assistant',
      dialogue: [
        { who: 'tia', text: 'Example Ltd, hello. I’m the automated assistant, I’ll take your message.' },
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
      'Tia is Herakia’s voice assistant. Talk to her from this page: you’ll hear her voice and how she listens and rephrases. Yours will work the same way, set up for your trade, your area and your hours.',
    andyNote:
      'I set up the assistant with you: how it introduces your business, what to ask depending on the job, and where to send the summary. After that, I’m the one you call.',
    roiTitle: 'One recovered job pays for the setup',
    roiText: (setup) =>
      `An unanswered call is often a customer who moves on to the next name on their list. It only takes one of those calls turning into a job to cover the ${setup} setup.`,
    faq: (setup, monthly) => [
      {
        q: 'How much does it cost?',
        a: `From ${setup} setup, then ${monthly} per month, with no commitment. The exact price depends on your needs${SHOW_QUOTE_FOLLOWUP ? ' (for example automatic follow-up of quotes)' : ''} and is given to you before we start.`,
      },
      {
        q: 'Does it work with my current number?',
        a: 'Yes, you keep your number. We set up call forwarding to the assistant when you don’t answer or are already on a call. Your customers dial the same number as before.',
      },
      {
        q: 'Will my customers know it’s an AI?',
        a: 'Yes. The assistant introduces itself from the start as an automated assistant taking a message for you. Your customers know who they are talking to, and you are the one who calls them back.',
      },
      FAQ_ARRET.en,
    ],
    finalTitle: 'You won’t miss the next call.',
  },
};
