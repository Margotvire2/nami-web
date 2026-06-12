"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { secretaryApi, type PatientAdmin, type CreatePatientInput, type SecretaryMeManagedProvider } from "@/lib/api";
import { toast } from "sonner";
import { ChevronDown, Loader2, X } from "lucide-react";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (patient: PatientAdmin) => void;
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function CreatePatientAdminModal({ open, onClose, onCreated }: Props) {
  const { accessToken } = useAuthStore();
  const api = secretaryApi(accessToken ?? "");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState<"" | "MALE" | "FEMALE" | "OTHER" | "UNKNOWN">("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressOpen, setAddressOpen] = useState(false);
  const [addressLine1, setAddressLine1] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");

  const [providerPersonId, setProviderPersonId] = useState("");
  const [nir, setNir] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: meData } = useQuery({
    queryKey: ["secretary", "me"],
    queryFn: () => api.getMe(),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
  const providers: SecretaryMeManagedProvider[] = meData?.managedProviders ?? [];

  const firstInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const el = dialogRef.current;
      if (!el) return;
      const focusable = el.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const mutation = useMutation({
    mutationFn: (input: CreatePatientInput) => api.createPatient(input),
    onSuccess: (patient) => {
      toast.success(`Patient ${patient.firstName} ${patient.lastName} créé`);
      onCreated?.(patient);
      onClose();
    },
    onError: (err: unknown) => {
      const apiErr = err as { status?: number; message?: string };
      if (apiErr.status === 403) {
        toast.error(apiErr.message ?? "Vous n'avez pas l'autorisation de créer un patient");
      } else if (apiErr.status === 400) {
        toast.error(apiErr.message ?? "Données invalides — vérifiez les champs");
      } else {
        toast.error("Erreur serveur, réessayez");
      }
    },
  });

  function validate(): CreatePatientInput | null {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "Prénom requis";
    if (!lastName.trim()) errs.lastName = "Nom requis";
    if (!email.trim()) errs.email = "Email requis";
    else if (!isValidEmail(email)) errs.email = "Format d'email invalide";
    if (!providerPersonId) errs.providerPersonId = "Soignant référent requis";
    const nirDigits = nir.replace(/\s/g, "");
    if (nirDigits && !/^[12]\d{14}$/.test(nirDigits)) errs.nir = "NIR invalide (ex : 1 85 02 75 116 001 23)";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return null;

    const input: CreatePatientInput = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      providerPersonId,
    };
    if (nirDigits) input.nir = nirDigits;
    if (phone) input.phone = phone.trim();
    if (birthDate) input.birthDate = new Date(birthDate + "T12:00:00.000Z").toISOString();
    if (sex) input.sex = sex;
    if (addressLine1) input.addressLine1 = addressLine1.trim();
    if (postalCode) input.postalCode = postalCode.trim();
    if (city) input.city = city.trim();
    return input;
  }

  function handleSubmit() {
    const input = validate();
    if (!input) return;
    mutation.mutate(input);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Créer un patient"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8ECF4]">
          <h2 className="text-[15px] font-semibold text-[#1A1A2E]">
            Créer un patient
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:text-[#1A1A2E] hover:bg-[#F0F2FA] transition"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Soignant référent */}
          <section>
            <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
              Soignant référent <span className="text-[#DC2626]">*</span>
            </p>
            <select
              value={providerPersonId}
              onChange={(e) => { setProviderPersonId(e.target.value); setErrors((p) => ({ ...p, providerPersonId: "" })); }}
              className={`w-full h-9 px-3 rounded-xl border text-[13px] text-[#1A1A2E] bg-white focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] transition ${errors.providerPersonId ? "border-[#DC2626]" : "border-[#E8ECF4]"}`}
            >
              <option value="">— Choisir un soignant —</option>
              {providers.map((mp) => (
                <option key={mp.provider.personId} value={mp.provider.personId}>
                  {mp.provider.person.firstName} {mp.provider.person.lastName}
                  {mp.provider.specialties.length > 0 ? ` — ${mp.provider.specialties[0]}` : ""}
                </option>
              ))}
            </select>
            {errors.providerPersonId && <p className="mt-1 text-[11px] text-[#DC2626]">{errors.providerPersonId}</p>}
          </section>

          {/* Identité */}
          <section>
            <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
              Identité
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#374151] mb-1">
                  Prénom <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({ ...p, firstName: "" })); }}
                  placeholder="Marie"
                  className={`w-full h-9 px-3 rounded-xl border text-[13px] text-[#1A1A2E] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] transition ${errors.firstName ? "border-[#DC2626]" : "border-[#E8ECF4]"}`}
                />
                {errors.firstName && <p className="mt-1 text-[11px] text-[#DC2626]">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#374151] mb-1">
                  Nom <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setErrors((p) => ({ ...p, lastName: "" })); }}
                  placeholder="Dupont"
                  className={`w-full h-9 px-3 rounded-xl border text-[13px] text-[#1A1A2E] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] transition ${errors.lastName ? "border-[#DC2626]" : "border-[#E8ECF4]"}`}
                />
                {errors.lastName && <p className="mt-1 text-[11px] text-[#DC2626]">{errors.lastName}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-[11px] font-medium text-[#374151] mb-1">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[#E8ECF4] text-[13px] text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#374151] mb-1">
                  Sexe
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as typeof sex)}
                  className="w-full h-9 px-3 rounded-xl border border-[#E8ECF4] text-[13px] text-[#1A1A2E] bg-white focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] transition"
                >
                  <option value="">Non renseigné</option>
                  <option value="MALE">Masculin</option>
                  <option value="FEMALE">Féminin</option>
                  <option value="OTHER">Autre</option>
                  <option value="UNKNOWN">Inconnu</option>
                </select>
              </div>
            </div>
          </section>

          {/* Coordonnées */}
          <section>
            <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">
              Coordonnées
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-[#374151] mb-1">
                  Email <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                  placeholder="patient@email.com"
                  className={`w-full h-9 px-3 rounded-xl border text-[13px] text-[#1A1A2E] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] transition ${errors.email ? "border-[#DC2626]" : "border-[#E8ECF4]"}`}
                />
                {errors.email && <p className="mt-1 text-[11px] text-[#DC2626]">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#374151] mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 00 00 00 00"
                  className="w-full h-9 px-3 rounded-xl border border-[#E8ECF4] text-[13px] text-[#1A1A2E] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#374151] mb-1">
                  NIR (optionnel)
                </label>
                <input
                  type="text"
                  value={nir}
                  onChange={(e) => { setNir(e.target.value); setErrors((p) => ({ ...p, nir: "" })); }}
                  placeholder="1 85 02 75 116 001 23"
                  maxLength={21}
                  className={`w-full h-9 px-3 rounded-xl border text-[13px] text-[#1A1A2E] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] transition ${errors.nir ? "border-[#DC2626]" : "border-[#E8ECF4]"}`}
                />
                {errors.nir && <p className="mt-1 text-[11px] text-[#DC2626]">{errors.nir}</p>}
                <p className="mt-1 text-[10px] text-[#9CA3AF]">Chiffré côté serveur, jamais affiché en clair</p>
              </div>
            </div>
          </section>

          {/* Adresse (collapsible) */}
          <section>
            <button
              type="button"
              onClick={() => setAddressOpen((v) => !v)}
              className="flex items-center gap-2 text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider w-full text-left hover:text-[#5B4EC4] transition"
            >
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${addressOpen ? "rotate-0" : "-rotate-90"}`}
              />
              Adresse
            </button>
            {addressOpen && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#374151] mb-1">
                    Adresse
                  </label>
                  <AddressAutocomplete
                    defaultValue={addressLine1}
                    placeholder="12 rue des Lilas, 75001 Paris"
                    onSelect={(r) => {
                      setAddressLine1(r.name);
                      setPostalCode(r.postcode);
                      setCity(r.city);
                    }}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#374151] mb-1">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="75001"
                      maxLength={10}
                      className="w-full h-9 px-3 rounded-xl border border-[#E8ECF4] text-[13px] text-[#1A1A2E] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#374151] mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Paris"
                      className="w-full h-9 px-3 rounded-xl border border-[#E8ECF4] text-[13px] text-[#1A1A2E] placeholder:text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] transition"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Footer info RGPD */}
          <div className="rounded-xl bg-[#EEEDFB] px-4 py-3 text-[11px] text-[#5B4EC4] leading-relaxed">
            Vous créez la fiche administrative du patient. Aucune donnée clinique
            n&apos;est enregistrée. Un soignant pourra ensuite ouvrir son parcours de
            soin.
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#E8ECF4] bg-[#FAFAF8]">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="h-9 px-4 rounded-xl text-[13px] font-medium text-[#6B7280] hover:text-[#1A1A2E] hover:bg-[#F0F2FA] transition disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={mutation.isPending || !providerPersonId || !email.trim()}
            className="h-9 px-5 rounded-xl text-[13px] font-medium bg-[#5B4EC4] text-white hover:bg-[#4A3DB3] transition disabled:opacity-60 flex items-center gap-2"
            style={{ transition: "all 200ms cubic-bezier(0.16,1,0.3,1)" }}
          >
            {mutation.isPending ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Création…
              </>
            ) : (
              "Créer le patient"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
