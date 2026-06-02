import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OrgTypeSelector, ORG_TYPE_OPTIONS } from "../OrgTypeSelector";

describe("OrgTypeSelector", () => {
  it("rend les 13 types publics (INTERNAL exclu)", () => {
    render(<OrgTypeSelector value={null} onChange={() => {}} />);
    expect(ORG_TYPE_OPTIONS).toHaveLength(13);
    // INTERNAL n'est pas exposé au public.
    expect(
      ORG_TYPE_OPTIONS.find((o) => (o.value as string) === "INTERNAL"),
    ).toBeUndefined();
  });

  it("appelle onChange avec le type cliqué", () => {
    const onChange = vi.fn();
    render(<OrgTypeSelector value={null} onChange={onChange} />);
    fireEvent.click(screen.getByTestId("org-type-CPTS"));
    expect(onChange).toHaveBeenCalledWith("CPTS");
  });

  it("marque l'option sélectionnée comme aria-checked", () => {
    render(<OrgTypeSelector value="HOSPITAL" onChange={() => {}} />);
    const hospital = screen.getByTestId("org-type-HOSPITAL");
    expect(hospital.getAttribute("aria-checked")).toBe("true");
  });

  it("affiche le badge FINESS sur les structures sanitaires", () => {
    render(<OrgTypeSelector value={null} onChange={() => {}} />);
    const hospital = screen.getByTestId("org-type-HOSPITAL");
    expect(hospital.textContent).toContain("FINESS");
    const cpts = screen.getByTestId("org-type-CPTS");
    expect(cpts.textContent).not.toContain("FINESS");
  });
});
