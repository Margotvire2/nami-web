import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { RcpPickerNetworkGroup } from "../RcpPickerNetworkGroup";
import type { RcpPickerGroup } from "@/lib/api";

function makeGroup(
  members: { personId: string; firstName: string; lastName: string; specialty?: string }[]
): RcpPickerGroup {
  return {
    organization: { id: "org-1", name: "Réseau X", type: "NETWORK", logoUrl: null },
    members: members.map((m) => ({
      personId: m.personId,
      firstName: m.firstName,
      lastName: m.lastName,
      photoUrl: null,
      specialty: m.specialty ?? null,
      memberRole: "PROVIDER" as const,
    })),
  };
}

describe("RcpPickerNetworkGroup (INIT-489)", () => {
  it("affiche le nom de l'org + le compteur membres", () => {
    const group = makeGroup([
      { personId: "p1", firstName: "Anna", lastName: "Durand" },
      { personId: "p2", firstName: "Bernard", lastName: "Petit" },
    ]);

    render(
      <RcpPickerNetworkGroup
        orgName="Réseau TCA IDF"
        orgType="NETWORK"
        isLoading={false}
        group={group}
        selectedIds={[]}
        onToggleMember={() => {}}
        onInviteAll={() => {}}
      />
    );

    expect(screen.getByText("Réseau TCA IDF")).toBeInTheDocument();
    expect(screen.getByText(/Réseau · 2 membres/)).toBeInTheDocument();
  });

  it("clic 'Tout inviter' appelle onInviteAll avec tous les personIds", () => {
    const onInviteAll = vi.fn();
    const group = makeGroup([
      { personId: "p1", firstName: "Anna", lastName: "Durand" },
      { personId: "p2", firstName: "Bernard", lastName: "Petit" },
      { personId: "p3", firstName: "Claire", lastName: "Roux" },
    ]);

    render(
      <RcpPickerNetworkGroup
        orgName="Réseau X"
        orgType="NETWORK"
        isLoading={false}
        group={group}
        selectedIds={[]}
        onToggleMember={() => {}}
        onInviteAll={onInviteAll}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Tout inviter" }));
    expect(onInviteAll).toHaveBeenCalledWith(["p1", "p2", "p3"]);
  });

  it("'Tout inviter' désactivé quand tous les membres sont déjà sélectionnés", () => {
    const group = makeGroup([
      { personId: "p1", firstName: "Anna", lastName: "Durand" },
      { personId: "p2", firstName: "Bernard", lastName: "Petit" },
    ]);

    render(
      <RcpPickerNetworkGroup
        orgName="Réseau X"
        orgType="NETWORK"
        isLoading={false}
        group={group}
        selectedIds={["p1", "p2"]}
        onToggleMember={() => {}}
        onInviteAll={() => {}}
      />
    );

    const btn = screen.getByRole("button", { name: "Tous invités" });
    expect(btn).toBeDisabled();
  });

  it("développé → affiche la liste des membres avec spécialité", () => {
    const group = makeGroup([
      { personId: "p1", firstName: "Anna", lastName: "Durand", specialty: "Psychiatrie" },
    ]);

    render(
      <RcpPickerNetworkGroup
        orgName="Réseau X"
        orgType="NETWORK"
        isLoading={false}
        group={group}
        selectedIds={[]}
        onToggleMember={() => {}}
        onInviteAll={() => {}}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Déplier Réseau X/ }));
    expect(screen.getByText("Anna Durand")).toBeInTheDocument();
    expect(screen.getByText("Psychiatrie")).toBeInTheDocument();
  });

  it("clic checkbox membre appelle onToggleMember", () => {
    const onToggle = vi.fn();
    const group = makeGroup([
      { personId: "p1", firstName: "Anna", lastName: "Durand" },
    ]);

    render(
      <RcpPickerNetworkGroup
        orgName="Réseau X"
        orgType="NETWORK"
        isLoading={false}
        group={group}
        selectedIds={[]}
        onToggleMember={onToggle}
        onInviteAll={() => {}}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Déplier Réseau X/ }));
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith("p1");
  });

  it("isLoading → message de chargement, pas de 'Tout inviter'", () => {
    render(
      <RcpPickerNetworkGroup
        orgName="Réseau X"
        orgType="NETWORK"
        isLoading={true}
        group={undefined}
        selectedIds={[]}
        onToggleMember={() => {}}
        onInviteAll={() => {}}
      />
    );

    expect(screen.queryByRole("button", { name: "Tout inviter" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Déplier Réseau X/ }));
    expect(screen.getByText(/Chargement des membres/)).toBeInTheDocument();
  });
});
