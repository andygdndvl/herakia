import type { MetierSlug } from '@/lib/metiers';

/** Le savoir-faire mobilisé : `telephone` = l'offre « Zéro appel manqué », les autres = pages /services/<id>. */
export type Savoir = 'telephone' | 'workflows' | 'agents' | 'llm' | 'data';

export interface CasMetier {
  savoir: Savoir;
  title: string;
  text: string;
  /** Mention d'une réalisation réelle, affichée seulement quand elle est vraie (cf. Chantiers de l'accueil). */
  proof?: string;
}

export interface SavoirFaireMetier {
  /** Ce qui arrive dans la fenêtre du hero : quatre tâches courtes, prises en charge. */
  taches: readonly string[];
  intro: string;
  cas: readonly CasMetier[];
}

/**
 * Ce qu'Herakia construit pour chaque métier (page /metiers). Le premier cas est toujours
 * l'assistant téléphonique, prêt à installer ; les autres sont du sur-mesure, décrits comme ce
 * qu'on construit, sans résultat chiffré inventé.
 */
export const SAVOIR_FAIRE: Record<MetierSlug, { fr: SavoirFaireMetier; en: SavoirFaireMetier }> = {
  artisans: {
    fr: {
      taches: ['Appels pris sur le chantier', 'Devis transformés en factures', 'Interventions planifiées', 'Questions du site répondues'],
      intro: 'Moins de téléphone, moins de paperasse : plus de temps sur les chantiers.',
      cas: [
        {
          savoir: 'telephone',
          title: 'Appels décrochés sur le chantier',
          text: 'L’assistant prend le nom, l’adresse, le type de travaux et l’urgence, et vous envoie le résumé par SMS.',
        },
        {
          savoir: 'workflows',
          title: 'Du devis à la facture, sans ressaisie',
          text: 'Le devis accepté devient facture, l’acompte est demandé et le paiement suivi, dans vos outils actuels.',
        },
        {
          savoir: 'agents',
          title: 'Interventions planifiées',
          text: 'Les rendez-vous se calent selon vos disponibilités ; le client reçoit la confirmation et un rappel la veille.',
        },
        {
          savoir: 'llm',
          title: 'Demandes du site triées',
          text: 'Zone d’intervention, délais, garanties : les questions courantes ont leur réponse, les vrais projets vous arrivent qualifiés.',
        },
      ],
    },
    en: {
      taches: ['Calls taken on site', 'Quotes turned into invoices', 'Jobs scheduled', 'Website questions answered'],
      intro: 'Less phone, less paperwork: more time on the job.',
      cas: [
        {
          savoir: 'telephone',
          title: 'Calls answered on site',
          text: 'The assistant takes the name, address, type of work and urgency, and texts you the summary.',
        },
        {
          savoir: 'workflows',
          title: 'From quote to invoice, no re-typing',
          text: 'An accepted quote becomes an invoice, the deposit is requested and payment tracked, in the tools you already use.',
        },
        {
          savoir: 'agents',
          title: 'Jobs scheduled',
          text: 'Appointments are booked around your availability; the customer gets a confirmation and a reminder the day before.',
        },
        {
          savoir: 'llm',
          title: 'Website enquiries sorted',
          text: 'Service area, lead times, guarantees: common questions get answered, real projects reach you qualified.',
        },
      ],
    },
  },
  immobilier: {
    fr: {
      taches: ['Appels pris pendant les visites', 'Acquéreurs qualifiés', 'Comptes rendus envoyés aux vendeurs', 'Annonces rédigées'],
      intro: 'Plus de temps sur le terrain, moins derrière l’écran.',
      cas: [
        {
          savoir: 'telephone',
          title: 'Appels décrochés pendant les visites',
          text: 'Vendeur ou acquéreur, l’assistant note le projet, le bien, le secteur et le moment où rappeler.',
        },
        {
          savoir: 'agents',
          title: 'Acquéreurs qualifiés',
          text: 'Chaque demande reçue sur les portails a une réponse rapide ; budget, financement et critères sont notés avant la visite.',
        },
        {
          savoir: 'workflows',
          title: 'Comptes rendus de visite',
          text: 'Vos notes après une visite deviennent un compte rendu propre, envoyé au vendeur après votre relecture.',
        },
        {
          savoir: 'llm',
          title: 'Annonces rédigées',
          text: 'À partir de la fiche du bien, une annonce claire et complète, prête à relire et à publier.',
        },
      ],
    },
    en: {
      taches: ['Calls taken during viewings', 'Buyers qualified', 'Viewing reports sent to sellers', 'Listings written'],
      intro: 'More time in the field, less behind the screen.',
      cas: [
        {
          savoir: 'telephone',
          title: 'Calls answered during viewings',
          text: 'Seller or buyer, the assistant notes the project, the property, the area and when to call back.',
        },
        {
          savoir: 'agents',
          title: 'Buyers qualified',
          text: 'Every enquiry from the property portals gets a quick reply; budget, financing and criteria are noted before the viewing.',
        },
        {
          savoir: 'workflows',
          title: 'Viewing reports',
          text: 'Your notes after a viewing become a clean report, sent to the seller once you have checked it.',
        },
        {
          savoir: 'llm',
          title: 'Listings written',
          text: 'From the property file, a clear and complete listing, ready to review and publish.',
        },
      ],
    },
  },
  comptables: {
    fr: {
      taches: ['Appels triés en rendez-vous', 'Pièces manquantes réclamées', 'Factures lues et pré-saisies', 'Procédures du cabinet interrogeables'],
      intro: 'Moins de relances et de saisie, plus de conseil.',
      cas: [
        {
          savoir: 'telephone',
          title: 'Appels triés pendant vos rendez-vous',
          text: 'Client du cabinet ou nouveau contact, l’assistant note le dossier, l’objet et l’échéance éventuelle.',
        },
        {
          savoir: 'workflows',
          title: 'Pièces manquantes réclamées',
          text: 'Les justificatifs manquants sont listés et réclamés aux clients, relances comprises, jusqu’au dossier complet.',
        },
        {
          savoir: 'data',
          title: 'Factures lues et pré-saisies',
          text: 'Les factures reçues sont lues, rapprochées et pré-saisies ; vos collaborateurs valident au lieu de recopier.',
        },
        {
          savoir: 'llm',
          title: 'Le savoir du cabinet, interrogeable',
          text: 'Vos procédures et notes internes répondent aux questions de l’équipe, en langage courant, en citant leurs sources.',
        },
      ],
    },
    en: {
      taches: ['Calls sorted during meetings', 'Missing documents requested', 'Invoices read and pre-entered', 'Firm procedures searchable'],
      intro: 'Less chasing and data entry, more advice.',
      cas: [
        {
          savoir: 'telephone',
          title: 'Calls sorted during your meetings',
          text: 'Existing client or new enquiry, the assistant notes the file, the reason and any deadline.',
        },
        {
          savoir: 'workflows',
          title: 'Missing documents requested',
          text: 'Missing receipts are listed and requested from clients, follow-ups included, until the file is complete.',
        },
        {
          savoir: 'data',
          title: 'Invoices read and pre-entered',
          text: 'Incoming invoices are read, matched and pre-entered; your team checks instead of re-typing.',
        },
        {
          savoir: 'llm',
          title: 'Your firm’s know-how, searchable',
          text: 'Your procedures and internal notes answer the team’s questions in plain language, citing their sources.',
        },
      ],
    },
  },
  sante: {
    fr: {
      taches: ['Messages des patients pris', 'Rappels de rendez-vous envoyés', 'Courriers mis en forme', 'Questions pratiques répondues'],
      intro: 'Moins d’interruptions et de secrétariat, plus de temps pour les patients.',
      cas: [
        {
          savoir: 'telephone',
          title: 'Messages pris pendant les consultations',
          text: 'L’assistant note le motif et les disponibilités, oriente les urgences vers le 15 et ne donne jamais d’avis médical.',
        },
        {
          savoir: 'agents',
          title: 'Rappels de rendez-vous',
          text: 'Un rappel la veille ; une annulation libère le créneau pour un patient en attente.',
        },
        {
          savoir: 'workflows',
          title: 'Courriers mis en forme',
          text: 'Vos notes deviennent un courrier ou un compte rendu mis en page, prêt à relire et à signer.',
        },
        {
          savoir: 'llm',
          title: 'Questions pratiques répondues',
          text: 'Horaires, accès, documents à apporter : les patients ont une réponse immédiate, sans aucun avis médical.',
        },
      ],
    },
    en: {
      taches: ['Patient messages taken', 'Appointment reminders sent', 'Letters formatted', 'Practical questions answered'],
      intro: 'Fewer interruptions and less admin, more time for patients.',
      cas: [
        {
          savoir: 'telephone',
          title: 'Messages taken during consultations',
          text: 'The assistant notes the reason and availability, directs emergencies to the emergency number and never gives medical advice.',
        },
        {
          savoir: 'agents',
          title: 'Appointment reminders',
          text: 'A reminder the day before; a cancellation frees the slot for a patient on the waiting list.',
        },
        {
          savoir: 'workflows',
          title: 'Letters formatted',
          text: 'Your notes become a properly laid-out letter or report, ready to review and sign.',
        },
        {
          savoir: 'llm',
          title: 'Practical questions answered',
          text: 'Opening hours, access, documents to bring: patients get an instant answer, with no medical advice.',
        },
      ],
    },
  },
  enseignement: {
    fr: {
      taches: ['Appels des candidats pris', 'Candidatures préqualifiées', 'Contrats générés et signés', 'Plannings construits'],
      intro: 'Moins d’administratif, plus de temps pour les étudiants.',
      cas: [
        {
          savoir: 'telephone',
          title: 'Appels des candidats pris pendant les cours',
          text: 'Candidat ou parent, l’assistant note la formation visée, le niveau et la rentrée souhaitée.',
        },
        {
          savoir: 'agents',
          title: 'Candidatures préqualifiées',
          text: 'Chaque candidat reçoit une réponse, son projet est noté et un entretien lui est proposé.',
        },
        {
          savoir: 'workflows',
          title: 'Contrats générés et envoyés en signature',
          text: 'Les documents d’inscription se remplissent depuis le dossier et partent en signature électronique.',
          proof: 'Réalisé chez IPSSI',
        },
        {
          savoir: 'data',
          title: 'Plannings automatisés',
          text: 'Les plannings se construisent à partir des données de l’établissement, et le pilotage se fait en temps réel.',
          proof: 'Réalisé chez IPSSI',
        },
      ],
    },
    en: {
      taches: ['Applicant calls taken', 'Applications pre-qualified', 'Contracts generated and signed', 'Schedules built'],
      intro: 'Less admin, more time for students.',
      cas: [
        {
          savoir: 'telephone',
          title: 'Applicant calls taken during class',
          text: 'Applicant or parent, the assistant notes the programme, the level and the preferred start date.',
        },
        {
          savoir: 'agents',
          title: 'Applications pre-qualified',
          text: 'Every applicant gets a reply, their plans are noted and an interview is offered.',
        },
        {
          savoir: 'workflows',
          title: 'Contracts generated and sent for signature',
          text: 'Enrolment documents fill in from the applicant’s file and go out for e-signature.',
          proof: 'Built for IPSSI',
        },
        {
          savoir: 'data',
          title: 'Automated schedules',
          text: 'Schedules are built from the institution’s data, with real-time reporting.',
          proof: 'Built for IPSSI',
        },
      ],
    },
  },
};
