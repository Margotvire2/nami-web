/**
 * Données structurées Landing "Pour les proches" V1.
 *
 * Wording strictement vérifié (CLAUDE.md + DGCCRF + MDR + ANSM) :
 *   ❌ Aucune pathologie nominale ("Alzheimer", "Parkinson", "cancer", etc.)
 *     → RGPD + MDR : décrire des SITUATIONS, pas des étiquettes
 *   ❌ Aucun "diagnostic", "traitement", "prescription", "guérison"
 *   ❌ Aucun superlatif invérifiable ("meilleur", "leader", "n°1")
 *   ❌ Aucun témoignage non sourcé
 *   ✅ "perte d'autonomie", "maladie chronique", "suivi long"
 *   ✅ "coordination", "outil de coordination"
 *   ✅ "consentement explicite" (RGPD)
 *   ✅ "autorité parentale" (art. 371-1 Code civil pour mineur)
 *
 * Statistique sourcée :
 *   - DREES 2024 : 11 millions d'aidants familiaux en France
 */

export type PersonaIconName =
  | "baby"
  | "heart"
  | "users"
  | "hand-heart";

export interface Persona {
  id: string;
  label: string;
  description: string;
  iconName: PersonaIconName;
  /** 2-3 pain points concrets — wording quotidien, pas clinique */
  painPoints: string[];
  /** 2-3 façons dont Nami aide */
  namiHelps: string[];
}

export const PROCHES_PERSONAE: Persona[] = [
  {
    id: "parent-enfant",
    label: "Parent d'un enfant",
    description:
      "Vous gérez les rendez-vous, les documents et le suivi de votre enfant mineur.",
    iconName: "baby",
    painPoints: [
      "Plusieurs spécialistes à coordonner sans vision d'ensemble",
      "Documents éparpillés entre carnet de santé, mails et papiers",
      "Difficulté à retrouver l'historique des consultations",
    ],
    namiHelps: [
      "Un seul espace centralisé pour votre enfant",
      "Vous gérez son compte en tant que représentant légal",
      "Vous partagez l'accès avec l'autre parent ou un soignant référent",
    ],
  },
  {
    id: "conjoint",
    label: "Conjoint(e) ou partenaire",
    description:
      "Vous accompagnez votre conjoint(e) dans son parcours de soin au quotidien.",
    iconName: "heart",
    painPoints: [
      "Vous oubliez les détails médicaux discutés en consultation",
      "Vous n'êtes pas toujours présent(e) aux rendez-vous",
      "Vous voulez aider sans vous substituer à votre conjoint(e)",
    ],
    namiHelps: [
      "Accès partagé avec l'accord explicite de votre conjoint(e)",
      "Notifications des rendez-vous à venir",
      "Documents et messages accessibles à tout moment",
    ],
  },
  {
    id: "enfant-aine",
    label: "Enfant adulte d'un parent âgé",
    description:
      "Vous aidez votre père ou mère à organiser son parcours médical, même à distance.",
    iconName: "users",
    painPoints: [
      "Plusieurs soignants à coordonner (médecin traitant, spécialistes)",
      "Difficulté à suivre les ordonnances et les rendez-vous",
      "Distance géographique parfois importante",
    ],
    namiHelps: [
      "Coordination centralisée pour votre parent",
      "Accès délégué avec son consentement explicite",
      "Tous les soignants visibles dans un seul outil",
    ],
  },
  {
    id: "aidant-proche",
    label: "Aidant d'une personne en perte d'autonomie",
    description:
      "Vous accompagnez un proche dépendant ou en situation de handicap.",
    iconName: "hand-heart",
    painPoints: [
      "Organisation lourde du quotidien médical",
      "Coordination d'une équipe pluridisciplinaire",
      "Charge mentale forte et durable",
    ],
    namiHelps: [
      "Vue d'ensemble du parcours de soin",
      "Coordination équipe dans un seul outil",
      "Délégation possible avec d'autres aidants familiaux",
    ],
  },
];

// ─── Features pour proches ────────────────────────────────────────────────────

export type FeatureIconName =
  | "bell"
  | "users"
  | "file-text"
  | "list-checks"
  | "message-circle";

export interface ProcheFeature {
  id: string;
  title: string;
  description: string;
  iconName: FeatureIconName;
}

export const PROCHES_FEATURES: ProcheFeature[] = [
  {
    id: "notifs",
    title: "Notifications partagées",
    description:
      "Recevez les rappels de rendez-vous de votre proche en même temps que lui.",
    iconName: "bell",
  },
  {
    id: "equipe",
    title: "Vue d'ensemble des soignants",
    description:
      "Tous les soignants de votre proche dans un seul écran : qui suit quoi, quand.",
    iconName: "users",
  },
  {
    id: "documents",
    title: "Documents centralisés",
    description:
      "Ordonnances, bilans, comptes-rendus : tout rangé au même endroit, accessible à tous les soignants autorisés.",
    iconName: "file-text",
  },
  {
    id: "preparation",
    title: "Préparation des consultations",
    description:
      "Notez les questions à poser, ajoutez les documents avant le rendez-vous, n'oubliez rien.",
    iconName: "list-checks",
  },
  {
    id: "messages",
    title: "Échange avec les soignants",
    description:
      "Messagerie sécurisée pour communiquer avec l'équipe entre les consultations (avec l'accord de votre proche).",
    iconName: "message-circle",
  },
];

// ─── Mini FAQ pour proches ────────────────────────────────────────────────────

export interface ProcheFAQ {
  id: string;
  question: string;
  answer: string;
}

export const PROCHES_FAQ: ProcheFAQ[] = [
  {
    id: "compte-proche",
    question: "Mon proche doit-il créer un compte aussi ?",
    answer:
      "Pour les mineurs : non, vous gérez tout depuis votre compte parent. Pour les proches majeurs : oui, votre proche crée son compte et vous donne accès délégué via une notification d'acceptation. Il peut retirer cet accès à tout moment.",
  },
  {
    id: "transparence",
    question: "Que voit mon proche de ce que je fais ?",
    answer:
      "Votre proche voit l'historique complet de toutes vos actions en son nom (rendez-vous pris, documents ajoutés, messages envoyés). La traçabilité est totale, conformément au RGPD.",
  },
  {
    id: "plusieurs",
    question: "Puis-je gérer plusieurs proches en même temps ?",
    answer:
      "Oui. Vous pouvez gérer plusieurs profils délégués depuis un seul compte (par exemple : vos enfants + votre mère âgée). Vous basculez d'un profil à l'autre en un clic.",
  },
  {
    id: "retrait",
    question: "Comment retirer mon accès à un proche ?",
    answer:
      "Vous ou votre proche pouvez retirer l'accès à tout moment depuis l'espace Mon compte. L'historique est conservé pour audit, mais vous ne pouvez plus agir au nom de votre proche.",
  },
  {
    id: "tutelle",
    question: "Et si mon proche n'est pas en état de consentir ?",
    answer:
      "Si votre proche est sous tutelle, curatelle ou habilitation familiale, la gestion s'effectue dans le cadre du mandat juridique. Contactez-nous pour vous accompagner dans la mise en place : contact@namipourlavie.com.",
  },
];

// ─── Statistique sourcée DREES 2024 ───────────────────────────────────────────
// Référence : DREES, Enquête Capacités, aides et ressources des seniors (CARE)
// — 11 millions d'aidants familiaux en France.

export const STAT_AIDANTS = {
  count: "11 millions",
  label: "d'aidants familiaux en France",
  source: "DREES 2024",
};
