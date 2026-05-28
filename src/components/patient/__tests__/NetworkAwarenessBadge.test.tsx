import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NetworkAwarenessBadge } from "../NetworkAwarenessBadge";
import type { PatientCareCaseOrganization } from "@/lib/api";

function makeOrg(
  overrides: Partial<PatientCareCaseOrganization> &
    Pick<PatientCareCaseOrganization, "type">,
): PatientCareCaseOrganization {
  return {
    id: "org_1",
    name: "Réseau TCA Île-de-France",
    missionStatement: null,
    publicMetadata: null,
    logoUrl: null,
    ...overrides,
  };
}

describe("NetworkAwarenessBadge — F-STRUCT-Q11", () => {
  it("ne rend rien si organization est null", () => {
    const { container } = render(<NetworkAwarenessBadge organization={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("ne rend rien si organization.type = INTERNAL (hors whitelist)", () => {
    const { container } = render(
      <NetworkAwarenessBadge organization={makeOrg({ type: "INTERNAL" })} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("ne rend rien si organization.type = HOSPITAL_SERVICE (hors whitelist)", () => {
    const { container } = render(
      <NetworkAwarenessBadge organization={makeOrg({ type: "HOSPITAL_SERVICE" })} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("affiche le badge avec 'le réseau X' quand type = NETWORK", () => {
    render(
      <NetworkAwarenessBadge
        organization={makeOrg({ type: "NETWORK", name: "Réseau TCA IDF" })}
      />,
    );
    // Phrasing factuel, MDR-safe (passif "coordonné via").
    expect(screen.getByText(/coordonné via le réseau/i)).toBeInTheDocument();
    expect(screen.getByText("Réseau TCA IDF")).toBeInTheDocument();
    // Lien vers la mini-fiche.
    const link = screen.getByRole("link", { name: /en savoir plus/i });
    expect(link).toHaveAttribute("href", "/structures/org_1");
  });

  it("affiche 'la fédération X' quand type = FEDERATION", () => {
    render(
      <NetworkAwarenessBadge
        organization={makeOrg({ type: "FEDERATION", name: "FFAB" })}
      />,
    );
    expect(screen.getByText(/coordonné via la fédération/i)).toBeInTheDocument();
    expect(screen.getByText("FFAB")).toBeInTheDocument();
  });

  it("affiche 'la CPTS X' quand type = CPTS", () => {
    render(
      <NetworkAwarenessBadge
        organization={makeOrg({ type: "CPTS", name: "CPTS Paris 11" })}
      />,
    );
    expect(screen.getByText(/coordonné via la CPTS/i)).toBeInTheDocument();
    expect(screen.getByText("CPTS Paris 11")).toBeInTheDocument();
  });

  it("rend le logo quand logoUrl est présent", () => {
    const { container } = render(
      <NetworkAwarenessBadge
        organization={makeOrg({
          type: "NETWORK",
          logoUrl: "https://example.test/logo.png",
        })}
      />,
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("src", "https://example.test/logo.png");
  });

  it("n'utilise AUCUN terme MDR interdit (détecter/alerter/surveiller/vigilance/risque)", () => {
    render(
      <NetworkAwarenessBadge
        organization={makeOrg({ type: "NETWORK", name: "Réseau X" })}
      />,
    );
    const text = document.body.textContent ?? "";
    const forbidden = [
      "détect",
      "alert",
      "surveill",
      "vigilance",
      "risque",
      "anormal",
      "diagnostic",
    ];
    for (const word of forbidden) {
      expect(text.toLowerCase()).not.toContain(word);
    }
  });
});
