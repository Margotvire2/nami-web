"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { useAdminMemberships } from "@/hooks/useAdminMemberships";

export default function StructureSelectPage() {
  const router = useRouter();
  const { memberships, isLoading } = useAdminMemberships();

  // Garde-fou : si une seule org au moment du rendu (cas rare — URL tapée directement),
  // on redirige sans afficher la page de sélection.
  useEffect(() => {
    if (!isLoading && memberships.length === 1) {
      router.replace(`/structure/${memberships[0].id}/admin`);
    }
  }, [isLoading, memberships, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2FA]">
        <div className="w-8 h-8 border-2 border-[#5B4EC4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoading && memberships.length === 0) {
    router.replace("/login?error=no_access");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F0F2FA] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#5B4EC4]/10 mb-4">
            <Building2 size={24} className="text-[#5B4EC4]" />
          </div>
          <h1
            className="text-xl font-semibold text-[#1E293B]"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Choisir une structure
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Vous administrez plusieurs structures. Laquelle souhaitez-vous gérer ?
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {memberships.map((org) => (
            <button
              key={org.id}
              type="button"
              onClick={() => router.push(`/structure/${org.id}/admin`)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border border-[#E8ECF4] hover:border-[#5B4EC4] hover:shadow-md transition-all text-left group"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#2BA89C]/10 flex items-center justify-center">
                <Building2 size={18} className="text-[#2BA89C]" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium text-[#1E293B] truncate group-hover:text-[#5B4EC4] transition-colors"
                  style={{ fontFamily: "var(--font-jakarta)" }}
                >
                  {org.name}
                </p>
                <p className="text-xs text-[#94A3B8] capitalize">{org.type.toLowerCase().replace(/_/g, " ")}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
