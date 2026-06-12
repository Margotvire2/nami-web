"use client";

import { use, useState } from "react";
import { Users, Search } from "lucide-react";
import Image from "next/image";
import { ConsoleSidebar } from "@/components/structure/ConsoleSidebar";
import { useOrgPatients, type OrgPatientRow } from "@/hooks/useOrgPatients";

function formatBirthDate(iso: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch { return null; }
}

function PatientCard({ patient }: { patient: OrgPatientRow }) {
  const fullName = `${patient.firstName ?? ""} ${patient.lastName}`.trim();
  const birth = formatBirthDate(patient.birthDate);
  const leadProvider = patient.patientCases[0]?.leadProvider?.person;
  const leadName = leadProvider
    ? `${leadProvider.firstName ?? ""} ${leadProvider.lastName}`.trim()
    : null;

  return (
    <li className="flex items-center gap-3 rounded-xl border border-[#E8ECF4] bg-white px-4 py-3">
      <div className="shrink-0 size-9 rounded-full bg-[#F0F2FA] flex items-center justify-center overflow-hidden">
        {patient.photoUrl ? (
          <Image src={patient.photoUrl} alt="" width={36} height={36} className="size-full object-cover" />
        ) : (
          <Users size={16} className="text-[#6B7280]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#0F172A] truncate">{fullName || "—"}</p>
        <p className="text-xs text-[#6B7280] truncate">
          {birth ? `Né(e) le ${birth}` : ""}
          {birth && (patient.email || leadName) ? " · " : ""}
          {leadName ? `Soignant référent : ${leadName}` : patient.email ?? ""}
        </p>
      </div>
      {patient.patientCases.length > 1 && (
        <span className="shrink-0 text-xs text-[#5B4EC4] bg-[#F0F2FA] px-2 py-0.5 rounded-full font-medium">
          {patient.patientCases.length} dossiers
        </span>
      )}
    </li>
  );
}

export default function PatientsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  function handleSearch(value: string) {
    setSearch(value);
    clearTimeout((handleSearch as { _t?: ReturnType<typeof setTimeout> })._t);
    (handleSearch as { _t?: ReturnType<typeof setTimeout> })._t = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  }

  const { patients, total, isLoading } = useOrgPatients(orgId, debouncedSearch);

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-jakarta)" }}>
      <ConsoleSidebar orgId={orgId} active="patients" />

      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-2xl">
            <Users size={22} className="text-[#5B4EC4]" aria-hidden />
            <h1 className="font-bold text-[#0F172A]">Patients</h1>
          </div>
          <p className="text-sm text-[#6B7280]">
            Tous les patients suivis par les soignants de cette structure.
          </p>
        </div>
        {total > 0 && (
          <span className="shrink-0 text-sm font-medium text-[#6B7280] bg-[#F0F2FA] px-3 py-1.5 rounded-lg">
            {total} patient{total !== 1 ? "s" : ""}
          </span>
        )}
      </header>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher par nom, email…"
          className="w-full rounded-xl border border-[#E8ECF4] bg-white pl-9 pr-4 py-2.5 text-sm text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4] focus:border-transparent"
        />
      </div>

      <section aria-label="Liste des patients">
        {isLoading ? (
          <div className="rounded-xl border border-[#E8ECF4] bg-white px-5 py-6 text-sm text-[#6B7280] text-center">
            Chargement…
          </div>
        ) : patients.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E8ECF4] bg-white/50 px-5 py-10 text-center">
            <Users size={22} className="mx-auto text-[#6B7280] mb-3" />
            <p className="text-sm font-medium text-[#0F172A]">
              {debouncedSearch ? "Aucun patient trouvé pour cette recherche." : "Aucun patient associé à cette structure."}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {patients.map((p) => (
              <PatientCard key={p.id} patient={p} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
