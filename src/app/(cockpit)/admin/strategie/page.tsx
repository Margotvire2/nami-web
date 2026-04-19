"use client";

import { useState } from "react";

const COLORS = {
  primary: "#5B4EC4",
  primaryLight: "#7B6FD4",
  primaryDark: "#4A3DA3",
  teal: "#2ABFBF",
  tealLight: "#E6F9F9",
  bg: "#FAFAF8",
  card: "#FFFFFF",
  cardAlt: "#F5F3EF",
  text: "#1A1A2E",
  textMuted: "#6B6B80",
  border: "#E8E6E1",
  red: "#E74C3C",
  orange: "#F39C12",
  green: "#27AE60",
  greenLight: "#E8F8F0",
  redLight: "#FDE8E5",
  orangeLight: "#FEF5E7",
};

const tabs = [
  { id: "segments", label: "Segments & Cibles", icon: "🎯" },
  { id: "funnels", label: "Funnels de Vente", icon: "🔄" },
  { id: "arguments", label: "Arguments par Cible", icon: "💬" },
  { id: "interlocutors", label: "Interlocuteurs Clés", icon: "👥" },
  { id: "roadmap", label: "Roadmap Commerciale", icon: "📅" },
  { id: "aphp", label: "Stratégie AP-HP", icon: "🏥" },
  { id: "prompt", label: "Prompt Mega-Stratégie", icon: "🧠" },
];

const segments = [
  {
    name: "🟣 Segment A — Libéraux en coordination",
    priority: "HAUTE",
    priorityColor: COLORS.green,
    tam: "50 000 professionnels",
    tier: "Gratuit → Essentiel (19€) → Coordination (79€) → Intelligence (149€)",
    profiles: [
      "Diététicien·ne·s nutritionnistes (cible #1 — ta tribu)",
      "Psychologues clinicien·ne·s",
      "Médecins généralistes coordonnateurs",
      "Endocrinologues de ville",
      "Kinésithérapeutes / APA",
      "Orthophonistes en parcours pédiatrique",
    ],
    pain: "5 outils fragmentés (SMS + Doctolib + email + courrier + WhatsApp), pas de dossier commun, répétition de l'anamnèse, perte d'information entre consultations, aucune visibilité sur ce que font les confrères",
    wedge: "Doctolib leur coûte 149€/mois pour agenda + RDV. Nami l'offre gratuitement. Le hook est économique ET fonctionnel.",
    conversion: "Gratuit (agenda) → Essentiel (facturation 19€) → Coordination (app patient 79€) → Intelligence (IA 149€). Chaque upgrade déclenché par un besoin terrain.",
  },
  {
    name: "🟢 Segment B — Structures d'exercice coordonné",
    priority: "CRITIQUE",
    priorityColor: COLORS.red,
    tam: "3 770 structures (MSP + CPTS + CSO + DAC)",
    tier: "Réseau (499€ + 79€/user) — ACV 15 468€/an",
    profiles: [
      "MSP (2 700, objectif 4 000 d'ici 2027)",
      "CPTS (800 en structuration, couverture 100%)",
      "CSO — Centres Spécialisés Obésité (42 structures)",
      "DAC — Dispositifs d'Appui à la Coordination",
      "Réseaux de santé spécialisés (TCA, addictologie, etc.)",
    ],
    pain: "L'ACI (Accord Conventionnel Interprofessionnel) finance la coordination mais aucun outil n'est à la hauteur. Paaco-Globule est gratuit mais mal adopté. Les MSP utilisent encore des réunions hebdo + classeurs papier + mails.",
    wedge: "Le PCR Obésité Complexe (269 structures, téléprocédure ouverte le 5 mai 2026) crée une URGENCE de coordination. Ces structures DOIVENT se coordonner pour candidater. Nami est prêt avec les 4 profils A/B/C/D.",
    conversion: "Pilote gratuit 3 mois → Réseau payant. Le coordinateur est le champion interne.",
  },
  {
    name: "🔵 Segment C — Hospitalier privé",
    priority: "HAUTE",
    priorityColor: COLORS.green,
    tam: "~1 000 cliniques et hôpitaux privés",
    tier: "Réseau (499€ + 79€/user) — deal structurant",
    profiles: [
      "Hôpital Américain de Paris (cible fondatrice #1)",
      "Cliniques privées avec ambulatoire actif",
      "Services de pédiatrie / nutrition / psychiatrie ambulatoire",
    ],
    pain: "Le virage ambulatoire pousse les patients hors de l'hôpital. Les équipes hospitalières perdent le suivi dès la sortie. Le relais ville-hôpital est un angle mort. Pas d'outil pour suivre ce qui se passe chez les libéraux.",
    wedge: "Pitch confrère-à-confrère : Margot EST diététicienne à l'HAP. Elle VIT le problème. Démo sur le cas Gabrielle (TCA pédiatrique). Le parcours de démonstration est prêt.",
    conversion: "Pilote fondateur gratuit 6 mois → Réseau payant. Le chef de service ou le médecin référent ambulatoire est le champion.",
  },
  {
    name: "🟠 Segment D — Hospitalier public (AP-HP & CHU)",
    priority: "STRATÉGIQUE (long cycle)",
    priorityColor: COLORS.orange,
    tam: "39 hôpitaux AP-HP + 32 CHU",
    tier: "Custom enterprise — deal politique",
    profiles: [
      "AP-HP — Direction des Services Numériques (Raphaël Beaufret)",
      "Paul-Brousse (TCA — Prof. Hanachi)",
      "Pitié-Salpêtrière (Obésité — Pr Aron-Wisnewsky)",
      "CHU de province avec services ambulatoires actifs",
    ],
    pain: "Orbis est le DPI mais ne couvre pas la coordination ambulatoire. Mon Espace Santé / DMP sont des coffres-forts de documents, pas des outils de coordination active. Santélien est poussé par les ARS en IDF mais reste généraliste. L'AP-HP développe ses propres outils (mon.aphp.fr) mais ça ne sort jamais de l'hôpital.",
    wedge: "Nami ne remplace PAS Orbis/DMP. Nami est la COUCHE ENTRE l'hôpital et la ville. C'est le morceau que personne ne fait. Interopérable par design.",
    conversion: "Pilote sur données de test → Validation DSI → Convention. 12-18 mois. HDS obligatoire.",
  },
  {
    name: "🟡 Segment E — Acteurs publics & institutionnels",
    priority: "INFLUENCE (pas de revenu direct)",
    priorityColor: COLORS.orange,
    tam: "ARS, DGOS, HAS, DNS, CNAM",
    tier: "Pas de vente directe — positionnement politique",
    profiles: [
      "ARS — Directeurs e-santé régionaux",
      "DGOS — Direction Générale de l'Offre de Soins",
      "HAS — Département parcours de soins",
      "DNS — Délégation au Numérique en Santé",
      "GRADeS régionaux (SESAN en IDF)",
    ],
    pain: "Le programme e-Parcours a déployé des outils régionaux (Santélien, Paaco-Globule, Terr-eSanté) mais l'adoption reste faible. La doctrine numérique en santé 2025 pousse l'interopérabilité mais les outils actuels sont des usines à gaz généralistes.",
    wedge: "Nami se positionne comme COMPLÉMENTAIRE, pas concurrent. Nami est le spécialiste coordination ambulatoire pluridisciplinaire. Les outils régionaux sont les tuyaux — Nami est l'intelligence qui circule dedans. Interop MSSanté + DMP + PPCS.",
    conversion: "Pas de vente. Mais leur soutien ouvre les portes des structures (MSP, CPTS, CSO). Stratégie : publier des résultats, participer aux GT HAS, répondre aux consultations publiques.",
  },
  {
    name: "🩷 Segment F — Associations de patients & soignants",
    priority: "ACCÉLÉRATEUR",
    priorityColor: COLORS.teal,
    tam: "~200 associations actives en France",
    tier: "Partenariat — pas de vente",
    profiles: [
      "FFAB (Fédération Française Anorexie Boulimie) — réseau TCA #1",
      "Ligue contre l'obésité / Obésité France",
      "France Assos Santé",
      "Associations de parents (épilepsie, TCA pédiatrique)",
      "Via Sana, réseaux TCA Franciliens",
    ],
    pain: "Les associations voient les patients tomber dans les trous de la coordination. Elles font du plaidoyer mais n'ont pas d'outil à recommander. Elles cherchent des partenaires tech crédibles.",
    wedge: "Margot est DANS les réseaux (8 réseaux actifs dont FFAB). Crédibilité clinique maximale. Nami n'est pas un vendeur tech qui débarque — c'est une clinicienne qui construit l'outil qu'elle a toujours voulu avoir.",
    conversion: "Partenariat de visibilité → co-construction de parcours → recommandation aux adhérents → acquisition virale.",
  },
];

const funnels = [
  {
    name: "Funnel Libéral (B2C-like)",
    icon: "👩‍⚕️",
    stages: [
      { stage: "AWARENESS", action: "Le soignant entend parler de Nami", channels: "Bouche-à-oreille confrère, LinkedIn organique, congrès spécialisés (FFAB, JFN, CPNLF), SEO local ('coordination parcours diététique')", metric: "Visiteurs site / mois", target: "500 → 2 000 en 6 mois" },
      { stage: "ACQUISITION", action: "Il s'inscrit en Gratuit", channels: "Landing page spécialisée par métier ('Nami pour les diététiciens'), comparateur Doctolib visible, CTA 'Remplacez votre agenda Doctolib à 149€ — gratuitement'", metric: "Inscriptions gratuites / mois", target: "50 → 300 en 6 mois" },
      { stage: "ACTIVATION", action: "Il utilise l'agenda + messagerie 3x en 7 jours", channels: "Onboarding guidé in-app (3 étapes max), import contacts Doctolib, SMS d'activation J+1/J+3/J+7", metric: "% activation J7", target: "> 40%" },
      { stage: "EXPANSION", action: "Il invite un confrère sur un patient partagé", channels: "Invitation in-app ('Ajoutez le psychiatre de votre patient'), email au confrère avec accès direct au dossier de coordination", metric: "Invitations envoyées / user actif", target: "> 1.5 invitations / mois" },
      { stage: "REVENUE", action: "Il upgrade vers Essentiel (19€) ou Coordination (79€)", channels: "Trigger naturel : besoin de facturation (19€), besoin d'app patient ou adressage structuré (79€), besoin de synthèses IA (149€)", metric: "Taux de conversion gratuit → payant", target: "10-15% à M+6" },
    ],
  },
  {
    name: "Funnel Structure (B2B)",
    icon: "🏢",
    stages: [
      { stage: "IDENTIFICATION", action: "Identifier les structures avec douleur coordination", channels: "Liste ARS des MSP, annuaire CPTS (fédération nationale), liste PCR Obésité (269 structures après mai 2026), réseau personnel Margot (FFAB, Via Sana)", metric: "Structures identifiées dans le CRM", target: "200 en base qualifiée" },
      { stage: "OUTREACH", action: "Premier contact — confrère à confrère", channels: "Email personnalisé du coordinateur de la structure (PAS de mail générique), MSSanté si possible (signal de crédibilité), appel direct au médecin référent, intervention en réunion de concertation", metric: "Taux de réponse", target: "> 25%" },
      { stage: "DÉMONSTRATION", action: "Démo live sur un cas patient réel (anonymisé)", channels: "Visio 30 min avec le coordinateur + 1-2 soignants clés, parcours démo prêt (TCA ou Obésité PCR), focus sur le dossier partagé + synthèse IA + app patient", metric: "Taux de conversion démo → pilote", target: "> 40%" },
      { stage: "PILOTE", action: "3 mois gratuits sur 5-10 patients", channels: "Onboarding terrain (Margot en personne ou visio), config des parcours, formation équipe 1h, check-ins hebdo M1 puis bi-mensuel", metric: "Utilisation active > 3 connexions/semaine/soignant", target: "> 60% d'adoption équipe" },
      { stage: "CLOSING", action: "Conversion en Réseau payant (499€ + 79€/user)", channels: "Revue d'impact à M+3 (avant/après quantifié), proposition commerciale au décideur (directeur MSP, président CPTS), facturation annuelle avec remise engagement", metric: "Taux de conversion pilote → payant", target: "> 50%" },
    ],
  },
  {
    name: "Funnel Institutionnel (B2G)",
    icon: "🏛️",
    stages: [
      { stage: "POSITIONNEMENT", action: "Se faire connaître comme expert coordination ambulatoire", channels: "Publications terrain (résultats pilotes, études de cas), participation aux GT HAS / DNS / DGOS, interventions aux États Généraux de l'Obésité, tribune dans Concours Pluripro / APMnews", metric: "Citations / mentions institutionnelles", target: "5 en 12 mois" },
      { stage: "ACCÈS", action: "Obtenir un RDV avec le décideur (DSN AP-HP, ARS e-santé)", channels: "Introduction via réseau clinique (Prof. Hanachi, Pr Aron-Wisnewsky), via FFAB/Obésité France (accès politique), via GRADeS/SESAN (accès technique)", metric: "RDV institutionnels / trimestre", target: "3-5" },
      { stage: "CONVENTION", action: "Signer une convention de pilote institutionnel", channels: "Dossier de candidature structuré (conformité HDS/RGPD/non-DM), interop démontrée (MSSanté, DMP, PPCS), budget sur enveloppe innovation ou e-parcours", metric: "Conventions signées", target: "1-2 en 18 mois" },
    ],
  },
];

const argumentsByTarget = [
  {
    target: "Diététicien·ne libéral·e", emoji: "🥗",
    pain: "Pas d'outil pour suivre les patients entre les consultations. Photos repas sur WhatsApp. Pas de lien structuré avec le médecin ou le psy.",
    hook: "\"Votre patient vous envoie ses photos repas sur WhatsApp. Vous les perdez. Ses résultats bio sont dans un PDF sur votre bureau. Le psychiatre ne sait pas ce que vous faites. Et si tout ça était dans un seul endroit ?\"",
    arguments: ["App patient avec IA photos repas intégrée — fini WhatsApp", "Dossier de coordination partagé avec l'équipe pluridisciplinaire", "Extraction automatique des bilans biologiques", "Agenda gratuit (vs 149€ Doctolib)", "Synthèses IA sourcées HAS/FFAB pour gagner 2h/semaine"],
    objection: "\"J'utilise déjà Doctolib\" → \"Doctolib gère vos RDV. Nami gère vos PARCOURS. Quand votre patient voit 5 soignants, Doctolib ne sait pas. Nami le sait.\"",
  },
  {
    target: "Psychologue clinicien·ne", emoji: "🧠",
    pain: "Isolement professionnel total. Aucune visibilité sur le suivi somatique. Le médecin ne sait pas ce qui se passe en séance (et ne devrait pas tout savoir — mais le minimum vital, oui).",
    hook: "\"Votre patient·e suit un parcours TCA avec un psychiatre, une diététicienne, un médecin. Vous voyez les résultats de votre travail… mais les autres ne le voient pas. Et vous ne voyez pas les leurs.\"",
    arguments: ["Matrice de visibilité par rôle — chaque soignant voit CE QUI LE CONCERNE", "Notes partagées avec granularité (psycho → résumé non clinique pour l'équipe)", "PHQ-9 / EDE-Q intégrés avec interprétation automatique", "Zéro admin — dictez, l'IA structure, vous validez"],
    objection: "\"Le secret professionnel\" → \"Nami respecte le secret par ARCHITECTURE. La matrice de visibilité est définie par le soignant. Le psy décide exactement ce que l'équipe voit. Art. L.1110-4 CSP.\"",
  },
  {
    target: "Chef de service hospitalier", emoji: "🩺",
    pain: "Perd la visibilité sur ses patients dès qu'ils sortent. Le courrier de sortie est le dernier contact. Le relais ville-hôpital est un acte de foi.",
    hook: "\"Votre patient sort un vendredi. Lundi, 5 libéraux prennent le relais. Aujourd'hui, vous n'avez aucune idée de ce qui se passe. Avec Nami, vous le savez.\"",
    arguments: ["Vision continue du parcours ambulatoire depuis l'hôpital", "Indicateurs de complétude du parcours (pas d'alerte clinique — complétude informationnelle)", "Parcours de coordination pré-configurés par pathologie", "Pas un DMP concurrent — une couche AU-DESSUS qui orchestre", "Interopérable Orbis via HL7 FHIR (roadmap)"],
    objection: "\"On a déjà Orbis et le DMP\" → \"Orbis est votre DPI. Le DMP est le coffre-fort du patient. Ni l'un ni l'autre ne coordonnent les 5 libéraux qui prennent le relais à la sortie. C'est ce trou-là que Nami comble.\"",
  },
  {
    target: "Président·e de CPTS", emoji: "🏘️",
    pain: "Budget ACI pour la coordination. Obligation de résultats. Mais pas d'outil à la hauteur. Santélien est imposé par l'ARS mais personne ne l'utilise vraiment.",
    hook: "\"L'ACI vous finance pour coordonner. Mais vous coordonnez avec quoi ? Des mails, des réunions, et un outil ARS que personne n'ouvre. Et si la coordination était aussi simple qu'un WhatsApp — mais structurée, tracée, et conforme ?\"",
    arguments: ["Parcours pré-configurés par pathologie (PCR Obésité prêt)", "Tableau de bord coordination pour le rapport ACI", "Dashboard financier (actes, remboursements, forfaits PCR)", "Complémentaire aux outils régionaux — pas concurrent", "Déploiement en 7 jours (vs 3-6 mois pour un outil régional)"],
    objection: "\"L'ARS nous impose Santélien\" → \"Santélien est l'outil de l'ARS. Nami est l'outil de votre ÉQUIPE. On s'interopère. Les deux coexistent — comme votre logiciel de cabinet coexiste avec le DMP.\"",
  },
  {
    target: "Coordinateur·rice PCR Obésité", emoji: "📋",
    pain: "La téléprocédure ouvre le 5 mai 2026. Le cahier des charges exige une coordination pluridisciplinaire structurée. Aucun outil n'est prêt. Le coordinateur doit monter le dossier SANS outil.",
    hook: "\"Le PCR Obésité exige 5 professionnels coordonnés, des séquences structurées, un suivi patient formalisé, et un reporting d'activité. La téléprocédure ouvre le 5 mai. Votre outil de coordination est prêt ?\"",
    arguments: ["4 profils patients A/B/C/D pré-configurés (arrêté du 26 février 2026)", "Séquences PCR intégrées (évaluation initiale → suivi → réévaluation)", "Fiche synthétique d'activité générée automatiquement", "Équipe socle configurable (médecin spé, diét, psy, APA, IDE)", "Forfait PCR tracé par patient — dashboard financier"],
    objection: "\"On va se débrouiller avec Excel\" → \"Le cahier des charges exige traçabilité, coordination active, et reporting. Excel ne trace rien. Nami le fait nativement.\"",
  },
  {
    target: "Direction AP-HP / DSN", emoji: "🏥",
    pain: "Développent leurs propres outils (mon.aphp.fr, Orbis, Nursing U) mais tout reste INTRA-HOSPITALIER. La coordination ambulatoire ville-hôpital est un angle mort stratégique.",
    hook: "\"L'AP-HP investit massivement dans le numérique intra-hospitalier. Mais quand le patient sort, il tombe dans un trou. Nami n'est pas un concurrent de vos outils — c'est le pont que vous ne construisez pas.\"",
    arguments: ["Pas un DPI, pas un DMP — une couche de COORDINATION AMBULATOIRE", "Interopérable par design (HL7 FHIR, MSSanté, INS qualifiée)", "Ne touche pas aux systèmes existants — se branche dessus", "Architecture non-DM documentée (MDCG 2019-11)", "Hébergement HDS en cours (Scalingo / OVH Healthcare)", "Résultats publiables → apport recherche AP-HOP pour l'institution"],
    objection: "\"On développe déjà nos outils\" → \"Exactement. Vous développez l'INTRA. Nami fait l'EXTRA — la coordination avec les libéraux en ville. C'est complémentaire, pas concurrent. Et ça fait partie des priorités DSN 2026 : améliorer le parcours patient HORS de l'hôpital.\"",
  },
];

const interlocutors = [
  {
    org: "MSP / Maison de Santé Pluriprofessionnelle",
    contacts: [
      { role: "Médecin référent / Président SISA", power: "Décideur", approach: "Confrère à confrère. Démo sur un cas patient partagé. Montrer le gain de temps coordination." },
      { role: "Coordinateur·rice de parcours", power: "Champion", approach: "C'est SON outil. Montrer que Nami lui simplifie la vie (reporting ACI, suivi patients, convocations)." },
      { role: "Secrétaire médical·e", power: "Gate-keeper", approach: "Montrer que l'agenda Nami est plus simple. Import patients facile. Formation 30 min." },
    ],
  },
  {
    org: "CPTS",
    contacts: [
      { role: "Président·e de la CPTS", power: "Décideur politique", approach: "Enjeu ACI + résultats obligatoires. Nami = outil qui justifie le financement." },
      { role: "Coordinateur·rice territorial·e", power: "Champion opérationnel", approach: "Dashboard de coordination. Visibilité sur l'activité. Reporting automatisé." },
      { role: "Référent·e e-santé (chef de projet e-Parcours)", power: "Facilitateur technique", approach: "Interopérabilité. Complémentarité Santélien. Architecture conforme." },
    ],
  },
  {
    org: "Hôpital privé (type HAP)",
    contacts: [
      { role: "Chef de service ambulatoire", power: "Décideur clinique", approach: "Le cas patient. 'Votre patient sort — voici ce qui se passe avec Nami.'" },
      { role: "Directeur médical / CME", power: "Décideur stratégique", approach: "Positionnement innovation. Différenciation. Parcours ambulatoire comme avantage concurrentiel." },
      { role: "DSI / Responsable SI", power: "Gate-keeper technique", approach: "Architecture, sécurité, interop, RGPD. Dossier technique prêt." },
      { role: "Cadre de santé", power: "Champion terrain", approach: "Gain de temps infirmier. Moins d'appels de coordination. Dossier accessible sur mobile." },
    ],
  },
  {
    org: "AP-HP",
    contacts: [
      { role: "Raphaël Beaufret — DSN AP-HP", power: "Décideur numérique", approach: "Interop, complémentarité Orbis, couche ambulatoire manquante. Via introduction SESAN ou CME." },
      { role: "Prof. Hanachi — Paul-Brousse (TCA)", power: "Champion clinique TCA", approach: "Cas Gabrielle. Parcours TCA ambulatoire. Publication commune possible." },
      { role: "Pr Aron-Wisnewsky — Pitié-Salpêtrière", power: "Champion PCR Obésité", approach: "Co-pilote feuille de route obésité 2026-2030. Si elle recommande Nami pour les CSO..." },
      { role: "Commission Numérique CME", power: "Validation institutionnelle", approach: "Présentation formelle. Dossier conformité. Résultats pilote HAP si disponibles." },
      { role: "Pr Brigitte Séroussi — SN@SU", power: "Réseau académique", approach: "Angle recherche. Évaluation outils numériques en coordination. Publication AP-HOP." },
    ],
  },
  {
    org: "ARS Île-de-France",
    contacts: [
      { role: "Direction e-santé / Pilote e-Parcours", power: "Orienteur", approach: "Se positionner comme complémentaire. Proposer un pilote évalué. Ne pas attaquer Santélien." },
      { role: "Référent PCR Obésité régional", power: "Gate-keeper PCR", approach: "Nami comme outil de coordination pour les structures candidates au PCR." },
    ],
  },
  {
    org: "PCR Obésité — GCC CSO",
    contacts: [
      { role: "Thibaut Batisse — Coordinateur GCC CSO", power: "Réseau CSO national", approach: "Contact identifié. Présenter Nami comme outil prêt pour les 269 structures." },
      { role: "Pr Judith Aron-Wisnewsky — Bureau GCC CSO", power: "Autorité scientifique", approach: "Feuille de route obésité 2026-2030. Si le GCC recommande un outil de coordination..." },
      { role: "Dr Cyril Gauthier — Fondateur EMNO", power: "Légitimité Article 51", approach: "L'expérimentation qui a créé le PCR. Son soutien = crédibilité maximale auprès des structures." },
    ],
  },
];

const roadmapPhases = [
  {
    phase: "PHASE 0 — Fondations (Avril-Mai 2026)",
    color: COLORS.primary,
    milestones: [
      "✅ Finaliser buildFullContext() — synthèse IA 6 blocs opérationnelle",
      "✅ Fixer les bugs critiques (audio transcription, bio data, Mifflin-St Jeor)",
      "✅ Préparer le pitch confrère-à-confrère pour l'HAP pédiatrie",
      "✅ Configurer les 4 profils PCR Obésité (A/B/C/D) dans Nami",
      "📝 Rédiger le dossier conformité (non-DM memo, RGPD, roadmap HDS)",
      "📝 Créer 3 landing pages par persona (diététicien, psy, médecin coordonnateur)",
      "📝 Mettre en place un CRM léger (Notion ou Attio) avec pipeline commercial",
    ],
  },
  {
    phase: "PHASE 1 — Premiers clients fondateurs (Mai-Août 2026)",
    color: COLORS.teal,
    milestones: [
      "🎯 Pilote HAP — équipe pédiatrie ambulatoire (pitch en mai)",
      "🎯 Pilote PCR Obésité — 2-3 structures candidates (téléprocédure ouvre le 5 mai)",
      "🎯 10 diététicien·ne·s libéraux en Gratuit via réseau FFAB/AFDN",
      "🎯 Premier pilote CPTS via réseau Via Sana",
      "📣 Intervention aux journées AFDN / congrès FFAB",
      "📣 Article LinkedIn 'Pourquoi j'ai construit l'outil que j'aurais voulu avoir'",
      "💰 Premier euro : upgrade Essentiel (19€) sur les diét libéraux",
    ],
  },
  {
    phase: "PHASE 2 — Traction (Sept-Déc 2026)",
    color: COLORS.green,
    milestones: [
      "🎯 50 soignants actifs (WAU > 30)",
      "🎯 3-5 structures en pilote Réseau",
      "🎯 1 structure PCR Obésité payante",
      "💰 5-10K€ MRR (mix Essentiel + Coordination + Réseau)",
      "🔧 Migration HDS lancée (Scalingo ou OVH Healthcare)",
      "📣 Première étude de cas publiée (avant/après coordination)",
      "📣 Contact Paul-Brousse pour pilote TCA (via Prof. Hanachi)",
      "📣 Contact GCC CSO / Thibaut Batisse",
    ],
  },
  {
    phase: "PHASE 3 — Scale prep & Seed (Jan-Juin 2027)",
    color: COLORS.primaryDark,
    milestones: [
      "🎯 200-500 soignants inscrits",
      "🎯 10-15 structures tier Réseau dont 5+ payantes",
      "💰 20-40K€ MRR → trajectoire 300-500K€ ARR",
      "🔧 HDS certifié → déverrouille le public",
      "🔧 Memo non-DM formalisé par avocat santé",
      "🚀 Lancement seed — 800K-1.2M€ à 4-6M€ pre-money",
      "👥 Recrutement CTO co-fondateur + BD/founding AE",
      "📣 Premier pilote AP-HP (Paul-Brousse ou Foch, données de test)",
    ],
  },
];

const aphpStrategy = {
  context: "L'AP-HP développe ses propres outils numériques en parallèle. La DSN (Raphaël Beaufret) pilote Orbis, mon.aphp.fr, la qualification INS, le déploiement MSSanté. La CME numérique valide les projets. SESAN (GRADeS IDF) déploie Santélien. Tout est orienté INTRA-hospitalier ou connectique institutionnelle.",
  positioning: "Nami ne joue PAS sur le même terrain. Nami est la couche ambulatoire que l'AP-HP ne construit pas et n'a pas vocation à construire. L'AP-HP fait l'INTRA. Nami fait l'INTER — entre l'hôpital et les libéraux en ville.",
  angles: [
    { title: "1. Le pont ville-hôpital", detail: "L'AP-HP investit dans mon.aphp.fr (espace patient) mais il ne couvre que l'expérience DANS l'hôpital. Nami couvre ce qui se passe APRÈS la sortie, quand 5 libéraux prennent le relais. C'est le morceau manquant que la DSN reconnaît elle-même dans ses priorités 2026." },
    { title: "2. L'interopérabilité comme preuve de bonne foi", detail: "Ne JAMAIS se positionner en concurrent. Montrer l'interop : HL7 FHIR pour Orbis, INS qualifiée, MSSanté, DMP via API. Nami enrichit l'écosystème AP-HP — il ne le remplace pas. Le message : 'Nous nous branchons sur vos rails.'" },
    { title: "3. L'angle recherche (AP-HOP / APRESO)", detail: "L'AP-HP valorise la recherche. Le master AP-HOP de Margot + sa recherche non publiée (monitoring passif ≠ réduction charge de travail) = crédibilité académique. Proposer une évaluation formelle de Nami dans un cadre APRESO ou PHRIP → le pilote DEVIENT un projet de recherche. L'AP-HP co-publie → tout le monde gagne." },
    { title: "4. L'entrée par le clinicien, pas par la DSI", detail: "Ne PAS commencer par Raphaël Beaufret (DSN). Commencer par le Prof. Hanachi (Paul-Brousse, TCA) ou le Dr Gervaix (HAP pédiatrie). Le clinicien qui dit 'j'ai besoin de cet outil pour mes patients ambulatoires' crée la demande. La DSI suit. C'est le playbook bottom-up classique." },
    { title: "5. La fenêtre PCR Obésité", detail: "La Pr Aron-Wisnewsky co-pilote la feuille de route obésité 2026-2030. Les CSO AP-HP (42 structures dont plusieurs AP-HP) vont candidater au PCR. Si Nami est l'outil de coordination recommandé par le GCC CSO pour les structures PCR, l'AP-HP ne peut pas l'ignorer. C'est l'entrée par le haut." },
    { title: "6. Le bouclier HDS", detail: "L'AP-HP ne signera RIEN sans HDS. C'est la première question éliminatoire. Le pilote peut commencer sur données de test (anonymisées) pendant la migration HDS. Mais la convention définitive nécessite la certification. Calendrier : HDS certifié Q1 2027 → convention pilote AP-HP Q2 2027." },
  ],
  doNot: [
    "Ne JAMAIS critiquer les outils AP-HP (Orbis, mon.aphp.fr, Santélien)",
    "Ne JAMAIS prétendre remplacer le DMP ou le DPI",
    "Ne JAMAIS promettre des features non construites",
    "Ne JAMAIS bypasser la DSI — même si l'entrée est clinique, la DSI DOIT valider",
    "Ne JAMAIS parler de 'surveillance' ou 'alerte clinique' — c'est un trigger DM fatal en milieu AP-HP",
    "Ne JAMAIS arriver sans dossier conformité écrit (RGPD, non-DM, architecture, roadmap HDS)",
  ],
};

const megaPrompt = `# NAMI — PROMPT MEGA-STRATÉGIE COMMERCIALE GTM

## CONTEXTE
Tu es le directeur commercial / Head of Growth de Nami, une plateforme SaaS de coordination des parcours de soins ambulatoires complexes en France. Tu travailles directement avec Margot Viré, fondatrice solo, diététicienne-nutritionniste à l'Hôpital Américain de Paris, master santé publique AP-HOP, ESSEC, active dans 8 réseaux cliniques dont la FFAB.

## TON RÔLE
Pour chaque tâche commerciale, tu dois :
1. Identifier le segment et la cible exacte (cf. matrice 6 segments)
2. Adapter le wording Nami (voix pro, jamais "surveillance/alerte/détection")
3. Construire l'argumentaire avec les 3 filtres : ÉMOTION → CLARTÉ → COMPLIANCE
4. Proposer le canal de contact optimal
5. Anticiper les objections et préparer les réponses
6. Définir les métriques de suivi

## MATRICE DES 6 SEGMENTS

### Segment A — Libéraux en coordination (50K pros)
- Cibles : diététiciens, psychologues, MG, endocrino, kiné/APA
- Tier : Gratuit → Essentiel (19€) → Coordination (79€) → Intelligence (149€)
- Wedge : "Tout ce que Doctolib facture 149€, Nami l'offre gratuitement"
- Funnel : Product-led growth (inscription gratuite → activation → expansion virale → upgrade)
- KPI : inscriptions/mois, activation J7 > 40%, invitations/user > 1.5, conversion payant > 10%

### Segment B — Structures coordonnées (3 770 structures)
- Cibles : MSP, CPTS, CSO, DAC, réseaux spécialisés
- Tier : Réseau (499€ + 79€/user) — ACV 15 468€/an
- Wedge : PCR Obésité (269 structures, téléprocédure 5 mai 2026)
- Funnel : Sales-led (identification → outreach confrère → démo cas patient → pilote 3 mois → closing)
- KPI : structures en pipeline, taux de réponse > 25%, conversion démo→pilote > 40%, pilote→payant > 50%

### Segment C — Hospitalier privé (~1 000 structures)
- Cible fondatrice : Hôpital Américain de Paris (pédiatrie ambulatoire)
- Tier : Réseau — deal structurant
- Wedge : Pitch confrère-à-confrère, cas Gabrielle (TCA pédiatrique)
- Funnel : Relationship-led (réseau clinique → démo terrain → pilote fondateur → convention)

### Segment D — Hospitalier public (AP-HP, CHU)
- Cibles : Paul-Brousse (TCA), Pitié-Salpêtrière (obésité), Foch
- Tier : Custom enterprise
- Wedge : Couche ambulatoire manquante + angle recherche AP-HOP
- Stratégie : Entrée par le clinicien (bottom-up) + validation DSI. HDS obligatoire.
- Contacts clés : Prof. Hanachi, Pr Aron-Wisnewsky, Raphaël Beaufret (DSN), Pr Séroussi (SN@SU)

### Segment E — Acteurs publics (ARS, DGOS, HAS, DNS)
- Pas de vente directe — positionnement politique
- Stratégie : Complémentarité (pas concurrent), publications, GT HAS/DNS
- Objectif : Que les ARS recommandent Nami aux structures PCR

### Segment F — Associations patients & soignants
- FFAB, Obésité France, Via Sana, associations de parents
- Partenariat de visibilité → co-construction → recommandation → viral

## RÈGLES WORDING ABSOLUES
- DIRE : coordination, orchestration, centraliser, structurer, partager, documenter, cockpit, complétude, continuité informationnelle
- NE JAMAIS DIRE : surveillance, monitoring, alerte clinique, détection, scoring, prévenir, sécuriser, révolution, disruptif
- IA = "brouillon à valider" + "synthèse automatique" + "extraction" — JAMAIS "IA clinique" ou "aide à la décision"

## POSITIONING ANTI-CONCURRENT
- vs Doctolib : "Doctolib gère vos RDV. Nami gère vos PARCOURS."
- vs Omnidoc : "Omnidoc fait de la téléexpertise ponctuelle. Nami fait de la coordination continue."
- vs Santélien/Paaco-Globule : "Outils régionaux généralistes. Nami est spécialisé coordination ambulatoire pluridisciplinaire."
- vs DMP/Mon Espace Santé : "Le DMP est un coffre-fort. Nami est le couloir."
- vs outils AP-HP (Orbis, mon.aphp.fr) : "L'AP-HP fait l'intra. Nami fait l'inter."

## PRICING CHEAT SHEET
| Tier | Prix | ACV | Cible | Payback |
|------|-------|------|-------|---------|
| Gratuit | 0€ | 0€ | Acquisition massive | — |
| Essentiel | 19€/mois | 228€ | Libéral qui facture | 2.6 mois |
| Coordination | 79€/mois | 948€ | Libéral qui coordonne | 3.8 mois |
| Intelligence | 149€/mois | 1 788€ | Power user IA | 2.4 mois |
| Réseau | 499€+79€/user | 15 468€ | Structure 10 users | 2.3 mois |

## FENÊTRES TEMPORELLES CRITIQUES
- 5 mai 2026 : Ouverture téléprocédure PCR Obésité → URGENCE pour les 269 structures
- 30 juin 2026 : Date limite candidatures régions haute prévalence (BFC, CVL, Grand Est, HdF, Normandie)
- 31 décembre 2026 : Date limite candidatures autres régions
- Q1 2027 : Certification HDS cible → déverrouille AP-HP
- 2027 : Objectif 4 000 MSP (Plan gouvernemental)
- Mai 2028 : Clause de revoyure PCR

## COMMENT UTILISER CE PROMPT
Quand Margot te demande :
- "Rédige un email pour [cible]" → Identifie le segment, adapte le wording, utilise le bon wedge
- "Prépare ma démo pour [structure]" → Choisis le parcours démo adapté (TCA, obésité PCR, pédiatrie)
- "Aide-moi à préparer le RDV avec [personne]" → Identifie le rôle, le pouvoir de décision, les objections probables
- "Fais-moi un plan d'attaque pour [organisation]" → Cartographie les interlocuteurs, définis la séquence de contacts, anticipe les gate-keepers
- "Analyse mon pipeline" → Évalue chaque deal par segment, probabilité, timeline, next step`;

export default function NamiGTMStrategy() {
  const [activeTab, setActiveTab] = useState("segments");
  const [expandedSegment, setExpandedSegment] = useState(0);
  const [expandedArg, setExpandedArg] = useState(0);
  const [expandedOrg, setExpandedOrg] = useState(0);
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    navigator.clipboard.writeText(megaPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ fontFamily: "var(--font-jakarta, 'Plus Jakarta Sans', system-ui, sans-serif)", background: COLORS.bg, minHeight: "100vh", color: COLORS.text }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, padding: "32px 24px 24px", color: "white", borderRadius: 16, marginBottom: 0 }}>
        <div style={{ fontSize: 13, letterSpacing: 2, opacity: 0.7, marginBottom: 8, textTransform: "uppercase" }}>Nami • Stratégie Commerciale GTM</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>Machine de Guerre Commerciale</h1>
        <p style={{ fontSize: 14, opacity: 0.8, marginTop: 8, lineHeight: 1.5 }}>6 segments · 3 funnels · 6 argumentaires · roadmap 18 mois · stratégie AP-HP · prompt mega-stratégie</p>
      </div>

      {/* Tabs */}
      <div style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, overflowX: "auto", whiteSpace: "nowrap", marginTop: 0 }}>
        <div style={{ display: "flex", gap: 0 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "14px 16px",
                background: "none",
                border: "none",
                borderBottom: activeTab === tab.id ? `3px solid ${COLORS.primary}` : "3px solid transparent",
                color: activeTab === tab.id ? COLORS.primary : COLORS.textMuted,
                fontWeight: activeTab === tab.id ? 600 : 400,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 0" }}>

        {/* SEGMENTS */}
        {activeTab === "segments" && (
          <div>
            <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              6 segments ordonnés par priorité d&apos;exécution. Chaque segment a son funnel, son wedge d&apos;entrée, et sa logique de conversion propre.
            </p>
            {segments.map((seg, i) => (
              <div key={i} style={{ marginBottom: 12, border: `1px solid ${COLORS.border}`, borderRadius: 12, background: COLORS.card, overflow: "hidden" }}>
                <button
                  onClick={() => setExpandedSegment(expandedSegment === i ? -1 : i)}
                  style={{ width: "100%", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}
                >
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.text }}>{seg.name}</div>
                    <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>{seg.tam} · {seg.tier.split("→")[0].trim()}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: seg.priorityColor + "20", color: seg.priorityColor }}>{seg.priority}</span>
                    <span style={{ fontSize: 18, color: COLORS.textMuted, display: "inline-block", transform: expandedSegment === i ? "rotate(180deg)" : "none", transition: "0.2s" }}>▾</span>
                  </div>
                </button>
                {expandedSegment === i && (
                  <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${COLORS.border}` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.primary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Profils cibles</div>
                        {seg.profiles.map((p, j) => <div key={j} style={{ fontSize: 13, padding: "4px 0", color: COLORS.text }}>• {p}</div>)}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.red, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Douleur principale</div>
                        <p style={{ fontSize: 13, lineHeight: 1.6, color: COLORS.text }}>{seg.pain}</p>
                      </div>
                    </div>
                    <div style={{ marginTop: 16, padding: 16, background: COLORS.tealLight, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.teal, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Wedge d&apos;entrée</div>
                      <p style={{ fontSize: 13, lineHeight: 1.6, color: COLORS.text, margin: 0 }}>{seg.wedge}</p>
                    </div>
                    <div style={{ marginTop: 12, padding: 16, background: COLORS.cardAlt, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.primary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Logique de conversion</div>
                      <p style={{ fontSize: 13, lineHeight: 1.6, color: COLORS.text, margin: 0 }}>{seg.conversion}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* FUNNELS */}
        {activeTab === "funnels" && (
          <div>
            <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              3 funnels distincts selon le type de client. Le libéral est product-led (il s&apos;inscrit seul). La structure est sales-led (Margot démarche). L&apos;institutionnel est influence-led (pas de vente directe).
            </p>
            {funnels.map((funnel, fi) => (
              <div key={fi} style={{ marginBottom: 24, border: `1px solid ${COLORS.border}`, borderRadius: 12, background: COLORS.card, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, background: COLORS.cardAlt }}>
                  <span style={{ fontSize: 20 }}>{funnel.icon}</span>
                  <span style={{ fontSize: 16, fontWeight: 600, marginLeft: 10 }}>{funnel.name}</span>
                </div>
                <div style={{ padding: 20 }}>
                  {funnel.stages.map((s, si) => (
                    <div key={si} style={{ display: "flex", gap: 16, marginBottom: si < funnel.stages.length - 1 ? 20 : 0, paddingBottom: si < funnel.stages.length - 1 ? 20 : 0, borderBottom: si < funnel.stages.length - 1 ? `1px dashed ${COLORS.border}` : "none" }}>
                      <div style={{ minWidth: 100 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "white", padding: "4px 8px", borderRadius: 4, textAlign: "center", background: si === 0 ? COLORS.primary : si === funnel.stages.length - 1 ? COLORS.green : COLORS.teal }}>
                          {s.stage}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>{s.action}</div>
                        <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6, marginBottom: 6 }}>{s.channels}</div>
                        <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                          <span style={{ color: COLORS.primary, fontWeight: 500 }}>📊 {s.metric}</span>
                          <span style={{ color: COLORS.green, fontWeight: 500 }}>🎯 {s.target}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ARGUMENTS */}
        {activeTab === "arguments" && (
          <div>
            <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              Pour chaque interlocuteur type : sa douleur, le hook d&apos;ouverture, les arguments clés, et la réponse à son objection principale.
            </p>
            {argumentsByTarget.map((arg, i) => (
              <div key={i} style={{ marginBottom: 12, border: `1px solid ${COLORS.border}`, borderRadius: 12, background: COLORS.card, overflow: "hidden" }}>
                <button
                  onClick={() => setExpandedArg(expandedArg === i ? -1 : i)}
                  style={{ width: "100%", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}
                >
                  <span style={{ fontSize: 16, fontWeight: 600 }}>{arg.emoji} {arg.target}</span>
                  <span style={{ fontSize: 18, color: COLORS.textMuted, display: "inline-block", transform: expandedArg === i ? "rotate(180deg)" : "none", transition: "0.2s" }}>▾</span>
                </button>
                {expandedArg === i && (
                  <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${COLORS.border}` }}>
                    <div style={{ marginTop: 16, padding: 14, background: COLORS.redLight, borderRadius: 8, marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.red, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Douleur</div>
                      <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>{arg.pain}</p>
                    </div>
                    <div style={{ padding: 14, background: `${COLORS.primary}10`, borderRadius: 8, marginBottom: 12, borderLeft: `3px solid ${COLORS.primary}` }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.primary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Hook d&apos;ouverture</div>
                      <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>{arg.hook}</p>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.green, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Arguments clés</div>
                      {arg.arguments.map((a, j) => (
                        <div key={j} style={{ fontSize: 13, padding: "5px 0", display: "flex", gap: 8 }}>
                          <span style={{ color: COLORS.green }}>✓</span><span>{a}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: 14, background: COLORS.orangeLight, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.orange, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Objection → Réponse</div>
                      <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>{arg.objection}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* INTERLOCUTORS */}
        {activeTab === "interlocutors" && (
          <div>
            <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              Pour chaque type d&apos;organisation : qui contacter, quel est son pouvoir de décision, et comment l&apos;approcher.
            </p>
            {interlocutors.map((org, i) => (
              <div key={i} style={{ marginBottom: 12, border: `1px solid ${COLORS.border}`, borderRadius: 12, background: COLORS.card, overflow: "hidden" }}>
                <button
                  onClick={() => setExpandedOrg(expandedOrg === i ? -1 : i)}
                  style={{ width: "100%", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}
                >
                  <span style={{ fontSize: 16, fontWeight: 600 }}>🏢 {org.org}</span>
                  <span style={{ fontSize: 18, color: COLORS.textMuted, display: "inline-block", transform: expandedOrg === i ? "rotate(180deg)" : "none", transition: "0.2s" }}>▾</span>
                </button>
                {expandedOrg === i && (
                  <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${COLORS.border}` }}>
                    {org.contacts.map((c, j) => (
                      <div key={j} style={{ marginTop: 14, padding: 14, background: j % 2 === 0 ? COLORS.cardAlt : COLORS.card, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{c.role}</span>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 12,
                            background: c.power.includes("Décideur") ? COLORS.green + "20" : c.power.includes("Champion") ? COLORS.primary + "20" : COLORS.orange + "20",
                            color: c.power.includes("Décideur") ? COLORS.green : c.power.includes("Champion") ? COLORS.primary : COLORS.orange,
                          }}>{c.power}</span>
                        </div>
                        <p style={{ fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.6 }}>{c.approach}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ROADMAP */}
        {activeTab === "roadmap" && (
          <div>
            <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              Roadmap commerciale sur 18 mois — de la fondation produit au seed. Chaque phase a ses objectifs, ses actions, et ses métriques.
            </p>
            {roadmapPhases.map((phase, i) => (
              <div key={i} style={{ marginBottom: 20, borderLeft: `4px solid ${phase.color}`, paddingLeft: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: phase.color, marginBottom: 12 }}>{phase.phase}</div>
                {phase.milestones.map((m, j) => (
                  <div key={j} style={{ fontSize: 13, padding: "5px 0", lineHeight: 1.6, color: COLORS.text }}>{m}</div>
                ))}
              </div>
            ))}
            <div style={{ marginTop: 24, padding: 20, background: COLORS.cardAlt, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>📊 KPIs North Star par phase</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  { label: "Phase 0", kpi: "Product-ready", detail: "0 bug critique" },
                  { label: "Phase 1", kpi: "5 pilotes", detail: "Premier euro" },
                  { label: "Phase 2", kpi: "10K€ MRR", detail: "50 WAU" },
                  { label: "Phase 3", kpi: "Seed closed", detail: "500K€ ARR run" },
                ].map((k, idx) => (
                  <div key={idx} style={{ padding: 12, background: COLORS.card, borderRadius: 8, textAlign: "center", border: `1px solid ${COLORS.border}` }}>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>{k.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary }}>{k.kpi}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{k.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AP-HP */}
        {activeTab === "aphp" && (
          <div>
            <div style={{ padding: 16, background: COLORS.orangeLight, borderRadius: 12, marginBottom: 20, border: `1px solid ${COLORS.orange}30` }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.orange, marginBottom: 6 }}>⚠️ Contexte stratégique</div>
              <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>{aphpStrategy.context}</p>
            </div>
            <div style={{ padding: 16, background: `${COLORS.primary}10`, borderRadius: 12, marginBottom: 20, borderLeft: `4px solid ${COLORS.primary}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.primary, marginBottom: 6 }}>🎯 Positionnement Nami</div>
              <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>{aphpStrategy.positioning}</p>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>6 angles d&apos;attaque</div>
            {aphpStrategy.angles.map((angle, i) => (
              <div key={i} style={{ marginBottom: 12, padding: 16, background: COLORS.card, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.primary, marginBottom: 6 }}>{angle.title}</div>
                <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: COLORS.text }}>{angle.detail}</p>
              </div>
            ))}
            <div style={{ marginTop: 24, padding: 16, background: COLORS.redLight, borderRadius: 12, border: `1px solid ${COLORS.red}20` }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.red, marginBottom: 10 }}>🚫 Les interdits absolus avec l&apos;AP-HP</div>
              {aphpStrategy.doNot.map((d, i) => (
                <div key={i} style={{ fontSize: 13, padding: "4px 0", color: COLORS.text }}>❌ {d.replace("Ne JAMAIS ", "").replace("Ne ", "")}</div>
              ))}
            </div>
          </div>
        )}

        {/* PROMPT */}
        {activeTab === "prompt" && (
          <div>
            <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              Ce prompt systématise toute ta stratégie commerciale. Copie-le et utilise-le comme system prompt pour chaque tâche commerciale (emails, préparations de RDV, analyses de pipeline, etc.).
            </p>
            <div style={{ position: "relative" }}>
              <button
                onClick={copyPrompt}
                style={{
                  position: "sticky", top: 16, float: "right", zIndex: 10,
                  padding: "8px 16px", background: copied ? COLORS.green : COLORS.primary, color: "white",
                  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                {copied ? "✓ Copié !" : "📋 Copier le prompt"}
              </button>
              <pre style={{
                background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12,
                padding: 20, fontSize: 12, lineHeight: 1.6, overflowX: "auto",
                whiteSpace: "pre-wrap", wordBreak: "break-word", color: COLORS.text,
                maxHeight: 600, overflowY: "auto",
              }}>
                {megaPrompt}
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
