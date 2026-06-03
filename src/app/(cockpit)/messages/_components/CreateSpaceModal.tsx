"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { getSpaceConfig } from "./proSpaceConfig";

const SPACE_TYPES = [
  { value: "CLINICAL_NETWORK", label: "Réseau clinique" },
  { value: "CPTS", label: "CPTS" },
  { value: "HOSPITAL", label: "Hôpital / Service" },
  { value: "PRACTICE", label: "Cabinet" },
  { value: "ALUMNI", label: "Alumni / Formation" },
  { value: "COMMUNITY", label: "Communauté" },
] as const;

export function CreateSpaceModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("CLINICAL_NETWORK");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  function reset() {
    setName("");
    setType("CLINICAL_NETWORK");
    setDescription("");
  }

  async function handleCreate() {
    if (!name.trim() || !accessToken) return;
    setCreating(true);
    try {
      const api = apiWithToken(accessToken);
      const conv = await api.proMessages.createGroup(
        name.trim(),
        [],
        description.trim() || undefined,
        type,
      );
      qc.invalidateQueries({ queryKey: ["pro-conversations"] });
      onCreated(conv.id);
      onOpenChange(false);
      reset();
      toast.success(`Espace "${name.trim()}" créé`);
    } catch {
      toast.error("Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus size={16} className="text-primary" />
            Créer un espace
          </DialogTitle>
          <DialogDescription>
            Créez un espace de coordination pour échanger avec vos pairs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">
              Type d&apos;espace
            </label>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {SPACE_TYPES.map((t) => {
                const cfg = getSpaceConfig(t.value);
                const Icon = cfg.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                      type === t.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    <Icon size={13} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-muted-foreground">
              Nom de l&apos;espace
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Réseau TCA Francilien"
              className="h-9 text-xs mt-1"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-muted-foreground">
              Description (optionnel)
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description courte de l'espace"
              className="h-9 text-xs mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            className="text-xs gap-1.5"
            onClick={handleCreate}
            disabled={creating || !name.trim()}
          >
            <Plus size={12} />
            Créer l&apos;espace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
