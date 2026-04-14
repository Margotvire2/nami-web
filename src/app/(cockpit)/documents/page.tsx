"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, CareCase, Document, BioCandidate } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  FileText,
  Upload,
  Clock,
  User,
  Search,
  Share2,
  Sparkles,
  Eye,
  FolderOpen,
  FlaskConical,
  Loader2,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NamiCard } from "@/components/ui/NamiCard";
import { ShimmerCard } from "@/components/ui/shimmer";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// ─── Constantes ──────────────────────────────────────────────────────────────

const DOC_TYPE_LABEL: Record<string, string> = {
  PRESCRIPTION: "Ordonnance",
  BIOLOGICAL_REPORT: "Bilan biologique",
  CONSULTATION_REPORT: "Compte rendu",
  HOSPITAL_REPORT: "Rapport hospitalier",
  LETTER: "Courrier",
  IMAGING: "Imagerie",
  OTHER: "Autre",
};

const DOC_TYPE_STYLE: Record<string, string> = {
  PRESCRIPTION: "bg-purple-50 text-purple-700 border-purple-200",
  BIOLOGICAL_REPORT: "bg-teal-50 text-teal-700 border-teal-200",
  CONSULTATION_REPORT: "bg-blue-50 text-blue-700 border-blue-200",
  HOSPITAL_REPORT: "bg-orange-50 text-orange-700 border-orange-200",
  LETTER: "bg-slate-50 text-slate-600 border-slate-200",
  IMAGING: "bg-amber-50 text-amber-700 border-amber-200",
  OTHER: "bg-muted text-muted-foreground border-border",
};

function timeAgo(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "hier";
  return `il y a ${days}j`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / 1048576).toFixed(1)} Mo`;
}

// ─── Bio Extraction Modal ───────────────────────────────────────────────────

interface CandidateRow extends BioCandidate {
  included: boolean;
  editedValue: number;
}

function BioExtractionModal({
  doc,
  open,
  onOpenChange,
  api,
}: {
  doc: Document & { _caseId: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  api: ReturnType<typeof apiWithToken>;
}) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"idle" | "extracting" | "review" | "validating" | "error">("idle");
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [datePrelevement, setDatePrelevement] = useState("");
  const [laboratoire, setLaboratoire] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleExtract() {
    setStep("extracting");
    setErrorMsg("");
    try {
      const result = await api.documents.extractBio(doc.id);
      setCandidates(
        result.candidates.map((c) => ({
          ...c,
          included: true,
          editedValue: c.value,
        }))
      );
      setDatePrelevement(result.datePrelevement ?? "");
      setLaboratoire(result.laboratoire ?? "");
      setStep("review");
    } catch (err: any) {
      const msg = err?.error ?? err?.message ?? "Extraction impossible";
      setErrorMsg(msg);
      setStep("error");
    }
  }

  async function handleValidate() {
    const selected = candidates.filter((c) => c.included);
    if (selected.length === 0) {
      toast.error("Sélectionnez au moins une valeur");
      return;
    }
    if (!datePrelevement) {
      toast.error("Indiquez la date de prélèvement");
      return;
    }

    setStep("validating");
    try {
      await api.documents.validateBio(doc.id, {
        datePrelevement,
        observations: selected.map((c) => ({
          metricKey: c.metricKey,
          label: c.labelOriginal,
          value: c.editedValue,
          unit: c.unit,
        })),
      });
      toast.success(`${selected.length} valeur(s) intégrée(s) au dossier`);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      onOpenChange(false);
      // Reset
      setStep("idle");
      setCandidates([]);
    } catch (err: any) {
      toast.error(err?.error ?? "Erreur lors de la validation");
      setStep("review");
    }
  }

  function handleClose() {
    onOpenChange(false);
    setStep("idle");
    setCandidates([]);
    setErrorMsg("");
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical size={16} className="text-teal-600" />
            Extraction de bilan biologique
          </DialogTitle>
          <DialogDescription>
            Brouillon d&apos;extraction automatique — vérifiez chaque valeur avant intégration.
            Cette extraction ne constitue pas une interprétation clinique.
          </DialogDescription>
        </DialogHeader>

        {/* Idle — bouton lancer */}
        {step === "idle" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center">
              <FlaskConical size={28} className="text-teal-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{doc.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                L&apos;IA va extraire les valeurs numériques du bilan.
                Vous pourrez vérifier et corriger chaque valeur avant intégration.
              </p>
            </div>
            <Button onClick={handleExtract} className="gap-2">
              <FlaskConical size={14} /> Lancer l&apos;extraction
            </Button>
          </div>
        )}

        {/* Extracting */}
        {step === "extracting" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <Loader2 size={32} className="text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Analyse du bilan en cours…</p>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <p className="text-sm font-medium">Extraction impossible</p>
            <p className="text-xs text-muted-foreground text-center max-w-sm">
              {errorMsg || "Ajoutez les valeurs manuellement."}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExtract}>
                Réessayer
              </Button>
              <Button variant="outline" size="sm" onClick={handleClose}>
                Fermer
              </Button>
            </div>
          </div>
        )}

        {/* Review — tableau des valeurs */}
        {(step === "review" || step === "validating") && (
          <>
            {/* Date + labo */}
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-[11px] font-medium text-muted-foreground">Date de prélèvement</label>
                <Input
                  type="date"
                  value={datePrelevement}
                  onChange={(e) => setDatePrelevement(e.target.value)}
                  className="h-8 text-xs mt-1"
                />
              </div>
              {laboratoire && (
                <div className="flex-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Laboratoire</label>
                  <Input
                    value={laboratoire}
                    readOnly
                    className="h-8 text-xs mt-1 bg-muted/30"
                  />
                </div>
              )}
            </div>

            {/* Tableau */}
            <div className="flex-1 overflow-y-auto -mx-4 px-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium w-8"></th>
                    <th className="text-left py-2 font-medium">Analyte</th>
                    <th className="text-right py-2 font-medium">Valeur</th>
                    <th className="text-left py-2 font-medium pl-2">Unité</th>
                    <th className="text-center py-2 font-medium">Confiance</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c, i) => (
                    <tr
                      key={c.metricKey + i}
                      className={`border-b border-border/50 ${!c.included ? "opacity-40" : ""}`}
                    >
                      <td className="py-2">
                        <button
                          onClick={() =>
                            setCandidates((prev) =>
                              prev.map((r, j) => (j === i ? { ...r, included: !r.included } : r))
                            )
                          }
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            c.included
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {c.included && <Check size={12} />}
                        </button>
                      </td>
                      <td className="py-2">
                        <span className="font-medium">{c.labelOriginal}</span>
                        <span className="text-muted-foreground ml-1.5">({c.metricKey})</span>
                      </td>
                      <td className="py-2 text-right">
                        <input
                          type="number"
                          step="any"
                          value={c.editedValue}
                          onChange={(e) =>
                            setCandidates((prev) =>
                              prev.map((r, j) =>
                                j === i ? { ...r, editedValue: parseFloat(e.target.value) || 0 } : r
                              )
                            )
                          }
                          className="w-20 text-right bg-transparent border-b border-dashed border-border focus:border-primary focus:outline-none py-0.5 font-mono"
                        />
                      </td>
                      <td className="py-2 pl-2 text-muted-foreground">{c.unit}</td>
                      <td className="py-2 text-center">
                        {c.confidence >= 0.8 ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <Check size={9} /> Élevée
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            <AlertTriangle size={9} /> Faible
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {candidates.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-8">
                  Aucune valeur extraite
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={handleClose} disabled={step === "validating"}>
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={handleValidate}
                disabled={step === "validating" || candidates.filter((c) => c.included).length === 0}
                className="gap-1.5"
              >
                {step === "validating" ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Intégration…
                  </>
                ) : (
                  <>
                    <Check size={12} /> Valider et intégrer ({candidates.filter((c) => c.included).length})
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const [search, setSearch] = useState("");
  const [extractDoc, setExtractDoc] = useState<(Document & { _caseId: string }) | null>(null);

  const { data: cases, isLoading: loadingCases } = useQuery({
    queryKey: ["care-cases", "all"],
    queryFn: () => api.careCases.list(),
  });

  const caseIds = useMemo(() => (cases ?? []).map((c) => c.id), [cases]);

  const { data: allDocs, isLoading: loadingDocs } = useQuery({
    queryKey: ["documents", "all", caseIds],
    queryFn: async () => {
      const results = await Promise.all(
        caseIds.map(async (id) => {
          const docs = await api.documents.list(id);
          return docs.map((d) => ({ ...d, _caseId: id }));
        })
      );
      return results.flat();
    },
    enabled: caseIds.length > 0,
  });

  const isLoading = loadingCases || loadingDocs;
  const documents = allDocs ?? [];

  const filtered = documents.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      (DOC_TYPE_LABEL[d.documentType] ?? "").toLowerCase().includes(q)
    );
  });

  const caseMap = useMemo(() => {
    const m = new Map<string, CareCase>();
    for (const c of cases ?? []) m.set(c.id, c);
    return m;
  }, [cases]);

  const isBioDocument = (doc: Document) =>
    doc.documentType === "BIOLOGICAL_REPORT" || doc.documentType === "PRESCRIPTION";

  return (
    <div className="h-full flex flex-col overflow-hidden bg-muted/10">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold flex items-center gap-2">
              <FileText size={16} /> Documents
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isLoading
                ? "…"
                : `${filtered.length} document${filtered.length !== 1 ? "s" : ""} de coordination`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs w-56"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1.5 h-8"
              onClick={() =>
                toast.info("Import de documents — prochainement")
              }
            >
              <Upload size={12} /> Ajouter un document
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="max-w-3xl mx-auto px-6 py-4 space-y-3">
            {[...Array(5)].map((_, i) => <ShimmerCard key={i} />)}
          </div>
        ) : filtered.length === 0 && !search ? (
          /* ── Empty state contexte 1 : liste globale vide ── */
          <div className="flex flex-col items-center justify-center h-80 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
              <FileText size={24} className="text-primary/40" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Centralisez les documents de coordination
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
              Ordonnances, comptes rendus, bilans — partagez les documents
              utiles avec votre équipe en un clic.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <Button
                size="sm"
                className="text-xs gap-1.5 h-8"
                onClick={() =>
                  toast.info("Import de documents — prochainement")
                }
              >
                <Upload size={12} /> Ajouter un document
              </Button>
              <Link
                href="/patients"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs gap-1.5 h-8 px-2.5 font-medium transition-all"
              >
                <FolderOpen size={12} /> Ouvrir un dossier patient
              </Link>
            </div>
          </div>
        ) : filtered.length === 0 && search ? (
          /* ── Recherche sans résultat ── */
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Search size={24} className="text-muted-foreground/25 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              Aucun résultat pour &quot;{search}&quot;
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Essayez un autre terme ou vérifiez l&apos;orthographe.
            </p>
          </div>
        ) : (
          /* ── Liste de documents ── */
          <div className="max-w-3xl mx-auto px-6 py-4 space-y-2 nami-card-stagger">
            {filtered.map((doc) => {
              const cc = caseMap.get(doc.careCaseId);
              const typeLabel =
                DOC_TYPE_LABEL[doc.documentType] ?? doc.documentType;
              const typeStyle =
                DOC_TYPE_STYLE[doc.documentType] ?? DOC_TYPE_STYLE.OTHER;

              return (
                <NamiCard
                  key={doc.id}
                  variant="lift"
                  padding="none"
                  className="p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Ligne 1 : badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${typeStyle}`}
                        >
                          {typeLabel}
                        </span>
                        {doc.isSharedWithTeam && (
                          <span className="text-[10px] text-primary/70 flex items-center gap-0.5">
                            <Share2 size={9} /> Partagé
                          </span>
                        )}
                        {doc.summaryAi && (
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 cursor-help"
                            title="Synthèse automatique extractive. Validation humaine requise avant tout usage."
                          >
                            <Sparkles size={9} /> Brouillon · à valider — à vérifier
                          </span>
                        )}
                        {doc.bioExtracted && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <Check size={9} /> Données extraites
                          </span>
                        )}
                      </div>

                      {/* Ligne 2 : titre */}
                      <p className="text-sm font-medium truncate">
                        {doc.title}
                      </p>

                      {/* Ligne 3 : patient */}
                      {cc && (
                        <Link
                          href={`/patients/${cc.id}`}
                          className="text-[11px] text-primary hover:underline"
                        >
                          {cc.patient.firstName} {cc.patient.lastName}
                        </Link>
                      )}

                      {/* Ligne 4 : métadonnées */}
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User size={9} /> {doc.uploadedBy.firstName}{" "}
                          {doc.uploadedBy.lastName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={9} /> {timeAgo(doc.createdAt)}
                        </span>
                        {doc.sizeBytes > 0 && (
                          <span>{formatSize(doc.sizeBytes)}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isBioDocument(doc) && !doc.bioExtracted && (
                        <button
                          className="p-1.5 rounded-md hover:bg-teal-50 text-teal-600 hover:text-teal-700 transition-colors"
                          title="Extraire les données biologiques"
                          onClick={() => setExtractDoc(doc)}
                        >
                          <FlaskConical size={14} />
                        </button>
                      )}
                      <button
                        className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                        title="Voir le document"
                        onClick={() => {
                          if (doc.fileUrl) {
                            window.open(doc.fileUrl, "_blank");
                          } else {
                            toast.info("Document non téléchargé");
                          }
                        }}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                        title="Partage — prochainement"
                        disabled
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                </NamiCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal extraction bio */}
      {extractDoc && (
        <BioExtractionModal
          doc={extractDoc}
          open={!!extractDoc}
          onOpenChange={(open) => { if (!open) setExtractDoc(null); }}
          api={api}
        />
      )}
    </div>
  );
}
