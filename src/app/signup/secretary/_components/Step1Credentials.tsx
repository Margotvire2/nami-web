"use client";

// F-SECRETAIRE-SIGNUP-FLOW-V1 — Step 1 : email + mot de passe + CGU.
// Mention explicite du scope d'accès aux dossiers patients via les soignants liés.

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface Step1Values {
  email:        string;
  password:     string;
  acceptedCGU:  boolean;
}

export function Step1Credentials({
  values,
  onChange,
}: {
  values:   Step1Values;
  onChange: <K extends keyof Step1Values>(field: K, value: Step1Values[K]) => void;
}) {
  return (
    <section className="space-y-4">
      <h1
        className="text-2xl font-extrabold"
        style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
      >
        Créez votre compte secrétariat.
      </h1>
      <p className="text-sm" style={{ color: "#6B7280" }}>
        Quelques informations pour démarrer. Les soignants que vous sélectionnerez
        à l&apos;étape suivante devront accepter votre demande de rattachement.
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="secretary-email">Email professionnel</Label>
        <Input
          id="secretary-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="vous@cabinet.fr"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="secretary-password">Mot de passe</Label>
        <Input
          id="secretary-password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => onChange("password", e.target.value)}
          placeholder="8 caractères minimum"
          required
        />
      </div>

      <div
        className="rounded-xl p-4 text-xs leading-relaxed"
        style={{
          background: "#FEF9F0",
          border: "1px solid #FAE6BB",
          color: "#7B4F00",
        }}
      >
        <strong className="block mb-1">Accès aux dossiers patients (RGPD Art. 6.1.b)</strong>
        En tant que secrétaire ou assistant·e médical·e, vous accéderez aux dossiers
        patients des soignants qui auront accepté votre demande de rattachement —
        uniquement pour les fonctions de coordination (rendez-vous, documents,
        messages). Aucun accès clinique direct.
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={values.acceptedCGU}
          onChange={(e) => onChange("acceptedCGU", e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-sm" style={{ color: "#374151" }}>
          J&apos;accepte les{" "}
          <Link
            href="/cgu"
            target="_blank"
            className="font-semibold hover:underline"
            style={{ color: "#5B4EC4" }}
          >
            conditions générales d&apos;utilisation
          </Link>
          {" "}et la{" "}
          <Link
            href="/confidentialite"
            target="_blank"
            className="font-semibold hover:underline"
            style={{ color: "#5B4EC4" }}
          >
            politique de confidentialité
          </Link>
          .
        </span>
      </label>
    </section>
  );
}

export function step1Valid(v: Step1Values): boolean {
  return (
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email) &&
    v.password.length >= 8 &&
    v.acceptedCGU
  );
}
