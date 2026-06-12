"use client";

import { useState } from "react";
import Image from "next/image";
import { User, MoreVertical, Link2, Trash2, X, Loader2, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import type { OrgSecretaryRow } from "@/hooks/useOrgSecretaries";
import { useRemoveSecretary, useRemoveAssignment } from "@/hooks/useOrgSecretaries";
import { AssignSecretaryModal } from "./AssignSecretaryModal";
import { EditSecretaryPermissionsModal } from "./EditSecretaryPermissionsModal";

const PERM_LABELS: Record<string, string> = {
  canCreatePatient: "Créer patients",
  canEditPatient: "Modifier patients",
  canManageAgenda: "Gérer agenda",
  canProcessPayment: "Paiements",
  canMessagePatients: "Msg patients",
  canMessageProviders: "Msg soignants",
  canViewBilling: "Facturation",
  canExportData: "Export",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch { return "—"; }
}

interface SecretaryRowProps {
  secretary: OrgSecretaryRow;
  orgId: string;
}

export function SecretaryRow({ secretary, orgId }: SecretaryRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showEditPerms, setShowEditPerms] = useState(false);

  const remove = useRemoveSecretary(orgId);
  const removeAssignment = useRemoveAssignment(orgId, secretary.id);

  const fullName = `${secretary.person.firstName ?? ""} ${secretary.person.lastName}`.trim();
  const activePerms = Object.entries(PERM_LABELS)
    .filter(([key]) => secretary[key as keyof OrgSecretaryRow] === true)
    .map(([, label]) => label);

  return (
    <>
      <li
        className="rounded-xl border border-[#E8ECF4] bg-white overflow-hidden"
        style={{ fontFamily: "var(--font-jakarta)" }}
      >
        {/* Row principale */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="shrink-0 size-10 rounded-full bg-[#F0F2FA] flex items-center justify-center overflow-hidden">
            {secretary.person.photoUrl ? (
              <Image src={secretary.person.photoUrl} alt="" width={40} height={40} className="size-full object-cover" />
            ) : (
              <User size={18} className="text-[#6B7280]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#0F172A] truncate">{fullName || "—"}</p>
            <p className="text-xs text-[#6B7280] truncate">
              {secretary.person.email ?? "—"} · Ajoutée {formatDate(secretary.createdAt)}
            </p>
          </div>

          {/* Badge nb assignations */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-[#F0F2FA] text-xs font-medium text-[#5B4EC4] hover:bg-[#ECEAF5] transition-colors"
          >
            <Link2 size={12} />
            {secretary.managedProviders.length} soignant{secretary.managedProviders.length !== 1 ? "s" : ""}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Actions"
              className="rounded-md p-1 text-[#6B7280] hover:bg-[#F0F2FA] hover:text-[#0F172A] transition-colors"
            >
              <MoreVertical size={15} strokeWidth={1.6} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onSelect={() => setShowAssign(true)}>
                <Link2 size={13} className="mr-2" />
                Assigner des soignants
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setShowEditPerms(true)}>
                <ShieldCheck size={13} className="mr-2" />
                Modifier les permissions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-[#DC2626] focus:text-[#DC2626]"
                onSelect={() => setConfirmRemove(true)}
              >
                <Trash2 size={13} className="mr-2" />
                Retirer de la structure
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Permissions */}
        {activePerms.length > 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1">
            {activePerms.map((p) => (
              <span key={p} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F0F2FA] text-[#5B4EC4]">
                {p}
              </span>
            ))}
          </div>
        )}

        {/* Assignations expansées */}
        {expanded && secretary.managedProviders.length > 0 && (
          <div className="border-t border-[#F0F2FA] bg-[#FAFBFF]">
            <ul className="divide-y divide-[#F0F2FA]">
              {secretary.managedProviders.map((a) => {
                const pName = `${a.provider.person.firstName ?? ""} ${a.provider.person.lastName}`.trim();
                return (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-2.5">
                    <div className="size-7 rounded-full bg-[#E8ECF4] flex items-center justify-center overflow-hidden shrink-0">
                      {a.provider.person.photoUrl ? (
                        <Image src={a.provider.person.photoUrl} alt="" width={28} height={28} className="size-full object-cover" />
                      ) : (
                        <User size={14} className="text-[#6B7280]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[#0F172A] font-medium truncate">{pName}</p>
                      {a.provider.specialtyView && (
                        <p className="text-xs text-[#6B7280] truncate">{a.provider.specialtyView}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAssignment.mutate(a.id)}
                      disabled={removeAssignment.isPending}
                      className="p-1 rounded text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors disabled:opacity-40"
                      title="Retirer l'assignation"
                    >
                      {removeAssignment.isPending ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <X size={13} />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </li>

      {/* Modal confirmation suppression */}
      <Dialog open={confirmRemove} onOpenChange={(o) => { if (!remove.isPending) setConfirmRemove(o); }}>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Retirer {fullName} ?</DialogTitle>
          <DialogDescription>
            Cette secrétaire sera retirée de la structure et perdra l&apos;accès à l&apos;agenda de tous les soignants assignés.
          </DialogDescription>
          <div className="flex justify-end gap-2 mt-2">
            <DialogClose className="rounded-md px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F0F2FA] transition-colors">
              Annuler
            </DialogClose>
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => remove.mutate(secretary.id, { onSuccess: () => setConfirmRemove(false) })}
              className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium bg-[#DC2626] text-white hover:bg-[#B91C1C] disabled:opacity-50 transition-colors"
            >
              {remove.isPending && <Loader2 size={13} className="animate-spin" />}
              Retirer
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal assignation */}
      <AssignSecretaryModal
        orgId={orgId}
        secretary={secretary}
        open={showAssign}
        onClose={() => setShowAssign(false)}
      />

      {/* Modal permissions */}
      <EditSecretaryPermissionsModal
        orgId={orgId}
        secretary={secretary}
        open={showEditPerms}
        onClose={() => setShowEditPerms(false)}
      />
    </>
  );
}
