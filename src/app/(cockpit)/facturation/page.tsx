"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken } from "@/lib/api";
import type { Invoice, BillingTariff, CreateInvoiceInput, InvoiceLineInput } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Receipt, Plus, Loader2, CheckCircle2,
  Clock, X, Search, FileText, User, BarChart2, FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PatientSelect } from "@/components/PatientSelect";
import { BillingDashboard } from "@/components/billing/BillingDashboard";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "https://nami-production-f268.up.railway.app";

type Api = ReturnType<typeof apiWithToken>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_META: Record<Invoice["status"], { label: string; color: string }> = {
  DRAFT:        { label: "Brouillon",  color: "bg-slate-100 text-slate-600" },
  READY:        { label: "Prête",      color: "bg-amber-50 text-amber-700" },
  SIGNED:       { label: "Signée",     color: "bg-blue-50 text-blue-700" },
  TRANSMITTED:  { label: "Transmise",  color: "bg-violet-50 text-violet-700" },
  ACKNOWLEDGED: { label: "Accusée",    color: "bg-indigo-50 text-indigo-700" },
  PAID:         { label: "Payée",      color: "bg-emerald-50 text-emerald-700" },
  REJECTED:     { label: "Rejetée",    color: "bg-red-50 text-red-700" },
  CANCELLED:    { label: "Annulée",    color: "bg-slate-100 text-slate-400" },
};

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " €";
}

function fmtDate(iso: string) {
  return format(new Date(iso), "d MMM yyyy", { locale: fr });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FacturationPage() {
  const accessToken = useAuthStore((s) => s.accessToken)!;
  const api = apiWithToken(accessToken);
  const qc = useQueryClient();

  const [tab, setTab] = useState<"fse" | "dashboard">("fse");
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<Invoice | null>(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["billing-invoices"],
    queryFn: () => api.billing.invoices(),
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Barre d'onglets ── */}
      <div className="shrink-0 flex items-center justify-between px-4 h-[56px] border-b border-[#E8ECF4] bg-white">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTab("fse")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors",
              tab === "fse"
                ? "bg-[#EEF2FF] text-[#4F46E5]"
                : "text-muted-foreground hover:text-[#0F172A] hover:bg-[#F8FAFF]"
            )}
          >
            <Receipt size={13} /> Feuilles de soins
          </button>
          <button
            onClick={() => setTab("dashboard")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors",
              tab === "dashboard"
                ? "bg-[#EEF2FF] text-[#4F46E5]"
                : "text-muted-foreground hover:text-[#0F172A] hover:bg-[#F8FAFF]"
            )}
          >
            <BarChart2 size={13} /> Dashboard
          </button>
        </div>
        {tab === "fse" && (
          <Button size="sm" className="h-7 text-xs gap-1 px-2.5" onClick={() => { setShowNew(true); setSelected(null); }}>
            <Plus size={13} /> Nouvelle FSE
          </Button>
        )}
      </div>

      {/* ── Dashboard ── */}
      {tab === "dashboard" && (
        <div className="flex-1 overflow-y-auto bg-[#F8FAFF] p-6">
          <BillingDashboard />
        </div>
      )}

      {/* ── FSE : liste + détail ── */}
      {tab === "fse" && (
      <div className="flex flex-1 overflow-hidden">
      {/* ── Liste ── */}
      <div className="w-[340px] shrink-0 border-r border-[#E8ECF4] flex flex-col bg-white">

        <div className="flex-1 overflow-y-auto divide-y divide-[#F1F5F9]">
          {isLoading && (
            <div className="flex items-center justify-center h-20">
              <Loader2 size={18} className="animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && invoices.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center px-6 gap-2">
              <FileText size={28} className="text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">Aucune FSE. Créez votre première feuille de soins.</p>
            </div>
          )}
          {invoices.map((inv) => (
            <button
              key={inv.id}
              onClick={() => { setSelected(inv); setShowNew(false); }}
              className={cn(
                "w-full text-left px-4 py-3 hover:bg-[#F8FAFF] transition-colors",
                selected?.id === inv.id && "bg-[#EEF2FF]"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-[#0F172A] truncate">
                    {inv.patient.firstName} {inv.patient.lastName}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{fmtDate(inv.careDate)}</p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", STATUS_META[inv.status].color)}>
                    {STATUS_META[inv.status].label}
                  </span>
                  {inv.status !== "DRAFT" && (
                    <span className="text-[11px] font-semibold text-[#0F172A]">{fmt(inv.totalHonoraires)}</span>
                  )}
                </div>
              </div>
              {inv.lines.length > 0 && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {inv.lines.map((l) => l.actCode).join(" + ")}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Détail / Nouvelle FSE ── */}
      <div className="flex-1 overflow-y-auto bg-[#F8FAFF] p-6">
        {showNew && (
          <NewInvoiceForm
            api={api}
            onCreated={(inv) => {
              qc.invalidateQueries({ queryKey: ["billing-invoices"] });
              setSelected(inv);
              setShowNew(false);
            }}
            onCancel={() => setShowNew(false)}
          />
        )}
        {selected && !showNew && (
          <InvoiceDetail
            invoice={selected}
            api={api}
            onUpdated={(inv) => {
              setSelected(inv);
              qc.invalidateQueries({ queryKey: ["billing-invoices"] });
            }}
            onCancelled={() => {
              setSelected(null);
              qc.invalidateQueries({ queryKey: ["billing-invoices"] });
            }}
          />
        )}
        {!selected && !showNew && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-muted-foreground">
            <Receipt size={40} className="opacity-20" />
            <p className="text-sm">Sélectionnez une FSE ou créez-en une nouvelle</p>
          </div>
        )}
      </div>
      </div>
      )}
    </div>
  );
}

// ─── Nouvelle FSE ─────────────────────────────────────────────────────────────

function NewInvoiceForm({
  api,
  onCreated,
  onCancel,
}: {
  api: Api;
  onCreated: (inv: Invoice) => void;
  onCancel: () => void;
}) {
  const [patient, setPatient] = useState<{ id: string; firstName: string; lastName: string; birthDate?: string | null; sex?: string | null } | null>(null);
  const [careDate, setCareDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMode, setPaymentMode] = useState<CreateInvoiceInput["paymentMode"]>("PAIEMENT_DIRECT");
  const [isALD, setIsALD] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      api.billing.create({
        patientId: patient!.id,
        careDate: new Date(careDate).toISOString(),
        paymentMode,
        isALD,
      }),
    onSuccess: (inv) => {
      toast.success("FSE créée");
      onCreated(inv as Invoice);
    },
    onError: () => toast.error("Erreur lors de la création"),
  });

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl border border-[#E8ECF4] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[#0F172A]" style={{ fontFamily: "var(--font-jakarta)" }}>
          Nouvelle feuille de soins
        </h2>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-medium text-muted-foreground">Patient</label>
          <div className="mt-1">
            <PatientSelect value={patient} onChange={setPatient} />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium text-muted-foreground">Date des soins</label>
          <Input
            type="date"
            value={careDate}
            onChange={(e) => setCareDate(e.target.value)}
            className="h-9 text-xs mt-1"
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-muted-foreground">Mode de paiement</label>
          <div className="flex gap-2 mt-1">
            {(["PAIEMENT_DIRECT", "TIERS_PAYANT_PARTIEL", "TIERS_PAYANT_TOTAL"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMode(m)}
                className={cn(
                  "flex-1 text-[10px] py-1.5 rounded-lg border transition-colors",
                  paymentMode === m
                    ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5] font-medium"
                    : "border-[#E8ECF4] text-muted-foreground hover:border-[#4F46E5]"
                )}
              >
                {m === "PAIEMENT_DIRECT" ? "Direct" : m === "TIERS_PAYANT_PARTIEL" ? "TP partiel" : "TP total"}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isALD} onChange={(e) => setIsALD(e.target.checked)} className="rounded" />
          <span className="text-[12px] text-[#0F172A]">Affection Longue Durée (ALD) — exonération ticket modérateur</span>
        </label>
      </div>

      <Button
        className="w-full h-9 text-sm gap-2"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !patient}
      >
        {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
        Créer la FSE
      </Button>
    </div>
  );
}

// ─── Détail FSE ───────────────────────────────────────────────────────────────

function InvoiceDetail({
  invoice,
  api,
  onUpdated,
  onCancelled,
}: {
  invoice: Invoice;
  api: Api;
  onUpdated: (inv: Invoice) => void;
  onCancelled: () => void;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [actSearch, setActSearch] = useState("");
  const [selectedLines, setSelectedLines] = useState<InvoiceLineInput[]>(
    invoice.lines.map((l) => ({ actCode: l.actCode, unitPrice: l.unitPrice, quantity: l.quantity }))
  );

  async function downloadPDF() {
    setPdfLoading(true);
    try {
      const res = await fetch(`${API}/billing/invoices/${invoice.id}/pdf`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) { toast.error("Erreur génération PDF"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FSE-${invoice.invoiceNumber ?? invoice.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erreur téléchargement PDF");
    } finally {
      setPdfLoading(false);
    }
  }

  const { data: tariffs = [] } = useQuery({
    queryKey: ["billing-tariffs", actSearch],
    queryFn: () => api.billing.tariffs({ q: actSearch }),
    enabled: actSearch.length >= 1,
  });

  const updateLines = useMutation({
    mutationFn: () => api.billing.updateLines(invoice.id, selectedLines),
    onSuccess: (inv) => { toast.success("Actes mis à jour"); onUpdated(inv as Invoice); },
    onError: () => toast.error("Erreur"),
  });

  const finalize = useMutation({
    mutationFn: () => api.billing.finalize(invoice.id),
    onSuccess: (inv) => { toast.success("FSE prête à signer"); onUpdated(inv as Invoice); },
    onError: () => toast.error("Erreur lors de la finalisation"),
  });

  const cancel = useMutation({
    mutationFn: () => api.billing.cancel(invoice.id),
    onSuccess: () => { toast.success("FSE annulée"); onCancelled(); },
    onError: () => toast.error("Impossible d'annuler"),
  });

  function addTariff(t: BillingTariff) {
    if (selectedLines.find((l) => l.actCode === t.code)) return;
    setSelectedLines((prev) => [...prev, { actCode: t.code, tariffId: t.id, unitPrice: t.priceMetropole, quantity: 1 }]);
    setActSearch("");
  }

  function removeLine(code: string) {
    setSelectedLines((prev) => prev.filter((l) => l.actCode !== code));
  }

  const isDraft = invoice.status === "DRAFT";

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* En-tête */}
      <div className="bg-white rounded-xl border border-[#E8ECF4] p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", STATUS_META[invoice.status].color)}>
                {STATUS_META[invoice.status].label}
              </span>
              {invoice.invoiceNumber && (
                <span className="text-[11px] text-muted-foreground">#{invoice.invoiceNumber}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <User size={13} className="text-muted-foreground" />
              <span className="text-[13px] font-semibold text-[#0F172A]">
                {invoice.patient.firstName} {invoice.patient.lastName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock size={12} className="text-muted-foreground" />
              <span className="text-[12px] text-muted-foreground">{fmtDate(invoice.careDate)}</span>
              {invoice.isALD && (
                <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full font-medium ml-1">ALD</span>
              )}
            </div>
          </div>

          {invoice.status !== "DRAFT" && (
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground">Total honoraires</p>
              <p className="text-[20px] font-bold text-[#0F172A]">{fmt(invoice.totalHonoraires)}</p>
              <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                <p>AMO : <span className="font-medium text-emerald-700">{fmt(invoice.totalAMO)}</span></p>
                <p>Patient : <span className="font-medium">{fmt(invoice.totalPatient)}</span></p>
                {invoice.totalDepassement > 0 && (
                  <p>Dépassement : <span className="font-medium text-amber-700">{fmt(invoice.totalDepassement)}</span></p>
                )}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={downloadPDF}
          disabled={pdfLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8ECF4] text-[11px] text-muted-foreground hover:bg-[#F8FAFF] hover:text-[#0F172A] transition-colors disabled:opacity-50 mt-3"
        >
          {pdfLoading ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
          Télécharger PDF
        </button>
      </div>

      {/* Actes */}
      <div className="bg-white rounded-xl border border-[#E8ECF4] p-5 space-y-4">
        <h3 className="text-[13px] font-semibold text-[#0F172A]">Actes</h3>

        {selectedLines.length > 0 && (
          <div className="space-y-2">
            {selectedLines.map((l) => {
              const existing = invoice.lines.find((il) => il.actCode === l.actCode);
              return (
                <div key={l.actCode} className="flex items-center justify-between bg-[#F8FAFF] rounded-lg px-3 py-2">
                  <div>
                    <span className="text-[12px] font-semibold text-[#4F46E5]">{l.actCode}</span>
                    {existing && (
                      <span className="text-[11px] text-muted-foreground ml-2">{existing.actLabel}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium">{fmt(l.unitPrice)}</span>
                    {isDraft && (
                      <button onClick={() => removeLine(l.actCode)} className="text-muted-foreground hover:text-destructive">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isDraft && (
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={actSearch}
              onChange={(e) => setActSearch(e.target.value)}
              placeholder="Rechercher un acte NGAP/CCAM… (ex: G, CS, DEQP003)"
              className="h-8 text-xs pl-7"
            />
            {tariffs.length > 0 && actSearch && (
              <div className="absolute z-10 top-full mt-1 w-full bg-white border border-[#E8ECF4] rounded-lg shadow-lg overflow-hidden">
                {(tariffs as BillingTariff[]).slice(0, 8).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => addTariff(t)}
                    className="w-full text-left px-3 py-2 hover:bg-[#EEF2FF] transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[12px] font-semibold text-[#4F46E5]">{t.code}</span>
                      <span className="text-[11px] text-muted-foreground ml-2 truncate">{t.label}</span>
                    </div>
                    <span className="text-[12px] font-medium shrink-0 ml-2">{fmt(t.priceMetropole)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {isDraft && (
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => updateLines.mutate()}
              disabled={updateLines.isPending || selectedLines.length === 0}
            >
              {updateLines.isPending && <Loader2 size={12} className="animate-spin mr-1" />}
              Enregistrer les actes
            </Button>
            <Button
              size="sm"
              className="text-xs h-8 gap-1"
              onClick={() => finalize.mutate()}
              disabled={finalize.isPending || selectedLines.length === 0}
            >
              {finalize.isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
              Finaliser la FSE
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8 text-destructive hover:text-destructive ml-auto"
              onClick={() => cancel.mutate()}
              disabled={cancel.isPending}
            >
              Annuler
            </Button>
          </div>
        )}
      </div>

      {/* Récapitulatif AMO */}
      {invoice.status !== "DRAFT" && (
        <div className="bg-white rounded-xl border border-[#E8ECF4] p-5">
          <h3 className="text-[13px] font-semibold text-[#0F172A] mb-3">Récapitulatif</h3>
          <div className="space-y-1.5 text-[12px]">
            <Row label="Base de remboursement" value={fmt(invoice.totalBase)} />
            <Row label="Part AMO (Assurance Maladie)" value={fmt(invoice.totalAMO)} valueClass="text-emerald-700 font-semibold" />
            <Row label="Participation forfaitaire" value={`− ${fmt(invoice.participationForfaitaire)}`} />
            {invoice.totalDepassement > 0 && (
              <Row label="Dépassement d'honoraires" value={fmt(invoice.totalDepassement)} valueClass="text-amber-700" />
            )}
            <div className="border-t border-[#F1F5F9] pt-1.5 mt-1.5">
              <Row label="Reste à charge patient" value={fmt(invoice.totalPatient)} valueClass="font-bold text-[#0F172A]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
