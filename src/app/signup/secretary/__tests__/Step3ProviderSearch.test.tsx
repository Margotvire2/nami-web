import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import {
  Step3ProviderSearch,
  step3Valid,
  type Step3Values,
} from "../_components/Step3ProviderSearch";
import * as apiModule from "@/lib/api";
import type { ProviderSearchLightResult } from "@/lib/api";

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryWrapper";
  return Wrapper;
}

function makeProvider(over: Partial<ProviderSearchLightResult> = {}): ProviderSearchLightResult {
  return {
    id:                  "p-1",
    firstName:           "Marie",
    lastName:            "Curie",
    profession:          "MEDECIN",
    specialtyView:       "GENERAL",
    city:                "Paris",
    proIdentifierType:   "RPPS",
    proIdentifierMasked: "***123",
    ...over,
  };
}

describe("Step3ProviderSearch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    cleanup();
  });

  it("does not call the API immediately after typing (debounce 300ms)", async () => {
    const searchSpy = vi
      .spyOn(apiModule.secretariatApi, "searchProvidersLight")
      .mockResolvedValue({ providers: [makeProvider()] });

    let values: Step3Values = { selectedProviders: [] };
    render(
      <Step3ProviderSearch
        values={values}
        onChange={(v) => { values = v; }}
      />,
      { wrapper: makeWrapper() },
    );

    const input = screen.getByLabelText(/Rechercher un soignant/i);
    fireEvent.change(input, { target: { value: "Cu" } });

    // Vérifie que la requête n'a pas encore été envoyée immédiatement.
    expect(searchSpy).not.toHaveBeenCalled();

    // Après le debounce (300ms) elle doit s'exécuter.
    await waitFor(() => expect(searchSpy).toHaveBeenCalled(), { timeout: 1500 });
    expect(searchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ q: "Cu", limit: 20 }),
    );
  });

  it("clicking a provider card toggles its selection", async () => {
    vi
      .spyOn(apiModule.secretariatApi, "searchProvidersLight")
      .mockResolvedValue({
        providers: [
          makeProvider({ id: "p-1", firstName: "Marie", lastName: "Curie" }),
          makeProvider({ id: "p-2", firstName: "Louis", lastName: "Pasteur" }),
        ],
      });

    let values: Step3Values = { selectedProviders: [] };
    const onChange = vi.fn((v: Step3Values) => { values = v; });

    const { rerender } = render(
      <Step3ProviderSearch values={values} onChange={onChange} />,
      { wrapper: makeWrapper() },
    );

    const input = screen.getByLabelText(/Rechercher un soignant/i);
    fireEvent.change(input, { target: { value: "ma" } });

    const card = await screen.findByTestId("provider-card-p-1", undefined, { timeout: 1500 });
    fireEvent.click(card);

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.selectedProviders).toHaveLength(1);
    expect(lastCall.selectedProviders[0].id).toBe("p-1");

    // Re-render with new state and click again → toggle off.
    values = lastCall;
    rerender(<Step3ProviderSearch values={values} onChange={onChange} />);
    const card2 = await screen.findByTestId("provider-card-p-1");
    fireEvent.click(card2);
    const last2 = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last2.selectedProviders).toHaveLength(0);
  });

  it("step3Valid requires at least 1 provider selected (min 1, max 20)", () => {
    expect(step3Valid({ selectedProviders: [] })).toBe(false);
    expect(step3Valid({ selectedProviders: [makeProvider()] })).toBe(true);

    const twentyOne = Array.from({ length: 21 }, (_, i) =>
      makeProvider({ id: `p-${i}` }),
    );
    expect(step3Valid({ selectedProviders: twentyOne })).toBe(false);
  });
});
