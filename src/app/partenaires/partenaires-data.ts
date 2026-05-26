/**
 * Données partenariats institutionnels V1.
 *
 * Wording STRICT (CLAUDE.md + DGCCRF + RGPD + MDR) :
 *   ❌ Aucun partenaire nominal inventé
 *   ❌ Aucun claim interop FHIR/MSSanté/Ségur non vérifié Phase 0
 *   ❌ Aucun "white-label", "SLA garanti", "leader" — pas dans l'existant
 *   ❌ Aucun "remplace le DAC" — Nami COMPLÉMENTAIRE des structures publiques
 *   ✅ Cohérence /pitch-reseau (ARS indicateurs, ville-hôpital, ambulatoire)
 *   ✅ "outil au service de", "compatible avec les missions"
 *
 * Référence vérifiée : LOI n°2019-774 du 24 juillet 2019 (Ma Santé 2022)
 * pour le cadre légal DAC.
 */

export type InstitutionType =
  | "ars"
  | "cpts"
  | "hopital"
  | "mutuelle"
  | "reseau-soins"
  | "dac";

export type IconName =
  | "landmark"
  | "users-round"
  | "building-2"
  | "shield-plus"
  | "network"
  | "compass";

export interface InstitutionTypology {
  id: InstitutionType;
  label: string;
  description: string;
  iconName: IconName;
  useCases: string[];
  namiValue: string[];
}

export const INSTITUTION_TYPES: InstitutionTypology[] = [
  {
    id: "ars",
    label: "Agences Régionales de Santé (ARS)",
    description: "Coordination régionale des parcours patients.",
    iconName: "landmark",
    useCases: [
      "Pilotage de parcours de soins spécialisés sur un territoire",
      "Réduction des ruptures de parcours entre ville et hôpital",
      "Suivi qualité des parcours coordonnés",
    ],
    namiValue: [
      "Outil déployable sur un périmètre territorial défini",
      "Indicateurs de file active et de complétude des parcours",
      "Outil au service des missions ARS — pas un remplacement",
    ],
  },
  {
    id: "cpts",
    label: "Communautés Professionnelles Territoriales de Santé (CPTS)",
    description: "Coordination ville pour un territoire de santé.",
    iconName: "users-round",
    useCases: [
      "Coordination pluri-professionnelle ville-hôpital",
      "Suivi des patients chroniques sur le territoire",
      "Partage d'information entre soignants du territoire",
    ],
    namiValue: [
      "Outil partagé pour tous les soignants de la CPTS",
      "Tableau de bord territorial selon le périmètre défini",
      "Adressage structuré entre membres de la CPTS",
    ],
  },
  {
    id: "hopital",
    label: "Hôpitaux publics et privés",
    description: "Coordination des sorties et suivis post-hospitaliers.",
    iconName: "building-2",
    useCases: [
      "Préparation et suivi des sorties d'hospitalisation",
      "Coordination avec la ville (médecin traitant, infirmier)",
      "Échanges sécurisés entre hospitalier et ambulatoire",
    ],
    namiValue: [
      "Continuité des soins post-sortie",
      "Outil de coordination ville-hôpital",
      "Espace partagé entre l'équipe hospitalière et ambulatoire",
    ],
  },
  {
    id: "dac",
    label: "Dispositifs d'Appui à la Coordination (DAC)",
    description:
      "Appui aux parcours complexes (LOI n°2019-774 du 24 juillet 2019).",
    iconName: "compass",
    useCases: [
      "Coordination des parcours complexes",
      "Centralisation des informations entre soignants",
      "Suivi longitudinal des situations accompagnées",
    ],
    namiValue: [
      "Outil compatible avec les missions DAC définies par la loi",
      "Centralisation des informations parcours dans un espace partagé",
      "Nami est complémentaire du DAC — pas un remplacement",
    ],
  },
  {
    id: "mutuelle",
    label: "Mutuelles et complémentaires santé",
    description:
      "Services de coordination dans le cadre d'offres santé pour adhérents.",
    iconName: "shield-plus",
    useCases: [
      "Coordination des soins pour adhérents",
      "Accompagnement des parcours chroniques",
      "Réseau de soignants partenaires accessible aux adhérents",
    ],
    namiValue: [
      "Outil de coordination intégrable à une offre mutualiste",
      "Suivi de parcours pour les adhérents bénéficiaires",
      "Modalités d'intégration à discuter selon votre périmètre",
    ],
  },
  {
    id: "reseau-soins",
    label: "Réseaux de soins spécialisés",
    description: "Coordination experte sur une pathologie ou un parcours.",
    iconName: "network",
    useCases: [
      "Réseau cancer, soins palliatifs, gérontologie, etc.",
      "Coordination experte sur un parcours dédié",
      "Suivi longitudinal sur plusieurs années",
    ],
    namiValue: [
      "Outil dédié à la coordination experte de votre réseau",
      "Adaptable au protocole du réseau",
      "Espace partagé entre tous les membres du réseau",
    ],
  },
];

// ─── 4 piliers de valeur ──────────────────────────────────────────────────────

export interface Pilier {
  id: string;
  title: string;
  description: string;
  iconName: "share-2" | "shield-check" | "rocket" | "settings-2";
}

export const PILIERS_VALEUR: Pilier[] = [
  {
    id: "coordination",
    title: "Coordination centralisée",
    description:
      "Un seul outil pour l'équipe pluri-professionnelle. Tous les soignants accèdent au même espace de coordination, dans le respect des consentements patients.",
    iconName: "share-2",
  },
  {
    id: "compliance",
    title: "Conformité native",
    description:
      "Hébergement en France, conformité RGPD, anonymisation sous 30 jours en cas de demande d'effacement. Migration vers une infrastructure HDS certifiée prévue en 2026.",
    iconName: "shield-check",
  },
  {
    id: "deploiement",
    title: "Déploiement progressif",
    description:
      "Pas d'installation lourde côté établissement. Application web et mobile responsive accessibles immédiatement par les utilisateurs autorisés.",
    iconName: "rocket",
  },
  {
    id: "adaptabilite",
    title: "Adaptabilité",
    description:
      "Configuration selon les protocoles, les périmètres et les workflows de votre structure. Discussion préalable avec votre équipe pour cadrer l'usage.",
    iconName: "settings-2",
  },
];

// ─── 4 étapes process partenariat ─────────────────────────────────────────────

export interface ProcessStep {
  number: 1 | 2 | 3 | 4;
  title: string;
  description: string;
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: 1,
    title: "Premier échange",
    description:
      "Présentation mutuelle de votre structure et de Nami, identification de vos besoins de coordination.",
  },
  {
    number: 2,
    title: "Démonstration ciblée",
    description:
      "Démonstration adaptée à votre périmètre (ville, hôpital, territoire) avec votre équipe.",
  },
  {
    number: 3,
    title: "Phase pilote",
    description:
      "Déploiement test sur un périmètre restreint avec accompagnement Nami. Durée et critères de succès à définir contractuellement.",
  },
  {
    number: 4,
    title: "Déploiement complet",
    description:
      "Extension au périmètre cible avec formation des utilisateurs et support continu.",
  },
];

// ─── FAQ institutionnelle ────────────────────────────────────────────────────

export interface InstitutionalFAQ {
  id: string;
  question: string;
  answer: string;
}

export const INSTITUTIONAL_FAQ: InstitutionalFAQ[] = [
  {
    id: "duree-engagement",
    question: "Quelle est la durée d'engagement contractuel ?",
    answer:
      "La durée d'engagement est définie contractuellement selon le périmètre du partenariat. Une phase pilote sans engagement long terme est systématiquement proposée avant le déploiement complet.",
  },
  {
    id: "integration-outils",
    question:
      "Comment Nami s'intègre-t-il avec nos outils existants ?",
    answer:
      "Les modalités d'intégration sont étudiées au cas par cas selon votre environnement existant (DPI, messagerie sécurisée, annuaire, etc.). Les standards d'interopérabilité sont discutés en phase de cadrage.",
  },
  {
    id: "formations",
    question:
      "Quelles formations sont prévues pour les utilisateurs ?",
    answer:
      "Un accompagnement à la prise en main est inclus dans le partenariat : sessions de formation pour les soignants, documentation utilisateur, support pendant la phase pilote. Modalités précises définies contractuellement.",
  },
  {
    id: "reversibilite",
    question:
      "Le contrat prévoit-il la réversibilité des données ?",
    answer:
      "Oui. En fin de contrat, vos données peuvent être exportées dans un format structuré et lisible (conformément au RGPD Art. 20 — droit à la portabilité). Les modalités d'export sont définies contractuellement.",
  },
  {
    id: "rgpd-sous-traitance",
    question:
      "Quel est le statut RGPD de Nami vis-à-vis de notre structure ?",
    answer:
      "Nami intervient en qualité de sous-traitant au sens de l'article 28 du RGPD. Une convention de sous-traitance précisant les rôles, les durées de conservation et les obligations est conclue avec chaque partenaire institutionnel.",
  },
  {
    id: "tarification",
    question: "Comment se définit la tarification ?",
    answer:
      "La tarification est adaptée au volume et au périmètre du partenariat. Aucune grille publique pour les acteurs institutionnels — un devis personnalisé est établi après le premier échange.",
  },
];
