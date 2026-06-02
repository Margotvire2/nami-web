import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemberStatusTabs } from "../MemberStatusTabs";

const COUNTS = { active: 12, suspended: 2, exited: 5 };

describe("MemberStatusTabs", () => {
  it("rend les 4 onglets (Actifs / En sommeil / Suspendus / Sortis)", () => {
    render(
      <MemberStatusTabs active="ACTIVE" onChange={() => {}} counts={COUNTS} />
    );
    expect(screen.getByRole("tab", { name: /actifs/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /en sommeil/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /suspendus/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /sortis/i })).toBeInTheDocument();
  });

  it('"En sommeil" est aria-disabled avec badge "Bientôt"', () => {
    render(
      <MemberStatusTabs active="ACTIVE" onChange={() => {}} counts={COUNTS} />
    );
    const dormant = screen.getByRole("tab", { name: /en sommeil/i });
    expect(dormant).toHaveAttribute("aria-disabled");
    expect(dormant).toHaveAttribute("aria-selected", "false");
    expect(dormant.textContent).toMatch(/bientôt/i);
  });

  it('aria-selected=true sur l\'onglet actif', () => {
    render(
      <MemberStatusTabs active="SUSPENDED" onChange={() => {}} counts={COUNTS} />
    );
    expect(screen.getByRole("tab", { name: /suspendus/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tab", { name: /actifs/i })).toHaveAttribute(
      "aria-selected",
      "false"
    );
  });

  it("affiche les counts sur les onglets fonctionnels", () => {
    render(
      <MemberStatusTabs active="ACTIVE" onChange={() => {}} counts={COUNTS} />
    );
    expect(screen.getByRole("tab", { name: /actifs/i })).toHaveTextContent("12");
    expect(screen.getByRole("tab", { name: /suspendus/i })).toHaveTextContent("2");
    expect(screen.getByRole("tab", { name: /sortis/i })).toHaveTextContent("5");
  });

  it("onChange est appelé lorsqu'on clique un onglet fonctionnel", () => {
    const onChange = vi.fn();
    render(
      <MemberStatusTabs active="ACTIVE" onChange={onChange} counts={COUNTS} />
    );
    fireEvent.click(screen.getByRole("tab", { name: /suspendus/i }));
    expect(onChange).toHaveBeenCalledWith("SUSPENDED");
  });

  it('clic sur "En sommeil" n\'appelle pas onChange (disabled)', () => {
    const onChange = vi.fn();
    render(
      <MemberStatusTabs active="ACTIVE" onChange={onChange} counts={COUNTS} />
    );
    fireEvent.click(screen.getByRole("tab", { name: /en sommeil/i }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
