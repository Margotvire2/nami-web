/**
 * FAQ Aide patient — données statiques V1.
 *
 * Pas d'API call : tout est servi côté client depuis ce fichier.
 * Avantages : zero latence, accessible offline (PWA-ready), pas de
 * dépendance backend.
 *
 * Wording strictement MDR-safe (cf. CLAUDE.md) :
 *   ❌ Aucun "diagnostic", "traitement", "prescription", "guérison"
 *   ✅ "rendez-vous", "soignant", "coordination", "compte", "données"
 *
 * Évolution V2 (ticket F-AIDE-FAQ-BACKEND) : remplacer ce fichier par
 * un fetch CMS pour mise à jour sans déploiement.
 */

export type FAQIconName =
  | "calendar"
  | "message"
  | "document"
  | "account"
  | "shield";

export interface FAQItem {
  id: string;
  question: string;
  /** Markdown léger supporté : **gras**, *italique*, [lien](url) */
  answerMarkdown: string;
  /** Mots-clés pour la recherche fuzzy basique côté client */
  keywords: string[];
}

export interface FAQCategory {
  id: string;
  title: string;
  icon: FAQIconName;
  description: string;
  items: FAQItem[];
}

export const FAQ_CATEGORIES: FAQCategory[] = [
  // ─── Rendez-vous ──────────────────────────────────────────────────────────
  {
    id: "rendez-vous",
    title: "Rendez-vous",
    icon: "calendar",
    description: "Prendre, modifier ou annuler vos rendez-vous",
    items: [
      {
        id: "rdv-prendre",
        question: "Comment prendre un rendez-vous avec un soignant ?",
        answerMarkdown:
          "Allez sur **Trouver un soignant** depuis votre accueil. Recherchez par spécialité ou par ville, choisissez un créneau disponible et confirmez. Le rendez-vous apparaît immédiatement dans **Mes rendez-vous**.",
        keywords: ["prendre", "réserver", "créer", "rdv", "rendez-vous"],
      },
      {
        id: "rdv-annuler",
        question: "Comment annuler un rendez-vous ?",
        answerMarkdown:
          "Sur la page **Mes rendez-vous**, ouvrez le rendez-vous concerné et cliquez sur **Annuler ce RDV**. Vous pouvez préciser un motif facultatif. Votre soignant est prévenu automatiquement.",
        keywords: ["annuler", "supprimer", "rdv", "rendez-vous"],
      },
      {
        id: "rdv-deplacer",
        question: "Comment déplacer ou modifier un rendez-vous ?",
        answerMarkdown:
          "Pour modifier la date ou l'heure d'un rendez-vous, annulez-le d'abord puis prenez-en un nouveau au créneau souhaité. Vous pouvez aussi envoyer un **message à votre soignant** pour qu'il le déplace pour vous.",
        keywords: ["déplacer", "modifier", "changer", "reporter", "rdv"],
      },
      {
        id: "rdv-rappel",
        question: "Vais-je recevoir un rappel avant mon rendez-vous ?",
        answerMarkdown:
          "Oui. Vous recevez automatiquement une notification **24 heures avant** et **1 heure avant** votre rendez-vous. Vous pouvez retrouver tous vos rappels dans **Notifications**.",
        keywords: ["rappel", "notification", "alerte", "rdv"],
      },
      {
        id: "rdv-demande",
        question: "À quoi sert la page « Mes demandes » ?",
        answerMarkdown:
          "Quand vous demandez un rendez-vous à un soignant qui valide manuellement ses créneaux, votre demande apparaît dans **Mes rendez-vous → Mes demandes** avec son statut : *En attente*, *Acceptée* ou *Refusée*.",
        keywords: ["demande", "en attente", "validation", "soignant"],
      },
    ],
  },

  // ─── Messages ─────────────────────────────────────────────────────────────
  {
    id: "messages",
    title: "Messages",
    icon: "message",
    description: "Communiquer avec votre équipe soignante",
    items: [
      {
        id: "msg-envoyer",
        question: "Comment envoyer un message à mon soignant ?",
        answerMarkdown:
          "Allez sur **Mes messages**, sélectionnez votre soignant et tapez votre message. Vous pouvez envoyer du texte, des questions, ou demander un complément d'information sur un compte-rendu.",
        keywords: ["envoyer", "message", "soignant", "communiquer"],
      },
      {
        id: "msg-non-vu",
        question: "Mon soignant ne voit pas mon message, que faire ?",
        answerMarkdown:
          "La messagerie Nami n'est **pas destinée aux échanges urgents**. Si votre soignant n'a pas répondu sous 48h, contactez-le par téléphone ou prenez un rendez-vous. **En cas d'urgence vitale, appelez le 15 ou le 112.**",
        keywords: ["urgence", "pas de réponse", "soignant", "message"],
      },
      {
        id: "msg-piece-jointe",
        question: "Puis-je joindre un document à un message ?",
        answerMarkdown:
          "L'ajout de pièces jointes dans la messagerie n'est pas encore disponible. En attendant, vous pouvez **téléverser votre document** dans **Mes documents** : votre soignant y a accès automatiquement.",
        keywords: ["pièce jointe", "document", "fichier", "message"],
      },
      {
        id: "msg-confidentialite",
        question: "Mes messages sont-ils confidentiels ?",
        answerMarkdown:
          "Oui. Vos messages sont chiffrés en transit et hébergés en France chez un Hébergeur de Données de Santé certifié (HDS). Seuls vous et votre équipe soignante y ont accès.",
        keywords: ["confidentiel", "sécurité", "HDS", "chiffré", "RGPD"],
      },
    ],
  },

  // ─── Documents ────────────────────────────────────────────────────────────
  {
    id: "documents",
    title: "Documents",
    icon: "document",
    description: "Ajouter, consulter et organiser vos documents",
    items: [
      {
        id: "doc-ajouter",
        question: "Comment ajouter un document à mon dossier ?",
        answerMarkdown:
          "Sur **Mes documents**, cliquez sur **Ajouter un document**. Sélectionnez un fichier (PDF, JPG, PNG, WebP, max 10 Mo), choisissez son type (ordonnance, bilan, courrier, etc.) et donnez-lui un titre clair.",
        keywords: ["ajouter", "uploader", "document", "fichier", "pdf"],
      },
      {
        id: "doc-formats",
        question: "Quels formats de documents sont acceptés ?",
        answerMarkdown:
          "Nami accepte les formats **PDF**, **JPEG**, **PNG** et **WebP**. La taille maximum est de **10 Mo par fichier**. Pour scanner un document papier, utilisez l'appareil photo de votre téléphone (mode document si disponible).",
        keywords: ["format", "pdf", "image", "taille", "10 mo"],
      },
      {
        id: "doc-partage",
        question: "Mes documents sont-ils partagés avec mon équipe ?",
        answerMarkdown:
          "Par défaut, **oui** : tous les soignants de votre équipe ont accès à vos documents pour mieux coordonner vos soins. Vous pourrez gérer ce partage finement dans une future version de Nami.",
        keywords: ["partage", "équipe", "soignant", "accès"],
      },
      {
        id: "doc-supprimer",
        question: "Comment supprimer un document ?",
        answerMarkdown:
          "La suppression individuelle de documents arrive prochainement. Si vous souhaitez retirer un document urgent, **envoyez un message à votre soignant** ou contactez-nous via la section **Contact** en bas de cette page.",
        keywords: ["supprimer", "retirer", "document"],
      },
      {
        id: "doc-conserver",
        question: "Combien de temps mes documents sont-ils conservés ?",
        answerMarkdown:
          "Vos documents restent disponibles tant que votre compte est actif. En cas de suppression de compte, ils sont anonymisés sous **30 jours** conformément au RGPD (Art. 17). Pour les obligations de conservation médicale, c'est votre soignant qui les applique de son côté.",
        keywords: ["conservation", "durée", "rgpd", "30 jours"],
      },
    ],
  },

  // ─── Mon compte ───────────────────────────────────────────────────────────
  {
    id: "compte",
    title: "Mon compte",
    icon: "account",
    description: "Gérer vos informations personnelles et votre profil",
    items: [
      {
        id: "compte-modifier",
        question: "Comment modifier mes informations personnelles ?",
        answerMarkdown:
          "Allez sur **Mon compte → Informations personnelles**. Vous pouvez modifier votre numéro de téléphone, votre date de naissance, votre adresse et votre genre. Votre email reste fixe (utilisé pour la connexion).",
        keywords: ["modifier", "informations", "profil", "compte"],
      },
      {
        id: "compte-email",
        question: "Comment changer mon adresse email ?",
        answerMarkdown:
          "Le changement d'email n'est pas encore disponible en libre-service. Envoyez-nous un message via la section **Contact** en bas de cette page : nous vous aiderons à transférer votre compte vers une nouvelle adresse.",
        keywords: ["email", "adresse", "changer"],
      },
      {
        id: "compte-mot-de-passe",
        question: "J'ai oublié mon mot de passe, que faire ?",
        answerMarkdown:
          "Sur la page de connexion, cliquez sur **Mot de passe oublié**. Vous recevrez un email avec un lien pour en créer un nouveau. Le lien est valable **1 heure**.",
        keywords: ["mot de passe", "oublié", "réinitialiser", "connexion"],
      },
      {
        id: "compte-supprimer",
        question: "Comment supprimer mon compte ?",
        answerMarkdown:
          "Allez sur **Mon compte → Supprimer mon compte**. Cette action est **définitive et irréversible**. Vos données seront anonymisées sous **30 jours**, conformément au RGPD (Art. 17 — droit à l'effacement). Vous devrez taper **SUPPRIMER** pour confirmer.",
        keywords: ["supprimer", "compte", "effacement", "rgpd"],
      },
      {
        id: "compte-enfant",
        question: "Puis-je gérer le compte de mon enfant mineur ?",
        answerMarkdown:
          "Oui. Vous pouvez créer un profil délégué pour votre enfant mineur (ou tout autre proche dont vous êtes le représentant légal) depuis **Mon compte → Profils délégués**. Vous gérerez alors ses rendez-vous, documents et messages à sa place.",
        keywords: ["enfant", "mineur", "parent", "délégation", "représentant"],
      },
    ],
  },

  // ─── Confidentialité et RGPD ──────────────────────────────────────────────
  {
    id: "confidentialite",
    title: "Confidentialité et RGPD",
    icon: "shield",
    description: "Sécurité de vos données et droits RGPD",
    items: [
      {
        id: "rgpd-hebergement",
        question: "Où sont hébergées mes données de santé ?",
        answerMarkdown:
          "Vos données sont hébergées en **France** chez un **Hébergeur de Données de Santé certifié (HDS)**. Aucune donnée n'est stockée ou transférée hors de l'Union européenne.",
        keywords: ["hébergement", "france", "hds", "europe", "données"],
      },
      {
        id: "rgpd-acces",
        question: "Qui peut voir mes données dans Nami ?",
        answerMarkdown:
          "Seuls **vous-même** et les **soignants de votre équipe** que vous avez explicitement acceptés. Aucun tiers (publicitaire, assureur, employeur) n'a accès à vos données.",
        keywords: ["accès", "qui", "voir", "équipe", "soignant"],
      },
      {
        id: "rgpd-droits",
        question: "Quels sont mes droits RGPD ?",
        answerMarkdown:
          "Conformément au RGPD, vous avez le droit : d'**accéder** à vos données (les consulter), de les **rectifier** (modifier), de demander leur **effacement** (suppression), à la **portabilité** (export), et de **vous opposer** au traitement. Toutes ces actions sont accessibles depuis **Mon compte**.",
        keywords: ["droits", "rgpd", "accès", "rectification", "portabilité"],
      },
      {
        id: "rgpd-export",
        question: "Comment exporter mes données ?",
        answerMarkdown:
          "Allez sur **Mon compte → Exporter mes données**. Vous recevrez par email un fichier ZIP contenant l'ensemble de votre dossier (informations, rendez-vous, messages, documents) au format lisible. Conforme RGPD Art. 15 et 20.",
        keywords: ["export", "télécharger", "portabilité", "zip", "rgpd"],
      },
      {
        id: "rgpd-consentement",
        question: "Comment gérer mes consentements ?",
        answerMarkdown:
          "Allez sur **Mon compte → Consentements**. Vous pouvez activer ou retirer votre consentement pour chaque type de traitement (envoi d'emails, partage avec un soignant tiers, etc.). Vous gardez le contrôle granulaire.",
        keywords: ["consentement", "cookies", "rgpd", "contrôle"],
      },
    ],
  },
];

/** Compteur total — utile pour analytics futur ou affichage */
export const TOTAL_FAQ_COUNT = FAQ_CATEGORIES.reduce(
  (acc, c) => acc + c.items.length,
  0,
);
