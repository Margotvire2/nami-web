import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProfileSwitcher } from "../ProfileSwitcher";
import { CancelAppointmentModal } from "../CancelAppointmentModal";
import { AppointmentCard } from "../AppointmentCard";

// Mock complet du client API + auth store (Vitest, pas de DB prod)
const mockCancel = vi.fn();

vi.mock("@/lib/api", () => ({
  apiWithToken: () => ({
    patient: {
      switchableProfiles: vi.fn(),
      appointments: {
        list: vi.fn(),
        cancel: mockCancel,
      },
    },
  }),
}));

vi.mock("@/lib/store", () => ({
  useAuthStore: (selector: (s: { accessToken: string }) => unknown) =>
    selector({ accessToken: "test-token" }),
}));

beforeEach(() => {
  mockCancel.mockReset();
});

// ═══════════════════════════════════════════════════════════════════════════
// ProfileSwitcher
// ═══════════════════════════════════════════════════════════════════════════

describe("ProfileSwitcher", () => {
  it("1. n'affiche rien si 1 seul profil (pas de délégation)", () => {
    const { container } = render(
      <ProfileSwitcher
        profiles={[
          {
            personId: "1",
            firstName: "Alice",
            lastName: "Martin",
            birthDate: null,
            isSelf: true,
            delegationScopes: null,
            delegationId: null,
          },
        ]}
        currentPersonId="1"
        onSwitch={() => {}}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("2. affiche le switcher avec 2 enfants et permet de basculer vers Léa", () => {
    const onSwitch = vi.fn();
    render(
      <ProfileSwitcher
        profiles={[
          {
            personId: "parent",
            firstName: "Marie",
            lastName: "Dubois",
            birthDate: null,
            isSelf: true,
            delegationScopes: null,
            delegationId: null,
          },
          {
            personId: "lea",
            firstName: "Léa",
            lastName: "Dubois",
            birthDate: "2016-03-15",
            isSelf: false,
            delegationScopes: ["VIEW_APPOINTMENTS", "CANCEL_APPOINTMENTS"],
            delegationId: "del-lea",
          },
          {
            personId: "ines",
            firstName: "Inès",
            lastName: "Dubois",
            birthDate: "2010-09-22",
            isSelf: false,
            delegationScopes: ["VIEW_APPOINTMENTS", "CANCEL_APPOINTMENTS"],
            delegationId: "del-ines",
          },
        ]}
        currentPersonId="parent"
        onSwitch={onSwitch}
      />,
    );

    // Ouvrir le menu (clic sur le trigger affichant le profil actif "Marie Dubois")
    fireEvent.click(screen.getByText(/Marie Dubois/));
    // Cliquer sur Léa dans le menu
    fireEvent.click(screen.getByText(/Léa Dubois/));
    expect(onSwitch).toHaveBeenCalledWith("lea");
  });

  it("3. affiche l'âge calculé pour les enfants quand un enfant est actif", () => {
    render(
      <ProfileSwitcher
        profiles={[
          {
            personId: "parent",
            firstName: "Marie",
            lastName: "Dubois",
            birthDate: null,
            isSelf: true,
            delegationScopes: null,
            delegationId: null,
          },
          {
            personId: "lea",
            firstName: "Léa",
            lastName: "Dubois",
            birthDate: "2016-03-15",
            isSelf: false,
            delegationScopes: ["VIEW_APPOINTMENTS"],
            delegationId: "del-lea",
          },
        ]}
        currentPersonId="lea"
        onSwitch={() => {}}
      />,
    );
    // Léa née 2016-03-15 → entre 9 et 10 ans en 2026
    expect(screen.getByText(/\b(9|10) ans\b/)).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CancelAppointmentModal
// ═══════════════════════════════════════════════════════════════════════════

describe("CancelAppointmentModal", () => {
  it("4. flow 2 étapes : sélection raison puis confirmation", async () => {
    const onSuccess = vi.fn();
    mockCancel.mockResolvedValueOnce({ status: "CANCELLED_BY_PATIENT" });

    render(
      <CancelAppointmentModal
        appointment={
          {
            id: "appt1",
            providerName: "Dr Suela",
            startAt: "2026-05-27T14:00:00Z",
          } as unknown as Parameters<typeof CancelAppointmentModal>[0]["appointment"]
        }
        open={true}
        onOpenChange={() => {}}
        onSuccess={onSuccess}
      />,
    );

    // Étape 1 : 3 reasons affichées
    expect(screen.getByText(/Je ne suis pas disponible/)).toBeInTheDocument();
    expect(screen.getByText(/Ce RDV n'est plus nécessaire/)).toBeInTheDocument();
    expect(screen.getByText(/Raison financière/)).toBeInTheDocument();

    // Sélectionner la 1ère reason
    fireEvent.click(screen.getByText(/Je ne suis pas disponible/));

    // Étape 2 : confirmation visible (titre h2 distinct du bouton)
    expect(screen.getByRole("heading", { name: /Confirmer l'annulation/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Confirmer l'annulation/i }));

    await waitFor(() => {
      expect(mockCancel).toHaveBeenCalledWith("appt1", {
        reason: "PATIENT_UNAVAILABLE",
        cancelNote: undefined,
        onBehalfOf: undefined,
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("5. note optionnelle transmise dans le body API", async () => {
    mockCancel.mockResolvedValueOnce({ status: "CANCELLED_BY_PATIENT" });

    render(
      <CancelAppointmentModal
        appointment={
          {
            id: "appt2",
            providerName: "Dr Suela",
            startAt: "2026-05-27T14:00:00Z",
          } as unknown as Parameters<typeof CancelAppointmentModal>[0]["appointment"]
        }
        open={true}
        onOpenChange={() => {}}
        onSuccess={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText(/Raison financière/));
    fireEvent.change(screen.getByPlaceholderText(/Précision facultative/), {
      target: { value: "Difficultés liées au remboursement" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Confirmer l'annulation/i }));

    await waitFor(() => {
      expect(mockCancel).toHaveBeenCalledWith("appt2", {
        reason: "PATIENT_FINANCIAL",
        cancelNote: "Difficultés liées au remboursement",
        onBehalfOf: undefined,
      });
    });
  });

  it("6. annulation onBehalfOf affiche le nom de l'enfant et passe le param", async () => {
    mockCancel.mockResolvedValueOnce({ status: "CANCELLED_BY_PATIENT" });

    render(
      <CancelAppointmentModal
        appointment={
          {
            id: "appt3",
            providerName: "Dr Pédiatre",
            startAt: "2026-05-27T14:00:00Z",
            onBehalfOfName: "Léa",
            onBehalfOf: "lea-person-id",
          } as unknown as Parameters<typeof CancelAppointmentModal>[0]["appointment"]
        }
        open={true}
        onOpenChange={() => {}}
        onSuccess={vi.fn()}
      />,
    );

    // Le composant doit afficher "Au nom de Léa"
    expect(screen.getByText(/Au nom de/)).toBeInTheDocument();
    expect(screen.getByText(/Léa/)).toBeInTheDocument();

    // Annulation : le body API doit contenir onBehalfOf
    fireEvent.click(screen.getByText(/Je ne suis pas disponible/));
    fireEvent.click(screen.getByRole("button", { name: /Confirmer l'annulation/i }));

    await waitFor(() => {
      expect(mockCancel).toHaveBeenCalledWith("appt3", {
        reason: "PATIENT_UNAVAILABLE",
        cancelNote: undefined,
        onBehalfOf: "lea-person-id",
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// AppointmentCard
// ═══════════════════════════════════════════════════════════════════════════

describe("AppointmentCard", () => {
  it("7. CONFIRMED → badge Confirmé + bouton Annuler cliquable", () => {
    const onCancel = vi.fn();
    render(
      <AppointmentCard
        appointment={
          {
            id: "1",
            status: "CONFIRMED",
            startAt: "2026-05-27T14:00:00Z",
            endAt: "2026-05-27T14:30:00Z",
            locationType: "IN_PERSON",
            notes: null,
            provider: { person: { firstName: "Suela", lastName: "Hima" } },
            consultationType: null,
            location: { name: "Hôpital Américain", address: null, city: null, color: null },
          } as unknown as Parameters<typeof AppointmentCard>[0]["appointment"]
        }
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText(/Confirmé/)).toBeInTheDocument();
    expect(screen.getByText(/Suela Hima/)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Annuler ce RDV/));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("8. CANCELLED_BY_PROVIDER → badge approprié, PAS de bouton Annuler", () => {
    render(
      <AppointmentCard
        appointment={
          {
            id: "2",
            status: "CANCELLED_BY_PROVIDER",
            startAt: "2026-05-15T10:00:00Z",
            endAt: "2026-05-15T10:30:00Z",
            locationType: "IN_PERSON",
            notes: null,
            provider: { person: { firstName: "Moreau", lastName: "Pierre" } },
            consultationType: null,
            location: { name: "Cabinet", address: null, city: null, color: null },
          } as unknown as Parameters<typeof AppointmentCard>[0]["appointment"]
        }
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText(/Annulé par le soignant/)).toBeInTheDocument();
    // Aucun bouton Annuler ne doit être affiché (canCancel=false dans STATUS_CFG)
    expect(screen.queryByText(/Annuler ce RDV/)).not.toBeInTheDocument();
  });
});
