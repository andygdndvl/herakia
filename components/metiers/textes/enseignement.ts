import type { TiaLandingText } from '@/components/metiers/TiaLanding';
import { COMMUN, FAQ_ARRET, FAQ_TIA } from '@/components/metiers/textes/commun';

/** Écoles et organismes de formation. */
export const ENSEIGNEMENT: { fr: TiaLandingText; en: TiaLandingText } = {
  fr: {
    ...COMMUN.fr,
    eyebrow: 'Tia · pour les écoles et organismes de formation',
    titleLead: 'Chaque candidat rappelé, ',
    titleAccent: 'même pendant les cours.',
    moments: ['EN COURS', 'EN ENTRETIEN D’ADMISSION', 'EN SALON ÉTUDIANT', 'EN PORTES OUVERTES'],
    persona: {
      role: 'Responsable des admissions',
      quote: 'En période d’inscriptions, le téléphone sonne pendant les cours et les entretiens. Chaque appel manqué, c’est peut-être un étudiant qui ira ailleurs.',
      pains: [
        'Un candidat contacte plusieurs écoles, et retient celle qui répond',
        'Les parents rappellent plusieurs fois avant de tomber sur quelqu’un',
        'Les messages ne disent ni la formation visée, ni la rentrée',
      ],
    },
    subtitle:
      'Quand l’équipe est en cours, en jury ou en salon, Tia, votre assistante IA, décroche, note le projet du candidat ou du parent et vous l’envoie par SMS ou WhatsApp.',
    steps: [
      {
        title: 'Un candidat appelle',
        text: 'L’équipe est en cours, en entretien d’admission ou déjà en ligne : personne ne peut décrocher.',
      },
      {
        title: 'Tia décroche',
        text: 'Elle se présente comme l’assistante automatisée de l’école, demande si elle parle au candidat ou à un parent, et note la formation visée, le niveau actuel et la rentrée souhaitée.',
      },
      {
        title: 'Vous recevez le résumé',
        text: 'Par SMS ou WhatsApp, en quelques secondes. Le chargé d’admission rappelle quand il veut, avec toutes les infos.',
      },
    ],
    scene: {
      context: 'En cours · salle 204',
      ringing: 'Appel entrant',
      caller: '06 •• •• •• 35',
      ringingHint: 'Personne ne peut décrocher.',
      assistant: 'Tia, assistante de l’école',
      dialogue: [
        { who: 'tia', text: 'École Exemple, bonjour. Je suis Tia, l’assistante automatisée, je prends votre message.' },
        { who: 'client', text: 'Bonjour, j’appelle pour ma fille, elle voudrait s’inscrire en BTS.' },
        { who: 'tia', text: 'Très bien. Pour quelle rentrée, et quel est son niveau actuel ?' },
        { who: 'client', text: 'Septembre, elle est en terminale. Rappelez-moi après 17 h.' },
      ],
      smsApp: 'Messages',
      smsTime: 'Aujourd’hui 14:34',
      smsLines: [
        'Nouvel appel à 14 h 32',
        'Nom : Mme Exemple (parent)',
        'Projet : inscription en BTS, rentrée de septembre',
        'Niveau actuel : terminale',
        'Rappel souhaité : après 17 h',
      ],
    },
    smsNote: 'Maquette d’illustration : le nom, le projet et le numéro sont fictifs.',
    tiaText:
      'Tia est l’assistante IA d’Herakia. Parlez-lui depuis cette page : vous entendrez sa voix, sa façon d’écouter et de reformuler. Chez vous, elle sera réglée sur vos formations, vos campus et vos horaires.',
    andyNote:
      'Je règle Tia avec vous : comment elle présente l’école, les questions à poser à un candidat ou à un parent, et à quel chargé d’admission envoyer le résumé. Ensuite, c’est moi que vous appelez.',
    roiTitle: 'Une inscription récupérée paie Tia pour l’année',
    roiText: (monthly) =>
      `En période d’inscriptions, un candidat contacte plusieurs écoles. S’il tombe sur la messagerie, il appelle la suivante. Il suffit qu’un seul de ces appels devienne une inscription pour payer plus d’un an de Tia à ${monthly} par mois.`,
    faq: (monthly) => [
      {
        q: 'Combien ça coûte ?',
        a: `Dès ${monthly} HT par mois, sans frais d’installation ni engagement. Tia ouvre bientôt : inscrivez-vous sur la liste d’attente pour être prévenu en premier. Le prix exact dépend de votre établissement (nombre de lignes, nombre de campus) et vous est donné avant de démarrer.`,
      },
      {
        q: 'Est-ce que ça s’installe sur le numéro de l’école ?',
        a: 'Oui, vous gardez vos numéros. On met en place un renvoi d’appel vers Tia quand personne ne répond ou que la ligne est occupée. Candidats et parents composent le même numéro qu’avant.',
      },
      {
        q: 'Nous avons plusieurs campus ou formations : qui reçoit les résumés ?',
        a: 'C’est vous qui choisissez à l’installation : l’accueil, le campus concerné, ou le chargé d’admission de la formation visée.',
      },
      {
        q: 'Les candidats sauront-ils que c’est une IA ?',
        a: 'Oui. Tia se présente dès le début comme une assistante automatisée qui prend le message pour l’école. Candidats et parents savent à qui ils parlent, et c’est votre équipe qui les rappelle.',
      },
      FAQ_TIA.fr,
      FAQ_ARRET.fr,
    ],
    finalTitle: 'Le prochain candidat qui appelle, c’est vous qui le rappelez.',
  },
  en: {
    ...COMMUN.en,
    eyebrow: 'Tia · for schools and training providers',
    titleLead: 'Every applicant called back, ',
    titleAccent: 'even during class.',
    moments: ['IN CLASS', 'IN AN ADMISSIONS INTERVIEW', 'AT AN EDUCATION FAIR', 'AT AN OPEN DAY'],
    persona: {
      role: 'Head of admissions',
      quote: 'During admissions season, the phone rings through classes and interviews. Every missed call might be a student who goes elsewhere.',
      pains: [
        'An applicant contacts several schools and goes with the one that answers',
        'Parents call several times before reaching anyone',
        'Messages say neither the programme nor the start date',
      ],
    },
    subtitle:
      'When the team is teaching, on an admissions panel or at a fair, Tia, your AI assistant, picks up, notes the applicant’s or parent’s plans and sends them to you by text message or WhatsApp.',
    steps: [
      {
        title: 'An applicant calls',
        text: 'The team is teaching, in an admissions interview or already on the phone: nobody can pick up.',
      },
      {
        title: 'Tia picks up',
        text: 'She introduces herself as the school’s automated assistant, asks whether she is speaking to the applicant or a parent, and notes the programme, current level and preferred start date.',
      },
      {
        title: 'You get the summary',
        text: 'By text message or WhatsApp, within seconds. The admissions officer calls back when it suits them, with all the details.',
      },
    ],
    scene: {
      context: 'In class · room 204',
      ringing: 'Incoming call',
      caller: '06 •• •• •• 35',
      ringingHint: 'Nobody can pick up.',
      assistant: 'Tia, school assistant',
      dialogue: [
        { who: 'tia', text: 'Example School, hello. I’m Tia, the automated assistant, I’ll take your message.' },
        { who: 'client', text: 'Hello, I’m calling for my daughter, she’d like to enrol in a two-year diploma.' },
        { who: 'tia', text: 'Of course. For which intake, and what is her current level?' },
        { who: 'client', text: 'September, she’s in her final year of school. Call me after 5 pm.' },
      ],
      smsApp: 'Messages',
      smsTime: 'Today 2:34 pm',
      smsLines: [
        'New call at 2:32 pm',
        'Name: Mrs Example (parent)',
        'Plan: two-year diploma, September intake',
        'Current level: final year of school',
        'Call back: after 5 pm',
      ],
    },
    smsNote: 'Illustration only: the name, plan and number are fictitious.',
    tiaText:
      'Tia is Herakia’s AI assistant. Talk to her from this page: you’ll hear her voice and how she listens and rephrases. With you, she will be set up for your programmes, your campuses and your hours.',
    andyNote:
      'I set up Tia with you: how she introduces the school, what to ask an applicant or a parent, and which admissions officer gets the summary. After that, I’m the one you call.',
    roiTitle: 'One recovered enrolment pays for a year of Tia',
    roiText: (monthly) =>
      `During admissions season, an applicant contacts several schools. If they reach voicemail, they call the next one. It only takes one of those calls turning into an enrolment to pay for more than a year of Tia at ${monthly} a month.`,
    faq: (monthly) => [
      {
        q: 'How much does it cost?',
        a: `From ${monthly} per month excl. VAT, with no setup fee and no commitment. Tia opens soon: join the waiting list to be the first to know. The exact price depends on your institution (number of lines, number of campuses) and is given to you before we start.`,
      },
      {
        q: 'Does it work with the school’s number?',
        a: 'Yes, you keep your numbers. We set up call forwarding to Tia when nobody answers or the line is busy. Applicants and parents dial the same number as before.',
      },
      {
        q: 'We have several campuses or programmes: who gets the summaries?',
        a: 'You choose at setup: the front desk, the campus concerned, or the admissions officer for the programme.',
      },
      {
        q: 'Will applicants know it’s an AI?',
        a: 'Yes. Tia introduces herself from the start as an automated assistant taking a message for the school. Applicants and parents know who they are talking to, and your team calls them back.',
      },
      FAQ_TIA.en,
      FAQ_ARRET.en,
    ],
    finalTitle: 'The next applicant who calls is the one you call back.',
  },
};
