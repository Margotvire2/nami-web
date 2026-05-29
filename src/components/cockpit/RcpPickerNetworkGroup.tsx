"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RcpPickerGroup } from "@/lib/api";

// Bloc "Mes réseaux" du picker invités RCP (INIT-489).
// Présente une org éligible avec ses membres ACTIVE et un bouton "Tout inviter".
// Pas de logique réseau ici — le fetch est porté par le parent (CreateRcpModal).

const ORG_TYPE_LABEL_FR: Record<string, string> = {
  NETWORK: "Réseau",
  FEDERATION: "Fédération",
  CPTS: "CPTS",
  HOSPITAL: "Hôpital",
  HOSPITAL_SERVICE: "Service hospitalier",
  MSP: "MSP",
};

export interface RcpPickerNetworkGroupProps {
  orgName: string;
  orgType: string;
  isLoading: boolean;
  group: RcpPickerGroup | undefined;
  selectedIds: string[];
  onToggleMember: (personId: string) => void;
  onInviteAll: (personIds: string[]) => void;
}

export function RcpPickerNetworkGroup({
  orgName,
  orgType,
  isLoading,
  group,
  selectedIds,
  onToggleMember,
  onInviteAll,
}: RcpPickerNetworkGroupProps) {
  const [open, setOpen] = useState(false);
  const members = group?.members ?? [];
  const allSelected =
    members.length > 0 && members.every((m) => selectedIds.includes(m.personId));

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden" data-testid="rcp-picker-group">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
        aria-expanded={open}
        aria-label={`Déplier ${orgName}`}
      >
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform shrink-0",
            open ? "rotate-0" : "-rotate-90"
          )}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{orgName}</p>
          <p className="text-xs text-gray-500">
            {ORG_TYPE_LABEL_FR[orgType] ?? orgType}
            {!isLoading && ` · ${members.length} membre${members.length > 1 ? "s" : ""}`}
          </p>
        </div>
        {!isLoading && members.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInviteAll(members.map((m) => m.personId));
            }}
            disabled={allSelected}
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-md transition-colors shrink-0",
              allSelected
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            )}
          >
            {allSelected ? "Tous invités" : "Tout inviter"}
          </button>
        )}
      </button>

      {open && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-2 space-y-1">
          {isLoading ? (
            <p className="text-xs text-gray-400 px-2 py-1">Chargement des membres…</p>
          ) : members.length === 0 ? (
            <p className="text-xs text-gray-400 px-2 py-1">Aucun membre actif.</p>
          ) : (
            members.map((m) => {
              const selected = selectedIds.includes(m.personId);
              return (
                <label
                  key={m.personId}
                  className={cn(
                    "flex items-center gap-3 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                    selected ? "bg-indigo-50" : "hover:bg-white"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleMember(m.personId)}
                    className="accent-indigo-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">
                      {m.firstName} {m.lastName}
                    </p>
                    {m.specialty && (
                      <p className="text-xs text-gray-500 truncate">{m.specialty}</p>
                    )}
                  </div>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
