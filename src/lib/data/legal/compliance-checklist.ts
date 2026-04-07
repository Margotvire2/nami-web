/**
 * NAMI — Checklist de conformité par feature
 *
 * Avant de développer ou déployer une feature, le dev/PM vérifie
 * les conditions GO/NO-GO ici.
 *
 * Statut :
 *   - "go"     = safe, déployable
 *   - "go_si"  = déployable SI les conditions sont remplies
 *   - "no_go"  = bloqué en V1
 *   - "a_valider" = nécessite validation juridique avant dev
 */

export type FeatureStatus = "go" | "go_si" | "no_go" | "a_valider";

export interface ComplianceCheck {
  id: string;
  description: string;
  verifie: boolean;
}

export interface FeatureCompliance {
  feature: string;
  module: string;
  status: FeatureStatus;
  conditions: string[];
  checks: ComplianceCheck[];
  /** Si no_go : alternative safe proposée */
  alternativeSafe?: string;
}

// ============================================================================
// CHECKLIST PAR FEATURE
// ============================================================================

export const featureCompliance: FeatureCompliance[] = [
  // ── NOTIFICATIONS / ALERTES ──
  {
    feature: "Notification RDV à venir / annulé",
    module: "B_DM_BOUNDARY",
    status: "go_si",
    conditions: [
      "Contenu : date/heure uniquement, SANS spécialité ni motif",
      "Push : prévisualisation désactivée par défaut",
      "Opt-in patient par canal et horaires",
    ],
    checks: [
      { id: "notif_1", description: "Le texte de notification ne contient aucun terme médical", verifie: false },
      { id: "notif_2", description: "La prévisualisation push est désactivée par défaut", verifie: false },
      { id: "notif_3", description: "L'opt-in patient est implémenté", verifie: false },
    ],
  },
  {
    feature: "Notification tâche assignée / en retard",
    module: "B_DM_BOUNDARY",
    status: "go_si",
    conditions: [
      "Tâche créée par un humain (pas automatique)",
      "Contenu : titre de la tâche uniquement, pas de données patient",
    ],
    checks: [
      { id: "task_notif_1", description: "La tâche est créée par un professionnel (pas auto-générée)", verifie: false },
      { id: "task_notif_2", description: "La notification ne contient pas de données patient", verifie: false },
    ],
  },
  {
    feature: "Alertes cliniques / signaux / drapeaux",
    module: "B_DM_BOUNDARY",
    status: "no_go",
    conditions: [],
    checks: [],
    alternativeSafe:
      "Remplacer par des 'indicateurs de complétude du dossier' basés uniquement sur des métadonnées (dates, présence/absence de champs).",
  },
  {
    feature: "Indicateurs de complétude du dossier",
    module: "B_DM_BOUNDARY",
    status: "go_si",
    conditions: [
      "Basé UNIQUEMENT sur des métadonnées (dates, présence/absence de champs, objets admin)",
      "AUCUN input 'données de santé' (symptômes, poids, humeur, biologie)",
      "Wording : 'À compléter' / 'Éléments manquants' — JAMAIS 'à surveiller' / 'risque'",
      "Tooltip : 'Indicateurs non cliniques destinés à l'organisation du dossier'",
    ],
    checks: [
      { id: "completude_1", description: "Les règles ne dépendent QUE de métadonnées", verifie: false },
      { id: "completude_2", description: "Aucun input 'données de santé' comme trigger", verifie: false },
      { id: "completude_3", description: "Le wording est safe (pas de 'risque', 'surveiller', 'alerte')", verifie: false },
      { id: "completude_4", description: "Tooltip disclaimer présent", verifie: false },
    ],
  },

  // ── IA ──
  {
    feature: "Résumé IA (synthèse de notes existantes)",
    module: "C_AI",
    status: "go_si",
    conditions: [
      "Résumé extractif UNIQUEMENT (pas d'inférence/interprétation)",
      "Affiché comme 'Brouillon IA — à vérifier'",
      "Bouton 'Voir les sources' + traçabilité complète",
      "Validation humaine obligatoire avant insertion",
      "Filtres lexicaux sur les outputs (mots interdits bloqués)",
      "DPA sous-traitant IA : no training, retention = 0, localisation UE",
      "Pseudonymisation des inputs (pas nom/prénom dans prompts)",
      "DPIA réalisée incluant l'IA",
    ],
    checks: [
      { id: "ai_1", description: "Badge 'Brouillon IA — à vérifier' affiché", verifie: false },
      { id: "ai_2", description: "Bouton 'Voir les sources' implémenté", verifie: false },
      { id: "ai_3", description: "Validation humaine avant insertion dans le dossier", verifie: false },
      { id: "ai_4", description: "Filtres lexicaux actifs sur les outputs", verifie: false },
      { id: "ai_5", description: "DPA sous-traitant IA signé (no training, no retention)", verifie: false },
      { id: "ai_6", description: "Inputs pseudonymisés", verifie: false },
      { id: "ai_7", description: "Table de traçabilité IA en place", verifie: false },
      { id: "ai_8", description: "DPIA réalisée", verifie: false },
    ],
  },
  {
    feature: "Détection de care gaps (IA ou règles)",
    module: "B_DM_BOUNDARY",
    status: "no_go",
    conditions: [],
    checks: [],
    alternativeSafe:
      "Transformer en 'indicateurs de complétude du dossier' (éléments manquants basés sur métadonnées uniquement).",
  },
  {
    feature: "Suggestions de suivi / points à surveiller",
    module: "B_DM_BOUNDARY",
    status: "no_go",
    conditions: [],
    checks: [],
    alternativeSafe:
      "Remplacer par des templates de tâches de coordination configurés par les équipes (manuels, non cliniques).",
  },
  {
    feature: "Priorisation / tri automatique de patients",
    module: "B_DM_BOUNDARY",
    status: "no_go",
    conditions: [],
    checks: [],
    alternativeSafe:
      "Tâches manuelles créées par les professionnels. Ordre d'affichage par date uniquement.",
  },

  // ── MESSAGERIE ──
  {
    feature: "Messagerie de coordination",
    module: "D_MESSAGING",
    status: "go_si",
    conditions: [
      "Triple barrière anti-urgence (bannière + interstitiel + microcopy)",
      "Bouton 'Urgence ?' → redirige vers 15/112 (n'envoie PAS de message)",
      "Pas de statut 'lu/vu' côté patient (utiliser 'Délivré')",
      "Push/email : uniquement 'Nouveau message' (zéro contenu médical)",
      "Accès limité à la care team du patient",
      "Décision d'archivage prise (modèle A ou B)",
      "Charte d'usage définie",
    ],
    checks: [
      { id: "msg_1", description: "Bannière permanente 'non urgence' dans l'écran chat", verifie: false },
      { id: "msg_2", description: "Interstitiel première utilisation avec checkbox", verifie: false },
      { id: "msg_3", description: "Microcopy 'En cas d'urgence : 15/112' dans zone de saisie", verifie: false },
      { id: "msg_4", description: "Bouton 'Urgence ?' redirige vers 15/112", verifie: false },
      { id: "msg_5", description: "Pas de statut 'lu' côté patient", verifie: false },
      { id: "msg_6", description: "Notifications sans contenu médical", verifie: false },
      { id: "msg_7", description: "Accès limité à la care team", verifie: false },
      { id: "msg_8", description: "Modèle d'archivage décidé (A ou B)", verifie: false },
    ],
  },

  // ── JOURNAL PATIENT ──
  {
    feature: "Journal patient (repas, émotions, activité)",
    module: "E_PATIENT_JOURNAL",
    status: "go_si",
    conditions: [
      "Positionné comme 'préparation de consultation' (asynchrone)",
      "Disclaimers à 3 niveaux (activation, saisie, messagerie)",
      "Bouton 'Urgence ?' → 15/112",
      "RBAC strict : journal = care team uniquement, label 'sensible+'",
      "Option patient : 'partager avec l'équipe' vs 'garder privé'",
      "Push : 'Nouvelle entrée' uniquement (JAMAIS le contenu)",
      "AUCUNE automatisation basée sur le contenu",
      "DPIA réalisée",
    ],
    checks: [
      { id: "journal_1", description: "Disclaimer 'pas de surveillance en continu' à l'activation", verifie: false },
      { id: "journal_2", description: "Disclaimer dans l'écran de saisie", verifie: false },
      { id: "journal_3", description: "Bouton 'Urgence ?' → 15/112", verifie: false },
      { id: "journal_4", description: "Accès journal limité (care team + label sensible+)", verifie: false },
      { id: "journal_5", description: "Option de partage par entrée", verifie: false },
      { id: "journal_6", description: "Notifications sans contenu", verifie: false },
      { id: "journal_7", description: "Aucune règle automatique sur le contenu", verifie: false },
      { id: "journal_8", description: "DPIA réalisée", verifie: false },
    ],
  },

  // ── ACCÈS / RBAC ──
  {
    feature: "Modèle d'accès care team par patient",
    module: "F_ACCESS_RBAC",
    status: "go_si",
    conditions: [
      "Tenant isolation stricte",
      "Accès patient = care team explicite uniquement",
      "RBAC : Clinicien éditeur / lecteur / Coordination / Admin technique (zéro contenu santé)",
      "ABAC labels : 'sensible+' pour psy/TCA/violences/journal",
      "Audit logs sur tous les accès",
      "MFA obligatoire",
      "Offboarding J0 automatique",
      "Break-glass avec motif + durée + logs",
    ],
    checks: [
      { id: "rbac_1", description: "Isolation tenant stricte", verifie: false },
      { id: "rbac_2", description: "Accès uniquement via care team explicite", verifie: false },
      { id: "rbac_3", description: "Rôles RBAC implémentés", verifie: false },
      { id: "rbac_4", description: "Labels ABAC 'sensible+' en place", verifie: false },
      { id: "rbac_5", description: "Audit logs complets", verifie: false },
      { id: "rbac_6", description: "MFA obligatoire pour les pros", verifie: false },
      { id: "rbac_7", description: "Offboarding automatique implémenté", verifie: false },
      { id: "rbac_8", description: "Break-glass opérationnel", verifie: false },
    ],
  },

  // ── NOTES & DOCUMENTS ──
  {
    feature: "Notes cliniques avec versioning",
    module: "G_NOTES_DOCS",
    status: "go_si",
    conditions: [
      "Auteur + horodatage + type obligatoires",
      "Versioning append-only ou historique consultable",
      "Suppression = logique avec motif + trace",
      "Rectification par addendum uniquement",
      "Nommage : 'dossier de coordination' (jamais 'DMP' ou 'dossier médical')",
    ],
    checks: [
      { id: "notes_1", description: "Champs auteur + timestamp obligatoires", verifie: false },
      { id: "notes_2", description: "Versioning implémenté (addendum ou historique)", verifie: false },
      { id: "notes_3", description: "Pas de suppression silencieuse", verifie: false },
    ],
  },
  {
    feature: "Upload de documents",
    module: "G_NOTES_DOCS",
    status: "go_si",
    conditions: [
      "Scan antivirus obligatoire",
      "Types autorisés : PDF, PNG, JPG uniquement",
      "Exécutables interdits",
      "Liens de téléchargement temporaires avec logs",
      "Hash d'intégrité conservé",
    ],
    checks: [
      { id: "docs_1", description: "Antivirus actif sur uploads", verifie: false },
      { id: "docs_2", description: "Filtrage des types de fichiers", verifie: false },
      { id: "docs_3", description: "Logs de téléchargement", verifie: false },
    ],
  },

  // ── ORIENTATION / RÉPERTOIRE ──
  {
    feature: "Répertoire de professionnels",
    module: "I_ORIENTATION",
    status: "go_si",
    conditions: [
      "Ordre par défaut : alphabétique ou distance",
      "Filtres objectifs uniquement (spécialité, lieu, langue, disponibilité)",
      "AUCUN ranking, score, 'recommandé', 'top', 'pertinence'",
      "Pas de référencement payant",
      "Vérification KYP avant listing (RPPS/ADELI ou validation organisationnelle)",
      "Anti-scraping + rate-limiting",
    ],
    checks: [
      { id: "rep_1", description: "Ordre alphabétique ou distance par défaut", verifie: false },
      { id: "rep_2", description: "Aucun ranking / recommandation", verifie: false },
      { id: "rep_3", description: "Vérification professionnelle avant listing", verifie: false },
      { id: "rep_4", description: "Anti-scraping en place", verifie: false },
    ],
  },
  {
    feature: "Matching / recommandation de professionnels",
    module: "I_ORIENTATION",
    status: "no_go",
    conditions: [],
    checks: [],
    alternativeSafe:
      "Utiliser un annuaire neutre avec filtres objectifs. L'adressage est initié par le professionnel, pas par Nami.",
  },

  // ── NO-SHOW / PAIEMENT ──
  {
    feature: "Empreinte bancaire / no-show",
    module: "H_APPOINTMENT_NOSHOW",
    status: "go_si",
    conditions: [
      "Nami = intermédiaire technique, PSP = tokenisation (Nami ne stocke JAMAIS de carte)",
      "Consentement explicite : écran conditions + checkbox + auth PSP (SCA)",
      "Montant et conditions d'annulation affichés clairement",
      "Prélèvement déclenché par le professionnel (action humaine)",
      "Process de contestation défini",
      "Désactivé par défaut pour les mineurs",
      "Validation déontologique par profession",
    ],
    checks: [
      { id: "noshow_1", description: "Architecture PSP (pas de stockage carte)", verifie: false },
      { id: "noshow_2", description: "Consentement explicite (checkbox + SCA)", verifie: false },
      { id: "noshow_3", description: "Conditions affichées clairement", verifie: false },
      { id: "noshow_4", description: "Prélèvement = action humaine du pro", verifie: false },
      { id: "noshow_5", description: "Process de contestation en place", verifie: false },
    ],
  },

  // ── HDS / INFRASTRUCTURE ──
  {
    feature: "Hébergement des données de santé",
    module: "J_HDS",
    status: "go_si",
    conditions: [
      "Hébergeur certifié HDS (attestation couvrant compute, DB, stockage, backups)",
      "Cartographie complète de la chaîne sous-traitants",
      "Zéro contenu santé dans les logs (scrubbers actifs)",
      "Staging/dev = données synthétiques uniquement",
      "Break-glass pour accès interne (2 personnes, motif, durée limitée)",
      "Backups chiffrés + rétention définie + restauration testée",
      "MFA pour accès cloud + comptes nominatifs + least privilege",
    ],
    checks: [
      { id: "hds_1", description: "Attestation HDS du prestataire obtenue", verifie: false },
      { id: "hds_2", description: "Cartographie sous-traitants complète", verifie: false },
      { id: "hds_3", description: "Scrubbers logs actifs (zéro contenu santé)", verifie: false },
      { id: "hds_4", description: "Données de test synthétiques", verifie: false },
      { id: "hds_5", description: "Break-glass opérationnel", verifie: false },
      { id: "hds_6", description: "Backups chiffrés + restauration testée", verifie: false },
      { id: "hds_7", description: "MFA + comptes nominatifs cloud", verifie: false },
    ],
  },

  // ── RGPD ──
  {
    feature: "DPIA (Analyse d'Impact)",
    module: "K_RGPD",
    status: "go_si",
    conditions: [
      "DPIA réalisée couvrant : données santé + messagerie + IA + journal patient",
      "Matrice rôles RGPD par module (RT/ST/co-RT)",
      "DPA template signé avec les clients",
      "Politique de conservation par type de données définie",
    ],
    checks: [
      { id: "rgpd_1", description: "DPIA complète réalisée", verifie: false },
      { id: "rgpd_2", description: "Matrice rôles RGPD par module finalisée", verifie: false },
      { id: "rgpd_3", description: "DPA template prêt", verifie: false },
      { id: "rgpd_4", description: "Politique de conservation définie", verifie: false },
    ],
  },
];

// ============================================================================
// HELPERS
// ============================================================================

/** Features bloquées en V1 */
export function getBlockedFeatures(): FeatureCompliance[] {
  return featureCompliance.filter((f) => f.status === "no_go");
}

/** Features nécessitant des conditions */
export function getConditionalFeatures(): FeatureCompliance[] {
  return featureCompliance.filter((f) => f.status === "go_si");
}

/** Checks non vérifiés (backlog de conformité) */
export function getUnverifiedChecks(): { feature: string; check: ComplianceCheck }[] {
  return featureCompliance.flatMap((f) =>
    f.checks
      .filter((c) => !c.verifie)
      .map((c) => ({ feature: f.feature, check: c }))
  );
}

/** Résumé de conformité */
export function getComplianceSummary(): {
  total: number;
  go: number;
  goSi: number;
  noGo: number;
  aValider: number;
  checksTotal: number;
  checksVerifies: number;
} {
  const checks = featureCompliance.flatMap((f) => f.checks);
  return {
    total: featureCompliance.length,
    go: featureCompliance.filter((f) => f.status === "go").length,
    goSi: featureCompliance.filter((f) => f.status === "go_si").length,
    noGo: featureCompliance.filter((f) => f.status === "no_go").length,
    aValider: featureCompliance.filter((f) => f.status === "a_valider").length,
    checksTotal: checks.length,
    checksVerifies: checks.filter((c) => c.verifie).length,
  };
}
