import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CguAcceptance } from "../CguAcceptance";

describe("CguAcceptance", () => {
  it("rend deux checkboxes décochées par défaut", () => {
    render(
      <CguAcceptance
        value={{ acceptedTerms: false, acceptedRgpd: false }}
        onChange={() => {}}
      />,
    );
    const terms = screen.getByTestId("cgu-terms") as HTMLInputElement;
    const rgpd = screen.getByTestId("cgu-rgpd") as HTMLInputElement;
    expect(terms.checked).toBe(false);
    expect(rgpd.checked).toBe(false);
  });

  it("appelle onChange en patchant acceptedTerms", () => {
    const onChange = vi.fn();
    render(
      <CguAcceptance
        value={{ acceptedTerms: false, acceptedRgpd: false }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByTestId("cgu-terms"));
    expect(onChange).toHaveBeenCalledWith({
      acceptedTerms: true,
      acceptedRgpd: false,
    });
  });

  it("appelle onChange en patchant acceptedRgpd indépendamment", () => {
    const onChange = vi.fn();
    render(
      <CguAcceptance
        value={{ acceptedTerms: true, acceptedRgpd: false }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByTestId("cgu-rgpd"));
    expect(onChange).toHaveBeenCalledWith({
      acceptedTerms: true,
      acceptedRgpd: true,
    });
  });

  it("liens externes CGU + Confidentialité accessibles", () => {
    render(
      <CguAcceptance
        value={{ acceptedTerms: false, acceptedRgpd: false }}
        onChange={() => {}}
      />,
    );
    const cguLink = screen.getByText(
      /conditions générales d'utilisation/i,
    ) as HTMLAnchorElement;
    const rgpdLink = screen.getByText(
      /politique de confidentialité/i,
    ) as HTMLAnchorElement;
    expect(cguLink.getAttribute("href")).toBe("/cgu");
    expect(rgpdLink.getAttribute("href")).toBe("/confidentialite");
  });
});
