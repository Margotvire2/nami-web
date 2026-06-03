import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MembershipRequestCard } from "../MembershipRequestCard";
import type { MembershipRequestRow } from "@/hooks/useMembershipRequests";

const baseRequest: MembershipRequestRow = {
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
  reviewer: null,
};

describe("MembershipRequestCard", () => {
  it("affiche nom, spécialité, ville, motivation et badge À valider pour PENDING", () => {
    render(<MembershipRequestCard request={baseRequest} />);
    expect(screen.getByText(/jeanne dubois/i)).toBeInTheDocument();
    expect(screen.getByText(/diététicienne/i)).toBeInTheDocument();
    expect(screen.getByText(/paris 14/i)).toBeInTheDocument();
    expect(screen.getByText(/rejoindre le réseau/i)).toBeInTheDocument();
    expect(screen.getByText(/à valider/i)).toBeInTheDocument();
  });

  it("PENDING → bouton 'Examiner' qui invoque onExamine(request)", () => {
    const onExamine = vi.fn();
    render(<MembershipRequestCard request={baseRequest} onExamine={onExamine} />);
    fireEvent.click(screen.getByRole("button", { name: /examiner/i }));
    expect(onExamine).toHaveBeenCalledTimes(1);
    expect(onExamine).toHaveBeenCalledWith(baseRequest);
  });

  it("ACCEPTED → badge 'Approuvée' + bouton 'Détails' + ligne examinateur", () => {
    const accepted: MembershipRequestRow = {
      ...baseRequest,
      status: "ACCEPTED",
      reviewedAt: "2026-06-01T09:00:00Z",
      acceptedAt: "2026-06-01T09:00:00Z",
      reviewer: { id: "p-rev", firstName: "Sylvie", lastName: "Bernard" },
    };
    render(<MembershipRequestCard request={accepted} />);
    expect(screen.getByText(/approuvée/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /détails/i })).toBeInTheDocument();
    expect(screen.getByText(/examinée par sylvie bernard/i)).toBeInTheDocument();
  });

  it("REJECTED → badge 'Refusée' visible", () => {
    const rejected: MembershipRequestRow = {
      ...baseRequest,
      status: "REJECTED",
      reviewedAt: "2026-06-01T09:00:00Z",
      reviewer: { id: "p-rev", firstName: "Sylvie", lastName: "Bernard" },
    };
    render(<MembershipRequestCard request={rejected} />);
    expect(screen.getByText(/refusée/i)).toBeInTheDocument();
  });

  it("specialty/city null → champs absents sans crash", () => {
    const minimal: MembershipRequestRow = {
      ...baseRequest,
      motivationMessage: null,
      applicant: {
        ...baseRequest.applicant,
        specialty: null,
        city: null,
      },
    };
    render(<MembershipRequestCard request={minimal} />);
    expect(screen.getByText(/jeanne dubois/i)).toBeInTheDocument();
    expect(screen.queryByText(/diététicienne/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/paris/i)).not.toBeInTheDocument();
  });
});
