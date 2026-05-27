import { MapPin, Building2 } from "lucide-react";
import type { PublicProviderDetail } from "@/lib/api";

interface ProviderAddressesCardProps {
  provider: PublicProviderDetail;
}

export function ProviderAddressesCard({ provider }: ProviderAddressesCardProps) {
  const hasStructures = provider.structures.length > 0;
  const hasConsultationCity =
    !!provider.consultationCity || !!provider.consultationPostalCode;

  return (
    <section
      aria-labelledby="provider-addresses-title"
      className="rounded-2xl p-6 md:p-8"
      style={{
        background: "#fff",
        border: "1px solid rgba(26,26,46,0.06)",
        boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
      }}
    >
      <h2
        id="provider-addresses-title"
        className="text-lg md:text-xl font-bold mb-4"
        style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
      >
        Lieux de consultation
      </h2>

      {!hasStructures && !hasConsultationCity && (
        <p className="text-sm italic" style={{ color: "#9CA3AF" }}>
          Aucun lieu de consultation public renseigné.
        </p>
      )}

      {hasStructures && (
        <ul className="flex flex-col gap-3">
          {provider.structures.map((s, i) => (
            <li
              key={`${s.name}-${i}`}
              className="flex items-start gap-3 rounded-xl p-4"
              style={{
                background: "#FAFAF8",
                border: "1px solid rgba(26,26,46,0.04)",
              }}
            >
              <div
                className="shrink-0 flex items-center justify-center rounded-lg"
                style={{
                  width: 36,
                  height: 36,
                  background: "rgba(91,78,196,0.10)",
                  color: "#5B4EC4",
                }}
                aria-hidden="true"
              >
                <Building2 size={16} />
              </div>
              <div className="flex-1 text-sm">
                <p
                  className="font-semibold"
                  style={{ color: "#1A1A2E" }}
                >
                  {s.name}
                </p>
                {s.type && (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "#6B7280" }}
                  >
                    {s.type}
                  </p>
                )}
                {s.addressLine1 && (
                  <p className="mt-1" style={{ color: "#374151" }}>
                    {s.addressLine1}
                  </p>
                )}
                {(s.postalCode || s.city) && (
                  <p style={{ color: "#6B7280" }}>
                    {[s.postalCode, s.city].filter(Boolean).join(" ")}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!hasStructures && hasConsultationCity && (
        <div className="flex items-start gap-3 text-sm">
          <MapPin
            size={16}
            aria-hidden="true"
            className="shrink-0 mt-0.5"
            style={{ color: "#5B4EC4" }}
          />
          <span style={{ color: "#374151" }}>
            {[provider.consultationPostalCode, provider.consultationCity]
              .filter(Boolean)
              .join(" ")}
          </span>
        </div>
      )}
    </section>
  );
}
