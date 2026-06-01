"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import {
  apiWithToken,
  type PatientDocument,
  type PatientMessageThread,
} from "@/lib/api";
import { FileText, Loader2 } from "lucide-react";
import { usePatientCareCases } from "@/hooks/usePatientCareCases";
import { usePatientMessageThreads } from "@/hooks/usePatientMessageThreads";
import {
  DocumentsFilters,
  FILTER_LABELS,
  bucketize,
  type FilterKey,
} from "./DocumentsFilters";
import { DocumentsCareCaseSection } from "./_components/DocumentsCareCaseSection";
import {
  DocumentsDmSection,
  type DmGroup,
} from "./_components/DocumentsDmSection";
import { DocumentsOrphanSection } from "./_components/DocumentsOrphanSection";

const C = {
  primary: "#5B4EC4",
  text: "#1A1A2E",
  textSoft: "#6B7280",
  border: "rgba(26,26,46,0.08)",
  card: "#FFFFFF",
  bg: "#FAFAF8",
};

/**
 * Resout la liste des careCaseId rattaches a un document.
 * Backend PR #96 : `careCaseId` (scalar legacy/primary) + `attachedCareCaseIds`
 * (join multi-CareCase). On unionne et on deduplique.
 */
function resolveDocCareCaseIds(doc: PatientDocument): string[] {
  const ids = new Set<string>();
  if (doc.careCaseId) ids.add(doc.careCaseId);
  for (const id of doc.attachedCareCaseIds ?? []) {
    if (id) ids.add(id);
  }
  return Array.from(ids);
}

/**
 * Construit le libelle d'interlocuteur DM en cherchant d'abord parmi les
 * threads DM connus du patient (mes-messages, PR #130). Fallback : nom de
 * l'uploader (qui est l'interlocuteur lorsque le patient est destinataire)
 * ou libelle generique safe.
 */
function findDmOtherName(
  doc: PatientDocument,
  selfPersonId: string | null,
  threads: PatientMessageThread[] | undefined,
): { otherPersonId: string | null; otherName: string } {
  const recipient = doc.directRecipientPersonId ?? null;

  // Cas 1 : le patient est le destinataire — l'interlocuteur est l'uploader
  if (selfPersonId && recipient === selfPersonId) {
    const name =
      `${doc.uploadedBy.firstName ?? ""} ${doc.uploadedBy.lastName ?? ""}`.trim();
    return {
      otherPersonId: null,
      otherName: name.length > 0 ? name : "Soignant",
    };
  }

  // Cas 2 : le patient est l'uploader — l'interlocuteur est `recipient`.
  // On cherche son identite dans les threads DM connus.
  if (recipient && threads && threads.length > 0) {
    for (const t of threads) {
      if (t.threadType !== "DM") continue;
      const match = t.participants.find((p) => p.personId === recipient);
      if (match) {
        const fullName = `${match.firstName} ${match.lastName}`.trim();
        return {
          otherPersonId: recipient,
          otherName: fullName.length > 0 ? fullName : "Soignant",
        };
      }
    }
  }

  return {
    otherPersonId: recipient,
    otherName: "Soignant",
  };
}

export default function DocumentsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const api = apiWithToken(accessToken!);
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [search, setSearch] = useState("");

  const { data: docs = [], isLoading } = useQuery<PatientDocument[]>({
    queryKey: ["patient-documents"],
    queryFn: () => api.patient.documents(),
    enabled: !!accessToken,
    staleTime: 5 * 60_000,
  });

  const careCasesQuery = usePatientCareCases();
  const careCases = useMemo(
    () => careCasesQuery.data ?? [],
    [careCasesQuery.data],
  );
  const careCaseIdSet = useMemo(
    () => new Set(careCases.map((c) => c.id)),
    [careCases],
  );

  const threadsQuery = usePatientMessageThreads();

  // ─── Filtrage : type + recherche texte ──────────────────────────────────
  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return docs.filter((d) => {
      if (filter !== "ALL" && bucketize(d.documentType) !== filter) return false;
      if (q && !d.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [docs, filter, search]);

  // ─── Counts par bucket sur le dataset entier (badges) ───────────────────
  const counts = useMemo(() => {
    const acc: Record<FilterKey, number> = {
      ALL: docs.length,
      BIOLOGICAL_REPORT: 0,
      PRESCRIPTION: 0,
      CONSULTATION_REPORT: 0,
      HOSPITAL_REPORT: 0,
      LETTER: 0,
      IMAGING: 0,
      OTHER: 0,
      IMPEDANCE_REPORT: 0,
      DXA_REPORT: 0,
      ECG_REPORT: 0,
      TRANSCRIPTION: 0,
    };
    for (const d of docs) {
      const bucket = bucketize(d.documentType);
      acc[bucket] = (acc[bucket] ?? 0) + 1;
    }
    return acc;
  }, [docs]);

  // ─── Buckets : CareCase / DM / Orphan ───────────────────────────────────
  // Un meme document peut etre rattache a N CareCases (join PR #96). On le
  // duplique alors visuellement dans chaque section CareCase correspondante
  // (verite metier : il est bien partage avec ces N parcours).
  const { byCareCase, dmGroups, orphans } = useMemo(() => {
    const byCareCase = new Map<string, PatientDocument[]>();
    const dmByOther = new Map<
      string,
      { otherPersonId: string | null; otherName: string; docs: PatientDocument[] }
    >();
    const orphans: PatientDocument[] = [];

    for (const doc of filteredDocs) {
      const ids = resolveDocCareCaseIds(doc).filter((id) =>
        careCaseIdSet.has(id),
      );
      const isDm = !!doc.directRecipientPersonId;

      if (ids.length > 0) {
        for (const id of ids) {
          const list = byCareCase.get(id);
          if (list) list.push(doc);
          else byCareCase.set(id, [doc]);
        }
        continue;
      }

      if (isDm) {
        const { otherPersonId, otherName } = findDmOtherName(
          doc,
          user?.id ?? null,
          threadsQuery.data,
        );
        const key = otherPersonId ?? `dm-fallback-${otherName}`;
        const existing = dmByOther.get(key);
        if (existing) {
          existing.docs.push(doc);
        } else {
          dmByOther.set(key, { otherPersonId, otherName, docs: [doc] });
        }
        continue;
      }

      orphans.push(doc);
    }

    const dmGroups: DmGroup[] = Array.from(dmByOther.values())
      .map((g) => ({
        otherPersonId: g.otherPersonId,
        otherName: g.otherName,
        documents: g.docs,
      }))
      .sort((a, b) => a.otherName.localeCompare(b.otherName, "fr"));

    return { byCareCase, dmGroups, orphans };
  }, [filteredDocs, careCaseIdSet, user?.id, threadsQuery.data]);

  const hasAnyDoc = filteredDocs.length > 0;
  const hasAnyCareCaseSection = careCases.some((c) =>
    (byCareCase.get(c.id) ?? []).length > 0,
  );
  const hasDm = dmGroups.length > 0;
  const hasOrphans = orphans.length > 0;

  return (
    <main
      aria-label="Mes documents"
      style={{
        padding: "28px 24px 80px",
        maxWidth: 720,
        margin: "0 auto",
        background: C.bg,
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: C.text,
          marginBottom: 20,
          letterSpacing: "-0.4px",
        }}
      >
        Mes documents
      </h1>

      <DocumentsFilters
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        counts={counts}
        totalAll={docs.length}
      />

      {/* Compteur resultats accessible aux lecteurs d'ecran */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {filteredDocs.length} document{filteredDocs.length !== 1 ? "s" : ""} affiché
        {filteredDocs.length !== 1 ? "s" : ""}.
      </p>

      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          aria-label="Chargement de vos documents"
          style={{ display: "flex", justifyContent: "center", padding: 40 }}
        >
          <Loader2
            size={22}
            className="animate-spin"
            style={{ color: C.primary }}
            aria-hidden="true"
          />
        </div>
      ) : !hasAnyDoc ? (
        <div
          role="status"
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: C.card,
            borderRadius: 16,
            border: `1px dashed ${C.border}`,
          }}
        >
          <FileText
            size={32}
            aria-hidden="true"
            style={{ margin: "0 auto 12px", opacity: 0.3 }}
          />
          <p style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>
            Aucun document à afficher
          </p>
          <p style={{ fontSize: 13, color: C.textSoft, marginTop: 6 }}>
            {search.trim().length > 0
              ? `Aucun document ne contient « ${search.trim()} ».`
              : filter !== "ALL"
              ? `Aucun document dans la catégorie « ${FILTER_LABELS[filter]} ».`
              : "Vos documents partagés par vos soignants apparaîtront ici."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Sections par CareCase actif (ordre = tri backend startDate desc) */}
          {hasAnyCareCaseSection
            ? careCases.map((careCase) => {
                const documents = byCareCase.get(careCase.id) ?? [];
                if (documents.length === 0) return null;
                return (
                  <DocumentsCareCaseSection
                    key={careCase.id}
                    careCase={careCase}
                    documents={documents}
                  />
                );
              })
            : null}

          {hasDm ? <DocumentsDmSection groups={dmGroups} /> : null}

          {hasOrphans ? (
            <DocumentsOrphanSection documents={orphans} />
          ) : null}
        </div>
      )}
    </main>
  );
}
