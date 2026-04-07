"use client";

import { Upload, Plus, Lock } from "lucide-react";

interface EmptyStateProps {
  onImport: () => void;
  onCreateManual: () => void;
}

export default function PatientsEmptyState({ onImport, onCreateManual }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 px-6">
      {/* Illustration */}
      <div className="relative mb-8">
        <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Folder back */}
          <rect x="15" y="25" width="90" height="65" rx="6" fill="#EEEDFB" stroke="#D4D0F6" strokeWidth="1.5" />
          {/* Folder tab */}
          <path d="M15 31C15 27.6863 17.6863 25 21 25H45L50 18H21C17.6863 18 15 20.6863 15 24V31Z" fill="#D4D0F6" />
          {/* Folder front */}
          <rect x="10" y="35" width="100" height="55" rx="6" fill="#F8F7FF" stroke="#D4D0F6" strokeWidth="1.5" />
          {/* Lines inside */}
          <rect x="30" y="50" width="40" height="3" rx="1.5" fill="#D4D0F6" />
          <rect x="30" y="60" width="55" height="3" rx="1.5" fill="#E8E5F8" />
          <rect x="30" y="70" width="30" height="3" rx="1.5" fill="#E8E5F8" />
          {/* Second folder behind */}
          <rect x="22" y="30" width="80" height="50" rx="5" fill="#F0EEFA" stroke="#E0DCF4" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>

      {/* Text */}
      <h3 className="text-base font-semibold text-gray-900 text-center">
        Vos patients apparaitront ici
      </h3>
      <p className="text-sm text-gray-500 text-center mt-2 max-w-sm leading-relaxed">
        Importez votre base depuis Doctolib ou creez votre premier dossier manuellement.
      </p>

      {/* Buttons */}
      <div className="flex items-center gap-3 mt-7">
        <button
          onClick={onImport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:shadow-lg"
          style={{ background: "#5B4FE8" }}
        >
          <Upload size={15} />
          Importer depuis Doctolib
        </button>
        <button
          onClick={onCreateManual}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-gray-50"
          style={{ borderColor: "#E8E9EF", color: "#374151" }}
        >
          <Plus size={15} />
          Creer un patient
        </button>
      </div>

      {/* Privacy note */}
      <div className="flex items-center gap-1.5 mt-8 text-xs text-gray-400">
        <Lock size={11} />
        <span>Vos donnees restent sur votre compte, jamais partagees sans votre accord.</span>
      </div>
    </div>
  );
}
