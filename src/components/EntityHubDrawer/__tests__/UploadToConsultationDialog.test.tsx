import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UploadToConsultationDialog } from "../UploadToConsultationDialog";

// useAuthStore -> retourne un token fictif.
vi.mock("@/lib/store", () => ({
  useAuthStore: <T,>(selector: (s: { accessToken: string | null }) => T): T =>
    selector({ accessToken: "tok-test" }),
}));

// Stub fetch global pour intercepter le POST /patient/documents/upload.
const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  // par défaut succès
  fetchMock.mockResolvedValue({
    ok: true,
    status: 201,
    headers: { get: () => "application/json" },
    json: async () => ({
      id: "doc-new-1",
      title: "Bilan biologique du 03/06/2026",
      documentType: "BIOLOGICAL_REPORT",
    }),
    text: async () => "",
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

function renderDialog(props?: Partial<React.ComponentProps<typeof UploadToConsultationDialog>>) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <UploadToConsultationDialog
        isOpen
        onClose={vi.fn()}
        careCaseId="cc-1"
        consultationId="cons-1"
        providerId="prov-1"
        providerName="Dr Marie Dubois"
        {...props}
      />
    </QueryClientProvider>,
  );
}

describe("UploadToConsultationDialog — rendu initial", () => {
  it("affiche le nom du soignant destinataire", () => {
    renderDialog();
    expect(screen.getByText("Transmettre un document")).toBeInTheDocument();
    expect(
      screen.getByText(/Ce document sera envoyé en privé à/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Dr Marie Dubois")).toBeInTheDocument();
  });

  it("type par défaut = BIOLOGICAL_REPORT, titre auto-suggéré", () => {
    renderDialog();
    const select = screen.getByLabelText("Type de document") as HTMLSelectElement;
    expect(select.value).toBe("BIOLOGICAL_REPORT");
    const titleInput = screen.getByLabelText("Titre") as HTMLInputElement;
    expect(titleInput.value).toMatch(/^Bilan biologique du/);
  });

  it("changer le type met à jour le titre auto-suggéré tant qu'il n'a pas été touché", () => {
    renderDialog();
    const select = screen.getByLabelText("Type de document") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "LETTER" } });
    const titleInput = screen.getByLabelText("Titre") as HTMLInputElement;
    expect(titleInput.value).toMatch(/^Lettre d.adressage du/);
  });

  it("si l'utilisateur édite le titre, le changement de type ne l'écrase plus", () => {
    renderDialog();
    const titleInput = screen.getByLabelText("Titre") as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "Mon titre custom" } });
    const select = screen.getByLabelText("Type de document") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "LETTER" } });
    expect(titleInput.value).toBe("Mon titre custom");
  });

  it("bouton 'Transmettre' désactivé tant qu'aucun fichier n'est sélectionné", () => {
    renderDialog();
    const submit = screen.getByRole("button", { name: /^transmettre$/i });
    expect(submit).toBeDisabled();
  });

  it("isOpen=false : ne rend rien (dialog masqué)", () => {
    const { container } = renderDialog({ isOpen: false });
    expect(container).toBeEmptyDOMElement();
  });
});

describe("UploadToConsultationDialog — wording MDR-safe", () => {
  it("aucun mot interdit MDR dans la modale", () => {
    const { container } = renderDialog();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\balerte\b/i);
    expect(text).not.toMatch(/\bsurveillance\b/i);
    expect(text).not.toMatch(/\bdétecter\b/i);
    expect(text).not.toMatch(/\bdiagnostic\b/i);
    expect(text).not.toMatch(/\banormal\b/i);
  });
});

describe("UploadToConsultationDialog — submit", () => {
  it("submit POST /patient/documents/upload avec directRecipientPersonId = providerId", async () => {
    renderDialog();
    const fileInput = document.getElementById("upload-consult-file") as HTMLInputElement;
    expect(fileInput).not.toBeNull();
    const fakeFile = new File(["hello"], "bilan.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [fakeFile] } });

    const submit = screen.getByRole("button", { name: /^transmettre$/i });
    expect(submit).not.toBeDisabled();
    fireEvent.click(submit);

    // Attendre que fetch ait été appelé (poll court).
    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toMatch(/\/patient\/documents\/upload$/);
    expect(init.method).toBe("POST");
    const fd = init.body as FormData;
    expect(fd.get("documentType")).toBe("BIOLOGICAL_REPORT");
    expect(fd.get("directRecipientPersonId")).toBe("prov-1");
    expect(fd.get("targetCareCaseIds")).toBeNull();
    expect((fd.get("file") as File).name).toBe("bilan.pdf");
  });

  it("succès : affiche le message de confirmation et appelle onClose après délai", async () => {
    const onClose = vi.fn();
    renderDialog({ onClose });
    const fileInput = document.getElementById("upload-consult-file") as HTMLInputElement;
    expect(fileInput).not.toBeNull();
    fireEvent.change(fileInput, {
      target: {
        files: [new File(["x"], "f.pdf", { type: "application/pdf" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /^transmettre$/i }));

    // Le bloc succès est rendu après que la mutation onSuccess s'exécute.
    await vi.waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/document transmis/i);
    });

    // onClose est planifié 1.4s après succès. waitFor avec timeout > 1.4s.
    await vi.waitFor(
      () => {
        expect(onClose).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 },
    );
  });
});
