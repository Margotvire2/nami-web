"use client";

import { useState } from "react";
import Image from "next/image";
import { User, MoreVertical, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
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
  DialogDescription,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import type { OrgMemberRow } from "@/hooks/useOrgMembers";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Propriétaire",
  ADMIN: "Admin",
  PROVIDER: "Soignant",
  COORDINATOR: "Coordinateur",
  VIEWER: "Lecteur",
  MEMBER: "Membre",
};

const ROLE_OPTIONS = ["PROVIDER", "COORDINATOR", "VIEWER", "ADMIN"] as const;

type Action = "DISABLE_ACCESS" | "EXIT" | "RESTORE" | "CHANGE_ROLE";

const ACTION_CONFIG: Record<
  Action,
  { title: string; desc: string; destructive: boolean }
> = {
  DISABLE_ACCESS: {
    title: "Désactiver l'accès",
    desc: "L'accès de ce membre sera désactivé.",
    destructive: true,
  },
  EXIT: {
    title: "Retirer de la structure",
    desc: "Ce membre sera retiré de la structure.",
    destructive: true,
  },
  RESTORE: {
    title: "Réactiver",
    desc: "Ce membre retrouvera un accès actif.",
    destructive: false,
  },
  CHANGE_ROLE: {
    title: "Modifier le rôle",
    desc: "",
    destructive: false,
  },
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function formatJoinedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

interface MemberRowProps {
  member: OrgMemberRow;
  orgId: string;
}

export function MemberRow({ member, orgId }: MemberRowProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<Action | null>(null);
  const [pendingRole, setPendingRole] = useState<string>("PROVIDER");
  const [submitting, setSubmitting] = useState(false);

  const fullName = `${member.firstName} ${member.lastName}`.trim();
  const role = ROLE_LABEL[member.memberRole] ?? member.memberRole;
  const specialty = member.providerProfile?.specialtyView ?? null;
  const isOwner = member.memberRole === "OWNER";
  const isActive = member.status === "ACTIVE";
  const canRestore =
    member.status === "SUSPENDED" || member.status === "INACTIVE";

  async function confirm() {
    if (!pendingAction || !accessToken) return;
    setSubmitting(true);
    try {
      const body: Record<string, string> = { action: pendingAction };
      if (pendingAction === "CHANGE_ROLE") body.role = pendingRole;
      await fetch(
        `${API}/organizations/${orgId}/members/${member.membershipId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(body),
        }
      );
      queryClient.invalidateQueries({ queryKey: ["org-members", orgId] });
    } catch (err) {
      console.error("Member action failed", err);
    } finally {
      setSubmitting(false);
      setPendingAction(null);
    }
  }

  const config = pendingAction ? ACTION_CONFIG[pendingAction] : null;

  return (
    <>
      <li
        className="flex items-center gap-3 rounded-xl border border-[#E8ECF4] bg-white px-4 py-3"
        style={{ fontFamily: "var(--font-jakarta)" }}
      >
        <div className="shrink-0 size-10 rounded-full bg-[#F0F2FA] flex items-center justify-center overflow-hidden">
          {member.photoUrl ? (
            <Image
              src={member.photoUrl}
              alt=""
              width={40}
              height={40}
              className="size-full object-cover"
            />
          ) : (
            <User size={18} className="text-[#6B7280]" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#0F172A] truncate">
            {fullName || "—"}
          </p>
          <p className="text-xs text-[#6B7280] truncate">
            {specialty ? `${specialty} · ` : ""}
            {role}
          </p>
        </div>
        <p className="hidden sm:block text-xs text-[#6B7280] shrink-0">
          Adhésion {formatJoinedAt(member.joinedAt)}
        </p>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Actions"
            className="rounded-md p-1 text-[#6B7280] hover:bg-[#F0F2FA] hover:text-[#0F172A] transition-colors"
          >
            <MoreVertical size={15} strokeWidth={1.6} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {isActive && !isOwner && (
              <DropdownMenuItem
                className="text-[#DC2626] focus:text-[#DC2626]"
                onSelect={() => setPendingAction("DISABLE_ACCESS")}
              >
                Désactiver l&apos;accès
              </DropdownMenuItem>
            )}
            {isActive && (
              <DropdownMenuItem
                className="text-[#DC2626] focus:text-[#DC2626]"
                onSelect={() => setPendingAction("EXIT")}
              >
                Retirer de la structure
              </DropdownMenuItem>
            )}
            {canRestore && (
              <DropdownMenuItem onSelect={() => setPendingAction("RESTORE")}>
                Réactiver
              </DropdownMenuItem>
            )}
            {!isOwner && (
              <>
                {isActive && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onSelect={() => {
                    setPendingRole(member.memberRole as string);
                    setPendingAction("CHANGE_ROLE");
                  }}
                >
                  Modifier le rôle
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </li>

      {config && (
        <Dialog
          open={!!pendingAction}
          onOpenChange={(open) => {
            if (!open && !submitting) setPendingAction(null);
          }}
        >
          <DialogContent showCloseButton={false}>
            <DialogTitle>{config.title}</DialogTitle>
            <DialogDescription>
              {pendingAction === "CHANGE_ROLE" ? (
                <>
                  Choisissez le nouveau rôle de{" "}
                  <strong>{fullName || "ce membre"}</strong>.
                  <select
                    value={pendingRole}
                    onChange={(e) => setPendingRole(e.target.value)}
                    className="mt-3 block w-full rounded-md border border-[#E8ECF4] px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABEL[r]}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                config.desc
              )}
            </DialogDescription>
            <div className="flex justify-end gap-2 mt-2">
              <DialogClose className="rounded-md px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F0F2FA] transition-colors">
                Annuler
              </DialogClose>
              <button
                type="button"
                disabled={submitting}
                onClick={confirm}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                  config.destructive
                    ? "bg-[#DC2626] hover:bg-[#B91C1C]"
                    : "bg-[#5B4EC4] hover:bg-[#4c3fa0]"
                }`}
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Confirmer"
                )}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
