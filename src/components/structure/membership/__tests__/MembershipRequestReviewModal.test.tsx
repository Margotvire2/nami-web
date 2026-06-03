import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MembershipRequestReviewModal } from "../MembershipRequestReviewModal";
import type { MembershipRequestRow } from "@/hooks/useMembershipRequests";

const pending: MembershipRequestRow = {
  id: "req-1",
  organizationId: "org-1",
  personId: "p-applicant",
  status: "PENDING",
  motivationMessage: "Motivation détaillée pour rejoindre.",
  createdAt: "2026-05-30T10:00:00Z",
  applicant: {
    id: "p-applicant",
    firstName: "Jeanne",
    lastName: "Dubois",
    specialty: "Diététicienne",
    city: null,
    photoUrl: null,
  },
  reviewer: null,
};

describe("MembershipRequestReviewModal", () => {
  it("open=false → ne rend rien", () => {
    const { container } = render(
      <MembershipRequestReviewModal
        open={false}
        request={pending}
        onClose={vi.fn()}
        onReview={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("open=true + PENDING → titre 'Examiner', motivation, deux boutons Approuver/Refuser", () => {
    render(
      <MembershipRequestReviewModal
        open
        request={pending}
        onClose={vi.fn()}
        onReview={vi.fn()}
      />,
    );
    expect(screen.getByText(/examiner la demande/i)).toBeInTheDocument();
    expect(screen.getByText(/motivation détaillée/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /approuver/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /refuser/i })).toBeInTheDocument();
  });

  it("click Approuver → onReview({ id, status: 'ACCEPTED' })", () => {
    const onReview = vi.fn();
    render(
      <MembershipRequestReviewModal
        open
        request={pending}
        onClose={vi.fn()}
        onReview={onReview}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /approuver/i }));
    expect(onReview).toHaveBeenCalledWith({ id: "req-1", status: "ACCEPTED" });
  });

  it("click Refuser → onReview({ id, status: 'REJECTED' })", () => {
    const onReview = vi.fn();
    render(
      <MembershipRequestReviewModal
        open
        request={pending}
        onClose={vi.fn()}
        onReview={onReview}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /refuser/i }));
    expect(onReview).toHaveBeenCalledWith({ id: "req-1", status: "REJECTED" });
  });

  it("click Fermer → onClose appelé", () => {
    const onClose = vi.fn();
    render(
      <MembershipRequestReviewModal
        open
        request={pending}
        onClose={onClose}
        onReview={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /fermer/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ACCEPTED → titre 'Détails', pas de boutons Approuver/Refuser, infos examinateur", () => {
    const accepted: MembershipRequestRow = {
      ...pending,
      status: "ACCEPTED",
      reviewedAt: "2026-06-01T09:00:00Z",
      acceptedAt: "2026-06-01T09:00:00Z",
      reviewer: { id: "p-rev", firstName: "Sylvie", lastName: "Bernard" },
    };
    render(
      <MembershipRequestReviewModal
        open
        request={accepted}
        onClose={vi.fn()}
        onReview={vi.fn()}
      />,
    );
    expect(screen.getByText(/détails de la demande/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /approuver/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /refuser/i })).not.toBeInTheDocument();
    expect(screen.getByText(/sylvie bernard/i)).toBeInTheDocument();
  });

  it("submitting=true → boutons disabled", () => {
    render(
      <MembershipRequestReviewModal
        open
        request={pending}
        submitting
        onClose={vi.fn()}
        onReview={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /approuver/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /refuser/i })).toBeDisabled();
  });

  it("errorMessage → alerte affichée", () => {
    render(
      <MembershipRequestReviewModal
        open
        request={pending}
        errorMessage="Erreur réseau"
        onClose={vi.fn()}
        onReview={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/erreur réseau/i);
  });

  it("motivationMessage null → message italic 'Aucun message de motivation'", () => {
    render(
      <MembershipRequestReviewModal
        open
        request={{ ...pending, motivationMessage: null }}
        onClose={vi.fn()}
        onReview={vi.fn()}
      />,
    );
    expect(screen.getByText(/aucun message de motivation/i)).toBeInTheDocument();
  });
});
