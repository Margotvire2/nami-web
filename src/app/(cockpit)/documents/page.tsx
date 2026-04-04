"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, Document, CareCase } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { FileText, Upload, Clock, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

// ─── Constantes ──────────────────────────────────────────────────────────────

const DOC_TYPE_LABEL: Record<string, string> = {
  BIOLOGICAL_REPORT: "Bilan biologique",
  PRESCRIPTION: "Ordonnance",
  CONSULTATION_REPORT: "Compte-rendu",
  HOSPITAL_REPORT: "Rapport hospitalier",
  LETTER: "Courrier",
  IMAGING: "Imagerie",
  OTHER: "Autre",
};

const DOC_TYPE_STYLE: Record<string, string> = {
  BIOLOGICAL_REPORT: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PRESCRIPTION: "bg-blue-50 text-blue-700 border-blue-200",
  CONSULTATION_REPORT: "bg-purple-50 text-purple-700 border-purple-200",
  HOSPITAL_REPORT: "bg-orange-50 text-orange-700 border-orange-200",
  LETTER: "bg-slate-50 text-slate-600 border-slate-200",
  IMAGING: "bg-amber-50 text-amber-700 border-amber-200",
  OTHER: "bg-muted text-muted-foreground border-border",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const [search, setSearch] = useState("");

  // Charger tous les care cases puis les documents de chacun
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
    return d.title.toLowerCase().includes(q) || (DOC_TYPE_LABEL[d.documentType] ?? "").toLowerCase().includes(q);
  });

  // Lookup care case par id
  const caseMap = useMemo(() => {
    const m = new Map<string, CareCase>();
    for (const c of cases ?? []) m.set(c.id, c);
    return m;
  }, [cases]);

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
              {isLoading ? "…" : `${filtered.length} document${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs w-56" />
            </div>
            <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8" disabled>
              <Upload size={12} /> Importer
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FileText size={28} className="text-muted-foreground/25 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">Aucun document</p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
              Les documents cliniques apparaîtront ici quand ils seront ajoutés aux dossiers patients.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-4 space-y-2">
            {filtered.map((doc) => {
              const cc = caseMap.get(doc.careCaseId);
              const typeLabel = DOC_TYPE_LABEL[doc.documentType] ?? doc.documentType;
              const typeStyle = DOC_TYPE_STYLE[doc.documentType] ?? DOC_TYPE_STYLE.OTHER;

              return (
                <div key={doc.id} className="rounded-xl border bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${typeStyle}`}>{typeLabel}</span>
                    </div>
                    {cc && (
                      <Link href={`/patients/${cc.id}`} className="text-[11px] text-primary hover:underline">
                        {cc.patient.firstName} {cc.patient.lastName} — {cc.caseTitle}
                      </Link>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><User size={9} /> {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}</span>
                      <span className="flex items-center gap-1"><Clock size={9} /> {new Date(doc.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
                      {doc.sizeBytes > 0 && <span>{formatSize(doc.sizeBytes)}</span>}
                    </div>
                    {doc.summaryAi && (
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1 italic">{doc.summaryAi}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / 1048576).toFixed(1)} Mo`;
}
