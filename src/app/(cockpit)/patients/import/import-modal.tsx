"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Papa from "papaparse";
import {
  Upload, FileCheck, Table2, Loader2, CheckCircle2,
  ChevronRight, ChevronLeft, X, AlertTriangle, Check,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";
import {
  type DoctolibeRow,
  type PatientImportPayload,
  type ImportResult,
  type MappingField,
  mapDoctolibeToNami,
  DEFAULT_DOCTOLIB_MAPPING,
} from "./import.types";

// ─── Props ───────────────────────────────────────────────────────────────────

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: ImportResult) => void;
}

// ─── Palette ─────────────────────────────────────────────────────────────────

const PRIMARY = "#5B4FE8";
const LIGHT = "#EEEDFB";
const BG = "#F2F3F8";
const BORDER = "#E8E9EF";

// ─── Stepper ─────────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Upload",     icon: Upload },
  { label: "Mapping",    icon: Table2 },
  { label: "Aperçu",     icon: FileCheck },
  { label: "Import",     icon: CheckCircle2 },
];

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-1 py-4 px-6">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = s.icon;
        return (
          <div key={i} className="flex items-center gap-1">
            <div className="flex items-center gap-1.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors"
                style={{
                  background: done || active ? PRIMARY : BG,
                  color: done || active ? "#fff" : "#9CA3AF",
                }}
              >
                {done ? <Check size={13} /> : <Icon size={13} />}
              </div>
              <span
                className="text-xs font-medium hidden sm:inline"
                style={{ color: active ? PRIMARY : done ? "#374151" : "#9CA3AF" }}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="w-8 h-px mx-1"
                style={{ background: i < current ? PRIMARY : BORDER }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isDoctolib(headers: string[]): boolean {
  const h = headers.map((s) => s.toLowerCase().trim());
  return h.includes("import_identifier") && h.includes("insurance_type");
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

interface PreviewRow {
  payload: PatientImportPayload;
  warnings: string[];
}

function buildPreviews(
  rows: DoctolibeRow[],
  mapping: MappingField[],
): { ready: PreviewRow[]; warned: PreviewRow[] } {
  const enabled = new Set(mapping.filter((m) => m.enabled).map((m) => m.csvKey));
  const ready: PreviewRow[] = [];
  const warned: PreviewRow[] = [];

  for (const row of rows) {
    // Zero out disabled fields
    const cleaned = { ...row };
    for (const key of Object.keys(cleaned) as (keyof DoctolibeRow)[]) {
      if (key === "first_name" || key === "last_name") continue; // always required
      if (!enabled.has(key)) (cleaned as Record<string, string>)[key] = "";
    }

    try {
      const payload = mapDoctolibeToNami(cleaned);
      const warnings: string[] = [];
      if (!payload.email) warnings.push("Email manquant");
      if (!payload.birthDate) warnings.push("Date de naissance manquante");
      if (!payload.phoneNumber) warnings.push("Téléphone manquant");

      const entry = { payload, warnings };
      if (warnings.length > 0) warned.push(entry);
      else ready.push(entry);
    } catch {
      // Skip completely invalid rows
    }
  }
  return { ready, warned };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);

  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<DoctolibeRow[]>([]);
  const [detected, setDetected] = useState(false);
  const [mapping, setMapping] = useState<MappingField[]>(DEFAULT_DOCTOLIB_MAPPING);
  const [previews, setPreviews] = useState<{ ready: PreviewRow[]; warned: PreviewRow[] }>({ ready: [], warned: [] });
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setFile(null);
      setRows([]);
      setDetected(false);
      setMapping(DEFAULT_DOCTOLIB_MAPPING);
      setPreviews({ ready: [], warned: [] });
      setImporting(false);
      setProgress({ done: 0, total: 0 });
      setResult(null);
    }
  }, [isOpen]);

  // ─── File handling ─────────────────────────────────────────────────────────

  const handleFile = useCallback((f: File) => {
    setFile(f);

    Papa.parse<DoctolibeRow>(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        setRows(data);

        if (results.meta.fields && isDoctolib(results.meta.fields)) {
          setDetected(true);
          setTimeout(() => setStep(1), 800);
        }
      },
      error: () => {
        toast.error("Erreur lors de la lecture du fichier");
      },
    });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  // ─── Step transitions ──────────────────────────────────────────────────────

  const goMapping = () => setStep(1);

  const goPreview = () => {
    const p = buildPreviews(rows, mapping);
    setPreviews(p);
    setStep(2);
  };

  const goImport = async () => {
    setStep(3);
    setImporting(true);

    const allPayloads = [...previews.ready, ...previews.warned].map((r) => r.payload);
    const total = allPayloads.length;
    setProgress({ done: 0, total });

    const batchSize = 50;
    const accumulated: ImportResult = { total, success: 0, skipped: 0, errors: [] };

    for (let i = 0; i < total; i += batchSize) {
      const batch = allPayloads.slice(i, i + batchSize);
      try {
        const res = await api.patientsBulk(batch);
        accumulated.success += res.result.success;
        accumulated.skipped += res.result.skipped;
        accumulated.errors.push(
          ...res.result.errors.map((e: { row: number; reason: string }) => ({
            row: e.row + i,
            reason: e.reason,
          })),
        );
      } catch {
        toast.error(`Erreur lors de l'import du batch ${Math.floor(i / batchSize) + 1}`);
        for (let j = 0; j < batch.length; j++) {
          accumulated.errors.push({ row: i + j + 1, reason: "Erreur réseau" });
        }
      }
      setProgress({ done: Math.min(i + batchSize, total), total });
    }

    setResult(accumulated);
    setImporting(false);
  };

  // ─── Close guard ───────────────────────────────────────────────────────────

  const handleClose = () => {
    if (step > 0 && !result) {
      if (!confirm("Annuler l'import ?")) return;
    }
    onClose();
  };

  if (!isOpen) return null;

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      {/* Modal */}
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <h2 className="text-base font-semibold text-gray-900">Import patients</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <Stepper current={step} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {step === 0 && (
            <StepUpload
              file={file}
              detected={detected}
              onFile={handleFile}
              onDrop={onDrop}
              fileRef={fileRef}
              onNext={goMapping}
            />
          )}
          {step === 1 && (
            <StepMapping
              mapping={mapping}
              setMapping={setMapping}
              onBack={() => setStep(0)}
              onNext={goPreview}
            />
          )}
          {step === 2 && (
            <StepPreview
              previews={previews}
              onBack={() => setStep(1)}
              onNext={goImport}
            />
          )}
          {step === 3 && (
            <StepProgress
              importing={importing}
              progress={progress}
              result={result}
              onDone={() => {
                if (result) onSuccess(result);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ÉTAPE 1 — UPLOAD
// ═══════════════════════════════════════════════════════════════════════════════

function StepUpload({
  file,
  detected,
  onFile,
  onDrop,
  fileRef,
  onNext,
}: {
  file: File | null;
  detected: boolean;
  onFile: (f: File) => void;
  onDrop: (e: React.DragEvent) => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Importez vos patients</h3>
        <p className="text-xs text-gray-500 mt-0.5">Formats acceptés : CSV Doctolib, Excel (.xlsx)</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className="relative border-2 border-dashed rounded-xl cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 py-14"
        style={{
          borderColor: file ? "#22C55E" : PRIMARY,
          background: file ? "#F0FDF4" : LIGHT,
        }}
      >
        {file ? (
          <>
            <FileCheck size={28} className="text-green-500" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{formatSize(file.size)}</p>
            </div>
            {detected && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: "#DCFCE7", color: "#166534" }}
              >
                <Check size={12} /> Format Doctolib detecte
              </span>
            )}
          </>
        ) : (
          <>
            <Upload size={28} style={{ color: PRIMARY }} />
            <div className="text-center">
              <p className="text-sm text-gray-700">Glissez votre export Doctolib ici</p>
              <p className="text-xs mt-1" style={{ color: PRIMARY }}>
                ou parcourir vos fichiers
              </p>
            </div>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </div>

      {/* Button */}
      {file && !detected && (
        <div className="flex justify-end">
          <button
            onClick={onNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: PRIMARY }}
          >
            Detecter le format <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ÉTAPE 2 — MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

function StepMapping({
  mapping,
  setMapping,
  onBack,
  onNext,
}: {
  mapping: MappingField[];
  setMapping: (m: MappingField[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const toggle = (i: number) => {
    const next = [...mapping];
    next[i] = { ...next[i], enabled: !next[i].enabled };
    setMapping(next);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Correspondance des colonnes</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Nous avons detecte votre export Doctolib et pre-rempli le mapping.
        </p>
      </div>

      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
        style={{ background: LIGHT, color: PRIMARY }}
      >
        <Check size={12} /> Format Doctolib reconnu — mapping automatique applique
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden" style={{ borderColor: BORDER }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: BG }}>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 w-10" />
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Colonne CSV</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Champ Nami</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: BORDER + "80" }}>
            {mapping.map((field, i) => (
              <tr
                key={field.csvKey}
                className={`transition-colors ${field.enabled ? "" : "opacity-40"}`}
              >
                <td className="px-4 py-2">
                  <button
                    onClick={() => toggle(i)}
                    className="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                    style={{
                      borderColor: field.enabled ? PRIMARY : "#D1D5DB",
                      background: field.enabled ? PRIMARY : "transparent",
                    }}
                  >
                    {field.enabled && <Check size={10} className="text-white" />}
                  </button>
                </td>
                <td className="px-4 py-2 text-xs font-mono text-gray-600">
                  {field.csvKey}
                </td>
                <td className="px-4 py-2 text-xs text-gray-900 flex items-center gap-1.5">
                  {field.namiLabel}
                  {field.enabled && <Check size={12} className="text-green-500" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nav */}
      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={14} /> Retour
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: PRIMARY }}
        >
          Apercu <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ÉTAPE 3 — PREVIEW
// ═══════════════════════════════════════════════════════════════════════════════

function StepPreview({
  previews,
  onBack,
  onNext,
}: {
  previews: { ready: PreviewRow[]; warned: PreviewRow[] };
  onBack: () => void;
  onNext: () => void;
}) {
  const total = previews.ready.length + previews.warned.length;
  const sample = [...previews.ready.slice(0, 3), ...previews.warned.slice(0, 2)];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Apercu de l'import</h3>
      </div>

      {/* Stats pills */}
      <div className="flex gap-3">
        <Pill icon="clipboard" label={`${total} patients detectes`} />
        <Pill icon="check" label={`${previews.ready.length} prets a importer`} variant="success" />
        {previews.warned.length > 0 && (
          <Pill icon="warning" label={`${previews.warned.length} avec avertissements`} variant="warning" />
        )}
      </div>

      {/* Table preview */}
      <div className="border rounded-lg overflow-hidden" style={{ borderColor: BORDER }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: BG }}>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Nom</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Prenom</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Date naissance</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Email</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: BORDER + "80" }}>
            {sample.map((r, i) => (
              <tr key={i}>
                <td className="px-4 py-2 text-xs text-gray-900">{r.payload.lastName}</td>
                <td className="px-4 py-2 text-xs text-gray-700">{r.payload.firstName}</td>
                <td className="px-4 py-2 text-xs text-gray-500">{r.payload.birthDate || "—"}</td>
                <td className="px-4 py-2 text-xs text-gray-500 truncate max-w-32">{r.payload.email || "—"}</td>
                <td className="px-4 py-2">
                  {r.warnings.length === 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700">
                      <Check size={10} /> Pret
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{ background: "#FEF3C7", color: "#92400E" }}
                      title={r.warnings.join(", ")}
                    >
                      <AlertTriangle size={10} /> {r.warnings[0]}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {total > 5 && (
          <div className="px-4 py-2 text-xs text-gray-400" style={{ background: BG }}>
            … et {total - 5} autres patients
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Les doublons (meme nom + date de naissance) seront automatiquement ignores.
      </p>

      {/* Nav */}
      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={14} /> Retour
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: PRIMARY }}
        >
          Importer {previews.ready.length + previews.warned.length} patients <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function Pill({
  icon,
  label,
  variant = "default",
}: {
  icon: "clipboard" | "check" | "warning";
  label: string;
  variant?: "default" | "success" | "warning";
}) {
  const bg =
    variant === "success" ? "#DCFCE7" : variant === "warning" ? "#FEF3C7" : LIGHT;
  const color =
    variant === "success" ? "#166534" : variant === "warning" ? "#92400E" : "#374151";
  const emoji = icon === "clipboard" ? "\uD83D\uDCCB" : icon === "check" ? "\u2713" : "\u26A0";

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
      style={{ background: bg, color }}
    >
      {emoji} {label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ÉTAPE 4 — PROGRESSION
// ═══════════════════════════════════════════════════════════════════════════════

function StepProgress({
  importing,
  progress,
  result,
  onDone,
}: {
  importing: boolean;
  progress: { done: number; total: number };
  result: ImportResult | null;
  onDone: () => void;
}) {
  const pct = progress.total > 0 ? (progress.done / progress.total) * 100 : 0;

  if (result) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-300"
          style={{ background: "#DCFCE7" }}
        >
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-gray-900">
            {result.success} patient{result.success !== 1 ? "s" : ""} importe{result.success !== 1 ? "s" : ""} avec succes
          </p>
          {result.skipped > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {result.skipped} ligne{result.skipped !== 1 ? "s" : ""} ignoree{result.skipped !== 1 ? "s" : ""} (doublons ou donnees manquantes)
            </p>
          )}
          {result.errors.length > 0 && (
            <p className="text-xs text-orange-600 mt-1">
              {result.errors.length} erreur{result.errors.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button
          onClick={onDone}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors mt-2"
          style={{ background: PRIMARY }}
        >
          Voir mes patients <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-14 space-y-5">
      <Loader2 size={28} className="animate-spin" style={{ color: PRIMARY }} />
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">Import en cours…</p>
        <p className="text-xs text-gray-500 mt-1">
          {progress.done} / {progress.total} patients importes
        </p>
      </div>
      <div className="w-full max-w-xs">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: BG }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ background: PRIMARY, width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
