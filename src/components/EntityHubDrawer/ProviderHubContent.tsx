"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import type { EntityHubProvider } from "@/lib/api";
import { useEntityHubControls } from "@/contexts/EntityHubContext";
import {
  EmptyLine,
  HubCard,
  SectionLabel,
  documentTypeLabel,
  formatDate,
  formatDateTime,
  locationLabel,
} from "./_shared";

interface Props {
  data: EntityHubProvider;
  careCaseId: string;
}

export function ProviderHubContent({ data, careCaseId }: Props) {
  const router = useRouter();
  const { openEntityHub, closeEntityHub } = useEntityHubControls();
  const { provider, appointments, documents, messages, actions } = data;

  return (
    <div className="space-y-5">
      <section>
        <SectionLabel>Identité</SectionLabel>
        <HubCard>
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="size-11 rounded-full bg-[#5B4EC4]/12 text-[#5B4EC4] flex items-center justify-center text-sm font-bold overflow-hidden shrink-0"
            >
              {provider.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={provider.photoUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                `${provider.firstName[0] ?? ""}${provider.lastName[0] ?? ""}`
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[#1A1A2E] truncate">
                {provider.firstName} {provider.lastName}
              </div>
              {provider.specialty && (
                <div className="text-xs text-[#6B7280] mt-0.5">
                  {provider.specialty}
                </div>
              )}
            </div>
          </div>
          {provider.locations.length > 0 && (
            <ul className="mt-3 pt-3 border-t border-[#1A1A2E]/06 space-y-1.5">
              {provider.locations.map((l) => (
                <li key={l.id} className="text-xs text-[#374151]">
                  <span className="font-medium text-[#1A1A2E]">{l.name}</span>
                  {l.city && (
                    <span className="text-[#6B7280]">
                      {" · "}
                      {l.postalCode ? `${l.postalCode} ` : ""}
                      {l.city}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </HubCard>
      </section>

      <section>
        <SectionLabel>Rendez-vous à venir</SectionLabel>
        {appointments.upcoming.length === 0 ? (
          <EmptyLine>Aucun rendez-vous prévu.</EmptyLine>
        ) : (
          <div className="space-y-2">
            {appointments.upcoming.map((a) => (
              <HubCard key={a.id}>
                <div className="text-sm font-medium text-[#1A1A2E]">
                  {formatDateTime(a.startAt)}
                </div>
                <div className="text-xs text-[#6B7280] mt-1">
                  {a.consultationTypeName
                    ? `${a.consultationTypeName} · `
                    : ""}
                  {locationLabel(a.locationType)}
                </div>
              </HubCard>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionLabel>Dernières consultations</SectionLabel>
        {appointments.past.length === 0 ? (
          <EmptyLine>Pas encore de consultations passées.</EmptyLine>
        ) : (
          <div className="space-y-2">
            {appointments.past.map((a) => (
              <HubCard key={a.id}>
                <div className="text-sm font-medium text-[#1A1A2E]">
                  {formatDate(a.startAt)}
                </div>
                <div className="text-xs text-[#6B7280] mt-1">
                  {a.consultationTypeName
                    ? `${a.consultationTypeName} · `
                    : ""}
                  {locationLabel(a.locationType)}
                </div>
              </HubCard>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionLabel>Documents partagés</SectionLabel>
        {documents.sentByMe.length === 0 &&
        documents.sharedByThem.length === 0 ? (
          <EmptyLine>Aucun document échangé pour ce parcours.</EmptyLine>
        ) : (
          <div className="space-y-2">
            {documents.sharedByThem.map((d) => (
              <HubCard
                key={`r-${d.id}`}
                onClick={() =>
                  openEntityHub({
                    type: "document",
                    careCaseId,
                    entityId: d.id,
                  })
                }
                ariaLabel={`Voir la fiche du document ${d.title}`}
              >
                <DocumentRow
                  title={d.title}
                  documentType={d.documentType}
                  createdAt={d.createdAt}
                  origin="Partagé par le soignant"
                />
              </HubCard>
            ))}
            {documents.sentByMe.map((d) => (
              <HubCard
                key={`s-${d.id}`}
                onClick={() =>
                  openEntityHub({
                    type: "document",
                    careCaseId,
                    entityId: d.id,
                  })
                }
                ariaLabel={`Voir la fiche du document ${d.title}`}
              >
                <DocumentRow
                  title={d.title}
                  documentType={d.documentType}
                  createdAt={d.createdAt}
                  origin="Envoyé par vous"
                />
              </HubCard>
            ))}
          </div>
        )}
      </section>

      {actions.canDM && (
        <section>
          <button
            type="button"
            onClick={() => {
              router.push(`/mes-messages/${messages.threadId}`);
              closeEntityHub();
            }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#5B4EC4] text-white px-4 py-3 text-sm font-semibold hover:bg-[#4c44b0] transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40"
          >
            <MessageCircle size={16} aria-hidden />
            Envoyer un message
            {messages.unreadCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-white text-[#5B4EC4] text-[11px] font-bold">
                {messages.unreadCount}
              </span>
            )}
          </button>
        </section>
      )}
    </div>
  );
}

function DocumentRow({
  title,
  documentType,
  createdAt,
  origin,
}: {
  title: string;
  documentType: string;
  createdAt: string;
  origin: string;
}) {
  return (
    <>
      <div className="text-sm font-medium text-[#1A1A2E] truncate">{title}</div>
      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F5F3EF] text-[10px] text-[#6B7280] font-medium">
          {documentTypeLabel(documentType)}
        </span>
        <span className="text-[10px] text-[#9CA3AF]">
          {origin} · {formatDate(createdAt)}
        </span>
      </div>
    </>
  );
}
