import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StructureSwitcher } from "../StructureSwitcher";
import * as adminHook from "@/hooks/useAdminMemberships";

// Vitest 4 / jsdom : localStorage is not provisioned by default — on installe
// un mock minimal avant chaque test.
const fakeStorage: Record<string, string> = {};
const memStorage: Storage = {
  get length() { return Object.keys(fakeStorage).length; },
  clear: () => { for (const k of Object.keys(fakeStorage)) delete fakeStorage[k]; },
  getItem: (k: string) => (k in fakeStorage ? fakeStorage[k] : null),
  setItem: (k: string, v: string) => { fakeStorage[k] = v; },
  removeItem: (k: string) => { delete fakeStorage[k]; },
  key: (i: number) => Object.keys(fakeStorage)[i] ?? null,
};
Object.defineProperty(window, "localStorage", {
  value: memStorage,
  configurable: true,
  writable: true,
});

const routerPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));

const mockUser: {
  id: string;
  roleType: string;
  providerProfile?: { id: string };
} = {
  id: "person-margot",
  roleType: "PROVIDER",
  providerProfile: { id: "pp-1" },
};

vi.mock("@/lib/store", () => ({
  useAuthStore: (selector: (s: { user: typeof mockUser | null }) => unknown) =>
    selector({ user: mockUser }),
}));

function mockMemberships(memberships: { id: string; name: string; type: string }[]) {
  vi.spyOn(adminHook, "useAdminMemberships").mockReturnValue({
    memberships,
    hasAny: memberships.length > 0,
    isLoading: false,
    isError: false,
  });
}

describe("StructureSwitcher", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    routerPush.mockReset();
    window.localStorage.clear();
    // Restaure le providerProfile + roleType pour les tests qui suivent
    mockUser.providerProfile = { id: "pp-1" };
    mockUser.roleType = "PROVIDER";
  });

  it("Aucune adhésion ADMIN → composant null (rien rendu)", () => {
    mockMemberships([]);
    const { container } = render(<StructureSwitcher />);
    expect(container.firstChild).toBeNull();
  });

  it("1 adhésion ADMIN → dropdown avec 2 entries (cockpit + 1 org)", () => {
    mockMemberships([{ id: "org-rtf", name: "Réseau TCA Francilien", type: "NETWORK" }]);
    render(<StructureSwitcher />);

    fireEvent.click(screen.getByRole("button", { name: /cockpit soignant/i }));

    const menu = screen.getByRole("menu");
    const items = menu.querySelectorAll("[role='menuitem']");
    expect(items.length).toBe(2);
    expect(menu.textContent).toMatch(/Cockpit soignant/);
    expect(menu.textContent).toMatch(/Réseau TCA Francilien/);
  });

  it("2 adhésions ADMIN → dropdown avec 3 entries", () => {
    mockMemberships([
      { id: "org-rtf", name: "Réseau TCA Francilien", type: "NETWORK" },
      { id: "org-ffab", name: "FFAB", type: "ASSOCIATION" },
    ]);
    render(<StructureSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: /cockpit soignant/i }));
    const items = screen.getByRole("menu").querySelectorAll("[role='menuitem']");
    expect(items.length).toBe(3);
  });

  it("Sélectionner une structure → router.push + persist localStorage", () => {
    mockMemberships([{ id: "org-rtf", name: "Réseau TCA Francilien", type: "NETWORK" }]);
    render(<StructureSwitcher />);
    fireEvent.click(screen.getByRole("button", { name: /cockpit soignant/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Réseau TCA Francilien/i }));

    expect(routerPush).toHaveBeenCalledWith("/structure/org-rtf/admin");
    const stored = window.localStorage.getItem("nami_structure_switcher_choice");
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual({ kind: "structure", orgId: "org-rtf" });
  });

  // F-SEC-RENAME-PLATFORM-ADMIN — coexistence transitoire.
  // Admin pur (!providerProfile) voit le switcher MAIS sans l'item "Cockpit soignant".
  it.each([
    ["PLATFORM_ADMIN"],
    ["ORG_ADMIN"],
  ])("User sans providerProfile (%s pur) → switcher visible, pas d'item Cockpit soignant", (role) => {
    mockMemberships([{ id: "org-rtf", name: "Réseau TCA Francilien", type: "NETWORK" }]);
    mockUser.providerProfile = undefined;
    mockUser.roleType = role;
    render(<StructureSwitcher />);

    // Le bouton trigger doit être rendu (affiche le nom de l'org, pas "Cockpit soignant").
    const trigger = screen.getByRole("button", { name: /Réseau TCA Francilien/i });
    expect(trigger).toBeTruthy();

    // Ouvrir le dropdown → pas d'item "Cockpit soignant".
    fireEvent.click(trigger);
    const menu = screen.getByRole("menu");
    expect(menu.textContent).not.toMatch(/Cockpit soignant/);
    expect(menu.textContent).toMatch(/Réseau TCA Francilien/);
  });

  it("Admin pur multi-org → dropdown liste toutes les orgs, pas de Cockpit soignant", () => {
    mockMemberships([
      { id: "org-rtf", name: "Réseau TCA Francilien", type: "NETWORK" },
      { id: "org-cpts", name: "CPTS Paris 13", type: "CPTS" },
    ]);
    mockUser.providerProfile = undefined;
    mockUser.roleType = "PLATFORM_ADMIN";
    render(<StructureSwitcher />);

    // Trigger affiche la 1ère org (choix "cockpit" par défaut → fallback admin pur).
    expect(screen.getByRole("button", { name: /Réseau TCA Francilien/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Réseau TCA Francilien/i }));
    const menu = screen.getByRole("menu");
    const items = menu.querySelectorAll("[role='menuitem']");
    expect(items.length).toBe(2);
    expect(menu.textContent).not.toMatch(/Cockpit soignant/);
    expect(menu.textContent).toMatch(/Réseau TCA Francilien/);
    expect(menu.textContent).toMatch(/CPTS Paris 13/);
  });
});
