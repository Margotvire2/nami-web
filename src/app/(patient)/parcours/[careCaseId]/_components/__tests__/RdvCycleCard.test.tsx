import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { RdvCycleCard } from "../RdvCycleCard";
import type {
  PatientCareCaseHubAppointment,
  PatientCareCaseHubAppointmentToBook,
  ProviderAttribution,
} from "@/lib/api";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/store", () => ({
  useAuthStore: () => "test-token",
}));

// SlotPicker fetches availabilities — neutralise pour ces tests unitaires
// (couverts par leur propre suite).
vi.mock("../SlotPicker", () => ({
  SlotPicker: () => <div data-testid="slot-picker-mock" />,
}));

const PROVIDER_ATTRIBUTION: ProviderAttribution = {
  personId: "prov-1",
  firstName: "Claire",
  lastName: "Dupont",
  specialty: "Diététicienne",
};

function makeToBook(
  attribution: ProviderAttribution | null,
): PatientCareCaseHubAppointmentToBook {
  return {
    pathwayStepId: "step-1",
    label: "Premier rendez-vous diététique",
    expectedDayOffset: 14,
    expectedDate: "2026-06-20T09:00:00.000Z",
    isRequired: true,
    providerAttribution: attribution,
  };
}

function makeAppointment(
  overrides?: Partial<PatientCareCaseHubAppointment>,
): PatientCareCaseHubAppointment {
  return {
    id: "appt-1",
    startAt: "2026-06-15T10:00:00.000Z",
    endAt: "2026-06-15T10:30:00.000Z",
    status: "CONFIRMED",
    locationType: "IN_PERSON",
    consultationTypeName: "Consultation de suivi",
    provider: {
      id: "prov-1",
      firstName: "Claire",
      lastName: "Dupont",
      specialties: ["Diététicienne"],
    },
    ...overrides,
  };
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryWrapper";
  return Wrapper;
}

describe("RdvCycleCard (V1-HUB-CYCLE-CONSULTATION-FRONTEND)", () => {
  it("TO_BOOK + providerAttribution → CTA Réserver + nom soignant", () => {
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <RdvCycleCard
          data={{ mode: "TO_BOOK", toBook: makeToBook(PROVIDER_ATTRIBUTION) }}
          careCaseId="cc-1"
          patientId="patient-1"
        />
      </Wrapper>,
    );

    expect(screen.getByText("Premier rendez-vous diététique")).toBeInTheDocument();
    expect(screen.getByText(/Claire Dupont/)).toBeInTheDocument();
    expect(screen.getByText(/Diététicienne/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Réserver un créneau/i }),
    ).toBeInTheDocument();
  });

  it("TO_BOOK + providerAttribution null → fallback 'Soignant à confirmer' + pas de CTA Réserver", () => {
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <RdvCycleCard
          data={{ mode: "TO_BOOK", toBook: makeToBook(null) }}
          careCaseId="cc-1"
          patientId="patient-1"
        />
      </Wrapper>,
    );

    expect(screen.getByText(/Soignant à confirmer/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Réserver un créneau/i }),
    ).toBeNull();
  });

  it("UPCOMING → date + lieu + CTA Voir détails", () => {
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <RdvCycleCard
          data={{ mode: "UPCOMING", appointment: makeAppointment() }}
          careCaseId="cc-1"
          patientId="patient-1"
        />
      </Wrapper>,
    );

    expect(screen.getByText("Consultation de suivi")).toBeInTheDocument();
    expect(screen.getByText("En cabinet")).toBeInTheDocument();
    expect(screen.getByText(/Voir détails/)).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/rendez-vous/appt-1");
  });

  it("PAST avec hasClinicalNote → badge Compte-rendu disponible", () => {
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <RdvCycleCard
          data={{
            mode: "PAST",
            appointment: makeAppointment({ id: "appt-past" }),
            hasClinicalNote: true,
          }}
          careCaseId="cc-1"
          patientId="patient-1"
        />
      </Wrapper>,
    );

    expect(screen.getByText("Compte-rendu disponible")).toBeInTheDocument();
    expect(screen.queryByText("Ordonnance")).toBeNull();
  });

  it("PAST avec hasPrescription → badge Ordonnance", () => {
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <RdvCycleCard
          data={{
            mode: "PAST",
            appointment: makeAppointment({ id: "appt-past" }),
            hasPrescription: true,
          }}
          careCaseId="cc-1"
          patientId="patient-1"
        />
      </Wrapper>,
    );

    expect(screen.getByText("Ordonnance")).toBeInTheDocument();
    expect(screen.queryByText("Compte-rendu disponible")).toBeNull();
  });

  it("Wording MDR-safe : aucun mot interdit (suspicion / diagnostic / pathologie / anorexie / TCA)", () => {
    const Wrapper = makeWrapper();
    const { container, rerender } = render(
      <Wrapper>
        <RdvCycleCard
          data={{ mode: "TO_BOOK", toBook: makeToBook(PROVIDER_ATTRIBUTION) }}
          careCaseId="cc-1"
          patientId="patient-1"
        />
      </Wrapper>,
    );

    const forbidden = [
      "suspicion",
      "diagnostic",
      "pathologie",
      "anorexie",
      "boulimie",
      "TCA",
      "alerte",
      "surveillance",
    ];

    function assertNoForbidden(text: string) {
      const lower = text.toLowerCase();
      for (const word of forbidden) {
        expect(lower).not.toContain(word.toLowerCase());
      }
    }

    assertNoForbidden(container.textContent ?? "");

    rerender(
      <Wrapper>
        <RdvCycleCard
          data={{ mode: "UPCOMING", appointment: makeAppointment() }}
          careCaseId="cc-1"
          patientId="patient-1"
        />
      </Wrapper>,
    );
    assertNoForbidden(container.textContent ?? "");

    rerender(
      <Wrapper>
        <RdvCycleCard
          data={{
            mode: "PAST",
            appointment: makeAppointment({ id: "appt-past" }),
            hasClinicalNote: true,
            hasPrescription: true,
          }}
          careCaseId="cc-1"
          patientId="patient-1"
        />
      </Wrapper>,
    );
    assertNoForbidden(container.textContent ?? "");
  });
});
