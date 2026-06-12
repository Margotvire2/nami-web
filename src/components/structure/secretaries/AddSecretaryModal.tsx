"use client";

import { useState } from "react";
import { Loader2, UserCog } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useAddSecretary } from "@/hooks/useOrgSecretaries";

interface AddSecretaryModalProps {
  orgId: string;
  open: boolean;
  onClose: () => void;
}

export function AddSecretaryModal({ orgId, open, onClose }: AddSecretaryModalProps) {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const add = useAddSecretary(orgId);

  function reset() {
    setEmail("");
    setSuccess(null);
    add.reset();
  }

  function handleClose() {
    if (!add.isPending) { reset(); onClose(); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    const result = await add.mutateAsync({ email: email.trim() });
    setSuccess(`${result.person?.firstName ?? ""} ${result.person?.lastName ?? email} a été ajoutée à la structure.`);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent showCloseButton={false} className="max-w-md">
        <DialogTitle className="flex items-center gap-2 text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>
          <UserCog size={17} className="text-[#5B4EC4]" />
          Ajouter une secrétaire
        </DialogTitle>
        <DialogDescription className="text-[#6B7280] text-sm">
          La secrétaire doit déjà avoir un compte Nami avec le rôle secrétaire.
        </DialogDescription>

        {success ? (
          <div className="space-y-4" style={{ fontFamily: "var(--font-jakarta)" }}>
            <div className="rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] px-4 py-3 text-sm text-[#15803D]">
              {success}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={reset} className="rounded-md px-4 py-2 text-sm font-medium text-[#5B4EC4] hover:bg-[#F0F2FA] transition-colors">
                Ajouter une autre
              </button>
              <button type="button" onClick={handleClose} className="rounded-md px-4 py-2 text-sm font-medium bg-[#5B4EC4] text-white hover:bg-[#4c3fa0] transition-colors">
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-1" style={{ fontFamily: "var(--font-jakarta)" }}>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#374151]">
                Email <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="secretaire@cabinet.fr"
                className="w-full rounded-lg border border-[#E8ECF4] px-3 py-2 text-sm text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4] focus:border-transparent"
              />
            </div>

            {add.isError && (
              <p className="text-xs text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2">
                {add.error?.message ?? "Une erreur est survenue."}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <DialogClose onClick={handleClose} className="rounded-md px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F0F2FA] transition-colors">
                Annuler
              </DialogClose>
              <button
                type="submit"
                disabled={add.isPending || !email.trim()}
                className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium bg-[#5B4EC4] text-white hover:bg-[#4c3fa0] disabled:opacity-50 transition-colors"
              >
                {add.isPending && <Loader2 size={13} className="animate-spin" />}
                Ajouter
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
