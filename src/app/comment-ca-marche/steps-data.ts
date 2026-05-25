/**
 * Steps Comment ça marche — données structurées V1.
 *
 * Page PUBLIQUE → enjeu MDR/DGCCRF/ANSM élevé.
 * Wording strictement vérifié (CLAUDE.md + DGCCRF) :
 *   ❌ Aucun "diagnostic", "traitement", "prescription", "guérison"
 *   ❌ Aucun superlatif invérifiable ("meilleur", "leader", "n°1")
 *   ❌ Aucun chiffre non sourcé (%, satisfaction, etc.)
 *   ✅ "rendez-vous", "soignant", "coordination", "document"
 *   ✅ "sereinement", "facilement", "en quelques clics" (UX, pas santé)
 */

export type StepIconName =
  | "search"
  | "calendar"
  | "file-text"
  | "users";

export interface Step {
  number: 1 | 2 | 3 | 4;
  title: string;
  description: string;
  iconName: StepIconName;
  bullets: string[];
  cta?: {
    label: string;
    href: string;
  };
}

export const STEPS: Step[] = [
  {
    number: 1,
    title: "Trouvez le soignant qui vous correspond",
    description:
      "Recherchez parmi les soignants Nami selon votre besoin, votre ville et vos disponibilités.",
    iconName: "search",
    bullets: [
      "Profils détaillés (spécialité, langues parlées, accessibilité)",
      "Disponibilités en temps réel",
      "Patient seul, parent ou proche aidant : tout le monde peut s'inscrire",
    ],
    cta: {
      label: "Trouver un soignant",
      href: "/trouver-un-soignant",
    },
  },
  {
    number: 2,
    title: "Prenez rendez-vous en quelques clics",
    description:
      "Choisissez votre créneau, précisez le motif, validez. C'est confirmé immédiatement.",
    iconName: "calendar",
    bullets: [
      "Présentiel, téléconsultation ou téléphone selon le soignant",
      "Confirmation immédiate sans appel téléphonique",
      "Modifiable ou annulable à tout moment depuis votre espace",
    ],
  },
  {
    number: 3,
    title: "Préparez votre consultation sereinement",
    description:
      "Centralisez vos documents et vos questions avant le rendez-vous.",
    iconName: "file-text",
    bullets: [
      "Téléversez vos documents (PDF, photos) en avance",
      "Notez vos questions pour ne rien oublier le jour J",
      "Recevez un rappel automatique 24h et 1h avant",
    ],
  },
  {
    number: 4,
    title: "Continuez votre parcours après le rendez-vous",
    description:
      "Gardez le contact avec votre équipe et coordonnez votre suivi.",
    iconName: "users",
    bullets: [
      "Messagerie sécurisée avec votre équipe soignante",
      "Historique complet de votre parcours dans un seul espace",
      "Coordination entre soignants facilitée pour votre suivi",
    ],
  },
];

// ─── Personae (section "Pour qui ?") ──────────────────────────────────────────
// MDR strict : JAMAIS de pathologie nominale. Décrire des SITUATIONS, pas des
// patients étiquetés ("diabétique", "cancéreux" → interdits RGPD + MDR).

export interface Persona {
  id: string;
  title: string;
  description: string;
  icon: "heart" | "baby" | "helping-hand" | "user";
}

export const PERSONAS: Persona[] = [
  {
    id: "chronique",
    title: "Vous avez un suivi régulier",
    description:
      "Plusieurs rendez-vous par an, plusieurs soignants : Nami centralise votre parcours pour ne plus rien perdre.",
    icon: "heart",
  },
  {
    id: "parent",
    title: "Vous gérez le suivi de votre enfant",
    description:
      "Créez un profil pour votre enfant mineur, prenez ses rendez-vous, suivez son carnet de santé en un endroit.",
    icon: "baby",
  },
  {
    id: "aidant",
    title: "Vous accompagnez un proche",
    description:
      "Aidant familial, vous gérez les rendez-vous et documents d'un proche avec son accord. La délégation est claire et révocable.",
    icon: "helping-hand",
  },
  {
    id: "ponctuel",
    title: "Vous avez un besoin ponctuel",
    description:
      "Un rendez-vous unique chez un soignant ? Nami fonctionne aussi pour les consultations isolées, sans engagement.",
    icon: "user",
  },
];

// ─── FAQ mini ─────────────────────────────────────────────────────────────────
// 5 questions essentielles publiques. Wording HDS + RGPD explicit.

export interface MiniFAQ {
  id: string;
  question: string;
  answer: string;
}

export const MINI_FAQ: MiniFAQ[] = [
  {
    id: "prix",
    question: "Nami est-il gratuit pour les patients ?",
    answer:
      "Oui, l'utilisation de Nami est gratuite pour vous. Aucun frais caché, aucun abonnement.",
  },
  {
    id: "securite",
    question: "Mes données sont-elles sécurisées ?",
    answer:
      "Vos données sont hébergées en France chez un Hébergeur de Données de Santé certifié (HDS). Nami applique strictement le RGPD. Vous gardez le contrôle de vos consentements.",
  },
  {
    id: "specialites",
    question: "Quelles spécialités sont disponibles sur Nami ?",
    answer:
      "Médecine générale, spécialités médicales (cardiologie, dermatologie, gynécologie, psychiatrie, etc.), professions paramédicales (kinésithérapie, orthophonie, podologie) et soins de support (diététique, psychologie). Le réseau s'agrandit chaque semaine.",
  },
  {
    id: "enfant",
    question: "Puis-je gérer le compte de mon enfant ?",
    answer:
      "Oui, en tant que représentant légal, vous pouvez créer un profil délégué pour votre enfant mineur. Vous gérez ses rendez-vous, documents et messages depuis votre propre compte.",
  },
  {
    id: "suppression",
    question: "Comment supprimer mon compte si je le souhaite ?",
    answer:
      "Depuis votre espace Mon compte, vous pouvez supprimer définitivement votre compte en tapant SUPPRIMER. Vos données sont anonymisées sous 30 jours conformément au RGPD (Art. 17 — droit à l'effacement).",
  },
];
