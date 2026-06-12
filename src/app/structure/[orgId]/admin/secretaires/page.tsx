"use client";

import { use, useState } from "react";
import { UserCog, Plus } from "lucide-react";
import { ConsoleSidebar } from "@/components/structure/ConsoleSidebar";
import { SecretaryRow } from "@/components/structure/secretaries/SecretaryRow";
import { AddSecretaryModal } from "@/components/structure/secretaries/AddSecretaryModal";
import { useOrgSecretaries } from "@/hooks/useOrgSecretaries";

export default function SecretairesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const { secretaries, isLoading } = useOrgSecretaries(orgId);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-jakarta)" }}>
      <ConsoleSidebar orgId={orgId} active="secretaries" />

      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-2xl">
            <UserCog size={22} className="text-[#5B4EC4]" aria-hidden />
            <h1 className="font-bold text-[#0F172A]">Secrétaires</h1>
          </div>
          <p className="text-sm text-[#6B7280]">
            Gérez les secrétaires de la structure et leurs soignants assignés.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 shrink-0 rounded-lg px-3 py-2 text-sm font-medium bg-[#5B4EC4] text-white hover:bg-[#4c3fa0] transition-colors"
        >
          <Plus size={14} />
          Ajouter
        </button>
      </header>

      <section aria-label="Liste des secrétaires">
        {isLoading ? (
          <div className="rounded-xl border border-[#E8ECF4] bg-white px-5 py-6 text-sm text-[#6B7280] text-center">
            Chargement…
          </div>
        ) : secretaries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E8ECF4] bg-white/50 px-5 py-10 text-center">
            <UserCog size={22} className="mx-auto text-[#6B7280] mb-3" />
            <p className="text-sm font-medium text-[#0F172A]">Aucune secrétaire dans cette structure.</p>
            <p className="text-xs text-[#6B7280] mt-1 mb-4">
              Ajoutez une secrétaire existante pour lui donner accès aux agendas.
            </p>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium bg-[#5B4EC4] text-white hover:bg-[#4c3fa0] transition-colors"
            >
              <Plus size={14} />
              Ajouter une secrétaire
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {secretaries.map((s) => (
              <SecretaryRow key={s.id} secretary={s} orgId={orgId} />
            ))}
          </ul>
        )}
      </section>

      <AddSecretaryModal orgId={orgId} open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
