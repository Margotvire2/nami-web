"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import {
  apiWithToken,
  Colleague,
  ProviderStructure,
  Invitation,
  CreateInvitationInput,
} from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";
import {
  UsersRound,
  UserPlus,
  Mail,
  Copy,
  Check,
  Building2,
  Search,
  MessageSquare,
  FolderOpen,
  Globe,
  Clock,
  RotateCcw,
  Link2,
  ExternalLink,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constantes ──────────────────────────────────────────────────────────────

const SPECIALTY_LABEL: Record<string, string> = {
  DIETITIAN: "Diététicien·ne",
  PSYCHOLOGIST: "Psychologue",
  PHYSICIAN: "Médecin",
  PSYCHIATRIST: "Psychiatre",
  ENDOCRINOLOGIST: "Endocrinologue",
  PEDIATRICIAN: "Pédiatre",
  NURSE: "Infirmier·ère",
  OTHER: "Autre",
};

const STATUS_STYLE = {
  onNami: { label: "Sur Nami", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  invited: { label: "Invité", className: "bg-amber-50 text-amber-700 border-amber-200" },
  external: { label: "Pas encore sur Nami", className: "bg-muted text-muted-foreground border-border" },
};

type Tab = "confreres" | "structures" | "rpps" | "invitations";

function timeAgo(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days}j`;
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EquipePage() {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>("confreres");
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: colleagues, isLoading: loadingColleagues } = useQuery({
    queryKey: ["colleagues"],
    queryFn: () => api.colleagues.list(),
  });

  const { data: structures, isLoading: loadingStructures } = useQuery({
    queryKey: ["structures"],
    queryFn: () => api.structures.list(),
  });

  const { data: invitations, isLoading: loadingInvitations } = useQuery({
    queryKey: ["invitations-mine"],
    queryFn: () => api.invitations.mine(),
  });

  const pendingCount = (invitations ?? []).filter(
    (i) => i.status === "PENDING" && new Date(i.expiresAt) > new Date()
  ).length;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "confreres", label: "Confrères", count: colleagues?.length },
    { key: "structures", label: "Structures", count: structures?.length },
    { key: "rpps", label: "Annuaire RPPS" },
    { key: "invitations", label: "Invitations", count: pendingCount || undefined },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-muted/10">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold flex items-center gap-2">
              <UsersRound size={16} /> Mon équipe & réseau
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {colleagues?.length ?? 0} confrère{(colleagues?.length ?? 0) !== 1 ? "s" : ""} · {structures?.length ?? 0} structure{(structures?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
          <Button size="sm" className="text-xs gap-1.5 h-8" onClick={() => setInviteOpen(true)}>
            <UserPlus size={12} /> Inviter un confrère
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-md transition-all",
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {t.label}
              {t.count !== undefined && (
                <span className={cn(
                  "ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full",
                  tab === t.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "confreres" && (
          <ColleaguesTab
            colleagues={colleagues ?? []}
            isLoading={loadingColleagues}
            onInvite={() => setInviteOpen(true)}
          />
        )}
        {tab === "structures" && (
          <StructuresTab
            structures={structures ?? []}
            isLoading={loadingStructures}
          />
        )}
        {tab === "rpps" && <RPPSTab />}
        {tab === "invitations" && (
          <InvitationsTab
            invitations={invitations ?? []}
            isLoading={loadingInvitations}
            api={api}
            queryClient={queryClient}
          />
        )}
      </div>

      {/* Modal invitation */}
      <InviteModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        api={api}
        queryClient={queryClient}
      />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 1 — CONFRÈRES
// ═════════════════════════════════════════════════════════════════════════════

function ColleaguesTab({
  colleagues,
  isLoading,
  onInvite,
}: {
  colleagues: Colleague[];
  isLoading: boolean;
  onInvite: () => void;
}) {
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-2">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }

  if (colleagues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-center px-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
          <UsersRound size={24} className="text-primary/40" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          Vos confrères apparaîtront ici
        </p>
        <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
          Dès que vous partagez un dossier patient avec un autre soignant,
          il apparaîtra dans votre réseau.
        </p>
        <Button size="sm" className="text-xs gap-1.5 h-8 mt-5" onClick={onInvite}>
          <UserPlus size={12} /> Inviter un confrère
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-4 space-y-2">
      {colleagues.map((c) => {
        const spec = c.provider.specialties[0];
        const specLabel = SPECIALTY_LABEL[spec] ?? spec ?? "Soignant";
        return (
          <div
            key={c.person.id}
            className="rounded-xl border bg-card p-4 hover:shadow-[0_2px_8px_rgba(79,70,229,0.08)] transition-shadow"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                {initials(c.person.firstName, c.person.lastName)}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {c.person.firstName} {c.person.lastName}
                  </p>
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", STATUS_STYLE.onNami.className)}>
                    {STATUS_STYLE.onNami.label}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{specLabel}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {c.sharedCaseCount} patient{c.sharedCaseCount !== 1 ? "s" : ""} en commun
                </p>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  href="/patients"
                  className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                  title="Voir les dossiers communs"
                >
                  <FolderOpen size={14} />
                </Link>
                <Link
                  href="/collaboration"
                  className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                  title="Envoyer un message"
                >
                  <MessageSquare size={14} />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 2 — STRUCTURES
// ═════════════════════════════════════════════════════════════════════════════

function StructuresTab({
  structures,
  isLoading,
}: {
  structures: ProviderStructure[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-2">
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }

  if (structures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-center px-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
          <Building2 size={24} className="text-primary/40" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          Ajoutez vos structures
        </p>
        <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
          Ajoutez vos structures pour retrouver vos confrères facilement.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="text-xs gap-1.5 h-8 mt-5"
          disabled title="Prochainement"
        >
          <Building2 size={12} /> Rejoindre une structure
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-4 space-y-2">
      {structures.map((s) => (
        <div
          key={s.id}
          className="rounded-xl border bg-card p-4 hover:shadow-[0_2px_8px_rgba(79,70,229,0.08)] transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {s.type} · {s.city} {s.postalCode}
              </p>
              {s.address && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.address}</p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7"
              disabled title="Prochainement"
            >
              Gérer
            </Button>
          </div>
        </div>
      ))}
      <div className="pt-2">
        <Button
          size="sm"
          variant="outline"
          className="text-xs gap-1.5 h-8"
          disabled title="Prochainement"
        >
          <Building2 size={12} /> Rejoindre une structure
        </Button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 3 — RECHERCHE RPPS
// ═════════════════════════════════════════════════════════════════════════════

interface RPPSResult {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  rppsNumber: string;
  specialty: string;
  address: string;
}

function RPPSTab() {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [results, setResults] = useState<RPPSResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const params = new URLSearchParams({ _count: "15" });

      // Split query into potential first/last name
      const parts = query.trim().split(/\s+/);
      if (parts.length >= 2) {
        params.set("family", parts.slice(-1)[0]);
        params.set("given", parts.slice(0, -1).join(" "));
      } else {
        params.set("name", parts[0]);
      }

      const url = `https://gateway.api.esante.gouv.fr/fhir/v1/Practitioner?${params}`;
      const resp = await fetch(url, {
        headers: { Accept: "application/fhir+json" },
        signal: AbortSignal.timeout(10000),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      const entries = data.entry ?? [];
      const parsed: RPPSResult[] = entries.map((e: any) => {
        const r = e.resource;
        const nameObj = r.name?.[0] ?? {};
        const firstName = nameObj.given?.join(" ") ?? "";
        const lastName = nameObj.family ?? "";
        const id = r.id ?? "";

        // Extract RPPS from identifiers
        const rpps = r.identifier?.find(
          (i: any) => i.system === "urn:oid:1.2.250.1.71.4.2.1"
        );
        const rppsNumber = rpps?.value ?? "";

        // Extract qualification
        const qual = r.qualification?.[0]?.code?.coding?.[0]?.display ?? "";

        // Extract address from extension or telecom
        const addr = r.address?.[0];
        const addressStr = addr
          ? [addr.line?.join(" "), addr.postalCode, addr.city].filter(Boolean).join(", ")
          : "";

        return {
          id,
          fullName: `${firstName} ${lastName}`.trim(),
          firstName,
          lastName,
          rppsNumber,
          specialty: qual,
          address: addressStr,
        };
      });

      setResults(parsed);
    } catch (err: any) {
      if (err.name === "TimeoutError" || err.name === "AbortError") {
        setError("Recherche indisponible momentanément. Réessayez dans quelques instants.");
      } else {
        setError("Erreur lors de la recherche. Vérifiez votre connexion.");
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-4">
      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Nom, prénom du professionnel…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-8 h-9 text-xs"
          />
        </div>
        <Button size="sm" className="text-xs h-9 gap-1.5" onClick={handleSearch} disabled={loading || !query.trim()}>
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
          Rechercher
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground mb-4">
        Recherche dans l&apos;annuaire national des professionnels de santé (RPPS) — 900 000+ professionnels.
      </p>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 mb-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          {results.map((r) => (
            <div key={r.id} className="rounded-xl border bg-card p-4 hover:shadow-[0_2px_8px_rgba(79,70,229,0.08)] transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center text-[11px] font-bold text-muted-foreground shrink-0">
                  {initials(r.firstName || "?", r.lastName || "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.fullName || "Nom inconnu"}</p>
                  {r.specialty && (
                    <p className="text-[11px] text-muted-foreground">{r.specialty}</p>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    {r.rppsNumber && (
                      <span className="text-[10px] text-muted-foreground">RPPS {r.rppsNumber}</span>
                    )}
                    {r.address && (
                      <span className="text-[10px] text-muted-foreground truncate">· {r.address}</span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="text-xs h-7 gap-1"
                  disabled title="Invitation via RPPS — prochainement"
                >
                  <UserPlus size={11} /> Inviter
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : searched && !error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search size={24} className="text-muted-foreground/25 mb-3" />
          <p className="text-sm text-muted-foreground font-medium">Aucun résultat</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Essayez avec un nom différent.</p>
        </div>
      ) : !searched ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
            <Globe size={24} className="text-primary/40" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Annuaire national RPPS
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
            Recherchez n&apos;importe quel professionnel de santé français par nom
            pour l&apos;inviter sur Nami.
          </p>
        </div>
      ) : null}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 4 — INVITATIONS
// ═════════════════════════════════════════════════════════════════════════════

function InvitationsTab({
  invitations,
  isLoading,
  api,
  queryClient,
}: {
  invitations: Invitation[];
  isLoading: boolean;
  api: ReturnType<typeof apiWithToken>;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const resendMutation = useMutation({
    mutationFn: (id: string) => api.invitations.resend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations-mine"] });
      toast.success("Invitation renvoyée");
    },
    onError: () => toast.error("Erreur lors du renvoi"),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-2">
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-center px-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
          <Mail size={24} className="text-primary/40" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          Aucune invitation envoyée
        </p>
        <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
          Invitez vos confrères à rejoindre Nami pour collaborer
          sur vos dossiers patients.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-4 space-y-2">
      {invitations.map((inv) => {
        const isExpired = inv.status === "PENDING" && new Date(inv.expiresAt) < new Date();
        const isAccepted = inv.status === "ACCEPTED";

        return (
          <div
            key={inv.id}
            className="rounded-xl border bg-card p-4 hover:shadow-[0_2px_8px_rgba(79,70,229,0.08)] transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                isAccepted ? "bg-emerald-50" : isExpired ? "bg-muted/40" : "bg-amber-50"
              )}>
                {isAccepted ? (
                  <Check size={18} className="text-emerald-600" />
                ) : isExpired ? (
                  <Clock size={18} className="text-muted-foreground" />
                ) : (
                  <Mail size={18} className="text-amber-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {inv.toEmail ?? "Invitation par lien"}
                  </p>
                  {isAccepted && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">
                      Acceptée
                    </span>
                  )}
                  {isExpired && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-muted text-muted-foreground border-border">
                      Expirée
                    </span>
                  )}
                  {!isAccepted && !isExpired && inv.status === "PENDING" && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
                      En attente
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Envoyée {timeAgo(inv.createdAt)}
                  {inv.careCase && <> · Dossier : {inv.careCase.caseTitle}</>}
                </p>
                {isAccepted && inv.acceptedBy && (
                  <p className="text-[10px] text-emerald-600 mt-0.5">
                    Acceptée par {inv.acceptedBy.firstName} {inv.acceptedBy.lastName}
                  </p>
                )}
              </div>
              {/* Actions */}
              {isExpired && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 gap-1"
                  onClick={() => resendMutation.mutate(inv.id)}
                  disabled={resendMutation.isPending}
                >
                  <RotateCcw size={11} /> Renvoyer
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MODAL — INVITER UN CONFRÈRE
// ═════════════════════════════════════════════════════════════════════════════

function InviteModal({
  open,
  onOpenChange,
  api,
  queryClient,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  api: ReturnType<typeof apiWithToken>;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const [method, setMethod] = useState<"email" | "link">("email");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    "Bonjour,\n\nJe vous invite à rejoindre Nami pour faciliter la coordination sur nos patients communs.\n\nÀ bientôt !"
  );
  const [generatedLink, setGeneratedLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: CreateInvitationInput) => api.invitations.create(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["invitations-mine"] });
      if (method === "email") {
        toast.success("Invitation envoyée !");
        onOpenChange(false);
        resetForm();
      } else {
        setGeneratedLink(result.inviteUrl ?? "");
      }
    },
    onError: () => toast.error("Erreur lors de la création de l'invitation"),
  });

  function resetForm() {
    setEmail("");
    setMessage("Bonjour,\n\nJe vous invite à rejoindre Nami pour faciliter la coordination sur nos patients communs.\n\nÀ bientôt !");
    setGeneratedLink("");
    setLinkCopied(false);
    setMethod("email");
  }

  function handleSend() {
    if (method === "email") {
      if (!email.trim()) {
        toast.error("Saisissez un email");
        return;
      }
      createMutation.mutate({ email, message: message || undefined });
    } else {
      createMutation.mutate({ message: message || undefined });
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(generatedLink);
    setLinkCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setLinkCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={16} className="text-primary" />
            Inviter un confrère
          </DialogTitle>
          <DialogDescription>
            30 secondes — votre confrère reçoit le lien et rejoint votre réseau.
          </DialogDescription>
        </DialogHeader>

        {/* Method toggle */}
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
          <button
            onClick={() => { setMethod("email"); setGeneratedLink(""); }}
            className={cn(
              "flex-1 text-xs font-medium py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5",
              method === "email"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground"
            )}
          >
            <Mail size={12} /> Par email
          </button>
          <button
            onClick={() => { setMethod("link"); setGeneratedLink(""); }}
            className={cn(
              "flex-1 text-xs font-medium py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5",
              method === "link"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground"
            )}
          >
            <Link2 size={12} /> Par lien
          </button>
        </div>

        {/* Email method */}
        {method === "email" && (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Email du confrère</label>
              <Input
                type="email"
                placeholder="confrere@cabinet.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-xs mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Message (optionnel)</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="text-xs mt-1 min-h-[80px] resize-none"
              />
            </div>
          </div>
        )}

        {/* Link method */}
        {method === "link" && !generatedLink && (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              Générez un lien unique d&apos;invitation, valable 7 jours.
              Partagez-le par SMS, WhatsApp ou tout autre canal.
            </p>
          </div>
        )}

        {method === "link" && generatedLink && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-2.5 overflow-hidden">
              <p className="text-[11px] text-muted-foreground flex-1 min-w-0 truncate font-mono">
                {generatedLink}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 gap-1 shrink-0"
                onClick={handleCopyLink}
              >
                {linkCopied ? <Check size={11} /> : <Copy size={11} />}
                {linkCopied ? "Copié" : "Copier"}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Ce lien expire dans 7 jours.
            </p>
          </div>
        )}

        <DialogFooter>
          {!(method === "link" && generatedLink) && (
            <Button
              className="text-xs gap-1.5"
              onClick={handleSend}
              disabled={createMutation.isPending || (method === "email" && !email.trim())}
            >
              {createMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : method === "email" ? (
                <Mail size={12} />
              ) : (
                <Link2 size={12} />
              )}
              {method === "email" ? "Envoyer l'invitation" : "Générer le lien"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
