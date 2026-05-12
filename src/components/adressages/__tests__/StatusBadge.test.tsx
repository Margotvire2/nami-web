import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";
import { STATUS_LABEL } from "../_constants";
import type { ReferralStatus } from "@/lib/api";

const ALL_STATUSES: ReferralStatus[] = [
  "DRAFT",
  "SENT",
  "RECEIVED",
  "UNDER_REVIEW",
  "ACCEPTED",
  "DECLINED",
  "PATIENT_CONTACTED",
  "APPOINTMENT_INVITED",
  "APPOINTMENT_BOOKED",
  "FIRST_VISIT_COMPLETED",
  "EXPIRED",
  "CANCELLED",
];

describe("StatusBadge", () => {
  it("affiche un label distinct pour chacun des 12 statuts (compliance MDR)", () => {
    for (const status of ALL_STATUSES) {
      const { container } = render(<StatusBadge status={status} />);
      const expected = STATUS_LABEL[status];
      expect(screen.getByText(expected)).toBeInTheDocument();
      container.remove();
    }
  });

  it("12 labels distincts (aucun doublon dans la nomenclature)", () => {
    const labels = ALL_STATUSES.map((s) => STATUS_LABEL[s]);
    const uniqueLabels = new Set(labels);
    expect(uniqueLabels.size).toBe(12);
  });

  it("applique des couleurs SOLID selon la catégorie (active/pending/terminal)", () => {
    // active : #1a8a7e
    const { container: c1 } = render(<StatusBadge status="ACCEPTED" />);
    expect(c1.querySelector(".text-\\[\\#1a8a7e\\]")).toBeTruthy();

    // pending : #B07820
    const { container: c2 } = render(<StatusBadge status="SENT" />);
    expect(c2.querySelector(".text-\\[\\#B07820\\]")).toBeTruthy();

    // terminal : #6B7280
    const { container: c3 } = render(<StatusBadge status="FIRST_VISIT_COMPLETED" />);
    expect(c3.querySelector(".text-\\[\\#6B7280\\]")).toBeTruthy();
  });
});
