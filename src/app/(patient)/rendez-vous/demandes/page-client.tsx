"use client";

import { useMemo, useState } from "react";
import {
  MOCK_APPOINTMENT_REQUESTS,
  type AppointmentRequestStatus,
} from "./mock-data";
import { DemandesHero } from "./DemandesHero";
import { DemandesList } from "./DemandesList";
import { DemandesEmptyState } from "./DemandesEmptyState";

type FilterKey = "ALL" | AppointmentRequestStatus;

export function DemandesPageClient() {
  const [filter, setFilter] = useState<FilterKey>("ALL");

  const requests = useMemo(
    () =>
      MOCK_APPOINTMENT_REQUESTS.filter((r) =>
        filter === "ALL" ? true : r.status === filter,
      ),
    [filter],
  );

  const counts = useMemo<Record<FilterKey, number>>(
    () => ({
      ALL: MOCK_APPOINTMENT_REQUESTS.length,
      PENDING: MOCK_APPOINTMENT_REQUESTS.filter((r) => r.status === "PENDING").length,
      ACCEPTED: MOCK_APPOINTMENT_REQUESTS.filter((r) => r.status === "ACCEPTED").length,
      DECLINED: MOCK_APPOINTMENT_REQUESTS.filter((r) => r.status === "DECLINED").length,
    }),
    [],
  );

  return (
    <main
      aria-label="Mes demandes de rendez-vous"
      style={{ maxWidth: 720, margin: "0 auto", padding: "32px 0 96px" }}
    >
      <DemandesHero filter={filter} onFilterChange={setFilter} counts={counts} />
      {requests.length === 0 ? (
        <DemandesEmptyState filter={filter} />
      ) : (
        <DemandesList requests={requests} />
      )}
    </main>
  );
}
