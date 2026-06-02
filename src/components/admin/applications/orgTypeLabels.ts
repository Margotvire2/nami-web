import type { OrgType, OrganizationTier } from "@/hooks/useAdminApplications";

export const ORG_TYPE_LABEL: Record<OrgType, string> = {
  PRIVATE_PRACTICE:    "Cabinet libéral",
  CLINIC:              "Clinique",
  HOSPITAL:            "Hôpital",
  HEALTH_CENTER:       "Centre de santé",
  NETWORK:             "Réseau de santé",
  MSP:                 "MSP",
  CPTS:                "CPTS",
  ASSOCIATION:         "Association",
  PROFESSIONAL_GROUP:  "Groupement professionnel",
  HOSPITAL_SERVICE:    "Service hospitalier",
  INTERNAL:            "Interne Nami",
  FEDERATION:          "Fédération",
  INSTITUTIONNEL:      "Institutionnel",
  ACCELERATEUR:        "Accélérateur",
};

export const TIER_LABEL: Record<OrganizationTier, string> = {
  COORDINATION: "Coordination",
  INTELLIGENCE: "Intelligence",
  PILOTAGE:     "Pilotage",
  RESEAU:       "Réseau",
};
