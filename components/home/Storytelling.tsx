'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useLang, localize } from '@/components/i18n/LangProvider';

interface StoryStep {
  label: string;
  title: string;
  description: string;
  panelStatus: string;
  pills: string[];
  logs: Array<{ label: string; value: string; type: 'danger' | 'progress' | 'success' }>;
}

const SECTOR_IDS = ['b2b', 'saas', 'ecommerce', 'health', 'realestate'] as const;

const UI = {
  fr: {
    eyebrow: 'Simulation interactive',
    title: "Visualisez l'impact concret sur votre secteur.",
    subtitle:
      "3 étapes : avant, pendant, après. Personnalisez la simulation avec votre nom d'entreprise et votre secteur.",
    start: 'Lancer la simulation',
    configTitle: 'Configuration',
    configSub: 'Quelques détails pour personnaliser le scénario.',
    companyLabel: 'Nom de votre entreprise',
    companyPlaceholder: 'Acme Industries',
    sectorLabel: "Secteur d'activité",
    back: 'Retour',
    go: 'Démarrer',
    cockpit: 'Cockpit',
    phases: 'Avant / Pendant / Après',
    restart: 'Recommencer',
    ctaTitle: (name: string) => `Et si on appliquait ce scénario à ${name} ?`,
    ctaButton: 'Démarrer mon projet',
    yourCompany: 'votre entreprise',
    missionControl: 'Herakia · Mission Control',
    activityLog: "Journal d'activité",
    realtime: 'Temps réel',
    sectors: {
      b2b: 'Services B2B',
      saas: 'SaaS / Tech',
      ecommerce: 'E-commerce / Retail',
      health: 'Santé / Médical',
      realestate: 'Immobilier',
    } as Record<string, string>,
  },
  en: {
    eyebrow: 'Interactive simulation',
    title: 'See the concrete impact on your sector.',
    subtitle:
      '3 steps: before, during, after. Personalise the simulation with your company name and sector.',
    start: 'Run the simulation',
    configTitle: 'Configuration',
    configSub: 'A few details to personalise the scenario.',
    companyLabel: 'Your company name',
    companyPlaceholder: 'Acme Industries',
    sectorLabel: 'Industry',
    back: 'Back',
    go: 'Start',
    cockpit: 'Cockpit',
    phases: 'Before / During / After',
    restart: 'Restart',
    ctaTitle: (name: string) => `What if we applied this scenario to ${name}?`,
    ctaButton: 'Start my project',
    yourCompany: 'your company',
    missionControl: 'Herakia · Mission Control',
    activityLog: 'Activity log',
    realtime: 'Real time',
    sectors: {
      b2b: 'B2B services',
      saas: 'SaaS / Tech',
      ecommerce: 'E-commerce / Retail',
      health: 'Healthcare / Medical',
      realestate: 'Real estate',
    } as Record<string, string>,
  },
} as const;

const SCENARIOS: Record<'fr' | 'en', Record<string, StoryStep[]>> = {
  fr: {
    b2b: [
      { label: 'Étape 1 · Avant', title: "Le quotidien repose entièrement sur l'humain.", description: 'Chaque tâche manuelle grignote le temps disponible pour décider et créer.', panelStatus: 'Tout repose sur les équipes', pills: ['237 tâches/jour', '5 outils non orchestrés', '42 relances en attente'], logs: [
        { label: '42 relances prospects', value: 'non traitées', type: 'danger' },
        { label: '68 leads à qualifier', value: 'en file', type: 'danger' },
        { label: '23 RDV à planifier', value: 'à planifier', type: 'danger' },
        { label: '15 tickets clients', value: 'sans réponse', type: 'danger' },
        { label: '89 contacts incomplets', value: 'à enrichir', type: 'danger' },
      ] },
      { label: 'Étape 2 · Pendant', title: 'Les agents IA prennent le relais en arrière-plan.', description: 'Pendant que vos équipes décident, 5 agents traitent le reste en parallèle.', panelStatus: '5 agents actifs', pills: ['Traitement en cours', 'Multi-canal', 'Temps réel'], logs: [
        { label: 'Relance des prospects', value: 'en cours · 42 prospects', type: 'progress' },
        { label: 'Qualification des leads', value: 'en cours · 68 leads', type: 'progress' },
        { label: 'Planification des RDV', value: 'en cours · 23 RDV', type: 'progress' },
        { label: 'Support niveau 1', value: 'en cours · 15 tickets', type: 'progress' },
        { label: 'Enrichissement des contacts', value: 'en cours · 89 contacts', type: 'progress' },
      ] },
      { label: 'Étape 3 · Après', title: "Vos équipes décident. L'IA exécute.", description: 'Le temps revient aux humains, là où il a le plus de valeur ajoutée.', panelStatus: 'Mission accomplie', pills: ['Tâches manuelles -62%', 'Pipeline +41%', 'Closing rate +28%'], logs: [
        { label: '42 relances envoyées', value: 'multicanal', type: 'success' },
        { label: '68 leads qualifiés', value: 'prêts vente', type: 'success' },
        { label: '23 RDV confirmés', value: 'calendrier sync', type: 'success' },
        { label: '15 tickets résolus', value: 'satisfaction +', type: 'success' },
        { label: '89 profils enrichis', value: 'data complète', type: 'success' },
      ] },
    ],
    saas: [
      { label: 'Étape 1 · Avant', title: 'Le quotidien repose entièrement sur les équipes.', description: 'Les leads chauds se refroidissent pendant que vous traitez le reste.', panelStatus: 'Tout repose sur les équipes', pills: ['191 tâches/jour', '6 outils non orchestrés', '46 leads non traités'], logs: [
        { label: '46 leads entrants', value: 'à qualifier', type: 'danger' },
        { label: '31 demandes de démo', value: 'en file', type: 'danger' },
        { label: '19 relances commerciales', value: 'sans réponse', type: 'danger' },
        { label: '22 tickets support N1', value: 'non priorisés', type: 'danger' },
        { label: '73 contacts CRM', value: 'incomplets', type: 'danger' },
      ] },
      { label: 'Étape 2 · Pendant', title: 'Les agents IA orchestrent votre funnel.', description: 'Du premier contact à la signature, chaque touch est cadencé automatiquement.', panelStatus: '5 agents actifs', pills: ['Funnel piloté', 'Sync CRM', 'Multi-canal'], logs: [
        { label: 'Qualification des leads', value: 'en cours · 46 leads', type: 'progress' },
        { label: 'Planification des démos', value: 'en cours · 31 demos', type: 'progress' },
        { label: 'Relance commerciale', value: 'en cours · 19 prospects', type: 'progress' },
        { label: 'Tri des tickets support', value: 'en cours · 22 tickets', type: 'progress' },
        { label: 'Enrichissement du CRM', value: 'en cours · 73 contacts', type: 'progress' },
      ] },
      { label: 'Étape 3 · Après', title: 'MRR en hausse, churn en baisse.', description: 'Vos commerciaux ne touchent plus que des leads qualifiés.', panelStatus: 'Mission accomplie', pills: ['Tâches manuelles -67%', 'MRR +18%', 'Churn -32%'], logs: [
        { label: '46 leads qualifiés', value: 'sales ready', type: 'success' },
        { label: '31 démos planifiées', value: 'calendrier sync', type: 'success' },
        { label: '19 relances envoyées', value: 'multicanal', type: 'success' },
        { label: '22 tickets routés', value: 'instantané', type: 'success' },
        { label: '73 contacts enrichis', value: 'data complète', type: 'success' },
      ] },
    ],
    ecommerce: [
      { label: 'Étape 1 · Avant', title: 'Vos paniers abandonnés ne reçoivent aucune réponse.', description: "Et chaque demande SAV attend qu'un humain soit disponible.", panelStatus: 'Tout repose sur les équipes', pills: ['152 tâches/jour', '7 outils non orchestrés', '38 paniers abandonnés'], logs: [
        { label: '38 paniers abandonnés', value: 'en attente', type: 'danger' },
        { label: '24 demandes SAV', value: 'non traitées', type: 'danger' },
        { label: '17 commandes à vérifier', value: 'à confirmer', type: 'danger' },
        { label: '12 relances post-achat', value: 'sans réponse', type: 'danger' },
        { label: '61 fiches clients', value: 'à enrichir', type: 'danger' },
      ] },
      { label: 'Étape 2 · Pendant', title: 'Les agents IA reprennent chaque opportunité.', description: 'Aucun panier ne reste sans relance, aucune question sans réponse.', panelStatus: '5 agents actifs', pills: ['Traitement en cours', 'SAV automatisé', 'CRM synchronisé'], logs: [
        { label: 'Relance des paniers abandonnés', value: 'en cours · 38 emails', type: 'progress' },
        { label: 'Traitement du SAV', value: 'en cours · 24 tickets', type: 'progress' },
        { label: 'Vérification des commandes', value: 'en cours · 17 ordres', type: 'progress' },
        { label: 'Relance post-achat', value: 'en cours · 12 clients', type: 'progress' },
        { label: 'Enrichissement des fiches clients', value: 'en cours · 61 fiches', type: 'progress' },
      ] },
      { label: 'Étape 3 · Après', title: 'Conversion en hausse, satisfaction au rendez-vous.', description: 'Vos équipes pilotent, vos agents IA convertissent.', panelStatus: 'Mission accomplie', pills: ['Tâches manuelles -73%', 'Conversion +24%', 'Satisfaction 4.8/5'], logs: [
        { label: '38 paniers récupérés', value: 'automatiquement', type: 'success' },
        { label: '24 SAV traités', value: 'J+0', type: 'success' },
        { label: '17 commandes vérifiées', value: 'sans erreur', type: 'success' },
        { label: '12 relances envoyées', value: 'multicanal', type: 'success' },
        { label: '61 fiches enrichies', value: 'data complète', type: 'success' },
      ] },
    ],
    health: [
      { label: 'Étape 1 · Avant', title: 'Les patients attendent. Les équipes courent.', description: 'Confirmation, reports, dossiers : du temps précieux englouti.', panelStatus: 'Tout repose sur les équipes', pills: ['112 tâches/jour', '4 outils non orchestrés', '27 demandes en attente'], logs: [
        { label: '27 demandes de RDV', value: 'à traiter', type: 'danger' },
        { label: '18 confirmations', value: 'en attente', type: 'danger' },
        { label: '12 reports', value: 'à confirmer', type: 'danger' },
        { label: '21 messages patients', value: 'non lus', type: 'danger' },
        { label: '34 dossiers incomplets', value: 'à compléter', type: 'danger' },
      ] },
      { label: 'Étape 2 · Pendant', title: 'Les agents IA libèrent vos équipes médicales.', description: 'Tout le périphérique administratif tourne en autonomie.', panelStatus: '5 agents actifs', pills: ['Agenda piloté', 'Confirmations auto', 'Dossiers complétés'], logs: [
        { label: 'Gestion des demandes de RDV', value: 'en cours · 27 demandes', type: 'progress' },
        { label: 'Confirmations et rappels', value: 'en cours · 18 rappels', type: 'progress' },
        { label: 'Gestion des reports', value: 'en cours · 12 reports', type: 'progress' },
        { label: 'Réponses aux messages patients', value: 'en cours · 21 messages', type: 'progress' },
        { label: 'Complétion des dossiers', value: 'en cours · 34 fiches', type: 'progress' },
      ] },
      { label: 'Étape 3 · Après', title: 'Plus de temps pour les patients.', description: 'Le temps médical reprend sa juste place.', panelStatus: 'Mission accomplie', pills: ['Tâches manuelles -68%', 'Temps médical +35%', 'Satisfaction 4.7/5'], logs: [
        { label: '27 RDV planifiés', value: 'automatiquement', type: 'success' },
        { label: '18 confirmations', value: 'envoyées J-1', type: 'success' },
        { label: '12 reports gérés', value: 'sans délai', type: 'success' },
        { label: '21 messages traités', value: 'sous 2h', type: 'success' },
        { label: '34 dossiers complétés', value: 'data complète', type: 'success' },
      ] },
    ],
    realestate: [
      { label: 'Étape 1 · Avant', title: 'Les acquéreurs attendent. Les biens stagnent.', description: 'Chaque visite oubliée ou retard de relance coûte une opportunité.', panelStatus: 'Tout repose sur les équipes', pills: ['120 tâches/jour', '5 outils non orchestrés', '31 demandes de visite'], logs: [
        { label: '31 demandes de visite', value: 'en attente', type: 'danger' },
        { label: '19 relances acquéreurs', value: 'non traitées', type: 'danger' },
        { label: '14 biens à qualifier', value: 'à planifier', type: 'danger' },
        { label: '9 RDV à confirmer', value: 'sans réponse', type: 'danger' },
        { label: '47 contacts incomplets', value: 'à enrichir', type: 'danger' },
      ] },
      { label: 'Étape 2 · Pendant', title: 'Les agents IA orchestrent visites, relances et matchs.', description: 'Chaque acquéreur reçoit le bon bien au bon moment.', panelStatus: '5 agents actifs', pills: ['Visites planifiées', 'Match auto', 'Relances multi-canal'], logs: [
        { label: 'Planification des visites', value: 'en cours · 31 demandes', type: 'progress' },
        { label: 'Relance des acquéreurs', value: 'en cours · 19 relances', type: 'progress' },
        { label: 'Qualification des biens', value: 'en cours · 14 biens', type: 'progress' },
        { label: 'Confirmation des RDV', value: 'en cours · 9 RDV', type: 'progress' },
        { label: 'Enrichissement des contacts', value: 'en cours · 47 profils', type: 'progress' },
      ] },
      { label: 'Étape 3 · Après', title: 'Vos négociateurs ne traitent que des dossiers chauds.', description: 'Les biens tournent plus vite, les commissions suivent.', panelStatus: 'Mission accomplie', pills: ['Tâches manuelles -71%', 'Visites +44%', 'Conversion +31%'], logs: [
        { label: '31 visites planifiées', value: 'calendrier sync', type: 'success' },
        { label: '19 relances envoyées', value: 'multicanal', type: 'success' },
        { label: '14 biens qualifiés', value: 'matchmaking', type: 'success' },
        { label: '9 RDV confirmés', value: 'automatiquement', type: 'success' },
        { label: '47 contacts enrichis', value: 'data complète', type: 'success' },
      ] },
    ],
  },
  en: {
    b2b: [
      { label: 'Step 1 · Before', title: 'Everything rests entirely on people.', description: 'Every manual task eats into the time available to decide and create.', panelStatus: 'It all rests on the teams', pills: ['237 tasks/day', '5 unconnected tools', '42 follow-ups pending'], logs: [
        { label: '42 prospect follow-ups', value: 'untouched', type: 'danger' },
        { label: '68 leads to qualify', value: 'queued', type: 'danger' },
        { label: '23 meetings to book', value: 'to schedule', type: 'danger' },
        { label: '15 customer tickets', value: 'no reply', type: 'danger' },
        { label: '89 incomplete contacts', value: 'to enrich', type: 'danger' },
      ] },
      { label: 'Step 2 · During', title: 'AI agents take over in the background.', description: 'While your teams decide, 5 agents handle the rest in parallel.', panelStatus: '5 agents active', pills: ['Processing', 'Multi-channel', 'Real time'], logs: [
        { label: 'Prospect follow-up', value: 'running · 42 prospects', type: 'progress' },
        { label: 'Lead qualification', value: 'running · 68 leads', type: 'progress' },
        { label: 'Meeting scheduling', value: 'running · 23 meetings', type: 'progress' },
        { label: 'Level-1 support', value: 'running · 15 tickets', type: 'progress' },
        { label: 'Contact enrichment', value: 'running · 89 contacts', type: 'progress' },
      ] },
      { label: 'Step 3 · After', title: 'Your teams decide. The AI executes.', description: 'Time goes back to people, where it adds the most value.', panelStatus: 'Mission accomplished', pills: ['Manual tasks -62%', 'Pipeline +41%', 'Closing rate +28%'], logs: [
        { label: '42 follow-ups sent', value: 'multi-channel', type: 'success' },
        { label: '68 leads qualified', value: 'sales-ready', type: 'success' },
        { label: '23 meetings confirmed', value: 'calendar synced', type: 'success' },
        { label: '15 tickets resolved', value: 'satisfaction +', type: 'success' },
        { label: '89 profiles enriched', value: 'data complete', type: 'success' },
      ] },
    ],
    saas: [
      { label: 'Step 1 · Before', title: 'Everything rests entirely on the teams.', description: 'Hot leads cool down while you handle everything else.', panelStatus: 'It all rests on the teams', pills: ['191 tasks/day', '6 unconnected tools', '46 leads untouched'], logs: [
        { label: '46 inbound leads', value: 'to qualify', type: 'danger' },
        { label: '31 demo requests', value: 'queued', type: 'danger' },
        { label: '19 sales follow-ups', value: 'no reply', type: 'danger' },
        { label: '22 L1 support tickets', value: 'unprioritised', type: 'danger' },
        { label: '73 CRM contacts', value: 'incomplete', type: 'danger' },
      ] },
      { label: 'Step 2 · During', title: 'AI agents orchestrate your funnel.', description: 'From first contact to signature, every touch is paced automatically.', panelStatus: '5 agents active', pills: ['Funnel steered', 'CRM sync', 'Multi-channel'], logs: [
        { label: 'Lead qualification', value: 'running · 46 leads', type: 'progress' },
        { label: 'Demo scheduling', value: 'running · 31 demos', type: 'progress' },
        { label: 'Sales follow-up', value: 'running · 19 prospects', type: 'progress' },
        { label: 'Support ticket triage', value: 'running · 22 tickets', type: 'progress' },
        { label: 'CRM enrichment', value: 'running · 73 contacts', type: 'progress' },
      ] },
      { label: 'Step 3 · After', title: 'MRR up, churn down.', description: 'Your reps only ever touch qualified leads.', panelStatus: 'Mission accomplished', pills: ['Manual tasks -67%', 'MRR +18%', 'Churn -32%'], logs: [
        { label: '46 leads qualified', value: 'sales ready', type: 'success' },
        { label: '31 demos scheduled', value: 'calendar synced', type: 'success' },
        { label: '19 follow-ups sent', value: 'multi-channel', type: 'success' },
        { label: '22 tickets routed', value: 'instant', type: 'success' },
        { label: '73 contacts enriched', value: 'data complete', type: 'success' },
      ] },
    ],
    ecommerce: [
      { label: 'Step 1 · Before', title: 'Your abandoned carts get no response.', description: 'And every support request waits for a human to be free.', panelStatus: 'It all rests on the teams', pills: ['152 tasks/day', '7 unconnected tools', '38 abandoned carts'], logs: [
        { label: '38 abandoned carts', value: 'waiting', type: 'danger' },
        { label: '24 support requests', value: 'untouched', type: 'danger' },
        { label: '17 orders to check', value: 'to confirm', type: 'danger' },
        { label: '12 post-purchase follow-ups', value: 'no reply', type: 'danger' },
        { label: '61 customer records', value: 'to enrich', type: 'danger' },
      ] },
      { label: 'Step 2 · During', title: 'AI agents pick up every opportunity.', description: 'No cart is left without a nudge, no question without an answer.', panelStatus: '5 agents active', pills: ['Processing', 'Support automated', 'CRM synced'], logs: [
        { label: 'Abandoned-cart follow-up', value: 'running · 38 emails', type: 'progress' },
        { label: 'Support handling', value: 'running · 24 tickets', type: 'progress' },
        { label: 'Order verification', value: 'running · 17 orders', type: 'progress' },
        { label: 'Post-purchase follow-up', value: 'running · 12 customers', type: 'progress' },
        { label: 'Customer-record enrichment', value: 'running · 61 records', type: 'progress' },
      ] },
      { label: 'Step 3 · After', title: 'Conversion up, satisfaction on point.', description: 'Your teams steer, your AI agents convert.', panelStatus: 'Mission accomplished', pills: ['Manual tasks -73%', 'Conversion +24%', 'Satisfaction 4.8/5'], logs: [
        { label: '38 carts recovered', value: 'automatically', type: 'success' },
        { label: '24 support cases handled', value: 'same day', type: 'success' },
        { label: '17 orders verified', value: 'error-free', type: 'success' },
        { label: '12 follow-ups sent', value: 'multi-channel', type: 'success' },
        { label: '61 records enriched', value: 'data complete', type: 'success' },
      ] },
    ],
    health: [
      { label: 'Step 1 · Before', title: 'Patients wait. Teams rush.', description: 'Confirmations, reschedules, records: precious time swallowed up.', panelStatus: 'It all rests on the teams', pills: ['112 tasks/day', '4 unconnected tools', '27 requests pending'], logs: [
        { label: '27 appointment requests', value: 'to handle', type: 'danger' },
        { label: '18 confirmations', value: 'pending', type: 'danger' },
        { label: '12 reschedules', value: 'to confirm', type: 'danger' },
        { label: '21 patient messages', value: 'unread', type: 'danger' },
        { label: '34 incomplete records', value: 'to complete', type: 'danger' },
      ] },
      { label: 'Step 2 · During', title: 'AI agents free up your medical teams.', description: 'All the administrative periphery runs on its own.', panelStatus: '5 agents active', pills: ['Schedule steered', 'Auto confirmations', 'Records completed'], logs: [
        { label: 'Appointment-request handling', value: 'running · 27 requests', type: 'progress' },
        { label: 'Confirmations & reminders', value: 'running · 18 reminders', type: 'progress' },
        { label: 'Reschedule handling', value: 'running · 12 reschedules', type: 'progress' },
        { label: 'Patient-message replies', value: 'running · 21 messages', type: 'progress' },
        { label: 'Record completion', value: 'running · 34 records', type: 'progress' },
      ] },
      { label: 'Step 3 · After', title: 'More time for patients.', description: 'Medical time takes back its rightful place.', panelStatus: 'Mission accomplished', pills: ['Manual tasks -68%', 'Clinical time +35%', 'Satisfaction 4.7/5'], logs: [
        { label: '27 appointments booked', value: 'automatically', type: 'success' },
        { label: '18 confirmations', value: 'sent day before', type: 'success' },
        { label: '12 reschedules handled', value: 'no delay', type: 'success' },
        { label: '21 messages handled', value: 'within 2h', type: 'success' },
        { label: '34 records completed', value: 'data complete', type: 'success' },
      ] },
    ],
    realestate: [
      { label: 'Step 1 · Before', title: 'Buyers wait. Listings stall.', description: 'Every missed viewing or late follow-up costs an opportunity.', panelStatus: 'It all rests on the teams', pills: ['120 tasks/day', '5 unconnected tools', '31 viewing requests'], logs: [
        { label: '31 viewing requests', value: 'waiting', type: 'danger' },
        { label: '19 buyer follow-ups', value: 'untouched', type: 'danger' },
        { label: '14 listings to qualify', value: 'to schedule', type: 'danger' },
        { label: '9 meetings to confirm', value: 'no reply', type: 'danger' },
        { label: '47 incomplete contacts', value: 'to enrich', type: 'danger' },
      ] },
      { label: 'Step 2 · During', title: 'AI agents orchestrate viewings, follow-ups and matches.', description: 'Every buyer gets the right property at the right time.', panelStatus: '5 agents active', pills: ['Viewings scheduled', 'Auto matching', 'Multi-channel follow-ups'], logs: [
        { label: 'Viewing scheduling', value: 'running · 31 requests', type: 'progress' },
        { label: 'Buyer follow-up', value: 'running · 19 follow-ups', type: 'progress' },
        { label: 'Listing qualification', value: 'running · 14 listings', type: 'progress' },
        { label: 'Meeting confirmation', value: 'running · 9 meetings', type: 'progress' },
        { label: 'Contact enrichment', value: 'running · 47 profiles', type: 'progress' },
      ] },
      { label: 'Step 3 · After', title: 'Your agents only work hot deals.', description: 'Properties move faster, commissions follow.', panelStatus: 'Mission accomplished', pills: ['Manual tasks -71%', 'Viewings +44%', 'Conversion +31%'], logs: [
        { label: '31 viewings scheduled', value: 'calendar synced', type: 'success' },
        { label: '19 follow-ups sent', value: 'multi-channel', type: 'success' },
        { label: '14 listings qualified', value: 'matchmaking', type: 'success' },
        { label: '9 meetings confirmed', value: 'automatically', type: 'success' },
        { label: '47 contacts enriched', value: 'data complete', type: 'success' },
      ] },
    ],
  },
};

function StepPanel({
  step,
  visible,
  ui,
}: {
  step: StoryStep;
  visible: boolean;
  ui: { missionControl: string; activityLog: string; realtime: string };
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.97 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full rounded-2xl border border-border-subtle bg-bg-secondary/60 p-5 backdrop-blur-md"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          {ui.missionControl}
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-border-green bg-green-subtle px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-green-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-green-primary" />
          {step.panelStatus}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {step.pills.map((pill, idx) => (
          <motion.span
            key={pill}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            className="rounded-full border border-border-subtle bg-bg-elevated px-3 py-1 font-sans text-xs text-text-secondary"
          >
            {pill}
          </motion.span>
        ))}
      </div>

      <div className="rounded-xl border border-border-subtle bg-bg-primary/50 p-3">
        <div className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-text-muted">
          <span>{ui.activityLog}</span>
          <span>{ui.realtime}</span>
        </div>
        <div className="space-y-1.5">
          {step.logs.map((log, idx) => (
            <motion.div
              key={`${log.label}-${idx}`}
              initial={{ opacity: 0, x: -10 }}
              animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="flex items-center justify-between gap-3 font-mono text-xs"
            >
              <span className="truncate text-text-secondary">{log.label}</span>
              <span
                className={`flex shrink-0 items-center gap-1.5 ${
                  log.type === 'danger'
                    ? 'text-red-400'
                    : log.type === 'progress'
                      ? 'text-cyan-300'
                      : 'text-green-primary'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    log.type === 'danger'
                      ? 'bg-red-400'
                      : log.type === 'progress'
                        ? 'bg-cyan-300'
                        : 'bg-green-primary'
                  }`}
                />
                {log.value}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}

export function Storytelling() {
  const prefersReducedMotion = useReducedMotion();
  const lang = useLang();
  const ui = UI[lang];
  const [stage, setStage] = useState<'intro' | 'config' | 'simulation'>('intro');
  const [companyName, setCompanyName] = useState('');
  const [sectorId, setSectorId] = useState<string>('b2b');
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);

  const steps = SCENARIOS[lang][sectorId] || SCENARIOS[lang].b2b;

  useEffect(() => {
    if (stage !== 'simulation' || prefersReducedMotion) {
      setVisibleSteps(stage === 'simulation' ? [0, 1, 2] : []);
      return;
    }
    setVisibleSteps([]);
    const timeouts = [0, 1, 2].map((i) =>
      setTimeout(() => setVisibleSteps((prev) => [...prev, i]), 400 + i * 700),
    );
    return () => timeouts.forEach(clearTimeout);
  }, [stage, sectorId, prefersReducedMotion]);

  const startSimulation = () => {
    if (!companyName.trim()) return;
    setStage('simulation');
  };

  return (
    <section className="relative overflow-hidden border-y border-border-subtle bg-bg-secondary/40 px-6 py-32 lg:px-8">
      <div
        className="absolute left-1/2 top-1/2 -z-0 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-primary/5 blur-[140px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl">
        <AnimatePresence mode="wait">
          {stage === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl text-center"
            >
              <span className="block font-mono text-xs uppercase tracking-widest text-green-primary">
                {ui.eyebrow}
              </span>
              <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl lg:text-6xl text-balance">
                {ui.title}
              </h2>
              <p className="mt-6 font-sans text-lg leading-relaxed text-text-secondary md:text-xl">
                {ui.subtitle}
              </p>
              <div className="mt-10 flex justify-center">
                <Button onClick={() => setStage('config')} variant="primary" size="lg">
                  {ui.start}
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {stage === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
              className="mx-auto max-w-xl rounded-2xl border border-border-subtle bg-bg-secondary p-8 backdrop-blur-md md:p-10"
            >
              <h3 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
                {ui.configTitle}
              </h3>
              <p className="mt-2 font-sans text-sm text-text-secondary">{ui.configSub}</p>

              <div className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="company-name"
                    className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-secondary"
                  >
                    {ui.companyLabel}
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={ui.companyPlaceholder}
                    className="w-full rounded-xl border border-border-subtle bg-bg-elevated px-4 py-3 font-sans text-text-primary placeholder:text-text-muted focus:border-green-primary/50 focus:outline-none focus:ring-2 focus:ring-green-primary/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="sector"
                    className="mb-2 block font-mono text-xs uppercase tracking-wider text-text-secondary"
                  >
                    {ui.sectorLabel}
                  </label>
                  <select
                    id="sector"
                    value={sectorId}
                    onChange={(e) => setSectorId(e.target.value)}
                    className="w-full cursor-pointer rounded-xl border border-border-subtle bg-bg-elevated px-4 py-3 font-sans text-text-primary focus:border-green-primary/50 focus:outline-none focus:ring-2 focus:ring-green-primary/20"
                  >
                    {SECTOR_IDS.map((id) => (
                      <option key={id} value={id} className="bg-bg-elevated">
                        {ui.sectors[id]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => setStage('intro')} variant="secondary" size="md" className="flex-1">
                  {ui.back}
                </Button>
                <Button
                  onClick={startSimulation}
                  variant="primary"
                  size="md"
                  className="flex-1"
                  disabled={!companyName.trim()}
                >
                  {ui.go}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {stage === 'simulation' && (
            <motion.div
              key="simulation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <div className="text-center sm:text-left">
                  <span className="font-mono text-xs uppercase tracking-widest text-green-primary">
                    {ui.cockpit} · {companyName}
                  </span>
                  <h3 className="mt-1 font-display text-2xl font-bold text-text-primary md:text-3xl">
                    {ui.phases}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStage('intro');
                    setCompanyName('');
                  }}
                  className="inline-flex items-center gap-2 font-sans text-sm text-text-secondary transition-colors hover:text-green-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {ui.restart}
                </button>
              </div>

              <div className="space-y-12">
                {steps.map((step, idx) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, y: 24 }}
                    animate={visibleSteps.includes(idx) ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className="grid gap-6 lg:grid-cols-2 lg:gap-10"
                  >
                    <div className="space-y-3">
                      <span className="block font-mono text-xs uppercase tracking-widest text-green-primary">
                        {step.label}
                      </span>
                      <h4 className="font-display text-2xl font-bold leading-tight text-text-primary md:text-3xl">
                        {step.title}
                      </h4>
                      <p className="font-sans text-base leading-relaxed text-text-secondary md:text-lg">
                        {step.description}
                      </p>
                    </div>
                    <StepPanel step={step} visible={visibleSteps.includes(idx)} ui={ui} />
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={visibleSteps.length === 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-col items-center gap-6 pt-8 text-center"
                >
                  <h3 className="max-w-xl font-display text-2xl font-bold text-text-primary md:text-3xl text-balance">
                    {ui.ctaTitle(companyName || ui.yourCompany)}
                  </h3>
                  <Button href={localize(lang, '/contact')} variant="primary" size="lg">
                    {ui.ctaButton}
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
