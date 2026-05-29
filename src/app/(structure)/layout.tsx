"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { useAdminMemberships } from "@/hooks/useAdminMemberships";
import { Building2, Stethoscope } from "lucide-react";

// Layout du groupe de routes (structure) — console d'animation pour
// les ORG_ADMIN purs ET les multi-casquette PROVIDER+ADMIN. Garde l'auth
// + onboarding minimal, sans la sidebar du cockpit soignant.
//
// La page complète est livrée par F-STRUCT-V1-CONSOLE-ANIMATION (ticket
// séparé). Ce layout pose juste le squelette de chrome + auth.
export default function StructureLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const [hasHydrated, setHasHydrated] = useState(false);
  const { memberships, hasAny, isLoading } = useAdminMemberships();

  // Attend la fin de la réhydratation Zustand
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
    return unsub;
  }, []);

  // Auth guard
  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken) router.replace("/login");
    else if (user?.roleType === "PATIENT") router.replace("/accueil");
    else if (user?.roleType === "SECRETARY") router.replace("/secretariat");
  }, [hasHydrated, accessToken, user, router]);

  // Pas d'adhésion ADMIN/OWNER → renvoyer au cockpit
  useEffect(() => {
    if (!hasHydrated || isLoading) return;
    if (!accessToken || !user) return;
    if (user.roleType === "PATIENT" || user.roleType === "SECRETARY") return;
    if (!hasAny && user.roleType !== "ORG_ADMIN") {
      router.replace("/aujourd-hui");
    }
  }, [hasHydrated, isLoading, hasAny, accessToken, user, router]);

  if (!hasHydrated || !accessToken) return null;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <header className="h-14 sticky top-0 z-30 flex items-center justify-between gap-4 px-6 bg-white/95 backdrop-blur-sm border-b border-[#E8ECF4]">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 size={16} className="text-[#5B4EC4] shrink-0" />
          <span className="font-semibold text-sm text-[#0F172A] truncate" style={{ fontFamily: "var(--font-jakarta)" }}>
            Console d&apos;animation
          </span>
          {memberships.length > 0 && (
            <span className="text-xs text-[#6B7280] truncate ml-2">— {memberships[0].name}</span>
          )}
        </div>

        {user?.providerProfile && (
          <Link
            href="/aujourd-hui"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8ECF4] text-[#374151] text-xs font-medium hover:border-[#5B4EC4] hover:text-[#5B4EC4] transition-colors"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            <Stethoscope size={13} />
            Cockpit soignant
          </Link>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
