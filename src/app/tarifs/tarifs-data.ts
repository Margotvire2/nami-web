// Source canonique : nami-web/CLAUDE.md + project_pricing_arr.md (memory utilisateur).
// Verbatim, aucune invention. Mise à jour : 2026-05-26.
// Ne pas modifier sans relecture juridique (page haut risque DGCCRF / L113-3).

export const PRICING_REFERENCE_DATE = "26 mai 2026"

export interface PricingFeature {
  label: string
  included: boolean
}

export interface PricingTier {
  id: string
  audience: "patient" | "soignant" | "structure"
  tierName: string
  price: string
  priceUnit?: string
  badge?: string
  description: string
  features: string[]
  cta: { label: string; href: string }
  caveat?: string
}

// Patient (1 tier)
export const PATIENT_TIER: PricingTier = {
  id: "patient-acces",
  audience: "patient",
  tierName: "Accès patient",
  price: "0 €",
  priceUnit: "",
  description: "L'utilisation de Nami est sans frais pour les patients et leurs proches aidants.",
  features: [
    "Création de compte et accès à l'espace patient",
    "Prise de rendez-vous auprès des soignants référencés",
    "Messagerie avec votre équipe soignante",
    "Centralisation de vos documents de coordination",
    "Carnet de santé partagé avec votre équipe (selon votre consentement)",
  ],
  cta: { label: "Créer un compte patient", href: "/signup?role=patient" },
  caveat: `Tarif applicable au ${PRICING_REFERENCE_DATE} — sous réserve d'évolution.`,
}

// Soignant libéral (4 tiers)
export const SOIGNANT_TIERS: PricingTier[] = [
  {
    id: "soignant-gratuit",
    audience: "soignant",
    tierName: "Gratuit",
    price: "0 €",
    priceUnit: "/mois",
    description: "Pour démarrer et structurer son activité quotidienne.",
    features: [
      "Agenda et prise de rendez-vous",
      "Référencement dans l'annuaire (582 000 soignants)",
      "Messagerie avec les patients",
      "Messagerie avec les autres soignants",
      "Téléexpertise",
      "Accès au réseau de soignants",
    ],
    cta: { label: "Créer un compte soignant", href: "/signup?role=provider" },
    caveat: `Tarif applicable au ${PRICING_REFERENCE_DATE} — sous réserve d'évolution.`,
  },
  {
    id: "soignant-essentiel",
    audience: "soignant",
    tierName: "Essentiel",
    price: "19 €",
    priceUnit: "/mois HT",
    description: "Pour facturer et téléconsulter.",
    features: [
      "Tout le périmètre Gratuit",
      "Facturation (non-médecin)",
      "Visio et téléconsultation (sans commission)",
    ],
    cta: { label: "Demander une démo", href: "/demander-une-demo" },
    caveat: `Tarif applicable au ${PRICING_REFERENCE_DATE} — sous réserve d'évolution.`,
  },
  {
    id: "soignant-coordination",
    audience: "soignant",
    tierName: "Coordination",
    price: "79 €",
    priceUnit: "/mois HT",
    description: "Pour coordonner une équipe pluridisciplinaire.",
    features: [
      "Tout le périmètre Essentiel",
      "Adressage structuré entre soignants",
      "Application patient (transmission documents, suivi quotidien)",
      "Tableau de bord d'activité",
    ],
    cta: { label: "Demander une démo", href: "/demander-une-demo" },
    caveat: `Tarif applicable au ${PRICING_REFERENCE_DATE} — sous réserve d'évolution.`,
  },
  {
    id: "soignant-intelligence",
    audience: "soignant",
    tierName: "Intelligence",
    price: "149 €",
    priceUnit: "/mois HT",
    badge: "Le plus complet",
    description: "Pour les soignants qui veulent l'outil le plus abouti.",
    features: [
      "Tout le périmètre Coordination",
      "Synthèses IA sourcées (brouillon — vérification humaine obligatoire)",
      "Extraction biologique automatique",
      "Base documentaire structurée (22 308 sources : HAS, DSM-5, Orphanet, BDPM, ICD-11)",
      "Indicateurs de complétude du dossier",
      "Application mobile soignant complète",
    ],
    cta: { label: "Demander une démo", href: "/demander-une-demo" },
    caveat: `Tarif applicable au ${PRICING_REFERENCE_DATE} — sous réserve d'évolution.`,
  },
]

// Structure (Réseau / CPTS / hôpital)
export const STRUCTURE_TIER: PricingTier = {
  id: "structure-reseau",
  audience: "structure",
  tierName: "Réseau",
  price: "499 €",
  priceUnit: "/mois HT + 79 € HT / utilisateur",
  description: "Pour les CPTS, MSP, services hospitaliers, mutuelles et réseaux ville-hôpital.",
  features: [
    "Tout le périmètre Intelligence",
    "Configuration de parcours complexes sur mesure",
    "Vue pilote de l'avancement",
    "Multi-équipes",
    "Parcours conformes aux recommandations HAS",
    "Tableau de bord structures",
    "Administration et gestion des accès",
  ],
  cta: { label: "Nous contacter", href: "/demander-une-demo" },
  caveat: `Tarif applicable au ${PRICING_REFERENCE_DATE} — sous réserve d'évolution. Tarification forfaitaire CPTS disponible sur demande.`,
}

// Forfait CPTS (mention secondaire)
export const CPTS_FORFAITS = [
  { taille: "Taille 1 (<40 000 habitants)", prix: "2 400 € / an HT" },
  { taille: "Taille 2 (40 000 à 80 000 habitants)", prix: "3 600 € / an HT" },
  { taille: "Taille 3 (80 000 à 175 000 habitants)", prix: "4 800 € / an HT" },
  { taille: "Taille 4 (>175 000 habitants)", prix: "7 200 € / an HT" },
]

// Tableau comparatif
export interface ComparisonRow {
  category: string
  feature: string
  patient: boolean | string
  soignant: boolean | string
  structure: boolean | string
}

export const COMPARISON_TABLE: ComparisonRow[] = [
  // Coordination
  { category: "Coordination", feature: "Prise de rendez-vous", patient: true, soignant: true, structure: true },
  { category: "Coordination", feature: "Messagerie patients", patient: true, soignant: true, structure: true },
  { category: "Coordination", feature: "Messagerie inter-soignants", patient: "—", soignant: true, structure: true },
  { category: "Coordination", feature: "Adressage structuré", patient: "—", soignant: "Coordination et +", structure: true },
  { category: "Coordination", feature: "Parcours pluridisciplinaires", patient: "—", soignant: "—", structure: true },
  // Documents
  { category: "Documents", feature: "Centralisation des documents", patient: true, soignant: true, structure: true },
  { category: "Documents", feature: "Application patient (transmission)", patient: true, soignant: "Coordination et +", structure: true },
  { category: "Documents", feature: "Extraction biologique automatique", patient: "—", soignant: "Intelligence", structure: true },
  // Intelligence
  { category: "Intelligence", feature: "Synthèses IA sourcées (brouillon)", patient: "—", soignant: "Intelligence", structure: true },
  { category: "Intelligence", feature: "Base documentaire 22 308 sources", patient: "—", soignant: "Intelligence", structure: true },
  { category: "Intelligence", feature: "Indicateurs de complétude", patient: "—", soignant: "Intelligence", structure: true },
  // Facturation
  { category: "Facturation", feature: "Facturation (non-médecin)", patient: "—", soignant: "Essentiel et +", structure: true },
  { category: "Facturation", feature: "Visio / téléconsultation", patient: "—", soignant: "Essentiel et +", structure: true },
  { category: "Facturation", feature: "Tableau de bord d'activité", patient: "—", soignant: "Coordination et +", structure: true },
  // Pilotage
  { category: "Pilotage", feature: "Vue pilote multi-équipes", patient: "—", soignant: "—", structure: true },
  { category: "Pilotage", feature: "Administration et accès", patient: "—", soignant: "—", structure: true },
  // Support
  { category: "Support", feature: "Support par email", patient: true, soignant: true, structure: true },
  { category: "Support", feature: "Référent dédié", patient: "—", soignant: "—", structure: true },
]

// FAQ tarifaire
export interface PricingFAQ {
  id: string
  question: string
  answer: string
}

export const PRICING_FAQS: PricingFAQ[] = [
  {
    id: "patient-gratuit",
    question: "Pourquoi Nami est-il sans frais pour les patients ?",
    answer:
      "Nami est financé par les abonnements des soignants et des structures de soin. Les patients accèdent aux fonctionnalités de coordination sans frais. Aucune publicité, aucune revente de données.",
  },
  {
    id: "tva",
    question: "Les tarifs sont-ils en TTC ou en HT ?",
    answer:
      "Sauf mention contraire, les tarifs soignants et structures sont indiqués hors taxes (HT). La TVA applicable s'ajoute selon la réglementation en vigueur.",
  },
  {
    id: "evolution",
    question: "Les tarifs peuvent-ils évoluer ?",
    answer: `Conformément à l'article L113-3 du Code de la consommation, le tarif applicable est celui en vigueur à la date de souscription. Les tarifs publiés sur cette page sont valables au ${PRICING_REFERENCE_DATE} et peuvent évoluer. Tout changement applicable à un abonnement en cours est communiqué dans les conditions prévues par les conditions générales.`,
  },
  {
    id: "essai",
    question: "Existe-t-il une période d'essai pour les soignants ?",
    answer:
      "Le périmètre Gratuit reste accessible. Les périmètres payants peuvent faire l'objet d'une démonstration et d'un échange préalable via le formulaire dédié.",
  },
  {
    id: "cpts",
    question: "Quel est le modèle pour les CPTS et structures ?",
    answer:
      "Les CPTS et structures bénéficient d'une tarification forfaitaire fonction de leur taille (population couverte ou nombre d'utilisateurs). Les détails sont communiqués sur demande, en fonction du périmètre fonctionnel souhaité (intégration SSO, FHIR, etc.).",
  },
  {
    id: "paiement",
    question: "Quels moyens de paiement sont acceptés ?",
    answer:
      "Pour les soignants libéraux : carte bancaire et prélèvement SEPA. Pour les structures : virement bancaire sur facture. Les modalités précises figurent dans les conditions générales applicables à chaque catégorie d'abonnement.",
  },
]
