import type { User } from "@/lib/api";

/**
 * Génération de l'export RGPD Art. 20 (droit à la portabilité) — 100% client-side.
 *
 * Périmètre V1 strictement limité aux champs présents dans le store auth
 * (User exposé par le backend via /auth/me). Aucun appel API : nous ne
 * pouvons pas exposer ici les données qui ne transitent pas par le store
 * (téléphone, date de naissance, dossier de coordination, etc.).
 *
 * IMPORTANT — ce que l'export NE contient PAS :
 *   - aucun token (accessToken, refreshToken) — secret de session
 *   - aucun mot de passe — jamais stocké en clair de toute façon
 *   - aucune donnée médicale — sortie scope MDR + responsabilité soignant
 *
 * V2 (post-ICD11) : enrichir via endpoint dédié /patient/gdpr/export pour
 * inclure les données dont le responsable de traitement est Nami (logs,
 * consentements, RDV, messagerie patient).
 */

interface ExportPayload {
  metadata: {
    exportedAt: string;
    service: string;
    serviceUrl: string;
    exportVersion: string;
    legalBasis: string;
    scope: string;
  };
  identity: {
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
  };
  account: {
    accountId: string;
    accountType: string;
  };
  notice: string;
}

export function buildExportPayload(user: User): ExportPayload {
  return {
    metadata: {
      exportedAt: new Date().toISOString(),
      service: "Nami",
      serviceUrl: "https://namipourlavie.com",
      exportVersion: "1.0",
      legalBasis:
        "RGPD Art. 20 — droit à la portabilité des données à caractère personnel.",
      scope:
        "Données d'identification et de compte du patient connecté. Les données du dossier de coordination relèvent du soignant responsable du traitement.",
    },
    identity: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      emailVerified: !!user.emailVerifiedAt,
    },
    account: {
      accountId: user.id,
      accountType: "PATIENT",
    },
    notice:
      "Cet export contient les données personnelles dont Nami est responsable de traitement. Pour les données saisies par un professionnel de santé (dossier de coordination), contactez directement le soignant concerné.",
  };
}

export function generateExportBlob(user: User): Blob {
  const payload = buildExportPayload(user);
  const json = JSON.stringify(payload, null, 2);
  return new Blob([json], { type: "application/json;charset=utf-8" });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Libère la mémoire après que le téléchargement a été déclenché.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function buildExportFilename(): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `nami-mes-donnees-${date}.json`;
}
