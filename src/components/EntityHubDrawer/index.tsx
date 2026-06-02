"use client";

import { ArrowLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEntityHubControls } from "@/contexts/EntityHubContext";
import { useEntityHub } from "@/hooks/useEntityHub";
import type {
  EntityHubConsultation,
  EntityHubDocument,
  EntityHubProvider as EntityHubProviderPayload,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { ProviderHubContent } from "./ProviderHubContent";
import { ConsultationHubContent } from "./ConsultationHubContent";
import { DocumentHubContent } from "./DocumentHubContent";

const ENTITY_TITLE: Record<string, string> = {
  provider: "Fiche soignant",
  consultation: "Fiche consultation",
  document: "Fiche document",
};

/**
 * Drawer générique navigable Provider / Consultation / Document.
 * Réutilise src/components/ui/sheet.tsx (Base UI Dialog, pattern TaskDetailSheet /
 * AdressageDetailSheet). Stack-safe : la flèche back dépile vers l'entité
 * précédente quand on a navigué d'un hub à l'autre.
 *
 * Monté une seule fois par <EntityHubProvider> ; affiché conditionnellement
 * selon `current` (top de la pile).
 */
export function EntityHubDrawer() {
  const { current, canGoBack, backEntityHub, closeEntityHub } =
    useEntityHubControls();
  const query = useEntityHub(current);

  const open = current !== null;
  const title = current ? ENTITY_TITLE[current.type] : "";

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) closeEntityHub();
      }}
    >
      <SheetContent
        side="right"
        className={cn(
          "!w-[480px] !max-w-[100vw] !p-0",
          "!border-l-[0.5px] !border-l-[#1A1A2E]/10",
          "flex flex-col h-full bg-[#FAFAF8]",
        )}
      >
        <div className="px-6 py-4 flex items-center gap-3 border-b border-[#1A1A2E]/06 shrink-0 bg-white">
          {canGoBack && (
            <button
              type="button"
              onClick={backEntityHub}
              aria-label="Revenir à la fiche précédente"
              className="rounded-lg p-1.5 hover:bg-[#5B4EC4]/8 transition text-[#5B4EC4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40"
            >
              <ArrowLeft size={18} aria-hidden />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-base font-bold text-[#1A1A2E] font-[var(--font-jakarta)] truncate">
              {title}
            </SheetTitle>
            <SheetDescription className="text-xs text-[#6B7280] mt-0.5">
              Vue d&apos;ensemble organisationnelle scopée à ce parcours.
            </SheetDescription>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {query.isLoading && <EntityHubSkeleton />}
          {query.isError && <EntityHubError />}
          {query.data && current?.type === "provider" && (
            <ProviderHubContent
              data={query.data as EntityHubProviderPayload}
              careCaseId={current.careCaseId}
            />
          )}
          {query.data && current?.type === "consultation" && (
            <ConsultationHubContent
              data={query.data as EntityHubConsultation}
              careCaseId={current.careCaseId}
            />
          )}
          {query.data && current?.type === "document" && (
            <DocumentHubContent
              data={query.data as EntityHubDocument}
              careCaseId={current.careCaseId}
              onRefetch={() => query.refetch()}
            />
          )}
        </div>

        <div className="px-6 py-2.5 text-center text-[11px] text-[#1A1A2E]/50 border-t border-[#1A1A2E]/06 shrink-0 bg-white">
          Outil de coordination · Non dispositif médical · Conforme RGPD
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EntityHubSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement de la fiche">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl bg-white border border-[#1A1A2E]/06 p-4 animate-pulse"
        >
          <div className="h-3 w-24 bg-[#1A1A2E]/06 rounded mb-3" />
          <div className="h-4 w-3/4 bg-[#1A1A2E]/06 rounded mb-2" />
          <div className="h-3 w-1/2 bg-[#1A1A2E]/06 rounded" />
        </div>
      ))}
    </div>
  );
}

function EntityHubError() {
  return (
    <div
      role="alert"
      className="rounded-xl bg-white border border-[#1A1A2E]/06 p-5 text-sm text-[#374151]"
    >
      <div className="font-semibold text-[#1A1A2E] mb-1">
        Fiche indisponible
      </div>
      <p className="text-[#6B7280]">
        Cette fiche n&apos;est pas accessible pour ce parcours. Si le problème
        persiste, contactez votre équipe.
      </p>
    </div>
  );
}
