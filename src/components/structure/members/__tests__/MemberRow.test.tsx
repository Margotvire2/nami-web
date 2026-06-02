import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemberRow } from "../MemberRow";
import type { OrgMemberRow } from "@/hooks/useOrgMembers";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...rest
  }: { src: string; alt: string } & React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...rest} />
  ),
}));

function makeMember(overrides: Partial<OrgMemberRow> = {}): OrgMemberRow {
  return {
    personId: "p1",
    memberRole: "PROVIDER",
    joinedAt: "2026-01-15T10:00:00.000Z",
    id: "p1",
    firstName: "Marie",
    lastName: "Curie",
    photoUrl: null,
    providerProfile: { specialtyView: "Pédiatrie" },
    ...overrides,
  };
}

describe("MemberRow", () => {
  it("affiche prénom + nom + spécialité + rôle traduit", () => {
    render(<MemberRow member={makeMember()} />);
    expect(screen.getByText(/marie curie/i)).toBeInTheDocument();
    expect(screen.getByText(/pédiatrie/i)).toBeInTheDocument();
    expect(screen.getByText(/soignant/i)).toBeInTheDocument();
  });

  it("traduit les rôles connus en label FR", () => {
    render(<MemberRow member={makeMember({ memberRole: "ADMIN" })} />);
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
  });

  it("affiche la date d'adhésion formatée FR", () => {
    render(<MemberRow member={makeMember()} />);
    expect(screen.getByText(/15 janv\. 2026/i)).toBeInTheDocument();
  });

  it("sans spécialité, n'affiche que le rôle", () => {
    render(
      <MemberRow
        member={makeMember({
          providerProfile: null,
          memberRole: "PROVIDER",
        })}
      />
    );
    expect(screen.queryByText(/pédiatrie/i)).not.toBeInTheDocument();
    expect(screen.getByText(/soignant/i)).toBeInTheDocument();
  });

  it("affiche l'avatar image quand photoUrl est défini", () => {
    const { container } = render(
      <MemberRow
        member={makeMember({ photoUrl: "https://example.com/photo.jpg" })}
      />
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("src", "https://example.com/photo.jpg");
  });
});
