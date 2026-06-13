import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Formate une date ISO de notification en texte lisible en français.
 * Utilisé par PatientNotificationsPanel et la page /notifications.
 */
export function formatNotifDate(iso: string | null | undefined): string {
  if (!iso) return "—";

  const d = parseISO(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;

  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) {
    return format(d, "EEEE d MMM 'à' HH'h'mm", { locale: fr });
  }

  return format(d, "d MMM yyyy", { locale: fr });
}
