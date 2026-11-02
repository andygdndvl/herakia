import type { ZeroAppelText } from '@/components/metiers/ZeroAppelLanding';
import { COMMUN, FAQ_ARRET } from '@/components/metiers/textes/commun';

/**
 * Santé : l'assistant ne donne jamais d'avis médical et oriente toute urgence vers le 15 (le 112
 * en anglais). Aucune promesse d'hébergement certifié : le traitement des données se décide avec
 * le cabinet avant l'installation.
 */
export const SANTE: { fr: ZeroAppelText; en: ZeroAppelText } = {
  fr: {
    ...COMMUN.fr,
    eyebrow: 'Pour les cabinets de santé',
    titleLead: 'Chaque patient entendu, ',
    titleAccent: 'même en consultation.',
    moments: ['EN CONSULTATION', 'EN VISITE À DOMICILE', 'PENDANT UN SOIN', 'APRÈS LA FERMETURE'],
    persona: {
      role: 'Praticien de santé',
      quote: 'Je ne peux pas décrocher pendant une consultation, et le secrétariat est déjà en ligne. Les patients rappellent, encore et encore.',
      pains: [
        'Le téléphone interrompt les consultations',
        'Les patients tombent sur une ligne occupée et s’agacent',
        'Les messages arrivent incomplets, il faut rappeler pour comprendre',
      ],
    },
    subtitle:
      'Quand vous êtes en consultation et que le secrétariat est déjà en ligne, un assistant IA décroche, prend le message du patient et vous l’envoie par SMS ou WhatsApp.',
    steps: [
      {
        title: 'Un patient appelle',
        text: 'Vous êtes en consultation, le secrétariat est déjà en ligne ou le cabinet est fermé : personne ne peut décrocher.',
      },
      {
        title: 'L’assistant décroche',
        text: 'Il se présente comme l’assistant automatisé du cabinet, rappelle d’appeler le 15 en cas d’urgence, puis note le nom, le motif de l’appel et les disponibilités du patient.',
      },
      {
        title: 'Vous recevez le résumé',
        text: 'Par SMS ou WhatsApp, en quelques secondes. Vous ou votre secrétariat rappelez quand vous voulez, avec toutes les infos.',
      },
    ],
    scene: {
      context: 'En consultation',
      ringing: 'Appel entrant',
      caller: '06 •• •• •• 29',
      ringingHint: 'Vous ne pouvez pas décrocher.',
      assistant: 'Assistant du cabinet',
      dialogue: [
        {
          who: 'tia',
          text: 'Cabinet du Dr Exemple, bonjour. Je suis l’assistant automatisé. En cas d’urgence, appelez le 15. Sinon, je prends votre message.',
        },
        { who: 'client', text: 'Bonjour, je voudrais un rendez-vous, j’ai mal au dos depuis une semaine.' },
        { who: 'tia', text: 'C’est noté. Êtes-vous déjà suivi au cabinet, et quand êtes-vous disponible ?' },
        { who: 'client', text: 'Oui, je suis déjà patient. Plutôt le matin.' },
      ],
      smsApp: 'Messages',
      smsTime: 'Aujourd’hui 14:34',
      smsLines: [
        'Nouvel appel à 14 h 32',
        'Nom : M. Exemple',
        'Patient : déjà suivi au cabinet',
        'Motif : rendez-vous, douleurs au dos depuis une semaine',
        'Disponibilités : plutôt le matin',
      ],
    },
    smsNote: 'Maquette d’illustration : le nom, le motif et le numéro sont fictifs.',
    tiaText:
      'Tia est l’assistante vocale d’Herakia. Parlez-lui depuis cette page : vous entendrez sa voix, sa façon d’écouter et de reformuler. Celui de votre cabinet suivra le même principe, réglé sur vos consultations, vos consignes et vos horaires.',
    andyNote:
      'Je règle l’assistant avec vous : comment il présente le cabinet, ce qu’il demande au patient et ce qu’il ne dit jamais, et à qui envoyer le résumé. Ensuite, c’est moi que vous appelez.',
    roiTitle: 'Moins d’interruptions, plus aucun patient sans réponse',
    roiText: () =>
      'Chaque appel pris par l’assistant, c’est une consultation que vous n’interrompez pas, et un patient qui n’a pas à rappeler trois fois. Le message vous arrive trié : nouveau patient ou patient suivi, motif, disponibilités.',
    faq: (setup, monthly) => [
      {
        q: 'Est-ce que l’assistant donne des conseils médicaux ?',
        a: 'Non, jamais. Il prend le message et le transmet. En cas d’urgence, il demande d’appeler le 15. C’est vous qui décidez de la suite.',
      },
      {
        q: 'Et les données de santé de mes patients ?',
        a: 'Ce sont des données sensibles, encadrées par le RGPD. Avant toute installation, on décide ensemble de ce que l’assistant note, de ce qui transite par SMS, et de l’endroit où c’est conservé.',
      },
      {
        q: 'Et si j’ai déjà un agenda en ligne ?',
        a: 'L’assistant ne le remplace pas : il prend les appels que personne ne peut décrocher. Il peut aussi indiquer au patient votre lien de prise de rendez-vous en ligne.',
      },
      {
        q: 'Combien ça coûte ?',
        a: `Dès ${setup} d’installation, puis ${monthly} par mois, sans engagement. Le prix exact dépend de votre cabinet (nombre de lignes, nombre de praticiens) et vous est donné avant de démarrer.`,
      },
      {
        q: 'Est-ce que ça s’installe sur le numéro du cabinet ?',
        a: 'Oui, vous gardez votre numéro. On met en place un renvoi d’appel vers l’assistant quand personne ne répond ou que la ligne est occupée. Vos patients composent le même numéro qu’avant.',
      },
      FAQ_ARRET.fr,
    ],
    finalTitle: 'Le prochain patient qui appelle aura une réponse.',
  },
  en: {
    ...COMMUN.en,
    eyebrow: 'For healthcare practices',
    titleLead: 'Every patient heard, ',
    titleAccent: 'even during consultations.',
    moments: ['IN A CONSULTATION', 'ON A HOME VISIT', 'DURING TREATMENT', 'AFTER HOURS'],
    persona: {
      role: 'Healthcare practitioner',
      quote: 'I can’t pick up during a consultation, and the front desk is already on the phone. Patients call again and again.',
      pains: [
        'The phone interrupts consultations',
        'Patients get a busy line and grow frustrated',
        'Messages arrive incomplete, so we call back just to understand',
      ],
    },
    subtitle:
      'When you are with a patient and the front desk is already on the phone, an AI assistant picks up, takes the patient’s message and sends it to you by text message or WhatsApp.',
    steps: [
      {
        title: 'A patient calls',
        text: 'You are in a consultation, the front desk is busy or the practice is closed: nobody can pick up.',
      },
      {
        title: 'The assistant picks up',
        text: 'It introduces itself as the practice’s automated assistant, reminds the caller to dial the emergency number if it is urgent, then notes the name, the reason for the call and the patient’s availability.',
      },
      {
        title: 'You get the summary',
        text: 'By text message or WhatsApp, within seconds. You or your front desk call back when it suits you, with all the details.',
      },
    ],
    scene: {
      context: 'In a consultation',
      ringing: 'Incoming call',
      caller: '06 •• •• •• 29',
      ringingHint: 'You can’t pick up.',
      assistant: 'Practice assistant',
      dialogue: [
        {
          who: 'tia',
          text: 'Dr Example’s practice, hello. I’m the automated assistant. If this is an emergency, call 112. Otherwise, I’ll take your message.',
        },
        { who: 'client', text: 'Hello, I’d like an appointment, my back has hurt for a week.' },
        { who: 'tia', text: 'Noted. Are you already a patient here, and when are you available?' },
        { who: 'client', text: 'Yes, I’m already a patient. Mornings, ideally.' },
      ],
      smsApp: 'Messages',
      smsTime: 'Today 2:34 pm',
      smsLines: [
        'New call at 2:32 pm',
        'Name: Mr Example',
        'Patient: already registered',
        'Reason: appointment, back pain for a week',
        'Availability: mornings',
      ],
    },
    smsNote: 'Illustration only: the name, reason and number are fictitious.',
    tiaText:
      'Tia is Herakia’s voice assistant. Talk to her from this page: you’ll hear her voice and how she listens and rephrases. Your practice’s will work the same way, set up for your consultations, your instructions and your hours.',
    andyNote:
      'I set up the assistant with you: how it introduces the practice, what it asks patients and what it never says, and who gets the summary. After that, I’m the one you call.',
    roiTitle: 'Fewer interruptions, no patient left without an answer',
    roiText: () =>
      'Every call the assistant takes is a consultation you don’t interrupt, and a patient who doesn’t have to call three times. The message reaches you sorted: new or existing patient, reason, availability.',
    faq: (setup, monthly) => [
      {
        q: 'Does the assistant give medical advice?',
        a: 'No, never. It takes the message and passes it on. If it is urgent, it tells the caller to dial the emergency number. You decide what happens next.',
      },
      {
        q: 'What about my patients’ health data?',
        a: 'It is sensitive data, governed by the GDPR. Before any setup, we decide together what the assistant records, what goes by text message, and where it is stored.',
      },
      {
        q: 'What if I already have online booking?',
        a: 'The assistant doesn’t replace it: it takes the calls nobody can answer. It can also give patients your online booking link.',
      },
      {
        q: 'How much does it cost?',
        a: `From ${setup} setup, then ${monthly} per month, with no commitment. The exact price depends on your practice (number of lines, number of practitioners) and is given to you before we start.`,
      },
      {
        q: 'Does it work with the practice’s number?',
        a: 'Yes, you keep your number. We set up call forwarding to the assistant when nobody answers or the line is busy. Your patients dial the same number as before.',
      },
      FAQ_ARRET.en,
    ],
    finalTitle: 'The next patient who calls will get an answer.',
  },
};
