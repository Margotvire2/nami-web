"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import {
  secretariatApi,
  apiWithToken,
  type ProviderSearchLightResult,
} from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, MessageSquarePlus, Search } from "lucide-react";

function ProviderInitials({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center text-[9px] font-bold text-white shrink-0 uppercase">
      {firstName[0]}
      {lastName[0]}
    </div>
  );
}

export function NewDmModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
}) {
  const { user, accessToken } = useAuthStore();
  const qc = useQueryClient();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<ProviderSearchLightResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [creatingFor, setCreatingFor] = useState<string | null>(null);

  // 300ms debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch on debounced query — min 2 chars
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    secretariatApi
      .searchProvidersLight({ q: debouncedQuery.trim(), limit: 15 })
      .then((data) =>
        setResults(
          (data.providers ?? []).filter((p) => p.id !== user?.id),
        ),
      )
      .catch(() => toast.error("Erreur lors de la recherche"))
      .finally(() => setSearching(false));
  }, [debouncedQuery, user?.id]);

  function handleOpenChange(v: boolean) {
    if (!v) {
      setQuery("");
      setDebouncedQuery("");
      setResults([]);
      setSearching(false);
      setCreatingFor(null);
    }
    onOpenChange(v);
  }

  async function handleSelect(provider: ProviderSearchLightResult) {
    if (!accessToken || creatingFor) return;
    setCreatingFor(provider.id);
    try {
      const conv = await apiWithToken(accessToken).proMessages.createDirect(
        provider.id,
      );
      qc.invalidateQueries({ queryKey: ["pro-conversations"] });
      onCreated(conv.id);
      handleOpenChange(false);
      toast.success(
        `Conversation avec ${provider.firstName} ${provider.lastName} ouverte`,
      );
    } catch {
      toast.error("Impossible de créer la conversation");
    } finally {
      setCreatingFor(null);
    }
  }

  const showList = query.trim().length >= 2;
  const tooShort = query.length > 0 && query.trim().length < 2;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus size={16} className="text-primary" />
            Nouveau message
          </DialogTitle>
          <DialogDescription>
            Recherchez un confrère enregistré sur Nami.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            {searching ? (
              <Loader2
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin"
              />
            ) : (
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            )}
            <Input
              autoFocus
              placeholder="Nom, prénom…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-7 h-9 text-sm"
            />
          </div>

          {tooShort && (
            <p className="text-[10px] text-muted-foreground px-1">
              Saisissez au moins 2 caractères
            </p>
          )}

          {showList && (
            <div className="max-h-56 overflow-y-auto space-y-0.5 -mx-1">
              {searching && results.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                  <Loader2 size={12} className="animate-spin" />
                  Recherche en cours…
                </div>
              ) : results.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  Aucun résultat
                </div>
              ) : (
                results.map((p) => (
                  <button
                    key={p.id}
                    disabled={creatingFor !== null}
                    onClick={() => handleSelect(p)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-muted/60 transition-colors disabled:opacity-50"
                  >
                    <ProviderInitials
                      firstName={p.firstName}
                      lastName={p.lastName}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {p.firstName} {p.lastName}
                      </p>
                      {(p.profession || p.city) && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {[p.profession, p.city].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    {creatingFor === p.id && (
                      <Loader2
                        size={12}
                        className="text-primary animate-spin shrink-0"
                      />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
