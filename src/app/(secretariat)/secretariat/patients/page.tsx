"use client";

import { Users } from "lucide-react";

export default function SecretariatPatientsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E8ECF4]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#EEEDFB] flex items-center justify-center">
            <Users size={18} className="text-[#5B4EC4]" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-[#1A1A2E] leading-tight">Patients</h1>
            <p className="text-[11px] text-[#6B7280]">
              Annuaire patient du cabinet
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div
          className="rounded-2xl px-6 py-10 text-center space-y-3"
          style={{ background: "#fff", border: "1px solid #E8ECF4" }}
        >
          <div className="w-12 h-12 rounded-full bg-[#EEEDFB] flex items-center justify-center mx-auto">
            <Users size={20} className="text-[#5B4EC4]" />
          </div>
          <h2 className="text-[14px] font-semibold text-[#1A1A2E]">
            Bientôt disponible
          </h2>
          <p className="text-[12px] text-[#6B7280] max-w-md mx-auto">
            La liste des patients du cabinet, la recherche par nom ou
            téléphone et la création de fiche administrative arrivent dans
            une prochaine version.
          </p>
        </div>
      </div>
    </div>
  );
}
