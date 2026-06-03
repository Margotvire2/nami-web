import { useUnifiedInbox } from "./useUnifiedInbox";

/**
 * Compteur unread global cockpit (Pro + DM patient + CareCase).
 * Wrapper léger sur useUnifiedInbox pour la sidebar badge.
 */
export function useUnifiedInboxTotal(): number {
  return useUnifiedInbox().total;
}
