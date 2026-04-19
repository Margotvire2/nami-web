"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { providerDirectoryApi, connectionRequestsApi, type PublicProvider } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import Link from "next/link";
import {
  Search,
  MapPin,
  Video,
  Clock,
  UserPlus,
  Check,
  Loader2,
  Shield,
  ArrowLeft,
  Stethoscope,
  Heart,
} from "lucide-react";

// ─── Constants ──────────────────────────────────────────────────────────────

const SPECIALTY_OPTIONS = [
  { value: "", label: "Toutes les spécialités" },
  { value: "DIETITIAN", label: "Diététicien·ne" },
  { value: "PSYCHOLOGIST", label: "Psychologue" },
  { value: "PHYSICIAN", label: "Médecin" },
  { value: "PSYCHIATRIST", label: "Psychiatre" },
  { value: "ENDOCRINOLOGIST", label: "Endocrinologue" },
  { value: "PEDIATRICIAN", label: "Pédiatre" },
];

const SPECIALTY_LABEL: Record<string, string> = {
  DIETITIAN: "Diététicien·ne",
  PSYCHOLOGIST: "Psychologue",
  PHYSICIAN: "Médecin",
  PSYCHIATRIST: "Psychiatre",
  ENDOCRINOLOGIST: "Endocrinologue",
  PEDIATRICIAN: "Pédiatre",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TrouverUnSoignantPage() {
  const { accessToken, user } = useAuthStore();
  const [specialty, setSpecialty] = useState("");
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<PublicProvider | null>(null);

  const { data: providers, isLoading } = useQuery({
    queryKey: ["provider-directory", specialty],
    queryFn: () =>
      providerDirectoryApi.search({
        ...(specialty ? { specialty } : {}),
        accepting: "true",
      }),
  });

  const filtered = (providers ?? []).filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = `${p.person.firstName} ${p.person.lastName}`.toLowerCase();
    const specs = p.specialties.map((s) => (SPECIALTY_LABEL[s] ?? s).toLowerCase()).join(" ");
    const city = p.structures[0]?.city?.toLowerCase() ?? "";
    return name.includes(q) || specs.includes(q) || city.includes(q);
  });

  const isPatient = user?.roleType === "PATIENT";

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
      {/* Header */}
      <div style={{ background: "#FAFAF8", borderBottom: "1px solid rgba(26,26,46,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 40px" }}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
              style={{ background: "rgba(91,78,196,0.07)", color: "#5B4EC4", border: "1px solid rgba(91,78,196,0.15)", letterSpacing: "0.08em" }}>
              ANNUAIRE
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4"
              style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)", lineHeight: 1.08 }}>
              Trouvez le bon soignant,<br className="hidden md:block" /> au bon moment.
            </h1>
            <p className="text-lg mb-8" style={{ color: "#4A4A5A" }}>
              60 000+ sources cliniques structurées. 131 parcours de soins.
            </p>
          </div>

          {/* Search bar premium */}
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1" style={{ minWidth: 240 }}>
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#8A8A96" }} />
                <Input
                  placeholder="Nom, spécialité, ville…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-0 rounded-full h-12 pl-11 pr-5 text-sm"
                  style={{ background: "#fff", boxShadow: "0 1px 3px rgba(26,26,46,0.08)", color: "#1A1A2E" }}
                />
              </div>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="h-12 px-5 rounded-full border-0 text-sm font-medium"
                style={{ background: "#fff", boxShadow: "0 1px 3px rgba(26,26,46,0.08)", color: "#4A4A5A", minWidth: 200 }}
              >
                {SPECIALTY_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Stethoscope size={28} className="text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Aucun soignant trouvé</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Essayez avec d&apos;autres critères de recherche.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <p className="text-sm font-medium mb-5 sm:col-span-2 lg:col-span-3" style={{ color: "#8A8A96" }}>
              {filtered.length} soignant{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}
            </p>
            {filtered.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isPatient={isPatient}
                onContact={() => setSelectedProvider(provider)}
              />
            ))}
          </div>
        )}

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-6 mt-12 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Shield size={11} /> Profils vérifiés</span>
          <span className="flex items-center gap-1"><Heart size={11} /> Coordination de soins</span>
        </div>
      </div>

      {/* Contact modal */}
      {selectedProvider && (
        <ContactModal
          provider={selectedProvider}
          open={!!selectedProvider}
          onOpenChange={(open) => !open && setSelectedProvider(null)}
          accessToken={accessToken}
          isPatient={isPatient}
        />
      )}
    </div>
  );
}

// ─── Provider Card ──────────────────────────────────────────────────────────

function ProviderCard({
  provider,
  isPatient,
  onContact,
}: {
  provider: PublicProvider;
  isPatient: boolean;
  onContact: () => void;
}) {
  const spec = provider.specialties[0];
  const specLabel = SPECIALTY_LABEL[spec] ?? spec ?? "Soignant";
  const structure = provider.structures[0];

  return (
    <div className="nami-pillar-card rounded-2xl border bg-white p-5 cursor-pointer"
      style={{ borderColor: "rgba(26,26,46,0.07)", boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-sm font-bold text-white shrink-0">
          {provider.person.firstName[0]}{provider.person.lastName[0]}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">
            {provider.person.firstName} {provider.person.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{specLabel}</p>

          {structure && (
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin size={10} /> {structure.name}{structure.city ? ` · ${structure.city}` : ""}
            </p>
          )}

          <div className="flex items-center gap-3 mt-1.5">
            {provider.acceptsTele && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Video size={9} /> Téléconsultation
              </span>
            )}
            {provider.acceptsNewPatients && (
              <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                <Check size={9} /> Accepte nouveaux patients
              </span>
            )}
          </div>

          {provider.bio && (
            <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2">{provider.bio}</p>
          )}
        </div>

        {/* CTA */}
        <Button
          size="sm"
          className="text-xs h-8 gap-1.5 shrink-0"
          onClick={onContact}
        >
          <UserPlus size={12} /> Contacter
        </Button>
      </div>
    </div>
  );
}

// ─── Contact Modal ──────────────────────────────────────────────────────────

function ContactModal({
  provider,
  open,
  onOpenChange,
  accessToken,
  isPatient,
}: {
  provider: PublicProvider;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessToken: string | null;
  isPatient: boolean;
}) {
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [preferredType, setPreferredType] = useState<"IN_PERSON" | "VIDEO" | "PHONE">("IN_PERSON");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const specLabel = SPECIALTY_LABEL[provider.specialties[0]] ?? provider.specialties[0] ?? "Soignant";

  async function handleSubmit() {
    if (!accessToken) {
      toast.error("Connectez-vous pour envoyer une demande");
      return;
    }
    setSubmitting(true);
    try {
      await connectionRequestsApi.create(accessToken, {
        providerId: provider.id,
        reason: reason.trim() || undefined,
        preferredType,
        message: message.trim() || undefined,
      });
      setDone(true);
      toast.success("Demande envoyée !");
    } catch (err: any) {
      if (err?.message?.includes("409")) {
        toast.error("Vous avez déjà une demande en cours vers ce soignant");
      } else if (err?.message?.includes("400")) {
        toast.error("Ce soignant n'accepte pas de nouveaux patients actuellement");
      } else {
        toast.error("Erreur lors de l'envoi");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {!done ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus size={16} className="text-primary" />
                Demande de suivi
              </DialogTitle>
              <DialogDescription>
                Envoyez une demande à {provider.person.firstName} {provider.person.lastName} ({specLabel}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {!accessToken && (
                <div className="bg-amber-50/50 rounded-lg p-3 text-xs text-amber-700">
                  <Link href="/signup" className="font-medium underline">Créez un compte</Link> ou <Link href="/login" className="font-medium underline">connectez-vous</Link> pour envoyer une demande.
                </div>
              )}

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Motif de consultation</label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Suivi nutritionnel, TCA, perte de poids…"
                  className="h-9 text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Format préféré</label>
                <div className="flex gap-1.5 mt-1.5">
                  {([["IN_PERSON", "Cabinet"], ["VIDEO", "Vidéo"], ["PHONE", "Téléphone"]] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setPreferredType(val)}
                      className={cn(
                        "text-xs font-medium px-3 py-1.5 rounded-md transition-all border",
                        preferredType === val
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">Message (optionnel)</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Présentez-vous brièvement…"
                  className="text-xs mt-1 min-h-[60px] resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                className="text-xs gap-1.5"
                onClick={handleSubmit}
                disabled={submitting || !accessToken}
              >
                {submitting ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                Envoyer la demande
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-4 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <Check size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold">Demande envoyée</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                {provider.person.firstName} {provider.person.lastName} recevra votre demande
                et vous recontactera prochainement.
              </p>
            </div>
            <Button variant="outline" className="text-xs" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
