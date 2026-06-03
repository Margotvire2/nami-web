"use client";

import { useMemo } from "react";
import { FileText } from "lucide-react";
import type {
  PatientDocument,
  PatientMessageThread,
  PatientCareCaseSummary,
} from "@/lib/api";
import { DocumentsCareCaseSection } from "@/app/(patient)/mes-documents/_components/DocumentsCareCaseSection";
import {
  DocumentsDmSection,
  type DmGroup,
} from "@/app/(patient)/mes-documents/_components/DocumentsDmSection";
import { DocumentsOrphanSection } from "@/app/(patient)/mes-documents/_components/DocumentsOrphanSection";

const C = {
  primary: "#5B4EC4",
  text: "#1A1A2E",
  textSoft: "#6B7280",
  border: "rgba(26,26,46,0.08)",
  card: "#FFFFFF",
};

/**
 * Union/dédup des careCaseId rattachés à un document (PR #96 :
 * `careCaseId` scalar legacy + `attachedCareCaseIds` join multi-CareCase).
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
 * Résout le libellé d'interlocuteur DM (cherche d'abord parmi les threads
 * DM connus du patient, fallback nom uploader).
 */
function findDmOtherName(
  doc: PatientDocument,
  selfPersonId: string | null,
  threads: PatientMessageThread[] | undefined,
): { otherPersonId: string | null; otherName: string } {
  const recipient = doc.directRecipientPersonId ?? null;

  if (selfPersonId && recipient === selfPersonId) {
    const name =
      `${doc.uploadedBy.firstName ?? ""} ${doc.uploadedBy.lastName ?? ""}`.trim();
    return {
      otherPersonId: null,
      otherName: name.length > 0 ? name : "Soignant",
    };
  }

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

  return { otherPersonId: recipient, otherName: "Soignant" };
}

interface DocumentListViewProps {
  documents: PatientDocument[];
  careCases: PatientCareCaseSummary[];
  threads: PatientMessageThread[] | undefined;
  selfPersonId: string | null;
  emptyLabel: string;
}

/**
 * Vue liste empilée (CareCase grouping + DM + Orphans) à utiliser dans
 * les sous-vues ?cat= de /mes-documents. Préserve la PR #139
 * (groupement par parcours) en l'appliquant aux documents déjà filtrés
 * par catégorie grid en amont.
 */
export function DocumentListView({
  documents,
  careCases,
  threads,
  selfPersonId,
  emptyLabel,
}: DocumentListViewProps) {
  const careCaseIdSet = useMemo(
    () => new Set(careCases.map((c) => c.id)),
    [careCases],
  );

  const { byCareCase, dmGroups, orphans } = useMemo(() => {
    const byCareCase = new Map<string, PatientDocument[]>();
    const dmByOther = new Map<
      string,
      { otherPersonId: string | null; otherName: string; docs: PatientDocument[] }
    >();
    const orphans: PatientDocument[] = [];

    for (const doc of documents) {
      const ids = resolveDocCareCaseIds(doc).filter((id) => careCaseIdSet.has(id));
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
        const { otherPersonId, otherName } = findDmOtherName(doc, selfPersonId, threads);
        const key = otherPersonId ?? `dm-fallback-${otherName}`;
        const existing = dmByOther.get(key);
        if (existing) existing.docs.push(doc);
        else dmByOther.set(key, { otherPersonId, otherName, docs: [doc] });
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
  }, [documents, careCaseIdSet, selfPersonId, threads]);

  const hasAnyCareCaseSection = careCases.some(
    (c) => (byCareCase.get(c.id) ?? []).length > 0,
  );
  const hasDm = dmGroups.length > 0;
  const hasOrphans = orphans.length > 0;
  const hasAny = hasAnyCareCaseSection || hasDm || hasOrphans;

  if (!hasAny) {
    return (
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
          {emptyLabel}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {hasAnyCareCaseSection
        ? careCases.map((careCase) => {
            const docs = byCareCase.get(careCase.id) ?? [];
            if (docs.length === 0) return null;
            return (
              <DocumentsCareCaseSection
                key={careCase.id}
                careCase={careCase}
                documents={docs}
              />
            );
          })
        : null}

      {hasDm ? <DocumentsDmSection groups={dmGroups} /> : null}
      {hasOrphans ? <DocumentsOrphanSection documents={orphans} /> : null}
    </div>
  );
}
