import { ShieldCheck, BadgeCheck, MapPin, Video } from "lucide-react";
import type { PublicProviderDetail } from "@/lib/api";

interface ProviderHeroProps {
  provider: PublicProviderDetail;
}

export function ProviderHero({ provider }: ProviderHeroProps) {
  const initials =
    `${provider.firstName.charAt(0)}${provider.lastName.charAt(0)}`.toUpperCase();
  const primarySpecialty =
    provider.specialties[0] ?? provider.publicSpecialties[0] ?? null;
  const subSpecialties = provider.subSpecialties.slice(0, 3);

  return (
    <header
      className="relative overflow-hidden rounded-2xl p-6 md:p-10"
      style={{
        background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 100% 0%, rgba(255,255,255,0.15) 0%, rgba(91,78,196,0) 70%)",
        }}
      />

      <div className="relative flex flex-col md:flex-row gap-6 items-start">
        {/* Avatar */}
        <div
          className="shrink-0 flex items-center justify-center rounded-2xl"
          style={{
            width: 96,
            height: 96,
            background: "rgba(255,255,255,0.18)",
            border: "2px solid rgba(255,255,255,0.30)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            fontSize: 32,
            fontWeight: 700,
            fontFamily: "var(--font-jakarta)",
            letterSpacing: "-0.02em",
          }}
          aria-hidden="true"
        >
          {provider.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={provider.photoUrl}
              alt=""
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            initials
          )}
        </div>

        {/* Identité */}
        <div className="flex-1 min-w-0 text-white">
          <h1
            className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2"
            style={{
              fontFamily: "var(--font-jakarta)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            {provider.firstName} {provider.lastName}
          </h1>

          {primarySpecialty && (
            <p
              className="text-base md:text-lg font-medium mb-3"
              style={{ color: "rgba(255,255,255,0.92)" }}
            >
              {primarySpecialty}
            </p>
          )}

          {subSpecialties.length > 0 && (
            <ul className="flex flex-wrap gap-2 mb-4" aria-label="Spécialités complémentaires">
              {subSpecialties.map((sub) => (
                <li
                  key={sub}
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.14)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
                >
                  {sub}
                </li>
              ))}
            </ul>
          )}

          <div
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            {provider.consultationCity && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} aria-hidden="true" />
                {provider.consultationCity}
              </span>
            )}
            {provider.teleconsultAvailable && (
              <span className="inline-flex items-center gap-1.5">
                <Video size={14} aria-hidden="true" />
                Téléconsultation
              </span>
            )}
            {provider.badges.rppsVerified && (
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} aria-hidden="true" />
                RPPS vérifié
              </span>
            )}
            {provider.badges.competenceVerified && (
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck size={14} aria-hidden="true" />
                Compétences attestées
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
