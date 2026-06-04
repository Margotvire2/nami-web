"use client";

// F-SECRETAIRE-SIGNUP-FLOW-V1 — Step 2 : identité + contact.

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface Step2Values {
  firstName: string;
  lastName:  string;
  phone:     string;
  city:      string;
}

export function Step2Profile({
  values,
  onChange,
}: {
  values:   Step2Values;
  onChange: <K extends keyof Step2Values>(field: K, value: Step2Values[K]) => void;
}) {
  return (
    <section className="space-y-4">
      <h2
        className="text-xl font-extrabold"
        style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
      >
        Qui êtes-vous ?
      </h2>
      <p className="text-sm" style={{ color: "#6B7280" }}>
        Ces informations seront partagées avec les soignants à qui vous demandez
        un rattachement.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="secretary-firstName">Prénom</Label>
          <Input
            id="secretary-firstName"
            value={values.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="secretary-lastName">Nom</Label>
          <Input
            id="secretary-lastName"
            value={values.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="secretary-phone">
          Téléphone <span style={{ color: "#B0B0BA", fontWeight: 400 }}>(optionnel)</span>
        </Label>
        <Input
          id="secretary-phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="06 12 34 56 78"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="secretary-city">
          Ville <span style={{ color: "#B0B0BA", fontWeight: 400 }}>(optionnel)</span>
        </Label>
        <Input
          id="secretary-city"
          value={values.city}
          onChange={(e) => onChange("city", e.target.value)}
          placeholder="Paris, Lyon, ..."
        />
      </div>
    </section>
  );
}

export function step2Valid(v: Step2Values): boolean {
  return v.firstName.trim().length > 0 && v.lastName.trim().length > 0;
}
