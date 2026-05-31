import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConsoleSidebar } from "../ConsoleSidebar";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  } & React.HTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("ConsoleSidebar", () => {
  it("active=dashboard → l'item Tableau de bord a aria-current=page", () => {
    render(<ConsoleSidebar orgId="org-1" active="dashboard" />);
    const tdb = screen.getByRole("link", { name: /tableau de bord/i });
    expect(tdb).toHaveAttribute("aria-current", "page");
  });

  it("active=discussions → l'item Discussions a aria-current=page", () => {
    render(<ConsoleSidebar orgId="org-1" active="discussions" />);
    const disc = screen.getByRole("link", { name: /discussions/i });
    expect(disc).toHaveAttribute("aria-current", "page");
  });

  it("items V2 sont marqués disabled avec tooltip", () => {
    render(<ConsoleSidebar orgId="org-1" active="dashboard" />);

    for (const label of [
      "Membres",
      "Actualités",
      "Ressources",
      "Recherche",
      "Paramètres",
    ]) {
      const span = screen.getByText(label, { selector: "[aria-disabled]" });
      expect(span).toHaveAttribute("title", "Disponible en V2");
    }
  });

  it("active=events → l'item Événements a aria-current=page", () => {
    render(<ConsoleSidebar orgId="org-1" active="events" />);
    const evts = screen.getByRole("link", { name: /événements/i });
    expect(evts).toHaveAttribute("aria-current", "page");
  });

  it("liens actifs pointent vers les bonnes URL", () => {
    render(<ConsoleSidebar orgId="org-42" active="dashboard" />);
    expect(
      screen.getByRole("link", { name: /tableau de bord/i })
    ).toHaveAttribute("href", "/structure/org-42/admin");
    expect(
      screen.getByRole("link", { name: /discussions/i })
    ).toHaveAttribute("href", "/messages");
    expect(
      screen.getByRole("link", { name: /événements/i })
    ).toHaveAttribute("href", "/structure/org-42/admin/evenements");
  });
});
