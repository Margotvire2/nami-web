"use client";

import { Settings } from "lucide-react";
import MyLinksSection from "../_components/MyLinksSection";

export default function SecretariatSettingsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E8ECF4]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#EEEDFB] flex items-center justify-center">
            <Settings size={18} className="text-[#5B4EC4]" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-[#1A1A2E] leading-tight">
              Paramètres
            </h1>
            <p className="text-[11px] text-[#6B7280]">
              Mes rattachements aux soignants
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-6">
        <MyLinksSection />
      </div>
    </div>
  );
}
