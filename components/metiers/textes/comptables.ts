import type { ZeroAppelText } from '@/components/metiers/ZeroAppelLanding';
import { COMMUN, FAQ_ARRET } from '@/components/metiers/textes/commun';

export const COMPTABLES: { fr: ZeroAppelText; en: ZeroAppelText } = {
  fr: {
    ...COMMUN.fr,
    eyebrow: 'Pour les cabinets d’expertise comptable',
    titleLead: 'Chaque appel décroché, ',
    titleAccent: 'même en période fiscale.',
    moments: ['EN RENDEZ-VOUS CLIENT', 'EN CLÔTURE DE BILAN', 'EN PLEINE TVA', 'EN RÉUNION D’ASSOCIÉS'],
    persona: {
      role: 'Expert-comptable',
      quote: 'En période fiscale, le téléphone n’arrête pas. Chaque appel coupe un dossier, et ceux que je laisse sonner, je ne sais pas qui c’était.',
      pains: [
        'Un créateur d’entreprise contacte plusieurs cabinets, et choisit celui qui rappelle',
        'Des clients appellent pour des questions qui pourraient attendre un e-mail',
        'Mes collaborateurs perdent le fil à chaque interruption',
      ],
    },
    subtitle:
      'Quand vous êtes en rendez-vous ou plongé dans un bilan, un assistant IA décroche à votre place, note qui appelle et pourquoi, et vous l’envoie par SMS ou WhatsApp.',
    steps: [
      {
        title: 'Un client appelle',
        text: 'Vous êtes en rendez-vous, en clôture ou déjà en ligne : personne ne peut décrocher.',
      },
      {
        title: 'L’assistant décroche',
        text: 'Il se présente comme l’assistant automatisé du cabinet, demande s’il s’agit d’un client ou d’un nouveau contact, et note le dossier, l’objet de l’appel et l’échéance éventuelle.',
      },
      {
        title: 'Vous recevez le résumé',
        text: 'Par SMS ou WhatsApp, en quelques secondes. Vous rappelez quand vous voulez, avec toutes les infos.',
      },
    ],
    scene: {
      context: 'En rendez-vous client',
      ringing: 'Appel entrant',
      caller: '06 •• •• •• 62',
      ringingHint: 'Vous ne pouvez pas décrocher.',
      assistant: 'Assistant du cabinet',
      dialogue: [
        { who: 'tia', text: 'Cabinet Exemple, bonjour. Je suis l’assistant automatisé, je prends votre message.' },
        { who: 'client', text: 'Bonjour, je crée mon entreprise et je cherche un expert-comptable.' },
        { who: 'tia', text: 'Très bien. Quelle activité, et sous quelle forme pensez-vous la créer ?' },
        { who: 'client', text: 'Un restaurant, en SAS. Rappelez-moi demain matin.' },
      ],
      smsApp: 'Messages',
      smsTime: 'Aujourd’hui 14:34',
      smsLines: [
        'Nouvel appel à 14 h 32',
        'Nom : M. Exemple',
        'Contact : nouveau, création d’entreprise',
        'Projet : restaurant, en SAS',
        'Rappel souhaité : demain matin',
      ],
    },
    smsNote: 'Maquette d’illustration : le nom, le projet et le numéro sont fictifs.',
    tiaText:
      'Tia est l’assistante vocale d’Herakia. Parlez-lui depuis cette page : vous entendrez sa voix, sa façon d’écouter et de reformuler. Celui de votre cabinet suivra le même principe, réglé sur vos missions, vos clients et vos horaires.',
    andyNote:
      'Je règle l’assistant avec vous : comment il présente le cabinet, les questions à poser à un client ou à un nouveau contact, et à qui envoyer le résumé. Ensuite, c’est moi que vous appelez.',
    roiTitle: 'Une lettre de mission signée rembourse l’installation',
    roiText: (setup) =>
      `Un chef d’entreprise qui cherche un expert-comptable contacte souvent plusieurs cabinets. S’il tombe sur la messagerie, il appelle le suivant. Il suffit qu’un seul de ces appels devienne une lettre de mission pour couvrir les ${setup} d’installation.`,
    faq: (setup, monthly) => [
      {
        q: 'Combien ça coûte ?',
        a: `Dès ${setup} d’installation, puis ${monthly} par mois, sans engagement. Le prix exact dépend de votre cabinet (nombre de lignes, nombre de collaborateurs) et vous est donné avant de démarrer.`,
      },
      {
        q: 'Est-ce que ça s’installe sur le numéro du cabinet ?',
        a: 'Oui, vous gardez vos numéros. On met en place un renvoi d’appel vers l’assistant quand personne ne répond ou que la ligne est occupée. Vos clients composent le même numéro qu’avant.',
      },
      {
        q: 'Est-ce qu’il répond aux questions comptables ou fiscales ?',
        a: 'Non. L’assistant prend le message et le trie, il ne donne aucun conseil : c’est vous ou vos collaborateurs qui répondez au client.',
      },
      {
        q: 'Qui reçoit les résumés ?',
        a: 'C’est vous qui choisissez à l’installation : l’accueil, un associé, ou le collaborateur en charge quand le client indique son dossier.',
      },
      {
        q: 'Vos clients sauront-ils que c’est une IA ?',
        a: 'Oui. L’assistant se présente dès le début comme un assistant automatisé qui prend le message pour le cabinet. Vos clients savent à qui ils parlent, et c’est vous qui les rappelez.',
      },
      FAQ_ARRET.fr,
    ],
    finalTitle: 'Le prochain client qui appelle, c’est vous qui le rappelez.',
  },
  en: {
    ...COMMUN.en,
    eyebrow: 'For accounting firms',
    titleLead: 'Every call answered, ',
    titleAccent: 'even at tax time.',
    moments: ['IN A CLIENT MEETING', 'CLOSING THE BOOKS', 'DURING VAT RETURNS', 'IN A PARTNERS’ MEETING'],
    persona: {
      role: 'Accountant',
      quote: 'At tax time, the phone never stops. Every call breaks my focus, and the ones I let ring, I never know who they were.',
      pains: [
        'Someone starting a business contacts several firms and picks the one that calls back',
        'Clients call about things that could wait for an email',
        'My team loses the thread with every interruption',
      ],
    },
    subtitle:
      'When you are in a meeting or deep in a year-end close, an AI assistant picks up for you, notes who is calling and why, and sends it to you by text message or WhatsApp.',
    steps: [
      {
        title: 'A client calls',
        text: 'You are in a meeting, closing accounts or already on the phone: nobody can pick up.',
      },
      {
        title: 'The assistant picks up',
        text: 'It introduces itself as the firm’s automated assistant, asks whether the caller is a client or a new enquiry, and notes the file, the reason for the call and any deadline.',
      },
      {
        title: 'You get the summary',
        text: 'By text message or WhatsApp, within seconds. You call back when it suits you, with all the details.',
      },
    ],
    scene: {
      context: 'In a client meeting',
      ringing: 'Incoming call',
      caller: '06 •• •• •• 62',
      ringingHint: 'You can’t pick up.',
      assistant: 'Firm assistant',
      dialogue: [
        { who: 'tia', text: 'Example & Partners, hello. I’m the automated assistant, I’ll take your message.' },
        { who: 'client', text: 'Hello, I’m starting a business and I’m looking for an accountant.' },
        { who: 'tia', text: 'Of course. What kind of business, and what legal structure are you planning?' },
        { who: 'client', text: 'A restaurant, as a company. Call me back tomorrow morning.' },
      ],
      smsApp: 'Messages',
      smsTime: 'Today 2:34 pm',
      smsLines: [
        'New call at 2:32 pm',
        'Name: Mr Example',
        'Contact: new, starting a business',
        'Project: restaurant, as a company',
        'Call back: tomorrow morning',
      ],
    },
    smsNote: 'Illustration only: the name, project and number are fictitious.',
    tiaText:
      'Tia is Herakia’s voice assistant. Talk to her from this page: you’ll hear her voice and how she listens and rephrases. Your firm’s will work the same way, set up for your services, your clients and your hours.',
    andyNote:
      'I set up the assistant with you: how it introduces the firm, what to ask a client or a new enquiry, and who gets the summary. After that, I’m the one you call.',
    roiTitle: 'One signed engagement letter pays for the setup',
    roiText: (setup) =>
      `A business owner looking for an accountant often contacts several firms. If they reach voicemail, they call the next one. It only takes one of those calls turning into an engagement to cover the ${setup} setup.`,
    faq: (setup, monthly) => [
      {
        q: 'How much does it cost?',
        a: `From ${setup} setup, then ${monthly} per month, with no commitment. The exact price depends on your firm (number of lines, number of staff) and is given to you before we start.`,
      },
      {
        q: 'Does it work with the firm’s number?',
        a: 'Yes, you keep your numbers. We set up call forwarding to the assistant when nobody answers or the line is busy. Your clients dial the same number as before.',
      },
      {
        q: 'Does it answer accounting or tax questions?',
        a: 'No. The assistant takes and sorts the message; it gives no advice. You or your team answer the client.',
      },
      {
        q: 'Who gets the summaries?',
        a: 'You choose at setup: the front desk, a partner, or the staff member in charge when the client mentions their file.',
      },
      {
        q: 'Will your clients know it’s an AI?',
        a: 'Yes. The assistant introduces itself from the start as an automated assistant taking a message for the firm. Your clients know who they are talking to, and you are the one who calls them back.',
      },
      FAQ_ARRET.en,
    ],
    finalTitle: 'The next client who calls is the one you call back.',
  },
};
