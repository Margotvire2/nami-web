import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ClinicalCriterion from "../ClinicalCriterion";

describe("ClinicalCriterion", () => {
  it("renders the children value", () => {
    render(<ClinicalCriterion critKey="imc">IMC &lt; 14 kg/m²</ClinicalCriterion>);
    expect(screen.getByText(/IMC < 14 kg\/m²/)).toBeInTheDocument();
  });

  it("exposes critKey via data-crit attribute (sympathie cross-card hook)", () => {
    const { container } = render(
      <ClinicalCriterion critKey="fc">FC &lt; 40 /min</ClinicalCriterion>,
    );
    const el = container.querySelector("[data-crit='fc']");
    expect(el).not.toBeNull();
  });

  it("invokes onSympathy(critKey, true) on mouse enter", () => {
    const onSympathy = vi.fn();
    const { container } = render(
      <ClinicalCriterion critKey="k" onSympathy={onSympathy}>
        K+ &lt; 3 mmol/L
      </ClinicalCriterion>,
    );
    const el = container.querySelector("[data-crit='k']") as HTMLElement;
    fireEvent.mouseEnter(el);
    expect(onSympathy).toHaveBeenCalledWith("k", true);
  });

  it("invokes onSympathy(critKey, false) on mouse leave", () => {
    const onSympathy = vi.fn();
    const { container } = render(
      <ClinicalCriterion critKey="gly" onSympathy={onSympathy}>
        Glycémie &lt; 0.6 g/L
      </ClinicalCriterion>,
    );
    const el = container.querySelector("[data-crit='gly']") as HTMLElement;
    fireEvent.mouseLeave(el);
    expect(onSympathy).toHaveBeenCalledWith("gly", false);
  });

  it("does not attach mouse handlers when onSympathy is undefined (default cursor)", () => {
    const { container } = render(
      <ClinicalCriterion critKey="imc">IMC</ClinicalCriterion>,
    );
    const el = container.querySelector("[data-crit='imc']") as HTMLElement;
    expect(el.style.cursor).toBe("default");
  });
});
