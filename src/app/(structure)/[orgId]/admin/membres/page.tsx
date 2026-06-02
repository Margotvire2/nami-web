"use client";

import { use, useState } from "react";
import { Users } from "lucide-react";
import { ConsoleSidebar } from "@/components/structure/ConsoleSidebar";
import { MemberStatusTabs, type MemberTab } from "@/components/structure/members/MemberStatusTabs";
import { MemberRow } from "@/components/structure/members/MemberRow";
import { useOrgMembers } from "@/hooks/useOrgMembers";

// Console d'animation — page Membres (F-STRUCT-V3-B-1).
// Onglets par status : Actifs / En sommeil (V1.1) / Suspendus / Sortis.
//
// V1 read-only : actions Suspendre/Exclure/Réactiver attendent l'extension
// du payload backend (membershipId + status + lastActivityAt + exitedAt
// + memberStatusReason) — cf. ticket V3-B-1-EXTEND-MEMBERS-PAYLOAD.
export default function MembresPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = use(params);
  const [tab, setTab] = useState<MemberTab>("ACTIVE");

  const filter =
    tab === "ACTIVE" ? "ACTIVE" : tab === "SUSPENDED" ? "SUSPENDED" : "INACTIVE";

  const { members, isLoading } = useOrgMembers(orgId, filter);

  // Compteurs séparés pour les badges des tabs (cache TanStack par status).
  const activeQuery = useOrgMembers(orgId, "ACTIVE", { enabled: tab !== "ACTIVE" });
  const suspendedQuery = useOrgMembers(orgId, "SUSPENDED", { enabled: tab !== "SUSPENDED" });
  const inactiveQuery = useOrgMembers(orgId, "INACTIVE", { enabled: tab !== "EXITED" });

  const counts = {
    active: tab === "ACTIVE" ? members.length : activeQuery.members.length,
    suspended:
      tab === "SUSPENDED" ? members.length : suspendedQuery.members.length,
    exited: tab === "EXITED" ? members.length : inactiveQuery.members.length,
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-jakarta)" }}>
      <ConsoleSidebar orgId={orgId} active="members" />

      <header className="space-y-1">
        <div className="flex items-center gap-2 text-2xl">
          <Users size={22} className="text-[#5B4EC4]" aria-hidden />
          <h1 className="font-bold text-[#0F172A]">Membres</h1>
        </div>
        <p className="text-sm text-[#6B7280]">
          Vue d&apos;ensemble des membres de la structure par statut.
        </p>
      </header>

      <MemberStatusTabs active={tab} onChange={setTab} counts={counts} />

      <section aria-label={`Membres ${tab.toLowerCase()}`} className="space-y-2">
        {isLoading ? (
          <div className="rounded-xl border border-[#E8ECF4] bg-white px-5 py-6 text-sm text-[#6B7280] text-center">
            Chargement des membres…
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E8ECF4] bg-white/50 px-5 py-8 text-center">
            <Users size={20} className="mx-auto text-[#6B7280] mb-2" />
            <p className="text-sm font-medium text-[#0F172A]">
              {tab === "ACTIVE" && "Aucun membre actif."}
              {tab === "SUSPENDED" && "Aucun membre suspendu."}
              {tab === "EXITED" && "Aucun membre sorti."}
            </p>
            <p className="text-xs text-[#6B7280] mt-1">
              Les membres apparaîtront ici quand leur statut changera.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {members.map((m) => (
              <MemberRow key={m.personId} member={m} />
            ))}
          </ul>
        )}
      </section>

      <p className="text-[11px] text-[#6B7280] italic">
        V1 lecture seule. Les actions Suspendre / Exclure / Réactiver
        seront disponibles après l&apos;extension du payload backend
        (ticket V3-B-1-EXTEND-MEMBERS-PAYLOAD).
      </p>
    </div>
  );
}
