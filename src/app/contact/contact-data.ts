/**
 * Points de contact publics Nami.
 *
 * Tous les emails sont SOURCÉS depuis /mentions-legales et /confidentialite :
 * - contact@namipourlavie.com : email générique (mentions-legales L.22, confidentialite L.19 et L.177)
 * - dpo@namipourlavie.com : référent protection des données (confidentialite L.143-144)
 *
 * Aucun email inventé. Aucune promesse de temps de réponse (DGCCRF).
 */

export type ContactAudience =
  | "patient"
  | "soignant"
  | "dpo"
  | "presse"
  | "securite"
  | "partenaire";

export type ContactIconName =
  | "Heart"
  | "Stethoscope"
  | "Shield"
  | "Newspaper"
  | "Lock"
  | "Handshake";

export interface ContactPoint {
  id: ContactAudience;
  title: string;
  description: string;
  iconName: ContactIconName;
  email: string;
  emailLabel?: string;
}

export const CONTACT_POINTS: ContactPoint[] = [
  {
    id: "patient",
    title: "Vous êtes patient ou proche",
    description:
      "Question sur votre compte, l'utilisation de l'application ou la prise de rendez-vous avec votre soignant.",
    iconName: "Heart",
    email: "contact@namipourlavie.com",
  },
  {
    id: "soignant",
    title: "Vous êtes professionnel de santé",
    description:
      "Question sur la plateforme de coordination, la facturation, l'intégration à votre cabinet ou une démonstration.",
    iconName: "Stethoscope",
    email: "contact@namipourlavie.com",
  },
  {
    id: "dpo",
    title: "Protection des données (DPO)",
    description:
      "Exercice de vos droits RGPD (accès, rectification, effacement, opposition au traitement automatisé).",
    iconName: "Shield",
    email: "dpo@namipourlavie.com",
  },
  {
    id: "presse",
    title: "Presse et médias",
    description:
      "Demande d'interview, dossier de presse, prise de parole ou couverture éditoriale.",
    iconName: "Newspaper",
    email: "contact@namipourlavie.com",
  },
  {
    id: "securite",
    title: "Signalement de sécurité",
    description:
      "Signalement responsable d'une vulnérabilité, faille technique ou incident de sécurité.",
    iconName: "Lock",
    email: "contact@namipourlavie.com",
  },
  {
    id: "partenaire",
    title: "Partenariat et institutions",
    description:
      "Hôpital, CPTS, MSP, réseau de santé, éditeur logiciel, recherche clinique ou collaboration institutionnelle.",
    iconName: "Handshake",
    email: "contact@namipourlavie.com",
  },
];
