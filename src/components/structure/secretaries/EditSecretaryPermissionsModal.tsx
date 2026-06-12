"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  useUpdateSecretaryPermissions,
  type OrgSecretaryRow,
  type SecretaryPermissions,
} from "@/hooks/useOrgSecretaries";

const PERMISSIONS: { key: keyof SecretaryPermissions; label: string; description: string }[] = [
  { key: "canCreatePatient",    label: "Créer des patients",      description: "Peut enregistrer de nouveaux patients" },
  { key: "canEditPatient",      label: "Modifier les patients",   description: "Peut mettre à jour les informations des patients" },
  { key: "canManageAgenda",     label: "Gérer l'agenda",          description: "Peut créer, modifier et annuler des rendez-vous" },
  { key: "canProcessPayment",   label: "Traiter les paiements",   description: "Peut enregistrer et gérer les règlements" },
  { key: "canMessagePatients",  label: "Messagerie patients",     description: "Peut envoyer des messages aux patients" },
  { key: "canMessageProviders", label: "Messagerie soignants",    description: "Peut contacter les soignants de la structure" },
  { key: "canViewBilling",      label: "Voir la facturation",     description: "Peut consulter les données de facturation" },
  { key: "canExportData",       label: "Exporter les données",    description: "Peut exporter les listes et rapports" },
];

interface Props {
  orgId: string;
  secretary: OrgSecretaryRow;
  open: boolean;
  onClose: () => void;
}

export function EditSecretaryPermissionsModal({ orgId, secretary, open, onClose }: Props) {
  const fullName = `${secretary.person.firstName ?? ""} ${secretary.person.lastName}`.trim();

  const [perms, setPerms] = useState<Record<keyof SecretaryPermissions, boolean>>({
    canCreatePatient:    secretary.canCreatePatient,
    canEditPatient:      secretary.canEditPatient,
    canManageAgenda:     secretary.canManageAgenda,
    canProcessPayment:   secretary.canProcessPayment,
    canMessagePatients:  secretary.canMessagePatients,
    canMessageProviders: secretary.canMessageProviders,
    canViewBilling:      secretary.canViewBilling,
    canExportData:       secretary.canExportData,
  });

  const update = useUpdateSecretaryPermissions(orgId, secretary.id);

  function toggle(key: keyof SecretaryPermissions) {
    setPerms((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    update.mutate(perms, {
      onSuccess: () => {
        toast.success("Permissions mises à jour.");
        onClose();
      },
      onError: (e: any) => toast.error(e?.message ?? "Erreur lors de la mise à jour."),
    });
  }

  function handleOpenChange(o: boolean) {
    if (!update.isPending) {
      if (!o) onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" style={{ fontFamily: "var(--font-jakarta)" }}>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={16} className="text-[#5B4EC4]" />
          <DialogTitle className="text-sm font-semibold text-[#0F172A]">
            Permissions — {fullName}
          </DialogTitle>
        </div>
        <DialogDescription className="text-xs text-[#6B7280] mb-4">
          Définissez ce que cette secrétaire peut faire dans la structure.
        </DialogDescription>

        <ul className="space-y-1">
          {PERMISSIONS.map(({ key, label, description }) => (
            <li
              key={key}
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-[#FAFBFF] transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#0F172A]">{label}</p>
                <p className="text-[11px] text-[#6B7280] leading-tight">{description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={perms[key]}
                onClick={() => toggle(key)}
                className={[
                  "shrink-0 relative inline-flex h-5 w-9 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4] focus-visible:ring-offset-2",
                  perms[key] ? "bg-[#5B4EC4]" : "bg-[#D1D5DB]",
                ].join(" ")}
              >
                <span
                  className={[
                    "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200",
                    perms[key] ? "translate-x-4" : "translate-x-0",
                  ].join(" ")}
                />
              </button>
            </li>
          ))}
        </ul>

        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[#E8ECF4]">
          <DialogClose
            disabled={update.isPending}
            className="rounded-md px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F0F2FA] transition-colors disabled:opacity-50"
          >
            Annuler
          </DialogClose>
          <button
            type="button"
            onClick={handleSave}
            disabled={update.isPending}
            className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium bg-[#5B4EC4] text-white hover:bg-[#4c3fa0] disabled:opacity-50 transition-colors"
          >
            {update.isPending && <Loader2 size={13} className="animate-spin" />}
            Enregistrer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
