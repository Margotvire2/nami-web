import { useMemo } from "react";
import { useCockpitDmInbox } from "./useCockpitDmInbox";
import { useCockpitProConversations } from "./useCockpitProConversations";

export type UnifiedInboxTab = "carecase" | "dm" | "pro";

export interface UnifiedInboxCounts {
  pro: number;
  dm: number;
  carecase: number;
}

/**
 * Combine les 3 silos messagerie cockpit pour donner un état global
 * (compte par tab + isLoading agrégé). CareCase n'expose pas d'unreadCount
 * au niveau du listing — V1 retourne 0, à étendre quand l'API exposera un
 * compteur par careCase (suivi via F-CROSS-GAP-Message-INBOX-COCKPIT).
 */
export function useUnifiedInbox() {
  const dm = useCockpitDmInbox();
  const pro = useCockpitProConversations();

  const counts = useMemo<UnifiedInboxCounts>(() => {
    const dmThreads = dm.data?.threads ?? [];
    const proConvs = pro.data ?? [];
    return {
      dm: dmThreads.reduce((sum, t) => sum + (t.unreadCount ?? 0), 0),
      pro: proConvs.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0),
      carecase: 0,
    };
  }, [dm.data, pro.data]);

  const total = counts.pro + counts.dm + counts.carecase;

  return {
    counts,
    total,
    isLoading: dm.isLoading || pro.isLoading,
  };
}
