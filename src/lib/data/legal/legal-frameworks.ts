/**
 * NAMI — Cadre juridique théorique
 *
 * Synthèse des règles de droit applicables à Nami,
 * extraites des cours M2 Droit de la santé numérique (Paris 8, 2024-2025)
 * et textes de référence.
 *
 * Chaque framework est une "fiche" : texte de loi, seuil de déclenchement,
 * conséquences, et ce que ça veut dire concrètement pour Nami.
 */

export interface LegalFramework {
  id: string;
  nom: string;
  theme: "dm" | "hds" | "rgpd" | "telemedecine" | "ia" | "contrats" | "deontologie";
  /** Textes de référence (articles, lois, règlements) */
  textes: string[];
  /** Ce que dit la loi (résumé actionnable) */
  regle: string;
  /** Seuil de déclenchement — quand ça s'applique */
  seuil: string;
  /** Conséquences en cas de non-conformité */
  consequences: string[];
  /** Ce que ça signifie concrètement pour Nami */
  impactNami: string;
  /** Source dans le PDF (pages approximatives) */
  sourcePdf?: string;
}

export const legalFrameworks: LegalFramework[] = [
  // ========================================================================
  // DISPOSITIF MÉDICAL LOGICIEL (MDR)
  // ========================================================================
  {
    id: "DM_QUALIFICATION",
    nom: "Qualification en Dispositif Médical Logiciel",
    theme: "dm",
    textes: [
      "Règlement UE 2017/745 (MDR) — Art. 2(1)",
      "MDCG 2019-11 rev.1 (juin 2025) — Guidance on qualification and classification of software",
      "Arrêt CJUE C-329/16, SNITEM c/ Ministre des affaires sociales (2017)",
    ],
    regle:
      "Un logiciel est un DM s'il poursuit une finalité médicale au sens du MDR : diagnostic, prévention, surveillance, prédiction, pronostic, traitement — même si cette finalité est indirecte. Le test CJUE SNITEM : (1) le logiciel fait une revendication médicale dans sa documentation, ET (2) il exploite des données patient-spécifiques pour une finalité médicale définie.",
    seuil:
      "Le logiciel FOURNIT une information destinée à orienter une décision de prise en charge (même indirectement via 'alertes', 'signaux', 'scoring', 'suggestions'). Attention : un logiciel qui génère des STATISTIQUES GÉNÉRIQUES (épidémiologiques, population) ≠ DM. Un logiciel qui génère des ALERTES PATIENT-SPÉCIFIQUES = probablement DM.",
    consequences: [
      "Obligation de marquage CE",
      "QMS (système qualité) obligatoire",
      "Évaluation clinique + gestion des risques",
      "Surveillance post-commercialisation",
      "Responsabilité produit accrue",
      "Assurance spécifique",
      "Délais et coûts considérables (12-24 mois minimum)",
    ],
    impactNami:
      "CRITIQUE. Si Nami produit des 'alertes cliniques', détecte des 'care gaps' interprétables médicalement, ou utilise l'IA pour 'identifier des risques', il bascule en DM. Pour rester hors DM : limiter à coordination/organisation/complétude, sans finalité médicale.",
    sourcePdf: "Pages 569-620 (cours DM), pages 570-571 (arrêt SNITEM)",
  },
  {
    id: "DM_CONTAMINATION",
    nom: "Contamination par un autre DM",
    theme: "dm",
    textes: ["MDR 2017/745 — Art. 2(1)", "MDCG 2019-11 — Section on accessories and software driving DMs"],
    regle:
      "Un logiciel qui 'pilote ou influence' un autre dispositif médical est lui-même qualifié de DM par contamination.",
    seuil: "Le logiciel envoie des instructions à un DM ou modifie son comportement.",
    consequences: ["Même obligations que le DM principal"],
    impactNami:
      "Faible pour V1 (Nami ne pilote pas de DM). À surveiller si intégration future avec des outils de télésuivi certifiés DM.",
    sourcePdf: "Pages 569-570",
  },
  {
    id: "DM_OBSERVANCE",
    nom: "Logiciel d'observance ≠ DM (exception)",
    theme: "dm",
    textes: ["MDCG 2019-11 — Examples", "ANSM guidance"],
    regle:
      "Un logiciel qui vérifie uniquement la prise de médicament (observance) SANS prendre de décision médicale ni interpréter = PAS un DM.",
    seuil: "Le logiciel se limite au constat factuel (pris / pas pris) sans analyse.",
    consequences: [],
    impactNami:
      "UTILE : si Nami intègre un jour du suivi d'observance, rester dans le 'constat factuel' sans analyse/recommandation.",
  },

  // ========================================================================
  // HDS — HÉBERGEMENT DE DONNÉES DE SANTÉ
  // ========================================================================
  {
    id: "HDS_OBLIGATION",
    nom: "Obligation d'hébergement certifié HDS",
    theme: "hds",
    textes: [
      "Art. L1111-8 CSP — Hébergement de données de santé",
      "Décret 2018-137 — Certification HDS",
      "Art. R1111-9 à R1111-14 CSP — Modalités",
      "Référentiel de certification HDS (ANS/COFRAC)",
    ],
    regle:
      "Tout hébergeur de données de santé pour le compte de tiers (personnes physiques ou morales) doit être certifié HDS. Cette obligation est d'ORDRE PUBLIC : un contrat sans HDS peut être ANNULÉ par un juge avec remboursement intégral.",
    seuil:
      "Dès que Nami héberge des données de santé pour le compte de professionnels/structures (= pour compte de tiers). Et ça inclut les 'à-côtés' : logs, backups, si ils contiennent de la donnée de santé.",
    consequences: [
      "Contrat annulable par un juge (ordre public)",
      "Remboursement intégral des sommes versées",
      "Responsabilité civile et pénale",
      "Blocage commercial : question éliminatoire en appel d'offres santé",
    ],
    impactNami:
      "BLOQUANT. Nami DOIT héberger chez un prestataire certifié HDS (ou obtenir sa propre certification, très lourd). Vérifier que TOUS les services (DB, stockage, backups, logs managés) sont dans le périmètre certifié.",
    sourcePdf: "Pages 179-185 (cours HDS), pages 129-131 (contrats informatiques)",
  },
  {
    id: "HDS_CLAUSES",
    nom: "9 catégories de clauses obligatoires du contrat HDS",
    theme: "hds",
    textes: ["Art. R1111-11 CSP"],
    regle:
      "Le contrat d'hébergement doit contenir 9 catégories de mentions obligatoires incluant : description du service, périmètre, sécurité, lieu d'hébergement, sous-traitance, restitution des données, notification d'incidents, audits, assurance.",
    seuil: "Tout contrat d'hébergement de données de santé.",
    consequences: [
      "Contrat non-conforme = risque d'annulation",
      "Responsabilité du RT (structure) et du ST (Nami) en cas d'incident",
    ],
    impactNami:
      "Le DPA/contrat entre Nami et son hébergeur ET entre Nami et ses clients doit intégrer ces 9 catégories.",
    sourcePdf: "Pages 183-184",
  },
  {
    id: "HDS_RESPONSABILITE",
    nom: "Responsabilité contractuelle : pas de cap sur la sécurité",
    theme: "hds",
    textes: [
      "Jurisprudence française sur les clauses limitatives de responsabilité",
      "Art. 1170 Code civil — clause privant de substance l'obligation essentielle",
    ],
    regle:
      "Les tribunaux français annulent les clauses qui plafonnent la responsabilité en matière de sécurité des données de santé. Une clause excluant les dommages indirects liés à une cyberattaque est considérée comme vidant l'obligation essentielle de sa substance.",
    seuil: "Tout contrat d'hébergement/SaaS santé.",
    consequences: [
      "Clause annulée par le juge",
      "Responsabilité intégrale",
    ],
    impactNami:
      "ATTENTION : les CGV de Nami ne doivent pas contenir de limitation de responsabilité trop agressive sur la sécurité des données. Ce sera contesté.",
    sourcePdf: "Pages 155-156 (cours contrats informatiques)",
  },

  // ========================================================================
  // RGPD — DONNÉES DE SANTÉ
  // ========================================================================
  {
    id: "RGPD_DONNEES_SANTE",
    nom: "Données de santé = catégorie spéciale (Art. 9)",
    theme: "rgpd",
    textes: [
      "RGPD Art. 9 — Traitement de catégories particulières",
      "RGPD Art. 9§2(h) — Exception : finalité médicale sous secret",
      "Art. L1110-4 CSP — Secret professionnel / secret partagé",
    ],
    regle:
      "Le traitement de données de santé est INTERDIT par principe. Exceptions applicables à Nami : Art. 9§2(h) — traitement nécessaire aux fins de médecine préventive, de diagnostic, de soins, par un professionnel soumis au secret. NE PAS utiliser le consentement (Art. 9§2(a)) comme base fourre-tout : en santé, le consentement est rarement 'librement donné' au sens RGPD.",
    seuil: "Dès que Nami traite : poids, IMC, symptômes, émotions, comportements alimentaires, notes cliniques, etc.",
    consequences: [
      "Amende CNIL jusqu'à 20M€ ou 4% CA mondial",
      "Interdiction du traitement",
      "Dommages et intérêts",
    ],
    impactNami:
      "Base légale principale pour le traitement de coordination : Art. 9§2(h). Le professionnel (RT) traite sous couvert du secret professionnel. Nami (ST) traite sur instruction du RT.",
    sourcePdf: "Pages 164-168, 429-436, 580-595",
  },
  {
    id: "RGPD_DPIA",
    nom: "DPIA obligatoire (Art. 35)",
    theme: "rgpd",
    textes: [
      "RGPD Art. 35 — Analyse d'impact (AIPD/DPIA)",
      "Liste CNIL des traitements nécessitant une DPIA",
      "Guidelines WP29/EDPB sur les DPIA",
    ],
    regle:
      "Une DPIA est obligatoire quand le traitement est susceptible d'engendrer un risque élevé pour les droits et libertés. Critères déclencheurs : données de santé + grande échelle + technologies innovantes (IA) + personnes vulnérables (patients).",
    seuil:
      "Nami coche au moins 3-4 critères : données de santé, IA, messagerie contenant de la DS, personnes vulnérables, grande échelle visée.",
    consequences: [
      "Amende CNIL",
      "Interdiction de mise en production",
    ],
    impactNami:
      "DPIA QUASI-OBLIGATOIRE avant mise en production. Doit couvrir : cockpit, journal patient, messagerie, IA, orientation.",
    sourcePdf: "Pages 581-583, 859-860",
  },
  {
    id: "RGPD_VIOLATION",
    nom: "Notification de violation (72h)",
    theme: "rgpd",
    textes: [
      "RGPD Art. 33 — Notification à l'autorité (72h)",
      "RGPD Art. 34 — Communication à la personne",
      "ANS — Signalement incidents de sécurité SI de santé",
    ],
    regle:
      "Notification à la CNIL dans les 72h suivant la découverte d'une violation de données. Si risque élevé : notification aux personnes concernées. En plus, en santé : signalement à l'ANS via le portail dédié.",
    seuil: "Toute violation (accès non autorisé, fuite, perte, altération) de données de santé.",
    consequences: [
      "Amende CNIL si notification tardive ou absente",
      "Atteinte réputationnelle majeure",
      "Perte de contrats B2B",
    ],
    impactNami:
      "Procédure de réponse aux incidents indispensable : détection, qualification, notification CNIL + ANS + clients + patients si nécessaire. Délai : 72h.",
    sourcePdf: "Pages 583, 858",
  },

  // ========================================================================
  // TÉLÉMÉDECINE / TÉLÉSURVEILLANCE
  // ========================================================================
  {
    id: "TELEMEDECINE_DEFINITION",
    nom: "Définition et actes de télémédecine",
    theme: "telemedecine",
    textes: [
      "Art. L6316-1 CSP — Définition télémédecine",
      "Art. R6316-1 CSP — 5 actes de télémédecine",
      "Décret 2023-1017 — Télésurveillance droit commun",
    ],
    regle:
      "La télémédecine comprend 5 actes : téléconsultation, téléexpertise, télésurveillance, téléassistance, régulation. La TÉLÉSURVEILLANCE = interprétation à distance de données pour le suivi médical d'un patient. La téléconsultation doit être par vidéo (pas téléphone). Maximum 20% de l'activité conventionnée à distance.",
    seuil:
      "Dès que Nami organise une 'interprétation à distance de données de suivi' → télésurveillance. Même si c'est 'simple' ou 'organisationnel' dans le discours.",
    consequences: [
      "Obligations spécifiques : consentement tracé, compte-rendu versé au DMP, conditions techniques",
      "Référentiels de télésurveillance à respecter",
      "Marquage CE si le logiciel est le DM de télésurveillance",
    ],
    impactNami:
      "STRUCTURANT. Nami ne doit PAS organiser de 'surveillance de l'état du patient à distance'. Rester dans la 'coordination et consolidation d'informations'. Le vocabulaire est déterminant.",
    sourcePdf: "Pages 860-876, 1260-1290",
  },
  {
    id: "TELESURVEILLANCE_DROIT_COMMUN",
    nom: "Télésurveillance de droit commun (2023)",
    theme: "telemedecine",
    textes: [
      "Décret 2023-1017",
      "Arrêtés de prise en charge des activités de télésurveillance",
    ],
    regle:
      "Depuis 2023, la télésurveillance est entrée dans le droit commun avec des conditions de prise en charge par l'Assurance Maladie. Le dispositif comprend obligatoirement un DM numérique certifié + un opérateur de télésurveillance.",
    seuil: "Activité de surveillance à distance organisée avec interprétation des données.",
    consequences: [
      "Obligation de certification DM pour le logiciel",
      "Obligation de certification/agrément pour l'opérateur",
      "Conditions de remboursement strictes",
    ],
    impactNami:
      "Si Nami veut UN JOUR faire de la télésurveillance (post-V1), il faudra un DM certifié CE. Pour V1 : rester fermement hors de ce périmètre.",
    sourcePdf: "Pages 1260-1290",
  },

  // ========================================================================
  // INTELLIGENCE ARTIFICIELLE
  // ========================================================================
  {
    id: "IA_ACT",
    nom: "AI Act (Règlement UE 2024/1689)",
    theme: "ia",
    textes: [
      "Règlement UE 2024/1689 — AI Act",
      "Annexe III — Systèmes d'IA à haut risque",
      "Art. 6 — Classification des systèmes à haut risque",
    ],
    regle:
      "L'AI Act classe les systèmes d'IA par niveau de risque. En santé, un système d'IA adossé à un DM (MDR) est automatiquement 'haut risque' (Annexe III). Obligations : QMS, gestion des risques, données d'entraînement, transparence, supervision humaine, robustesse, cybersécurité, enregistrement dans la base UE.",
    seuil:
      "Si l'IA de Nami est classée 'haut risque' (= adossée à un DM ou utilisée pour des décisions impactant la santé).",
    consequences: [
      "Obligations de conformité AI Act",
      "Amende jusqu'à 35M€ ou 7% CA mondial",
      "Interdiction de mise sur le marché",
    ],
    impactNami:
      "Si Nami reste hors DM, l'IA de Nami (résumés/structuration) est probablement 'risque limité' (obligations de transparence). Si Nami bascule en DM, l'IA devient automatiquement 'haut risque' avec obligations lourdes. Raison de plus pour rester hors DM.",
    sourcePdf: "Pages 437-446, 463-466, 478-481",
  },
  {
    id: "IA_TRANSPARENCE",
    nom: "Obligation de transparence IA (risque limité)",
    theme: "ia",
    textes: ["AI Act — Art. 50 — Obligations de transparence"],
    regle:
      "Les systèmes d'IA 'à risque limité' doivent informer les utilisateurs qu'ils interagissent avec un contenu généré par IA. Les contenus générés doivent être identifiés comme tels.",
    seuil: "Tout output généré par IA présenté à l'utilisateur.",
    consequences: ["Amende si absence de marquage"],
    impactNami:
      "APPLICABLE. Tous les résumés/synthèses IA doivent être identifiés comme 'Contenu généré par IA — brouillon à vérifier'. C'est cohérent avec les exigences anti-DM.",
  },

  // ========================================================================
  // CONTRATS INFORMATIQUES EN SANTÉ
  // ========================================================================
  {
    id: "CONTRAT_SLA",
    nom: "Obligations contractuelles SaaS santé",
    theme: "contrats",
    textes: [
      "Art. 1231-1 Code civil — Responsabilité contractuelle",
      "Jurisprudence sur les SLA en santé",
      "Référentiel HDS",
    ],
    regle:
      "En SaaS santé, les obligations de disponibilité, maintenance, réversibilité et sécurité sont renforcées. Un SLA incompatible avec un usage santé (ex : 99% disponibilité = 87h d'indisponibilité/an) peut être considéré comme insuffisant. La réversibilité (export des données en fin de contrat) est une obligation quasi-systématique.",
    seuil: "Tout contrat SaaS impliquant des données de santé.",
    consequences: [
      "Responsabilité contractuelle en cas d'indisponibilité",
      "Obligation de réversibilité (export structuré)",
      "Assurance RC Pro / cyber adaptée",
    ],
    impactNami:
      "Les CGV/CGU de Nami doivent prévoir : SLA réaliste + procédure de réversibilité + assurance RC Pro/cyber. Ne pas sous-estimer les attentes des établissements.",
    sourcePdf: "Pages 131-156 (cours contrats informatiques)",
  },
  {
    id: "CONTRAT_AUDIT",
    nom: "Droit d'audit du client",
    theme: "contrats",
    textes: [
      "RGPD Art. 28(3)(h) — Droit d'audit du RT sur le ST",
      "Référentiel HDS — Audit et contrôle",
    ],
    regle:
      "Le responsable de traitement (client/structure) a le droit d'auditer le sous-traitant (Nami). Ce droit est renforcé en santé. Il doit être prévu contractuellement : modalités, fréquence, périmètre, coûts.",
    seuil: "Tout contrat de sous-traitance RGPD en santé.",
    consequences: ["Refus d'audit = rupture contractuelle possible"],
    impactNami:
      "Prévoir dans les contrats : clause d'audit + modalités pratiques (remote audit, certification tierce, rapports de pentest).",
    sourcePdf: "Pages 200-206 (cours audit)",
  },

  // ========================================================================
  // DÉONTOLOGIE
  // ========================================================================
  {
    id: "DEONTO_SECRET",
    nom: "Secret professionnel et secret partagé",
    theme: "deontologie",
    textes: [
      "Art. L1110-4 CSP — Secret professionnel",
      "Art. L1110-12 CSP — Équipe de soins",
      "Décret 2016-994 — Échange et partage d'informations",
      "Code pénal Art. 226-13",
    ],
    regle:
      "Le secret médical est absolu. L'exception : le partage au sein de l'équipe de soins (Art. L1110-12) = professionnels participant DIRECTEMENT à la prise en charge d'un MÊME patient. Le patient doit être informé et peut s'opposer. Hors équipe de soins : consentement préalable du patient.",
    seuil:
      "Tout partage d'information de santé entre professionnels. Nami facilite ce partage → doit respecter le périmètre 'équipe de soins'.",
    consequences: [
      "Violation du secret = 1 an d'emprisonnement + 15 000€ d'amende (Code pénal)",
      "Sanctions disciplinaires (ordres professionnels)",
      "Responsabilité civile",
    ],
    impactNami:
      "STRUCTURANT pour le modèle d'accès. L'accès dans Nami = care team par patient = reflet juridique de l'équipe de soins. Accès 'organisation-wide' = violation du secret.",
    sourcePdf: "Pages 750-751 (consentement), pages 857-861",
  },
  {
    id: "DEONTO_CAPTATION",
    nom: "Interdiction de captation de patientèle",
    theme: "deontologie",
    textes: [
      "Art. R4127-56 et s. Code de déontologie médicale",
      "Art. L4113-5 CSP — Captation de patientèle",
      "Jurisprudence ordinale",
    ],
    regle:
      "Tout mécanisme qui 'envoie des patients' ou favorise un professionnel par rapport à un autre est interdit. Le référencement payant, le 'matching' opaque, le 'recommandé' sont assimilables à de la captation.",
    seuil: "Dès que le répertoire/l'adressage n'est pas neutre et transparent.",
    consequences: [
      "Sanctions disciplinaires pour le professionnel",
      "Risque pour la plateforme : complicité, responsabilité, réputation",
    ],
    impactNami:
      "Le répertoire DOIT être neutre (alphabétique/distance). L'adressage est un acte du professionnel, pas de Nami. Jamais de 'recommandé' ni de pay-to-rank.",
    sourcePdf: "Pages 427-428",
  },
];

// ============================================================================
// HELPERS
// ============================================================================

export function getFrameworksByTheme(
  theme: LegalFramework["theme"]
): LegalFramework[] {
  return legalFrameworks.filter((f) => f.theme === theme);
}

export function getCriticalFrameworks(): LegalFramework[] {
  return legalFrameworks.filter(
    (f) =>
      f.impactNami.startsWith("CRITIQUE") ||
      f.impactNami.startsWith("BLOQUANT") ||
      f.impactNami.startsWith("STRUCTURANT")
  );
}

export function getAllTextes(): string[] {
  return Array.from(new Set(legalFrameworks.flatMap((f) => f.textes))).sort();
}
