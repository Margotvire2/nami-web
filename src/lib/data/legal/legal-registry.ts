/**
 * NAMI — Registre Juridique & Réglementaire
 *
 * Base de données de conformité pour le développement de Nami.
 * Croisement entre :
 *   - L'analyse juridique appliquée (Legal Nami, avril 2026)
 *   - Le cadre théorique (cours M2 Droit de la santé numérique, Paris 8)
 *
 * Chaque module est évalué sur : risques, interdits, autorisés, actions requises,
 * et stratégie VC-compatible.
 *
 * RÈGLE CENTRALE :
 * "Toute fonctionnalité qui peut raisonnablement être utilisée pour décider
 *  'qui relancer ?', 'qui est à risque ?', 'qui doit être vu en priorité ?',
 *  'quoi faire cliniquement ?' = risque DM/télésurveillance → BLOQUÉE
 *  tant qu'elle n'est pas réduite à de la complétude / organisation."
 */

// ============================================================================
// TYPES
// ============================================================================

export type RiskLevel = "critique" | "eleve" | "modere" | "faible";
export type ModuleStatus = "bloque" | "a_recadrer" | "validable_sous_conditions";
export type ActionPriority = "bloquant_go" | "avant_lancement" | "moyen_terme";

export interface LegalRisk {
  id: string;
  description: string;
  gravite: RiskLevel;
  probabilite: RiskLevel;
  pourquoi: string;
  /** Seuil de bascule — quand exactement ce risque se matérialise */
  trigger: string;
}

export interface LegalAction {
  id: string;
  description: string;
  owner: "cto" | "produit" | "juridique" | "dpo" | "rssi" | "marketing" | "tous";
  priorite: ActionPriority;
  details: string;
}

export interface WordingRule {
  interdit: string;
  remplacement: string;
  contexte: string;
}

export interface LegalModule {
  id: string;
  nom: string;
  status: ModuleStatus;
  risqueGlobal: RiskLevel;
  resume: string;
  /** Cadre juridique applicable (articles, lois, règlements) */
  cadreJuridique: string[];
  risques: LegalRisk[];
  /** Ce qui est formellement interdit */
  interdits: string[];
  /** Ce qui est autorisé (zone safe) */
  autorises: string[];
  /** Actions requises pour passer en GO */
  actions: LegalAction[];
  /** Règles de wording (mots interdits → remplacements) */
  wording: WordingRule[];
  /** Documents/preuves manquants */
  documentsManquants: string[];
  /** Texte standard à ajouter (disclaimers, tooltips) */
  disclaimers: string[];
  /** Recommandation de réécriture pour la note avocat */
  reecritureAvocat: string;
}

// ============================================================================
// A) POSITIONNEMENT / MARKETING / WORDING
// ============================================================================

export const positioningModule: LegalModule = {
  id: "A_POSITIONING",
  nom: "Positionnement / Marketing / Promesse",
  status: "a_recadrer",
  risqueGlobal: "eleve",
  resume:
    "Les mots 'suivi longitudinal', 'continuité de prise en charge', 'signaux', 'vigilance' déclenchent une lecture 'surveillance clinique / DM / télésurveillance' même si l'intention est 'coordination'.",
  cadreJuridique: [
    "Règlement UE 2017/745 (MDR) — qualification DM logiciel",
    "MDCG 2019-11 rev.1 (juin 2025) — guidance qualification software",
    "Art. L5211-1 CSP — définition dispositif médical",
    "Art. R6316-1 CSP — télémédecine / télésurveillance",
    "Code de la consommation — pratiques commerciales trompeuses",
  ],
  risques: [
    {
      id: "A1",
      description: "Requalification DM/télésurveillance par vocabulaire",
      gravite: "critique",
      probabilite: "eleve",
      pourquoi:
        "Le vocabulaire déclenche l'analyse réglementaire avant même l'examen des features.",
      trigger:
        "Dès que le produit est compris comme 'il surveille entre deux consultations' ou 'il alerte sur des situations patients'.",
    },
    {
      id: "A2",
      description: "Publicité / communication trompeuse (promesse implicite)",
      gravite: "eleve",
      probabilite: "modere",
      pourquoi:
        "'Continuité de prise en charge' + 'signaux/vigilance' = promesse de sécurité ou réactivité opposable en cas d'incident.",
      trigger:
        "Dès que la formulation laisse croire que Nami réduit un risque clinique ou assure une vigilance.",
    },
    {
      id: "A3",
      description: "Faux sentiment de surveillance (risque contentieux)",
      gravite: "eleve",
      probabilite: "modere",
      pourquoi:
        "Patients/pros peuvent croire qu'un 'signal' sera vu/traité → reproche en cas d'incident ('vous aviez l'info').",
      trigger:
        "Dès que l'utilisateur peut raisonnablement croire : 'Si je saisis un symptôme, l'équipe sera alertée.'",
    },
  ],
  interdits: [
    "'suivi longitudinal', 'surveillance', 'monitoring'",
    "'continuité de prise en charge'",
    "'signaux', 'vigilance', 'drapeaux', 'alertes cliniques'",
    "'détection', 'prévention', 'sécuriser', 'réduire les risques', 'éviter les complications'",
    "'entre deux consultations on suit / on veille'",
    "'ne laissez plus rien passer', 'tranquillité d'esprit', 'filet de sécurité'",
    "Verbes : détecter, surveiller, alerter, prévenir, sécuriser, réduire le risque",
  ],
  autorises: [
    "'centralise', 'structure', 'partage', 'trace', 'facilite la coordination'",
    "'continuité de coordination / continuité informationnelle'",
    "'indicateurs de complétude / rappels organisationnels'",
    "'notifications organisationnelles (RDV, tâches, complétude du dossier)'",
    "Verbes : centraliser, structurer, partager, documenter, coordonner, tracer",
  ],
  actions: [
    {
      id: "A_ACT1",
      description: "Créer un Claims Registry (phrases autorisées) avec validation juridique",
      owner: "marketing",
      priorite: "bloquant_go",
      details:
        "Liste de toutes les formulations marketing avec statut OK / INTERDIT / À REFORMULER.",
    },
    {
      id: "A_ACT2",
      description:
        "Implémenter un lexique de mots interdits comme check automatisé (linting contenu / strings UI / pages web)",
      owner: "cto",
      priorite: "bloquant_go",
      details:
        "Voir forbidden-words.ts — à intégrer dans le pipeline CI/CD comme lint sur les strings.",
    },
    {
      id: "A_ACT3",
      description: "Ajouter le disclaimer universel partout (deck, site, onboarding, CGU, CGV)",
      owner: "tous",
      priorite: "bloquant_go",
      details:
        "Texte standard : voir disclaimers ci-dessous.",
    },
  ],
  wording: [
    {
      interdit: "suivi longitudinal",
      remplacement: "coordination dans la durée / organisation du parcours",
      contexte: "Partout (site, deck, CGU, UI, onboarding)",
    },
    {
      interdit: "continuité de prise en charge",
      remplacement: "continuité de coordination / continuité informationnelle",
      contexte: "Partout",
    },
    {
      interdit: "signaux",
      remplacement: "indicateurs de complétude / activité du dossier",
      contexte: "Partout",
    },
    {
      interdit: "vigilance",
      remplacement: "checklist de coordination / à compléter",
      contexte: "Partout",
    },
    {
      interdit: "alerte",
      remplacement: "notification / rappel (organisationnel uniquement)",
      contexte: "Partout",
    },
    {
      interdit: "détecter / identifier",
      remplacement: "mettre en évidence des éléments manquants",
      contexte: "Partout",
    },
    {
      interdit: "prévenir / sécuriser",
      remplacement: "centraliser / structurer / documenter",
      contexte: "Partout",
    },
  ],
  documentsManquants: [
    "Copie des écrans : dashboard, alertes, 'signaux', onboarding",
    "Copie des pages marketing / deck / app store description",
    "Glossaire interne (mots autorisés/interdits) + owner de validation",
  ],
  disclaimers: [
    "Nami est un outil de coordination et de documentation. Il ne réalise pas de diagnostic, ne produit pas d'alerte clinique et n'assure pas de surveillance en temps réel. Il ne remplace pas une consultation. En cas d'urgence, contacter le 15/112.",
  ],
  reecritureAvocat:
    "Nami est une plateforme de coordination et de structuration du parcours, conçue pour faciliter la consolidation et le partage d'informations entre consultations, au sein d'une équipe de prise en charge. Nami n'a pas vocation à réaliser un diagnostic, ni à produire des alertes cliniques, ni à assurer une surveillance en temps réel ; il s'agit d'un outil d'organisation, de documentation et de communication.",
};

// ============================================================================
// B) FRONTIÈRE DM / TÉLÉSURVEILLANCE
// ============================================================================

export const dmBoundaryModule: LegalModule = {
  id: "B_DM_BOUNDARY",
  nom: "Frontière Dispositif Médical / Télésurveillance",
  status: "bloque",
  risqueGlobal: "critique",
  resume:
    "Les alertes 'cliniques', la détection de 'care gaps', le scoring, les suggestions de suivi et les 'signaux' constituent les déclencheurs les plus directs de requalification en DM logiciel (MDR) et/ou télésurveillance.",
  cadreJuridique: [
    "Règlement UE 2017/745 (MDR) — Art. 2(1) définition DM",
    "MDCG 2019-11 rev.1 (juin 2025) — qualification/classification software",
    "Arrêt CJUE SNITEM c/Min. affaires sociales (2017) — test de qualification logiciel DM",
    "Art. R6316-1 CSP — définition télésurveillance médicale",
    "Décret 2023-1017 — télésurveillance droit commun",
    "ANSM — guidance logiciels dispositifs médicaux",
  ],
  risques: [
    {
      id: "B1",
      description: "Requalification DM logiciel par finalité des alertes",
      gravite: "critique",
      probabilite: "eleve",
      pourquoi:
        "'Alerte patient' = information qui oriente une décision. C'est la zone grise exacte où les autorités basculent.",
      trigger:
        "L'alerte est déclenchée par une donnée de santé (symptôme, score, variation, seuil) ou présente une 'signification' clinique.",
    },
    {
      id: "B2",
      description: "Télésurveillance 'de fait' + attente de réaction",
      gravite: "eleve",
      probabilite: "eleve",
      pourquoi:
        "Patient saisit symptômes + cockpit soignant + signaux = narratif 'surveillance'.",
      trigger:
        "Données patient (symptômes, poids, humeur) déclenchent des alertes à distance qui appellent une réaction.",
    },
    {
      id: "B3",
      description: "IA produisant une information 'nouvelle' (inférence) = DM probable",
      gravite: "critique",
      probabilite: "modere",
      pourquoi:
        "Un résumé qui interprète ou déduit = information clinique nouvelle. Arrêt SNITEM : logiciel qui exploite données patient-spécifiques pour finalité médicale = DM.",
      trigger:
        "Le résumé contient : 'probable', 'à surveiller', 'suggère', 'recommande', 'risque', 'urgence', ou une liste d'actions.",
    },
    {
      id: "B4",
      description: "Responsabilité 'non-traitement d'alerte/signal/care gap'",
      gravite: "eleve",
      probabilite: "modere",
      pourquoi:
        "Incident + log d'une alerte/gap non traitée = preuve à charge.",
      trigger:
        "Tout log montrant qu'un 'signal' ou 'care gap' a été affiché mais non traité.",
    },
  ],
  interdits: [
    // Alertes
    "'alertes cliniques', 'alertes santé', 'signaux', 'drapeaux rouges'",
    "Toute alerte déclenchée par : symptômes, poids/IMC, humeur/émotions, observance, biologie",
    "Couleurs/icônes de danger associées à un patient (rouge, triangle, 'high risk')",
    "CTA type : 'contacter le patient', 'adapter le plan', 'évaluer' à partir d'une alerte",
    // Care gaps
    "'Care gap' = insuffisance de suivi médical, relance patient, risque",
    "'Bilan manquant', 'consultation manquante', 'dépistage à faire', 'non observance'",
    // Suggestions
    "'À surveiller', 'Nous recommandons', 'Le patient devrait', 'Action : contacter/relancer/revoir/prescrire'",
    "Toute suggestion calculée à partir de données de santé",
    // Scoring
    "Tout score basé sur données de santé = requalification MDR quasi-automatique",
    // IA
    "Résumé IA contenant : 'diagnostic probable', 'hypothèse', 'risque', 'gravité', 'à faire/prescrire/surveiller'",
    "Génération automatique envoyée au patient",
    "Auto-insertion dans le dossier sans validation humaine",
  ],
  autorises: [
    // Notifications organisationnelles (catégorie A)
    "RDV à venir / RDV annulé",
    "Tâche assignée / tâche en retard (créée par un humain)",
    "Nouveau document ajouté",
    "Message reçu (sans connotation urgence)",
    // Indicateurs de complétude (catégorie B)
    "'Aucun RDV planifié'",
    "'Aucun compte-rendu joint'",
    "'Journal non alimenté depuis X jours' (présenté comme 'activité du dossier')",
    "'Dernière mise à jour du dossier : [date]'",
    "'Tâches en attente' (créées par l'équipe, pas générées automatiquement)",
    // IA safe
    "Résumé de textes existants en rubriques (Contexte, Historique, Traitements rapportés, Événements)",
    "Structuration en rubriques sans ajout — chaque phrase traçable à une source",
    "Badge 'Brouillon IA — à vérifier' + bouton 'Insérer après validation' + 'Voir les sources'",
    // Checklists manuelles
    "Templates de tâches pré-écrites par la structure (configuration humaine)",
    "Rappels de RDV / tâches créées par un humain",
  ],
  actions: [
    {
      id: "B_ACT1",
      description: "Geler en V1 : alertes cliniques, care gaps, scoring, priorisation, recommandations",
      owner: "cto",
      priorite: "bloquant_go",
      details:
        "Feature flags OFF en prod : care_gaps, clinical_alerts, scoring, recommendations, patient_prioritization.",
    },
    {
      id: "B_ACT2",
      description: "Bloquer techniquement toute règle basée sur données de santé",
      owner: "cto",
      priorite: "bloquant_go",
      details:
        "Les règles de 'gaps' / notifications ne peuvent dépendre QUE de métadonnées (dates, présence/absence de champs) et objets administratifs (RDV, documents, tâches). Interdiction d'inputs 'données de santé' comme trigger.",
    },
    {
      id: "B_ACT3",
      description: "Renommer 'Alertes' → 'Notifications' ou 'Activité du dossier'",
      owner: "produit",
      priorite: "bloquant_go",
      details: "Renommer dans toute l'UI + base de données + API.",
    },
    {
      id: "B_ACT4",
      description: "Implémenter la traçabilité IA complète",
      owner: "cto",
      priorite: "bloquant_go",
      details:
        "Table : generation_id, model_name, model_version, prompt_template_version, sources[], output, status (accepted/modified/rejected), validator_user_id, timestamp.",
    },
    {
      id: "B_ACT5",
      description: "Dossier interne 'anti-DM' : argumentaire de qualification",
      owner: "juridique",
      priorite: "avant_lancement",
      details:
        "Matrice : chaque feature → finalité → 'organisationnel vs médical' + justification. Captures écran + wording final.",
    },
    {
      id: "B_ACT6",
      description: "Filtres lexicaux sur outputs IA",
      owner: "cto",
      priorite: "bloquant_go",
      details:
        "Bloquer en sortie les mots : 'probable', 'recommander', 'risque', 'urgence', 'à surveiller', 'danger', 'anormal', 'non observance'. + Revue humaine obligatoire.",
    },
  ],
  wording: [
    {
      interdit: "alertes organisationnelles ou cliniques simples",
      remplacement: "notifications organisationnelles et indicateurs de complétude du dossier (non cliniques)",
      contexte: "UI, note avocat, CGU",
    },
    {
      interdit: "points de vigilance",
      remplacement: "checklist de coordination (documents, rendez-vous, tâches)",
      contexte: "UI, note avocat",
    },
    {
      interdit: "consulter des signaux de suivi",
      remplacement: "consulter des indicateurs de complétude et d'activité du dossier (non cliniques)",
      contexte: "Flux décrits dans la note avocat, UI",
    },
    {
      interdit: "résumés IA et détection de care gaps",
      remplacement: "résumés automatiques (brouillons) et indicateurs de complétude de dossier (non cliniques)",
      contexte: "Note avocat, UI, deck",
    },
    {
      interdit: "suggestions de suivi ou de points à surveiller",
      remplacement: "templates de tâches de coordination configurés par les équipes (non cliniques), sans recommandations médicales automatisées",
      contexte: "Note avocat, roadmap",
    },
  ],
  documentsManquants: [
    "Matrice de qualification : chaque feature → finalité → organisationnel vs médical",
    "Exemples réels d'outputs IA (10 exemples) avec texte exact affiché",
    "Screens des écrans 'alertes/signaux/vigilance'",
    "Spécification IA : entrées/sorties/interdits/tests anti-hallucination",
    "DPIA incluant l'IA",
  ],
  disclaimers: [
    "Les notifications n'ont pas vocation à signaler un état de santé ou une urgence. Nami n'assure pas de surveillance en temps réel.",
    "Indicateurs non cliniques destinés à l'organisation du dossier. Ne constitue pas une alerte médicale.",
    "Contenu généré automatiquement — brouillon à vérifier par un professionnel avant usage.",
  ],
  reecritureAvocat:
    "Nami permet de consulter des indicateurs de complétude et d'activité du dossier (non cliniques) pour organiser la coordination. Les résumés automatiques sont des brouillons de synthèse de contenus existants, sans interprétation clinique ni recommandation, soumis à validation humaine obligatoire.",
};

// ============================================================================
// C) IA — RÉSUMÉS, GOVERNANCE, SOUS-TRAITANCE
// ============================================================================

export const aiModule: LegalModule = {
  id: "C_AI",
  nom: "Intelligence Artificielle (résumés, structuration, gouvernance)",
  status: "validable_sous_conditions",
  risqueGlobal: "critique",
  resume:
    "L'IA est autorisée uniquement pour résumé/structuration de contenus existants, affichée comme brouillon, avec validation humaine. Tout output interprétatif, prescriptif ou inférentiel est bloqué.",
  cadreJuridique: [
    "AI Act (Règlement UE 2024/1689) — obligations selon niveau de risque",
    "RGPD Art. 22 — décision automatisée",
    "RGPD Art. 35 — DPIA obligatoire (données santé + IA)",
    "MDR 2017/745 — si IA produit information orientant prise en charge = DM",
    "MDCG 2019-11 — qualification logiciel comme DM",
    "Recommandations CNIL sur l'IA (2024-2025)",
  ],
  risques: [
    {
      id: "C1",
      description: "Hallucination intégrée au dossier",
      gravite: "eleve",
      probabilite: "eleve",
      pourquoi:
        "Soignant copie-colle un résumé faux → dommage traçable + réputation.",
      trigger: "Résumé IA inséré dans le dossier sans validation humaine.",
    },
    {
      id: "C2",
      description: "Requalification DM par 'information nouvelle'",
      gravite: "critique",
      probabilite: "modere",
      pourquoi:
        "Un résumé qui interprète ou déduit = information clinique (arrêt SNITEM).",
      trigger:
        "Le résumé contient un diagnostic, une hypothèse, un score, une recommandation.",
    },
    {
      id: "C3",
      description: "Données de santé envoyées à un LLM tiers",
      gravite: "eleve",
      probabilite: "eleve",
      pourquoi:
        "Transferts, retention, training, sécurité, sous-traitance non encadrée.",
      trigger: "Appel API LLM contenant des données de santé sans DPA ni clauses.",
    },
  ],
  interdits: [
    "Tout output interprétatif : hypothèses, recommandations, scores, tri",
    "Mots en sortie : 'probable', 'recommander', 'risque', 'urgence', 'à surveiller', 'non observance'",
    "Auto-insertion dans le dossier sans étape de validation humaine",
    "Génération envoyée au patient",
    "Utilisation de données client pour entraîner des modèles (no training)",
    "IA sur champs hypersensibles (psy, violences, mineurs) sans opt-in explicite",
  ],
  autorises: [
    "Résumé extractif de textes existants en rubriques (Contexte, Historique, Traitements rapportés)",
    "Structuration en catégories sans inférence — chaque phrase traçable à une source",
    "Checklist de complétude de dossier (champs vides, docs manquants) — administratif",
    "Badge 'Brouillon IA — à vérifier' + 'Voir les sources' + confirmation obligatoire",
  ],
  actions: [
    {
      id: "C_ACT1",
      description: "DPA avec sous-traitant IA : no training, retention = 0, localisation UE",
      owner: "juridique",
      priorite: "bloquant_go",
      details:
        "Clauses impératives : no training, no retention (ou durée très courte contractualisée), localisation UE si possible, sous-traitants listés, interdiction transferts non encadrés, audit.",
    },
    {
      id: "C_ACT2",
      description: "Pseudonymisation des inputs IA",
      owner: "cto",
      priorite: "bloquant_go",
      details:
        "Pas nom/prénom dans les prompts. Extraction 'snippets' plutôt que dossier complet. Paramètre : désactiver IA sur champs sensibles (psy, violences).",
    },
    {
      id: "C_ACT3",
      description: "DPIA incluant l'IA",
      owner: "dpo",
      priorite: "bloquant_go",
      details: "Quasi-obligatoire : données santé + IA + messagerie.",
    },
    {
      id: "C_ACT4",
      description: "Content policy : filtres lexicaux + kill switch",
      owner: "cto",
      priorite: "bloquant_go",
      details:
        "Filtres sur outputs (mots interdits). Kill switch global IA. Process incident + rollback.",
    },
  ],
  wording: [
    {
      interdit: "Résumés IA",
      remplacement: "Synthèses automatiques de contenus existants (brouillons à valider)",
      contexte: "Note avocat, UI, deck",
    },
  ],
  documentsManquants: [
    "Spécification IA détaillée (entrées/sorties/interdits)",
    "10 exemples d'outputs actuels + captures écran",
    "Liste des prestataires IA + lieux de traitement + clauses contractuelles",
    "DPIA brouillon incluant l'IA",
    "AI Governance Register : modèles, versions, finalités, données, risques, contrôles",
  ],
  disclaimers: [
    "Contenu généré automatiquement — brouillon destiné à faciliter la lecture. Il doit être vérifié par un professionnel avant usage.",
  ],
  reecritureAvocat:
    "Synthèses automatiques de contenus existants (brouillons à valider), sans interprétation clinique ni recommandation.",
};

// ============================================================================
// D) MESSAGERIE
// ============================================================================

export const messagingModule: LegalModule = {
  id: "D_MESSAGING",
  nom: "Messagerie de coordination",
  status: "validable_sous_conditions",
  risqueGlobal: "eleve",
  resume:
    "La messagerie est un déclencheur majeur de responsabilité : elle crée une attente de lecture/réponse. Possible si cadrée comme messagerie de coordination non urgente.",
  cadreJuridique: [
    "Art. L1110-4 CSP — secret professionnel / secret partagé",
    "RGPD Art. 5, 9, 32 — minimisation, sécurité, données de santé",
    "Art. L1111-8 CSP — HDS si archivage de données de santé",
    "Référentiel MSSanté (ANS) — messagerie sécurisée de santé",
    "Code de déontologie médicale — Art. R4127-4 (secret)",
  ],
  risques: [
    {
      id: "D1",
      description: "Attente de réponse / non-lecture = responsabilité",
      gravite: "eleve",
      probabilite: "eleve",
      pourquoi:
        "Patient écrit un message important → 'vous aviez l'info'. Bombe réputationnelle.",
      trigger: "Message médical envoyé sans disclaimer + statut 'lu' affiché.",
    },
    {
      id: "D2",
      description: "Urgence / sécurité patient",
      gravite: "critique",
      probabilite: "modere",
      pourquoi:
        "'Douleur aiguë', 'idées suicidaires' envoyés dans Nami au lieu du 15/112.",
      trigger: "Absence de triple barrière anti-urgence.",
    },
    {
      id: "D3",
      description: "Notifications push/email contenant des données médicales",
      gravite: "eleve",
      probabilite: "modere",
      pourquoi: "Fuite sur écran verrouillé / téléphone partagé.",
      trigger: "Push contenant le contenu du message.",
    },
  ],
  interdits: [
    "'Messagerie clinique' / 'échanges médicaux' sans mention non urgente",
    "Boutons 'urgence' qui envoient un message à l'équipe (au lieu de rediriger vers 15/112)",
    "Statut 'vu/lu' côté patient en V1 (crée une promesse implicite)",
    "Notifications push/email avec contenu médical",
    "Accès aux messages pour 'toute l'organisation' (sans care team)",
    "Absence de charte d'usage",
  ],
  autorises: [
    "'Messagerie de coordination' (renommée)",
    "Catégories organisationnelles : 'Administratif', 'Organisation RDV', 'Question non urgente'",
    "Statut 'Délivré' (technique) — pas 'Lu'",
    "Paramétrage par structure : horaires de traitement + message auto hors horaires",
    "Pièces jointes avec antivirus + types limités (PDF/JPG/PNG) + liens temporaires",
  ],
  actions: [
    {
      id: "D_ACT1",
      description: "Triple barrière anti-urgence",
      owner: "produit",
      priorite: "bloquant_go",
      details:
        "(1) Bannière permanente dans l'écran de chat, (2) Interstitiel 1ère utilisation + checkbox, (3) Microcopy dans la zone de saisie ('En cas d'urgence : 15/112').",
    },
    {
      id: "D_ACT2",
      description: "Bouton 'Urgence ?' qui ouvre fiche 15/112 + consignes",
      owner: "produit",
      priorite: "bloquant_go",
      details: "NE PAS envoyer de message dans Nami. Rediriger vers 15/112.",
    },
    {
      id: "D_ACT3",
      description: "Décision d'archivage (modèle A ou B) — obligatoire",
      owner: "produit",
      priorite: "bloquant_go",
      details:
        "Modèle A : messages = partie du dossier (même conservation). Modèle B : éphémère (6–24 mois + export avant purge). NO GO tant que pas tranché.",
    },
    {
      id: "D_ACT4",
      description: "Notifications : contenu interdit, uniquement 'Nouveau message'",
      owner: "cto",
      priorite: "bloquant_go",
      details:
        "Push/email : zéro contenu médical. Uniquement 'Vous avez un nouveau message dans Nami.' Prévisualisation désactivée par défaut.",
    },
  ],
  wording: [
    {
      interdit: "Messagerie",
      remplacement: "Messagerie de coordination non urgente",
      contexte: "UI, CGU, note avocat",
    },
  ],
  documentsManquants: [
    "Texte exact des bandeaux/ack 'non urgence'",
    "Politique de conservation des messages",
    "Matrice RBAC (qui accède à quelles conversations)",
    "Procédure de gestion incident (message urgent reçu)",
  ],
  disclaimers: [
    "Ce canal n'est pas surveillé en continu et ne doit pas être utilisé en cas d'urgence. En cas d'urgence (douleur intense, détresse, idées suicidaires, etc.), contactez immédiatement le 15/112.",
  ],
  reecritureAvocat:
    "Messagerie de coordination non urgente au sein de l'équipe de prise en charge, avec règles d'usage, traçabilité, et disclaimers 'pas de surveillance en continu'.",
};

// ============================================================================
// E) JOURNAL PATIENT
// ============================================================================

export const patientJournalModule: LegalModule = {
  id: "E_PATIENT_JOURNAL",
  nom: "Journal patient",
  status: "validable_sous_conditions",
  risqueGlobal: "eleve",
  resume:
    "Le journal est faisable mais c'est un aimant à risques : données ultra sensibles (psy/TCA), faux sentiment de surveillance, accès équipe. Doit être conçu comme outil de préparation asynchrone.",
  cadreJuridique: [
    "RGPD Art. 9 — données de santé, données sensibles",
    "RGPD Art. 35 — DPIA obligatoire (psy + TCA = quasi-systématique)",
    "Art. L1110-4 CSP — secret professionnel",
    "Art. L1111-7 CSP — accès au dossier",
    "Code pénal Art. 226-13 — violation du secret professionnel",
  ],
  risques: [
    {
      id: "E1",
      description: "Faux sentiment de surveillance / non-réponse",
      gravite: "eleve",
      probabilite: "eleve",
      pourquoi:
        "Patient écrit 'je vais mal / idées noires' → pas de réponse → reproche + risque réel.",
      trigger: "Journal sans disclaimer + sans bouton urgence.",
    },
    {
      id: "E2",
      description: "Accès excessif aux données intimes (psy/TCA)",
      gravite: "eleve",
      probabilite: "eleve",
      pourquoi:
        "Journal = infos intimes ; si 'toute l'organisation' y a accès = indéfendable.",
      trigger: "Accès par défaut à tous les membres d'une structure.",
    },
    {
      id: "E3",
      description: "Dérive : journal utilisé comme 'télésuivi'",
      gravite: "critique",
      probabilite: "modere",
      pourquoi:
        "Dès que l'équipe s'organise autour du journal en continu → zone 'surveillance'.",
      trigger: "Automatisations basées sur le contenu du journal.",
    },
  ],
  interdits: [
    "'Journal = signalement' (bouton 'signaler un symptôme urgent', 'alerter mon soignant')",
    "Toute promesse : 'votre équipe est informée', 'nous surveillons'",
    "Alerte basée sur mots ('douleur', 'suicide', 'vomissements')",
    "Tri/priorisation de patients à partir du journal",
    "Push contenant du contenu ('Vous avez indiqué douleur 8/10')",
    "Accès par défaut de tous les membres d'une organisation",
  ],
  autorises: [
    "Journal positionné comme 'asynchrone de préparation' pour consultations",
    "Entrées = dépôt horodaté + catégories, pas de 'niveau d'urgence'",
    "Option patient : 'partager cette entrée avec l'équipe' vs 'garder privé'",
    "Notification : uniquement 'Nouvelle entrée de journal' (jamais le contenu)",
  ],
  actions: [
    {
      id: "E_ACT1",
      description: "Disclaimers à 3 niveaux (activation, saisie, messagerie)",
      owner: "produit",
      priorite: "bloquant_go",
      details:
        "Texte standard : 'Ce journal n'est pas surveillé en continu et ne remplace pas une consultation. En cas d'urgence, contactez immédiatement le 15/112.'",
    },
    {
      id: "E_ACT2",
      description: "Bouton 'Urgence ?' → redirige vers 15/112",
      owner: "produit",
      priorite: "bloquant_go",
      details: "N'envoie PAS de message dans Nami.",
    },
    {
      id: "E_ACT3",
      description: "RBAC strict : journal visible uniquement par la care team",
      owner: "cto",
      priorite: "bloquant_go",
      details:
        "Label ABAC 'sensible+' : journal patient = accès restreint à certains rôles (psy, médecin référent). Break-glass avec motif + log.",
    },
    {
      id: "E_ACT4",
      description: "DPIA obligatoire (journal + données psy/TCA)",
      owner: "dpo",
      priorite: "bloquant_go",
      details: "Quasi-systématique dès que journal patient existe.",
    },
  ],
  wording: [
    {
      interdit: "déposer des entrées de journal (repas, émotions, symptômes…)",
      remplacement:
        "déposer des entrées de journal destinées à la préparation et au partage d'informations entre consultations (sans surveillance en temps réel et sans alertes cliniques)",
      contexte: "Note avocat, CGU",
    },
  ],
  documentsManquants: [
    "Maquettes journal (saisie, liste, partage, notifications)",
    "Politique d'accès (RBAC) + logs + break-glass",
    "Textes exacts disclaimers et écrans d'ack",
    "Politique de conservation du journal",
  ],
  disclaimers: [
    "Ce journal n'est pas surveillé en continu et ne remplace pas une consultation. En cas d'urgence (douleur intense, détresse, idées suicidaires, etc.), contactez immédiatement le 15/112 ou votre service médical.",
  ],
  reecritureAvocat:
    "Déposer des entrées de journal destinées à la préparation et au partage d'informations entre consultations (sans surveillance en temps réel et sans alertes cliniques). Le journal ne doit pas être utilisé pour des situations d'urgence.",
};

// ============================================================================
// F) ACCÈS / RBAC / ÉQUIPE DE SOINS
// ============================================================================

export const accessModule: LegalModule = {
  id: "F_ACCESS_RBAC",
  nom: "Accès / Habilitations / Équipe de soins",
  status: "validable_sous_conditions",
  risqueGlobal: "eleve",
  resume:
    "'Même organisation' ≠ droit d'accès général. Le seul modèle défendable : accès par patient (care team) + moindre privilège + traçabilité + procédure d'accès exceptionnel.",
  cadreJuridique: [
    "RGPD Art. 5(1)(c) — minimisation des données",
    "RGPD Art. 32 — sécurité du traitement",
    "Art. L1110-4 CSP — secret professionnel, équipe de soins",
    "Art. L1110-12 CSP — définition équipe de soins",
    "Décret 2016-994 — conditions d'échange d'informations",
    "Code pénal Art. 226-13 — violation du secret professionnel",
  ],
  risques: [
    {
      id: "F1",
      description: "Accès excessif (RGPD) + atteinte au secret",
      gravite: "eleve",
      probabilite: "eleve",
      pourquoi:
        "L'accès 'même organisation = tout voir' est une erreur classique et indéfendable.",
      trigger: "Accès par défaut à tous les dossiers pour tout membre d'une structure.",
    },
    {
      id: "F2",
      description: "Cas sensibles (psy/TCA/mineurs/violences) sans cloisonnement",
      gravite: "critique",
      probabilite: "modere",
      pourquoi: "Ces infos nécessitent une restriction renforcée ; sinon plainte + réputation.",
      trigger: "Notes psy/journal accessibles à toute l'équipe sans granularité.",
    },
    {
      id: "F3",
      description: "Fuite interne (offboarding non fait)",
      gravite: "eleve",
      probabilite: "eleve",
      pourquoi: "Majorité des incidents = interne (mauvais droits, compte partagé, départ non désactivé).",
      trigger: "Absence de procédure d'offboarding automatique.",
    },
  ],
  interdits: [
    "Accès par défaut à tous les dossiers pour tout membre d'une structure",
    "'Rôle admin' qui peut lire notes/journal/messages patient",
    "Partage automatique des conversations à une 'équipe' trop large",
    "Absence de logs de consultation (audit)",
    "Comptes partagés / génériques",
    "Absence de procédure d'offboarding",
  ],
  autorises: [
    "Modèle care team par patient : accès uniquement si (1) bon tenant + (2) ajouté explicitement à la care team + (3) rôle autorisé pour ce type de données",
    "Rôles RBAC : Clinicien éditeur / Clinicien lecteur / Coordination / Admin technique (zéro accès contenu santé)",
    "Labels ABAC 'sensible+' : journal patient, notes psy/TCA/violences/sexualité",
    "Break-glass : accès exceptionnel avec motif + durée limitée + log + notification",
  ],
  actions: [
    {
      id: "F_ACT1",
      description: "Implémenter le modèle care team par patient + RBAC + ABAC labels",
      owner: "cto",
      priorite: "bloquant_go",
      details:
        "4 niveaux : Tenant → Patient/CareCase → Rôle (RBAC) → Catégorie de données (ABAC). Admin ≠ accès aux données.",
    },
    {
      id: "F_ACT2",
      description: "Onboarding/offboarding nominatif + MFA obligatoire",
      owner: "cto",
      priorite: "bloquant_go",
      details:
        "Offboarding J0 : désactivation + révocation sessions/tokens + retrait de toutes care teams. Revue d'accès tous les 90 jours.",
    },
    {
      id: "F_ACT3",
      description: "Audit logs complets + détection d'anomalies",
      owner: "cto",
      priorite: "bloquant_go",
      details:
        "Journaliser : consultation dossier, lecture note/journal, export/téléchargement, recherche globale. Alertes : accès massif, hors horaires, patients inhabituels.",
    },
    {
      id: "F_ACT4",
      description: "Break-glass pour cas sensibles",
      owner: "cto",
      priorite: "avant_lancement",
      details:
        "Double approbation + notification renforcée pour contenus 'sensible+'. Reporting mensuel.",
    },
  ],
  wording: [
    {
      interdit: "équipe de soin / même organisation",
      remplacement:
        "professionnels autorisés et ajoutés au dossier du patient (équipe de prise en charge), selon des habilitations fines et une traçabilité complète",
      contexte: "Note avocat, CGU",
    },
  ],
  documentsManquants: [
    "Matrice RBAC/ABAC (table rôles × objets × permissions)",
    "Politique 'break-glass'",
    "Procédure onboarding/offboarding + revues d'accès",
    "Spécification des logs + durée de conservation",
  ],
  disclaimers: [],
  reecritureAvocat:
    "L'accès aux informations est limité aux professionnels autorisés et ajoutés au dossier du patient (équipe de prise en charge), selon des habilitations fines et une traçabilité complète.",
};

// ============================================================================
// G) NOTES CLINIQUES & DOCUMENTS
// ============================================================================

export const notesDocsModule: LegalModule = {
  id: "G_NOTES_DOCS",
  nom: "Notes cliniques & Documents (dossier de facto)",
  status: "validable_sous_conditions",
  risqueGlobal: "eleve",
  resume:
    "Dès que vous stockez 'notes cliniques' + documents + timeline, vous créez un dossier patient de facto. Obligations : traçabilité, auteur, versioning, conservation, droits RGPD, export, sécurité.",
  cadreJuridique: [
    "RGPD Art. 5, 15-17 — droits d'accès, rectification, effacement",
    "Art. L1111-7 CSP — droit d'accès au dossier médical",
    "Art. R1112-2 CSP — conservation du dossier médical (20 ans)",
    "Art. L1111-8 CSP — HDS",
  ],
  risques: [
    {
      id: "G1",
      description: "Confusion 'Nami = dossier médical'",
      gravite: "eleve",
      probabilite: "eleve",
      pourquoi:
        "Les équipes vont l'utiliser comme dossier. Un avocat adverse vous le reprochera si pas de gouvernance.",
      trigger: "Nami devient la source principale d'information clinique pour une équipe.",
    },
    {
      id: "G2",
      description: "Modifications non tracées = risque probatoire",
      gravite: "eleve",
      probabilite: "modere",
      pourquoi:
        "Sans versioning, impossible de prouver qui a écrit quoi, quand.",
      trigger: "Note modifiée silencieusement sans historique.",
    },
  ],
  interdits: [
    "Notes modifiables sans historique (pas d'audit trail)",
    "Suppression silencieuse de notes/documents",
    "'Admin' qui peut lire/exporter les documents",
    "Upload sans scan antivirus / sans contrôle de type",
    "Appeler ça 'DMP', 'dossier médical officiel'",
  ],
  autorises: [
    "Notes : auteur + timestamp + type + versioning (addendum/append-only)",
    "Documents : uploader + timestamp + hash (intégrité) + antivirus",
    "Export dossier : PDF structuré + métadonnées + logs",
    "Nommage : 'dossier de coordination' / 'case' / 'situation'",
    "Rectification par addendum (pas de réécriture silencieuse)",
  ],
  actions: [
    {
      id: "G_ACT1",
      description: "Versioning/audit trail sur les notes (append-only ou historique strict)",
      owner: "cto",
      priorite: "bloquant_go",
      details:
        "Champs obligatoires : auteur, date/heure, type de note. Modification = addendum ou version avec historique. Suppression = logique avec motif + trace.",
    },
    {
      id: "G_ACT2",
      description: "Export & portabilité (PDF/ZIP structuré + logs d'export)",
      owner: "cto",
      priorite: "avant_lancement",
      details:
        "Limiter export aux membres care team + rôle autorisé.",
    },
    {
      id: "G_ACT3",
      description: "Sécurité documents : antivirus + types limités + liens temporaires",
      owner: "cto",
      priorite: "bloquant_go",
      details: "PDF, PNG, JPG uniquement. Exécutables interdits. Contrôle téléchargement.",
    },
  ],
  wording: [],
  documentsManquants: [
    "Règles de conservation (par type de données)",
    "Spécification versioning / audit trail notes",
    "Spécification upload documents (scan, types, taille, logs)",
    "Modèle de réponse aux droits RGPD",
  ],
  disclaimers: [
    "Nami ne se substitue pas aux dossiers médicaux réglementaires nationaux.",
  ],
  reecritureAvocat:
    "Nami permet de conserver des notes et documents nécessaires à la coordination au sein de l'équipe autorisée. Les notes sont horodatées, attribuées à leur auteur et versionnées (addendum), avec traçabilité des accès et des exports. Nami ne se substitue pas aux dossiers médicaux réglementaires nationaux.",
};

// ============================================================================
// H) AGENDA / NO-SHOW / PAIEMENT
// ============================================================================

export const appointmentModule: LegalModule = {
  id: "H_APPOINTMENT_NOSHOW",
  nom: "Agenda / Rendez-vous / No-show / Paiement",
  status: "validable_sous_conditions",
  risqueGlobal: "eleve",
  resume:
    "L'agenda est faisable mais crée des risques : confidentialité (notifications), no-show/empreinte bancaire (consommation + preuve + réputation + déontologie).",
  cadreJuridique: [
    "Code de la consommation — information précontractuelle, CGV",
    "DSP2 / SCA (3DS) — authentification forte pour paiements",
    "RGPD — données de paiement, consentement",
    "Codes de déontologie (médecins, psy, paramédicaux) — honoraires, no-show",
    "Art. L1111-2 CSP — confidentialité",
  ],
  risques: [
    {
      id: "H1",
      description: "Confidentialité via rappels (SMS/email/push)",
      gravite: "eleve",
      probabilite: "eleve",
      pourquoi:
        "SMS 'RDV nutrition/TCA demain' sur téléphone partagé = fuite donnée de santé.",
      trigger: "Rappel contenant la spécialité ou le motif médical.",
    },
    {
      id: "H2",
      description: "No-show : litiges consommation + réputation",
      gravite: "eleve",
      probabilite: "modere",
      pourquoi:
        "Contestations ('je n'étais pas informé'), chargebacks, bad buzz.",
      trigger: "Conditions d'annulation floues + consentement contestable.",
    },
  ],
  interdits: [
    "Rappels contenant la spécialité, la pathologie, ou tout indice médical",
    "Push prévisualisation activée par défaut",
    "No-show : case précochée, conditions floues, montant non affiché, prélèvement auto sans preuve",
    "Nami qui se présente comme 'recouvrant' en son nom",
    "Stockage direct de données carte (c'est le PSP)",
    "No-show pour mineurs sans parcours renforcé",
  ],
  autorises: [
    "Rappel : 'Vous avez un rendez-vous demain à 14:00.' (sans spécialité)",
    "Optionnel : 'avec [Prénom Nom]' sans spécialité",
    "Architecture no-show : Nami = intermédiaire technique, PSP = tokenisation, pro = déclenche le prélèvement (action humaine)",
    "Parcours : Conditions no-show → Checkbox explicite → Auth PSP (SCA) → Confirmation → Email neutre",
  ],
  actions: [
    {
      id: "H_ACT1",
      description: "Notifications minimisées : zéro contenu médical",
      owner: "cto",
      priorite: "bloquant_go",
      details:
        "Push : 'Nouveau rappel dans Nami' uniquement. SMS : date/heure uniquement. Opt-in patient par canal + heures. Désactiver prévisualisation par défaut.",
    },
    {
      id: "H_ACT2",
      description: "Architecture no-show via PSP + consentement explicite",
      owner: "cto",
      priorite: "avant_lancement",
      details:
        "Nami ne stocke jamais de carte. PSP (Stripe/Adyen) gère tokenisation + SCA. Nami conserve : identifiant transaction/token + logs consentement + conditions acceptées (versionnées).",
    },
    {
      id: "H_ACT3",
      description: "Process de contestation + validation déontologique par vertical",
      owner: "juridique",
      priorite: "avant_lancement",
      details:
        "Support + délai + trace. Valider compatibilité déontologique selon professions ciblées.",
    },
  ],
  wording: [
    {
      interdit: "Empreinte bancaire / no-show",
      remplacement: "Option (désactivable) de garantie de rendez-vous opérée via un PSP, avec consentement explicite et politique d'annulation paramétrée par la structure",
      contexte: "Note avocat, CGV",
    },
  ],
  documentsManquants: [
    "Textes exacts des notifications (SMS/email/push)",
    "Parcours UI complet no-show (captures + wording)",
    "Politique d'annulation (modèle)",
    "Contrat PSP + DPA",
    "Registre des preuves (logs de consentement versionnés)",
  ],
  disclaimers: [],
  reecritureAvocat:
    "Gestion organisationnelle des rendez-vous avec notifications minimisées (sans contenu médical), traçabilité des confirmations/annulations. Option de garantie de rendez-vous opérée via un PSP, avec consentement explicite.",
};

// ============================================================================
// I) ORIENTATION / ADRESSAGE / RÉPERTOIRE
// ============================================================================

export const orientationModule: LegalModule = {
  id: "I_ORIENTATION",
  nom: "Orientation / Adressage / Répertoire de professionnels",
  status: "a_recadrer",
  risqueGlobal: "eleve",
  resume:
    "Dès que Nami 'oriente' ou 'recommande' un pro, vous entrez en zone déontologie / concurrence / transparence + responsabilité. Le répertoire est faisable si annuaire neutre.",
  cadreJuridique: [
    "Code de déontologie médicale — Art. R4127-56 et s. (exercice, publicité)",
    "Art. L4113-5 CSP — interdiction captation de patientèle",
    "Loi Hamon / Code consommation — transparence plateformes",
    "RGPD — minimisation des données partagées lors de l'adressage",
    "Règles ordinales par profession (médecins, psy, paramédicaux)",
  ],
  risques: [
    {
      id: "I1",
      description: "Captation de patientèle / manquement déontologique",
      gravite: "eleve",
      probabilite: "modere",
      pourquoi:
        "Les ordres sont très sensibles à tout mécanisme qui ressemble à 'on vous envoie des patients'.",
      trigger: "Matching automatique, ranking, 'recommandé'.",
    },
    {
      id: "I2",
      description: "Responsabilité 'orientation inadaptée'",
      gravite: "eleve",
      probabilite: "modere",
      pourquoi:
        "Si Nami est perçu comme 'ayant recommandé', vous portez une part du risque.",
      trigger: "CTA 'Nami recommande' ou ranking implicite.",
    },
    {
      id: "I3",
      description: "Conflits d'intérêts / ranking payant",
      gravite: "critique",
      probabilite: "modere",
      pourquoi: "'Pay-to-rank' en santé est toxique juridiquement et réputationnellement.",
      trigger: "Tout modèle de monétisation lié au positionnement.",
    },
  ],
  interdits: [
    "'Matching' automatique ('on trouve le bon pro' / 'recommandé pour vous')",
    "Classements : 'meilleurs pros', 'top', 'score', 'pertinence', 'rating'",
    "Référencement payant ou avantages contre visibilité",
    "Partage automatique du dossier patient au pro destinataire sans contrôle",
    "Orientation déclenchée par IA ('care gap → adresser à X')",
  ],
  autorises: [
    "Annuaire neutre : ordre alphabétique ou distance, filtres objectifs (spécialité, langue, lieu, disponibilités)",
    "Adressage initié par un soignant (pas par Nami) : 'Créer une demande d'adressage'",
    "Données minimales partagées : identité/contact + motif + contexte minimal",
    "Partage de documents : opt-in explicite (sélection de pièces), jamais 'tout le dossier'",
    "Mention claire : 'vous êtes libre de choisir tout professionnel'",
  ],
  actions: [
    {
      id: "I_ACT1",
      description: "Politique de référencement : critères objectifs, pas de pay-to-rank",
      owner: "produit",
      priorite: "avant_lancement",
      details:
        "Charte publique : critères d'entrée (RPPS/ADELI, spécialité), ordre d'affichage transparent, gestion conflits d'intérêts.",
    },
    {
      id: "I_ACT2",
      description: "Minimisation des données lors d'adressage",
      owner: "cto",
      priorite: "avant_lancement",
      details:
        "Par défaut : identité + motif + contexte minimal. Documents = opt-in par pièce. Lien sécurisé temporaire plutôt qu'envoi direct.",
    },
    {
      id: "I_ACT3",
      description: "Log d'adressage : qui adresse, à qui, quand, quelles données partagées",
      owner: "cto",
      priorite: "avant_lancement",
      details: "Traçabilité complète.",
    },
  ],
  wording: [
    {
      interdit: "orienter / adresser un patient à un autre professionnel",
      remplacement: "faciliter l'adressage initié par le professionnel, avec un répertoire neutre fondé sur des critères objectifs, dans le respect de la liberté de choix du patient",
      contexte: "Note avocat, UI",
    },
  ],
  documentsManquants: [
    "Maquettes du répertoire (ordre, filtres, libellés)",
    "Spécification 'adressage' : quelles données partent, à qui",
    "Politique de référencement (pas de pay-to-rank, critères objectifs)",
    "Clauses CGU/CGV sur la mise en relation + limitation de responsabilité",
  ],
  disclaimers: [
    "Vous êtes libre de choisir tout professionnel de santé.",
  ],
  reecritureAvocat:
    "Faciliter l'adressage initié par le professionnel, avec un répertoire neutre fondé sur des critères objectifs, dans le respect de la liberté de choix du patient et de la minimisation des données partagées.",
};

// ============================================================================
// J) HDS / HÉBERGEMENT / SOUS-TRAITANCE
// ============================================================================

export const hdsModule: LegalModule = {
  id: "J_HDS",
  nom: "HDS / Hébergement / Chaîne de sous-traitance",
  status: "validable_sous_conditions",
  risqueGlobal: "critique",
  resume:
    "En France, héberger des données de santé pour compte de tiers = HDS certifié obligatoire (CSP L.1111-8). Le risque vient des 'à-côtés' : logs, support, sauvegardes, observabilité, analytics, IA.",
  cadreJuridique: [
    "Art. L1111-8 CSP — hébergement de données de santé",
    "Décret 2018-137 — certification HDS",
    "Référentiel de certification HDS (ANS/COFRAC)",
    "RGPD Art. 28 — sous-traitance",
    "RGPD Art. 32 — sécurité du traitement",
    "RGPD Art. 44-49 — transferts hors UE",
    "Clause contractuelle HDS : 9 catégories de mentions obligatoires (Art. R1111-11 CSP)",
  ],
  risques: [
    {
      id: "J1",
      description: "Chaîne HDS incomplète",
      gravite: "critique",
      probabilite: "eleve",
      pourquoi:
        "En audit/appel d'offres, 'HDS ?' est une question éliminatoire. Un contrat sans HDS peut être annulé par un juge.",
      trigger: "Un seul maillon non HDS héberge/traite de la donnée de santé.",
    },
    {
      id: "J2",
      description: "'Shadow processing' via logs/observabilité/tickets",
      gravite: "eleve",
      probabilite: "eleve",
      pourquoi:
        "Sentry/Datadog/Zendesk peuvent capter des fragments de données de santé.",
      trigger: "Logs applicatifs contenant du texte clinique.",
    },
    {
      id: "J3",
      description: "Transferts hors UE (cloud US, SaaS)",
      gravite: "eleve",
      probabilite: "eleve",
      pourquoi:
        "Santé + transferts = DPIA, clauses SCC, TIA, risque CNIL/rejet clients.",
      trigger: "Tout prestataire hors UE accédant à des données de santé.",
    },
  ],
  interdits: [
    "'On est sur AWS/GCP/Azure donc c'est bon' (il faut HDS + sous-traitance + paramétrage)",
    "Logs contenant du texte clinique (messages, notes, prompts IA)",
    "Tickets support contenant des données de santé non minimisées",
    "Environnements de test avec données réelles non anonymisées",
    "Accès admin trop larges (comptes partagés, pas de MFA)",
  ],
  autorises: [
    "Hébergeur principal certifié HDS (vérifier aussi : stockage objet, bases managées, sauvegardes, logs)",
    "Logs techniques : uniquement IDs pseudonymes, codes d'événements, métriques techniques",
    "Staging/dev : uniquement données synthétiques ou anonymisées",
    "Zéro accès prod par défaut pour les équipes Nami + break-glass hyper encadré",
  ],
  actions: [
    {
      id: "J_ACT1",
      description: "Cartographie complète 'chaîne HDS'",
      owner: "cto",
      priorite: "bloquant_go",
      details:
        "Table exhaustive : où les données existent (prod/staging/logs/backups) + quoi + qui (prestataire) + où géo + durée conservation + accès + HDS oui/non.",
    },
    {
      id: "J_ACT2",
      description: "Hébergement chez un prestataire certifié HDS",
      owner: "cto",
      priorite: "bloquant_go",
      details:
        "Attestation HDS couvrant : compute, DB, stockage objet, sauvegardes, services de logs managés.",
    },
    {
      id: "J_ACT3",
      description: "Zéro contenu santé dans les logs (scrubbers + allowlists)",
      owner: "cto",
      priorite: "bloquant_go",
      details:
        "Interdire dans les logs : noms/prénoms, contenus de notes/messages/journal, symptômes. Utiliser IDs techniques, hash, event codes.",
    },
    {
      id: "J_ACT4",
      description: "Break-glass pour accès interne (2 personnes, motif, durée limitée, logs)",
      owner: "cto",
      priorite: "bloquant_go",
      details:
        "Demande validée par 2 personnes (support lead + DPO/sécurité). Motif obligatoire. Durée limitée (60 min). Scope limité (1 patient). Logs immuables.",
    },
    {
      id: "J_ACT5",
      description: "Backups : chiffrage + rétention définie + tests de restauration",
      owner: "cto",
      priorite: "bloquant_go",
      details: "30/60/90 jours selon catégorie. Cloisonnement environnements. Restauration testée.",
    },
  ],
  wording: [],
  documentsManquants: [
    "Attestations HDS (hébergeur + périmètre exact)",
    "Cartographie sous-traitants (incl. observabilité/support/analytics/IA)",
    "DPIA",
    "Politiques : logs, backups, IAM, gestion incidents, PRA/PCA",
    "Registre des traitements + DPA clients",
    "PSSI (Politique de Sécurité des Systèmes d'Information)",
  ],
  disclaimers: [
    "L'hébergement et les services techniques sont opérés au sein d'une chaîne conforme HDS. Les outils de support/observabilité sont configurés pour ne pas collecter de contenus de santé.",
  ],
  reecritureAvocat:
    "L'hébergement et les services techniques associés (stockage, sauvegardes, journalisation) sont opérés au sein d'une chaîne d'hébergement conforme HDS. Les accès d'administration sont restreints, tracés et soumis à MFA.",
};

// ============================================================================
// K) RGPD — RÔLES, BASES LÉGALES, DPIA, DROITS
// ============================================================================

export const rgpdModule: LegalModule = {
  id: "K_RGPD",
  nom: "RGPD — Rôles, bases légales, DPIA, droits, conservation",
  status: "a_recadrer",
  risqueGlobal: "eleve",
  resume:
    "Le positionnement RGPD conditionne tous les contrats. Modèle cible : Structure/Pro = RT, Nami = sous-traitant (sauf modules où Nami détermine les finalités). DPIA obligatoire.",
  cadreJuridique: [
    "RGPD Art. 4(7)(8) — RT / sous-traitant",
    "RGPD Art. 9 — données de santé (catégorie spéciale)",
    "RGPD Art. 9§2(h) — exception : finalité médicale sous secret",
    "RGPD Art. 13-14 — information des personnes",
    "RGPD Art. 15-22 — droits des personnes",
    "RGPD Art. 28 — sous-traitance + DPA",
    "RGPD Art. 35 — DPIA (analyse d'impact)",
    "RGPD Art. 33-34 — notification de violation (72h)",
    "CNIL — guides sur les données de santé, DPIA, sous-traitance",
    "Loi Informatique et Libertés (art. 8, 44, 78)",
  ],
  risques: [
    {
      id: "K1",
      description: "Flou RT / sous-traitant / co-RT selon les modules",
      gravite: "eleve",
      probabilite: "eleve",
      pourquoi:
        "Si Nami fait 'pilotage du suivi' + analytics + IA + répertoire, vous risquez d'être RT ou co-RT sur certains traitements.",
      trigger: "Nami définit substantiellement les finalités (analytics, matching, IA).",
    },
    {
      id: "K2",
      description: "DPIA absente alors qu'obligatoire",
      gravite: "eleve",
      probabilite: "eleve",
      pourquoi:
        "Données de santé + messagerie + IA = DPIA quasi-systématique.",
      trigger: "Mise en production sans DPIA.",
    },
    {
      id: "K3",
      description: "Information patient insuffisante",
      gravite: "eleve",
      probabilite: "eleve",
      pourquoi:
        "Le patient doit savoir : qui accède, pourquoi, durée, droits. Multi-couche obligatoire.",
      trigger: "Pas de notice patient ou notice insuffisante.",
    },
    {
      id: "K4",
      description: "Conservation non définie",
      gravite: "eleve",
      probabilite: "eleve",
      pourquoi:
        "Trop long = minimisation violée ; trop court = blocage usage pro/établissement.",
      trigger: "Absence de politique de conservation par type de données.",
    },
  ],
  interdits: [
    "Utiliser le consentement comme base fourre-tout (en santé, souvent pas 'librement donné')",
    "Réutiliser notes/messages/journal pour : entraîner un LLM, benchmarking cross-structure, KPIs cliniques",
    "Absence de registre des traitements",
    "Notification de violation > 72h sans justification",
  ],
  autorises: [
    "Modèle par défaut : Pro/structure = RT, Nami = sous-traitant",
    "Base légale coordination : Art.9§2(h) — finalité médicale sous secret pro",
    "Nami RT uniquement sur : analytics produit strictement technique (pseudonymisé/agrégé, sans contenu santé)",
    "Information patient multi-couche : (1) résumé 30s à l'onboarding, (2) page détaillée, (3) microcopy contextuel",
    "Droits RGPD : rectification par addendum, effacement limité si obligation conservation, export structuré",
  ],
  actions: [
    {
      id: "K_ACT1",
      description: "Matrice rôles RGPD par module (RT/ST/co-RT) + DPA template",
      owner: "dpo",
      priorite: "bloquant_go",
      details:
        "Cockpit/dossier/notes = Client RT, Nami ST. Répertoire/orientation = vérifier si Nami co-RT. Analytics produit = Nami RT sur pipeline séparé (technique, pseudonymisé). IA = sous-traitance uniquement si pas de training.",
    },
    {
      id: "K_ACT2",
      description: "DPIA complète",
      owner: "dpo",
      priorite: "bloquant_go",
      details: "Obligatoire : données santé + messagerie + IA + journal patient.",
    },
    {
      id: "K_ACT3",
      description: "Information patient multi-couche",
      owner: "produit",
      priorite: "avant_lancement",
      details:
        "Layer 1 : résumé 30s onboarding (qui est RT, rôle Nami, qui accède, pas de surveillance, droits). Layer 2 : page détaillée. Layer 3 : microcopy contextuel (journal, messagerie, partage).",
    },
    {
      id: "K_ACT4",
      description: "Politique de conservation par catégorie de données",
      owner: "dpo",
      priorite: "bloquant_go",
      details:
        "Dossier/notes = actif pendant le soin + archivage après clôture. Journal = aligné dossier. Messagerie = choix A ou B (voir module D). Audit logs = 12-24 mois. Logs applicatifs = 30-90 jours sans contenu santé. Backups = 30/60/90 jours.",
    },
    {
      id: "K_ACT5",
      description: "Écran 'Qui a accès à mon dossier ?' côté patient",
      owner: "produit",
      priorite: "avant_lancement",
      details:
        "Liste care team avec noms, rôles, date d'ajout. + Écran 'Mes droits'.",
    },
  ],
  wording: [],
  documentsManquants: [
    "Matrice rôles RGPD par module + DPA template",
    "DPIA (ou brouillon)",
    "Registre des traitements",
    "Politique de conservation par type de données",
    "Notice patient multi-couche",
    "Procédure de réponse aux droits RGPD",
    "Procédure de notification de violation (72h)",
    "Data Use Policy interne/externe (no training, no benchmarking)",
  ],
  disclaimers: [
    "Vos données sont traitées dans le cadre de votre parcours de soins par [Nom de la structure / professionnel], responsable de traitement. Nami fournit la plateforme technique. Seuls les professionnels impliqués dans votre prise en charge peuvent accéder à votre dossier. Nami n'est pas un service d'urgence. Pour exercer vos droits RGPD, contactez [contact structure].",
  ],
  reecritureAvocat:
    "L'architecture RGPD repose sur un modèle où la structure/le professionnel est responsable de traitement et Nami sous-traitant, sauf pour des traitements strictement techniques (analytics produit pseudonymisé). Une DPIA est réalisée. L'information patient est multi-couche. Les droits sont exercés via la structure avec l'assistance technique de Nami.",
};

// ============================================================================
// EXPORT — REGISTRE COMPLET
// ============================================================================

export const legalRegistry: LegalModule[] = [
  positioningModule,
  dmBoundaryModule,
  aiModule,
  messagingModule,
  patientJournalModule,
  accessModule,
  notesDocsModule,
  appointmentModule,
  orientationModule,
  hdsModule,
  rgpdModule,
];

/**
 * Helper : récupérer toutes les actions bloquantes (GO/NO-GO)
 */
export function getBlockingActions(): LegalAction[] {
  return legalRegistry.flatMap((m) =>
    m.actions.filter((a) => a.priorite === "bloquant_go")
  );
}

/**
 * Helper : récupérer tous les mots interdits
 */
export function getAllForbiddenWords(): WordingRule[] {
  return legalRegistry.flatMap((m) => m.wording);
}

/**
 * Helper : récupérer tous les disclaimers
 */
export function getAllDisclaimers(): string[] {
  return legalRegistry.flatMap((m) => m.disclaimers);
}

/**
 * Helper : récupérer les modules par risque
 */
export function getModulesByRisk(level: RiskLevel): LegalModule[] {
  return legalRegistry.filter((m) => m.risqueGlobal === level);
}

/**
 * Helper : récupérer les documents manquants (backlog)
 */
export function getAllMissingDocuments(): { module: string; documents: string[] }[] {
  return legalRegistry.map((m) => ({
    module: m.nom,
    documents: m.documentsManquants,
  }));
}
