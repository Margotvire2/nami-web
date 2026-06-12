"use client";

import { useState } from "react";
import { Loader2, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useAssignSecretary } from "@/hooks/useOrgSecretaries";
import { useOrgColleagues } from "@/hooks/useOrgColleagues";
import type { OrgSecretaryRow } from "@/hooks/useOrgSecretaries";

interface AssignSecretaryModalProps {
  orgId: string;
  secretary: OrgSecretaryRow;
  open: boolean;
  onClose: () => void;
}

export function AssignSecretaryModal({ orgId, secretary, open, onClose }: AssignSecretaryModalProps) {
  const { providers, isLoading: loadingProviders } = useOrgColleagues(orgId);
  const assign = useAssignSecretary(orgId, secretary.id);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [success, setSuccess] = useState(false);

  const alreadyAssigned = new Set(secretary.managedProviders.map((a) => a.provider.id));

  function toggle(providerId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(providerId)) next.delete(providerId);
      else next.add(providerId);
      return next;
    });
  }

  function handleClose() {
    if (!assign.isPending) {
      setSelected(new Set());
      setSuccess(false);
      assign.reset();
      onClose();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.size === 0) return;
    await assign.mutateAsync(Array.from(selected));
    setSuccess(true);
  }

  const secName = `${secretary.person.firstName ?? ""} ${secretary.person.lastName}`.trim();
  const unassignedProviders = providers.filter((p) => p.providerProfileId && !alreadyAssigned.has(p.providerProfileId));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent showCloseButton={false} className="max-w-md">
        <DialogTitle className="flex items-center gap-2 text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>
          <Link2 size={17} className="text-[#5B4EC4]" />
          Assigner {secName}
        </DialogTitle>
        <DialogDescription className="text-[#6B7280] text-sm">
          Sélectionnez les soignants dont {secName} gérera l&apos;agenda.
        </DialogDescription>

        {success ? (
          <div className="space-y-4" style={{ fontFamily: "var(--font-jakarta)" }}>
            <div className="rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] px-4 py-3 text-sm text-[#15803D]">
              {selected.size} soignant{selected.size > 1 ? "s" : ""} assigné{selected.size > 1 ? "s" : ""} avec succès.
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={handleClose} className="rounded-md px-4 py-2 text-sm font-medium bg-[#5B4EC4] text-white hover:bg-[#4c3fa0] transition-colors">
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 mt-1" style={{ fontFamily: "var(--font-jakarta)" }}>
            {loadingProviders ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={18} className="animate-spin text-[#5B4EC4]" />
              </div>
            ) : unassignedProviders.length === 0 ? (
              <p className="text-sm text-[#6B7280] py-4 text-center">
                Tous les soignants de la structure sont déjà assignés à cette secrétaire.
              </p>
            ) : (
              <ul className="divide-y divide-[#F0F2FA] max-h-64 overflow-y-auto rounded-xl border border-[#E8ECF4]">
                {unassignedProviders.map((p) => {
                  const isChecked = selected.has(p.providerProfileId!);
                  return (
                    <li key={p.providerProfileId}>
                      <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F8F9FF] transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggle(p.providerProfileId!)}
                          className="rounded border-[#D1D5DB] text-[#5B4EC4] focus:ring-[#5B4EC4]"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#0F172A] truncate">
                            {p.firstName} {p.lastName}
                          </p>
                          {p.specialty && (
                            <p className="text-xs text-[#6B7280] truncate">{p.specialty}</p>
                          )}
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}

            {assign.isError && (
              <p className="text-xs text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2">
                {assign.error?.message ?? "Une erreur est survenue."}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <DialogClose onClick={handleClose} className="rounded-md px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F0F2FA] transition-colors">
                Annuler
              </DialogClose>
              <button
                type="submit"
                disabled={assign.isPending || selected.size === 0}
                className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium bg-[#5B4EC4] text-white hover:bg-[#4c3fa0] disabled:opacity-50 transition-colors"
              >
                {assign.isPending && <Loader2 size={13} className="animate-spin" />}
                Assigner {selected.size > 0 ? `(${selected.size})` : ""}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
