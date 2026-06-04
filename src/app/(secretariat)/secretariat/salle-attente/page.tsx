"use client";

import { Armchair } from "lucide-react";

export default function SecretariatWaitingRoomPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E8ECF4]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#EEEDFB] flex items-center justify-center">
            <Armchair size={18} className="text-[#5B4EC4]" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-[#1A1A2E] leading-tight">
              Salle d&apos;attente
            </h1>
            <p className="text-[11px] text-[#6B7280]">
              Patients arrivés au cabinet
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
            <Armchair size={20} className="text-[#5B4EC4]" />
          </div>
          <h2 className="text-[14px] font-semibold text-[#1A1A2E]">
            Bientôt disponible
          </h2>
          <p className="text-[12px] text-[#6B7280] max-w-md mx-auto">
            La vue plein écran de la salle d&apos;attente, avec les patients
            arrivés et le temps d&apos;attente, arrive dans une prochaine
            version. En attendant, le badge en haut de l&apos;agenda affiche
            le nombre de patients arrivés.
          </p>
        </div>
      </div>
    </div>
  );
}
