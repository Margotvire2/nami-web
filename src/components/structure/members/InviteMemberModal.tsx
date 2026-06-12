"use client";

import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useInviteMember } from "@/hooks/useInviteMember";

const ROLE_LABELS = {
  PROVIDER: "Soignant",
  COORDINATOR: "Coordinateur",
  VIEWER: "Lecteur",
} as const;

interface InviteMemberModalProps {
  orgId: string;
  open: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ orgId, open, onClose }: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [rpps, setRpps] = useState("");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState<"PROVIDER" | "COORDINATOR" | "VIEWER">("PROVIDER");
  const [success, setSuccess] = useState<string | null>(null);

  const invite = useInviteMember(orgId);

  function reset() {
    setEmail("");
    setRpps("");
    setMessage("");
    setRole("PROVIDER");
    setSuccess(null);
    invite.reset();
  }

  function handleClose() {
    if (!invite.isPending) {
      reset();
      onClose();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    const result = await invite.mutateAsync({
      email: email.trim(),
      rpps: rpps.trim() || undefined,
      message: message.trim() || undefined,
      memberRole: role,
    });
    setSuccess(`${result.firstName ?? ""} ${result.lastName} a été ajouté à la structure.`);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent showCloseButton={false} className="max-w-md">
        <DialogTitle className="flex items-center gap-2 text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>
          <UserPlus size={17} className="text-[#5B4EC4]" />
          Inviter un soignant
        </DialogTitle>
        <DialogDescription className="text-[#6B7280] text-sm">
          Le soignant doit déjà avoir un compte Nami. Il sera ajouté directement comme membre actif.
        </DialogDescription>

        {success ? (
          <div className="space-y-4" style={{ fontFamily: "var(--font-jakarta)" }}>
            <div className="rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] px-4 py-3 text-sm text-[#15803D]">
              {success}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { reset(); }}
                className="rounded-md px-4 py-2 text-sm font-medium text-[#5B4EC4] hover:bg-[#F0F2FA] transition-colors"
              >
                Inviter un autre
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md px-4 py-2 text-sm font-medium bg-[#5B4EC4] text-white hover:bg-[#4c3fa0] transition-colors"
              >
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
                placeholder="prenom.nom@cabinet.fr"
                className="w-full rounded-lg border border-[#E8ECF4] px-3 py-2 text-sm text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4] focus:border-transparent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#374151]">
                N° RPPS <span className="text-[#9CA3AF] font-normal">(optionnel, si email non trouvé)</span>
              </label>
              <input
                type="text"
                value={rpps}
                onChange={(e) => setRpps(e.target.value)}
                placeholder="10012345678"
                maxLength={11}
                className="w-full rounded-lg border border-[#E8ECF4] px-3 py-2 text-sm text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4] focus:border-transparent"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#374151]">Rôle</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as typeof role)}
                className="w-full rounded-lg border border-[#E8ECF4] px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]"
              >
                {(Object.entries(ROLE_LABELS) as [typeof role, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#374151]">
                Message <span className="text-[#9CA3AF] font-normal">(optionnel)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Bienvenue dans notre structure…"
                rows={2}
                maxLength={1000}
                className="w-full rounded-lg border border-[#E8ECF4] px-3 py-2 text-sm text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4] resize-none"
              />
            </div>

            {invite.isError && (
              <p className="text-xs text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3 py-2">
                {invite.error?.message ?? "Une erreur est survenue."}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <DialogClose
                onClick={handleClose}
                className="rounded-md px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F0F2FA] transition-colors"
              >
                Annuler
              </DialogClose>
              <button
                type="submit"
                disabled={invite.isPending || !email.trim()}
                className="flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium bg-[#5B4EC4] text-white hover:bg-[#4c3fa0] disabled:opacity-50 transition-colors"
              >
                {invite.isPending && <Loader2 size={13} className="animate-spin" />}
                Ajouter
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
