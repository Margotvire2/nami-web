"use client";

import Image from "next/image";
import { User } from "lucide-react";
import type { OrgMemberRow } from "@/hooks/useOrgMembers";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Propriétaire",
  ADMIN: "Admin",
  PROVIDER: "Soignant",
  COORDINATOR: "Coordinateur",
  VIEWER: "Lecteur",
  MEMBER: "Membre",
};

function formatJoinedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

interface MemberRowProps {
  member: OrgMemberRow;
}

// Read-only V1 : actions Suspendre/Exclure/Réactiver attendent l'exposition
// du `membershipId` (et des champs lifecycle) dans le GET backend.
// Cf. ticket V3-B-1-EXTEND-MEMBERS-PAYLOAD.
export function MemberRow({ member }: MemberRowProps) {
  const fullName = `${member.firstName} ${member.lastName}`.trim();
  const role = ROLE_LABEL[member.memberRole] ?? member.memberRole;
  const specialty = member.providerProfile?.specialtyView ?? null;

  return (
    <li
      className="flex items-center gap-3 rounded-xl border border-[#E8ECF4] bg-white px-4 py-3"
      style={{ fontFamily: "var(--font-jakarta)" }}
    >
      <div className="shrink-0 size-10 rounded-full bg-[#F0F2FA] flex items-center justify-center overflow-hidden">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt=""
            width={40}
            height={40}
            className="size-full object-cover"
          />
        ) : (
          <User size={18} className="text-[#6B7280]" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#0F172A] truncate">
          {fullName || "—"}
        </p>
        <p className="text-xs text-[#6B7280] truncate">
          {specialty ? `${specialty} · ` : ""}
          {role}
        </p>
      </div>
      <p className="hidden sm:block text-xs text-[#6B7280] shrink-0">
        Adhésion {formatJoinedAt(member.joinedAt)}
      </p>
    </li>
  );
}
