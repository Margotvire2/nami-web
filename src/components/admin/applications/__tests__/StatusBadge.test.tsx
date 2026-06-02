import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";
import type { ApplicationStatus } from "@/hooks/useAdminApplications";

const CASES: Array<{ status: ApplicationStatus; label: string }> = [
  { status: "PENDING_REVIEW", label: "À reviewer" },
  { status: "IN_REVIEW",      label: "En cours" },
  { status: "APPROVED",       label: "Approuvée" },
  { status: "REJECTED",       label: "Rejetée" },
  { status: "WITHDRAWN",      label: "Retirée" },
];

describe("StatusBadge", () => {
  it.each(CASES)("affiche le label FR + data-status pour %s", ({ status, label }) => {
    render(<StatusBadge status={status} />);
    const badge = screen.getByTestId("application-status-badge");
    expect(badge).toHaveAttribute("data-status", status);
    expect(badge.textContent).toContain(label);
  });
});
