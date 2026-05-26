// Données structurées pour /securite-et-donnees
// Chaque claim ici est sourcé depuis /confidentialite et /mentions-legales
// Toute modification doit rester cohérente avec ces deux pages canoniques.

export type SecuriteCategory =
  | "hebergement"
  | "acces"
  | "certification"
  | "droit"
  | "incident"

export interface SecuriteClaim {
  id: string
  category: SecuriteCategory
  title: string
  description: string
  source?: string
}

// Source : /confidentialite §8 (Supabase eu-west-3, AES-256, TLS 1.3)
// + §3 (HDS pour données de santé) + /mentions-legales (Supabase eu-west-3 Paris)
export const HEBERGEMENT_CLAIMS: SecuriteClaim[] = [
  {
    id: "host-fr",
    category: "hebergement",
    title: "Base de données en France",
    description:
      "Vos données patient sont stockées sur une infrastructure PostgreSQL hébergée dans la région eu-west-3 (Paris, France).",
    source: "Politique de confidentialité §8",
  },
  {
    id: "host-hds",
    category: "hebergement",
    title: "Hébergeur de Données de Santé",
    description:
      "Les données de santé à caractère personnel sont hébergées sur une infrastructure certifiée Hébergeur de Données de Santé (HDS), conformément à l'article L.1111-8 du Code de la santé publique.",
    source: "Politique de confidentialité §3",
  },
  {
    id: "encryption-rest",
    category: "hebergement",
    title: "Chiffrement au repos",
    description:
      "Les données stockées sont chiffrées en AES-256 sur les serveurs de notre hébergeur de base de données.",
    source: "Politique de confidentialité §8",
  },
  {
    id: "encryption-transit",
    category: "hebergement",
    title: "Chiffrement en transit",
    description:
      "Toutes les communications entre votre appareil et nos serveurs utilisent le protocole TLS 1.3.",
    source: "Politique de confidentialité §8",
  },
  {
    id: "backups-eu",
    category: "hebergement",
    title: "Sauvegardes en zone européenne",
    description:
      "Les sauvegardes de la base de données sont chiffrées et stockées dans la même zone géographique européenne.",
    source: "Politique de confidentialité §8",
  },
]

// Source : /confidentialite §6 et §8 — pseudonymisation Art. 4(5), DPA, CCT
export const ACCES_CLAIMS: SecuriteClaim[] = [
  {
    id: "access-you",
    category: "acces",
    title: "Vous",
    description:
      "Vous accédez à votre propre dossier de coordination via votre compte personnel.",
  },
  {
    id: "access-soignants",
    category: "acces",
    title: "Les soignants que vous autorisez",
    description:
      "Seuls les professionnels de santé membres de votre équipe de coordination — et que vous avez autorisés — peuvent consulter votre dossier.",
  },
  {
    id: "access-no-third",
    category: "acces",
    title: "Jamais d'assureurs, employeurs ou tiers commerciaux",
    description:
      "Vos données ne sont jamais transmises à des assureurs, des employeurs, des organismes publicitaires ou des tiers commerciaux. Aucune revente, aucun partage commercial.",
  },
  {
    id: "access-ai",
    category: "acces",
    title: "Sous-traitants IA — données pseudonymisées",
    description:
      "Lorsque des fonctions IA sont utilisées (synthèse, extraction de bilans), les données sont pseudonymisées au sens de l'article 4(5) du RGPD avant transmission. Les noms, prénoms et dates de naissance sont remplacés par des identifiants génériques.",
    source: "Politique de confidentialité §6",
  },
]

// Source : /confidentialite §7 + §6 — droits RGPD applicables
export const DROITS_RGPD: SecuriteClaim[] = [
  {
    id: "art-15",
    category: "droit",
    title: "Droit d'accès — Art. 15",
    description:
      "Vous pouvez demander à consulter l'ensemble des données personnelles que Nami détient sur vous.",
  },
  {
    id: "art-16",
    category: "droit",
    title: "Droit de rectification — Art. 16",
    description:
      "Vous pouvez demander la correction d'une donnée inexacte ou incomplète.",
  },
  {
    id: "art-17",
    category: "droit",
    title: "Droit à l'effacement — Art. 17",
    description:
      "Vous pouvez demander la suppression de vos données, sous réserve des obligations légales de conservation des dossiers médicaux.",
  },
  {
    id: "art-18",
    category: "droit",
    title: "Droit à la limitation — Art. 18",
    description:
      "Vous pouvez demander à ce que le traitement de vos données soit limité dans certaines situations prévues par le RGPD.",
  },
  {
    id: "art-20",
    category: "droit",
    title: "Droit à la portabilité — Art. 20",
    description:
      "Vous pouvez recevoir vos données dans un format structuré et lisible, et demander leur transmission à un autre responsable de traitement.",
  },
  {
    id: "art-21",
    category: "droit",
    title: "Droit d'opposition — Art. 21",
    description:
      "Vous pouvez vous opposer au traitement de vos données, y compris aux traitements automatisés liés à l'IA.",
  },
]
