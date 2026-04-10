"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import {
  apiWithToken,
  type CreatePatientWithCaseInput,
  type CreatePatientWithCaseResult,
} from "@/lib/api";
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
import {
  User,
  FileText,
  Send,
  Check,
  Loader2,
  Copy,
  ArrowRight,
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
  const [caseType, setCaseType] = useState<CreatePatientWithCaseInput["caseType"]>("TCA");
  const [caseTitle, setCaseTitle] = useState("");
  const [mainConcern, setMainConcern] = useState("");
  const [riskLevel, setRiskLevel] = useState<CreatePatientWithCaseInput["riskLevel"]>("UNKNOWN");

  // Auto-generate case title
  function autoTitle() {
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
      }),
    onSuccess: (data) => {
      setResult(data);
      setStep(2);
      qc.invalidateQueries({ queryKey: ["care-cases"] });
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
    setCaseType("TCA");
    setCaseTitle("");
    setMainConcern("");
    setRiskLevel("UNKNOWN");
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
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">
                Type de suivi
              </label>
              <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                {CASE_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setCaseType(t.value)}
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
