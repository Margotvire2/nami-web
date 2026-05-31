import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MembershipRequestRow } from "../MembershipRequestRow";
import * as api from "@/lib/api";
import type { PendingMembershipRequestRow } from "@/hooks/usePendingMembershipRequests";

vi.mock("@/lib/store", () => ({
  useAuthStore: (selector: (s: { accessToken: string | null }) => unknown) =>
    selector({ accessToken: "tok" }),
}));

const baseRequest: PendingMembershipRequestRow = {
  id: "req-1",
  organizationId: "org-1",
  personId: "p-applicant",
  status: "PENDING",
  motivationMessage: "Je souhaite rejoindre le réseau pour mes patients TCA.",
  createdAt: "2026-05-30T10:00:00Z",
  applicant: {
    id: "p-applicant",
    firstName: "Jeanne",
    lastName: "Dubois",
    specialty: "Diététicienne",
    city: "Paris 14",
    photoUrl: null,
  },
};

describe("MembershipRequestRow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("affiche nom, spécialité, ville et motivation", () => {
    render(<MembershipRequestRow request={baseRequest} />);
    expect(screen.getByText(/jeanne dubois/i)).toBeInTheDocument();
    expect(screen.getByText(/diététicienne/i)).toBeInTheDocument();
    expect(screen.getByText(/paris 14/i)).toBeInTheDocument();
    expect(screen.getByText(/rejoindre le réseau/i)).toBeInTheDocument();
  });

  it("click Valider → membershipRequestsApi.update({ status: 'ACCEPTED' }) et onResolved", async () => {
    const updateSpy = vi
      .spyOn(api.membershipRequestsApi, "update")
      .mockResolvedValue({ ...baseRequest, status: "ACCEPTED" });
    const onResolved = vi.fn();

    render(<MembershipRequestRow request={baseRequest} onResolved={onResolved} />);

    fireEvent.click(screen.getByRole("button", { name: /valider/i }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith("tok", "req-1", { status: "ACCEPTED" });
      expect(onResolved).toHaveBeenCalledWith("req-1");
    });
  });

  it("click Refuser → membershipRequestsApi.update({ status: 'REJECTED' })", async () => {
    const updateSpy = vi
      .spyOn(api.membershipRequestsApi, "update")
      .mockResolvedValue({ ...baseRequest, status: "REJECTED" });

    render(<MembershipRequestRow request={baseRequest} />);

    fireEvent.click(screen.getByRole("button", { name: /refuser/i }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith("tok", "req-1", { status: "REJECTED" });
    });
  });

  it("bouton Contacter est disabled V1", () => {
    render(<MembershipRequestRow request={baseRequest} />);
    const contact = screen.getByRole("button", { name: /contacter/i });
    expect(contact).toBeDisabled();
    expect(contact).toHaveAttribute("title", "Disponible en V2");
  });
});
