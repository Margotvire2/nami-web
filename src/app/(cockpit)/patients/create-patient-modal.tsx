"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import {
  apiWithToken,
  type CreatePatientWithCaseInput,
  type CreatePatientWithCaseResult,
} from "@/lib/api";
import { groupByFamily, getFamilyLabel } from "@/lib/pathwayFamilyLabels";
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
import { cn } from "@/lib/utils";
import { track } from "@/lib/track";
import {
  User,
  FileText,
  Send,
  Check,
  Loader2,
  Copy,
  ArrowRight,
  Route,
  Search,
} from "lucide-react";

// ─── Constants ──────────────────────────────────────────────────────────────

const CASE_TYPES = [
  { value: "TCA", label: "TCA" },
  { value: "OBESITY", label: "Obésité" },
  { value: "METABOLIC", label: "Métabolique" },
  { value: "MENTAL_HEALTH", label: "Santé mentale" },
  { value: "PEDIATRIC", label: "Pédiatrique" },
  { value: "CHRONIC_PAIN", label: "Douleur chronique" },
  { value: "OTHER", label: "Autre" },
] as const;

const CASETYPE_TO_FAMILY: Record<string, string> = {
  TCA:          "tca",
  OBESITY:      "obesity",
  METABOLIC:    "dt2",
  MENTAL_HEALTH: "sante_mentale",
  PEDIATRIC:    "pediatrics",
  CHRONIC_PAIN: "douleur",
};

const RISK_LEVELS = [
  { value: "UNKNOWN", label: "Non évalué" },
  { value: "LOW", label: "Faible" },
  { value: "MEDIUM", label: "Modéré" },
  { value: "HIGH", label: "Élevé" },
  { value: "CRITICAL", label: "Critique" },
] as const;

const STEPS = [
  { label: "Patient", icon: User },
  { label: "Dossier", icon: FileText },
  { label: "Invitation", icon: Send },
];

// ─── Component ──────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePatientModal({ open, onOpenChange }: Props) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [result, setResult] = useState<CreatePatientWithCaseResult | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Step 1 — Patient info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sex, setSex] = useState<"M" | "F" | "OTHER" | "">("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");

  // Step 2 — Case info
  const [followUpMode, setFollowUpMode] = useState<"simple" | "structured">("simple");
  const [caseType, setCaseType] = useState<CreatePatientWithCaseInput["caseType"]>("OTHER");
  const [caseTitle, setCaseTitle] = useState("");
  const [mainConcern, setMainConcern] = useState("");
  const [riskLevel, setRiskLevel] = useState<CreatePatientWithCaseInput["riskLevel"]>("UNKNOWN");
  const [pathwayTemplateKey, setPathwayTemplateKey] = useState<string | undefined>(undefined);
  const [pathwaySearch, setPathwaySearch] = useState("");

  // Charger TOUS les pathways actifs (mode structuré seulement) — filtrage client-side
  const { data: allPathways = [] } = useQuery<{ id: string; key: string; label: string; family: string; _count?: { metrics: number } }[]>({
    queryKey: ["pathways-all-slim"],
    queryFn: () => api.intelligence.pathways(undefined, undefined, true),
    enabled: followUpMode === "structured" && step === 1,
    staleTime: 5 * 60 * 1000,
  });

  // Filtrage : par famille si un caseType est sélectionné, par recherche texte sinon
  const family = CASETYPE_TO_FAMILY[caseType];
  const pathways = allPathways.filter((p) => {
    const matchFamily = !family || p.family === family;
    const matchSearch = !pathwaySearch || p.label.toLowerCase().includes(pathwaySearch.toLowerCase());
    return matchFamily && matchSearch;
  });

  // Auto-generate case title
  function autoTitle() {
    if (followUpMode === "simple") return `Suivi ${firstName} ${lastName}`;
    const typeLabel = CASE_TYPES.find((t) => t.value === caseType)?.label ?? caseType;
    return `Suivi ${typeLabel} — ${firstName} ${lastName}`;
  }

  const createMutation = useMutation({
    mutationFn: () =>
      api.patients.createWithCase({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        sex: sex || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        birthDate: birthDate || undefined,
        caseType,
        caseTitle: caseTitle.trim() || autoTitle(),
        mainConcern: mainConcern.trim() || undefined,
        riskLevel,
        pathwayTemplateKey,
      }),
    onSuccess: (data) => {
      setResult(data);
      setStep(2);
      qc.invalidateQueries({ queryKey: ["care-cases"] });
      track.patientCreated({ method: "manual" });
      toast.success(`Dossier créé pour ${firstName} ${lastName}`);
    },
    onError: (err: any) => {
      if (err?.message?.includes("UPGRADE_REQUIRED")) {
        onOpenChange(false);
        router.push("/upgrade?trigger=create_patient");
        return;
      }
      const msg = err?.message?.includes("409")
        ? "Un patient avec ce nom existe déjà"
        : "Erreur lors de la création";
      toast.error(msg);
    },
  });

  function reset() {
    setStep(0);
    setResult(null);
    setLinkCopied(false);
    setFirstName("");
    setLastName("");
    setSex("");
    setEmail("");
    setPhone("");
    setBirthDate("");
    setFollowUpMode("simple");
    setCaseType("OTHER");
    setCaseTitle("");
    setMainConcern("");
    setRiskLevel("UNKNOWN");
    setPathwayTemplateKey(undefined);
    setPathwaySearch("");
  }

  function handleCopyLink() {
    if (result?.invitation?.inviteUrl) {
      navigator.clipboard.writeText(result.invitation.inviteUrl);
      setLinkCopied(true);
      toast.success("Lien copié !");
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }

  const canStep1 = firstName.trim() && lastName.trim();
  const canStep2 = true; // case type has default

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User size={16} className="text-primary" />
            Nouveau patient
          </DialogTitle>
          <DialogDescription>
            Créez un dossier patient et envoyez une invitation en 30 secondes.
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 py-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isDone = i < step;
            const isActive = i === step;
            return (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && (
                  <div className={cn("w-6 h-px", isDone ? "bg-primary" : "bg-border")} />
                )}
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors",
                    isDone
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary/10 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {isDone ? <Check size={12} /> : <Icon size={12} />}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step 1 — Patient */}
        {step === 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Prénom *
                </label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Prénom"
                  className="h-9 text-xs mt-1"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Nom *
                </label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nom"
                  className="h-9 text-xs mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Sexe</label>
              <div className="flex gap-2 mt-1.5">
                {([["M", "Homme"], ["F", "Femme"], ["OTHER", "Autre"]] as const).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSex(val)}
                    className={cn(
                      "flex-1 text-xs font-medium py-1.5 rounded-lg border transition-all",
                      sex === val
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
              <label className="text-[11px] font-medium text-muted-foreground">
                Email (pour l&apos;invitation)
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@email.fr"
                className="h-9 text-xs mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Téléphone
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="h-9 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Date de naissance
                </label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="h-9 text-xs mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Dossier */}
        {step === 1 && (
          <div className="space-y-3">
            {/* Mode de suivi */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">
                Mode de suivi
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => { setFollowUpMode("simple"); setCaseType("OTHER"); setPathwayTemplateKey(undefined); }}
                  className={cn(
                    "text-xs px-3 py-2.5 rounded-lg border transition-all text-left",
                    followUpMode === "simple"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <p className="font-semibold text-[11px]">Suivi simple</p>
                  <p className="text-[10px] opacity-70 mt-0.5">Consultations ponctuelles</p>
                </button>
                <button
                  type="button"
                  onClick={() => { setFollowUpMode("structured"); if (caseType === "OTHER") setCaseType("TCA"); }}
                  className={cn(
                    "text-xs px-3 py-2.5 rounded-lg border transition-all text-left",
                    followUpMode === "structured"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <p className="font-semibold text-[11px]">Parcours structuré</p>
                  <p className="text-[10px] opacity-70 mt-0.5">Coordination multi-soignants</p>
                </button>
              </div>
            </div>

            {/* Pathologie — uniquement en mode structuré */}
            {followUpMode === "structured" && (
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Pathologie / Spécialité
                </label>
                <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                  {CASE_TYPES.filter((t) => t.value !== "OTHER").map((t) => (
                    <button
                      key={t.value}
                      onClick={() => { setCaseType(t.value); setPathwayTemplateKey(undefined); }}
                      className={cn(
                        "text-xs font-medium px-2 py-1.5 rounded-lg transition-all border",
                        caseType === t.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sélecteur de pathway — en mode structuré (tous les parcours, recherche libre) */}
            {followUpMode === "structured" && (
              <div>
                <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <Route size={10} />
                  Parcours de soins
                </label>
                {/* Barre de recherche — toujours visible en mode structuré */}
                <div className="relative mt-1.5">
                  <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={pathwaySearch}
                    onChange={(e) => setPathwaySearch(e.target.value)}
                    placeholder="Rechercher un parcours…"
                    className="w-full pl-7 pr-3 h-8 text-[11px] rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="mt-1.5 space-y-1 max-h-40 overflow-y-auto pr-0.5">
                  {/* Option "Auto" */}
                  <button
                    type="button"
                    onClick={() => setPathwayTemplateKey(undefined)}
                    className={cn(
                      "w-full text-left text-[11px] px-3 py-2 rounded-lg border transition-all",
                      pathwayTemplateKey === undefined
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted/40"
                    )}
                  >
                    <span className="font-medium">Auto</span>
                    <span className="text-[10px] ml-1.5 opacity-70">— sélection automatique</span>
                  </button>

                  {pathways.length === 0 && (
                    <p className="text-[11px] text-muted-foreground text-center py-2 italic">
                      {allPathways.length === 0 ? "Chargement…" : "Aucun parcours trouvé"}
                    </p>
                  )}

                  {/* Vue groupée — quand pas de recherche ET pas de famille filtrée */}
                  {!pathwaySearch && !family && pathways.length > 0 && (
                    groupByFamily(pathways).map(({ family: fam, label: famLabel, items }) => (
                      <div key={fam}>
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground px-1 pt-2 pb-0.5">
                          {famLabel}
                        </p>
                        {items.map((p) => (
                          <button
                            key={p.key}
                            type="button"
                            onClick={() => setPathwayTemplateKey(p.key)}
                            className={cn(
                              "w-full text-left text-[11px] px-3 py-1.5 rounded-lg border transition-all",
                              pathwayTemplateKey === p.key
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border text-muted-foreground hover:bg-muted/40"
                            )}
                          >
                            <span className="font-medium truncate">{p.label}</span>
                          </button>
                        ))}
                      </div>
                    ))
                  )}

                  {/* Vue plate — quand recherche active OU famille filtrée */}
                  {(pathwaySearch || family) && pathways.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPathwayTemplateKey(p.key)}
                      className={cn(
                        "w-full text-left text-[11px] px-3 py-2 rounded-lg border transition-all",
                        pathwayTemplateKey === p.key
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">{p.label}</span>
                        {!family && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                            {getFamilyLabel(p.family)}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-medium text-muted-foreground">
                Titre du dossier
              </label>
              <Input
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
                placeholder={autoTitle()}
                className="h-9 text-xs mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">
                Motif principal
              </label>
              <Textarea
                value={mainConcern}
                onChange={(e) => setMainConcern(e.target.value)}
                placeholder="Ex: Restriction alimentaire sévère, perte de poids rapide…"
                className="text-xs mt-1 min-h-[60px] resize-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">
                Niveau de risque
              </label>
              <div className="flex gap-1.5 mt-1.5">
                {RISK_LEVELS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRiskLevel(r.value)}
                    className={cn(
                      "text-[10px] font-medium px-2.5 py-1 rounded-md transition-all border",
                      riskLevel === r.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Confirmation */}
        {step === 2 && result && (
          <div className="space-y-4 py-2">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <Check size={20} className="text-emerald-600" />
              </div>
              <p className="text-sm font-semibold">
                Dossier créé pour {result.patient.firstName} {result.patient.lastName}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {result.careCase.caseTitle}
              </p>
            </div>

            {result.invitation && (
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <p className="text-xs font-medium">Invitation envoyée</p>
                <p className="text-[11px] text-muted-foreground">
                  Un lien d&apos;invitation a été créé pour {result.patient.email}.
                  Il est valable 30 jours.
                </p>
                <div className="flex items-center gap-2 bg-card rounded-md p-2">
                  <p className="text-[10px] text-muted-foreground flex-1 break-all font-mono">
                    {result.invitation.inviteUrl}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-6 gap-1 shrink-0"
                    onClick={handleCopyLink}
                  >
                    {linkCopied ? <Check size={10} /> : <Copy size={10} />}
                    {linkCopied ? "Copié" : "Copier"}
                  </Button>
                </div>
              </div>
            )}

            {!result.invitation && (
              <div className="bg-amber-50/50 rounded-lg p-3">
                <p className="text-[11px] text-amber-700">
                  Pas d&apos;email renseigné — le patient pourra être invité plus tard
                  depuis son dossier.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <DialogFooter>
          {step === 0 && (
            <Button
              className="text-xs gap-1.5"
              disabled={!canStep1}
              onClick={() => setStep(1)}
            >
              Continuer <ArrowRight size={12} />
            </Button>
          )}
          {step === 1 && (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="text-xs"
                onClick={() => setStep(0)}
              >
                Précédent
              </Button>
              <Button
                className="text-xs gap-1.5 flex-1"
                disabled={createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Check size={12} />
                )}
                Créer le dossier
              </Button>
            </div>
          )}
          {step === 2 && (
            <Button
              className="text-xs"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
            >
              Fermer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
