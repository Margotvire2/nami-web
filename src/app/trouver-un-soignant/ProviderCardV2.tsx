"use client";

import Link from "next/link";
import {
  MapPin,
  Video,
  Phone,
  Building2,
  Check,
  ArrowRight,
  CalendarPlus,
} from "lucide-react";
import type { PublicProvider } from "@/lib/api";

interface ProviderCardV2Props {
  provider: PublicProvider;
  specialtyLabel: string;
}

/**
 * Construit le slug attendu par la route GET /providers/public/:slug
 * (backend src/routes/providers.ts) :
 *   `${firstName}-${lastName}-${providerId.slice(-6)}`
 */
function buildProviderSlug(provider: PublicProvider): string {
  return (
    `${provider.person.firstName}-${provider.person.lastName}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-") + `-${provider.id.slice(-6)}`
  );
}

export function ProviderCardV2({ provider, specialtyLabel }: ProviderCardV2Props) {
  const slug = buildProviderSlug(provider);
  const profileHref = `/trouver-un-soignant/${slug}`;
  const bookingHref = `${profileHref}/booking`;
  const structure = provider.structures[0];
  const initials = `${provider.person.firstName.charAt(
    0
  )}${provider.person.lastName.charAt(0)}`.toUpperCase();

  return (
    <article
      className="rounded-2xl p-5 flex flex-col gap-4 transition-shadow hover:shadow-lg"
      style={{
        background: "#fff",
        border: "1px solid rgba(26,26,46,0.07)",
        boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
      }}
    >
      {/* Bloc identité + lien profil */}
      <Link
        href={profileHref}
        className="flex items-start gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2 rounded-xl -m-1 p-1"
        aria-label={`Voir le profil de ${provider.person.firstName} ${provider.person.lastName}`}
      >
        <div
          className="shrink-0 flex items-center justify-center rounded-full text-sm font-bold"
          style={{
            width: 48,
            height: 48,
            background: "linear-gradient(135deg, #5B4EC4 0%, #2BA89C 100%)",
            color: "#fff",
            fontFamily: "var(--font-jakarta)",
          }}
          aria-hidden="true"
        >
          {provider.person.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={provider.person.photoUrl}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold transition-colors group-hover:text-[#5B4EC4]"
            style={{ color: "#1A1A2E" }}
          >
            {provider.person.firstName} {provider.person.lastName}
          </p>
          <p className="text-xs" style={{ color: "#6B7280" }}>
            {specialtyLabel}
          </p>

          {structure && (
            <p
              className="text-[11px] mt-1 inline-flex items-center gap-1"
              style={{ color: "#6B7280" }}
            >
              <Building2 size={10} aria-hidden="true" />
              {structure.name}
              {structure.city ? ` · ${structure.city}` : ""}
            </p>
          )}
        </div>
      </Link>

      {/* Pictos modes consultation + acceptation */}
      <ul
        className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]"
        style={{ color: "#374151" }}
        aria-label="Caractéristiques du soignant"
      >
        {provider.acceptsTele && (
          <li className="inline-flex items-center gap-1">
            <Video size={11} aria-hidden="true" style={{ color: "#5B4EC4" }} />
            Téléconsultation
          </li>
        )}
        {structure?.address && (
          <li className="inline-flex items-center gap-1">
            <MapPin size={11} aria-hidden="true" style={{ color: "#5B4EC4" }} />
            Présentiel
          </li>
        )}
        <li className="inline-flex items-center gap-1">
          <Phone size={11} aria-hidden="true" style={{ color: "#5B4EC4" }} />
          Sur RDV
        </li>
        {provider.acceptsNewPatients && (
          <li
            className="inline-flex items-center gap-1 font-medium"
            style={{ color: "#059669" }}
          >
            <Check size={11} aria-hidden="true" />
            Nouveaux patients
          </li>
        )}
      </ul>

      {/* Bio courte */}
      {provider.bio && (
        <p
          className="text-[11px] line-clamp-2"
          style={{ color: "#6B7280", lineHeight: 1.5 }}
        >
          {provider.bio}
        </p>
      )}

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-2 mt-auto">
        <Link
          href={bookingHref}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2 flex-1"
          style={{ background: "#5B4EC4", color: "#fff" }}
        >
          <CalendarPlus size={12} aria-hidden="true" />
          Prendre RDV
        </Link>
        <Link
          href={profileHref}
          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full text-xs font-semibold transition-colors hover:bg-[rgba(91,78,196,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2 flex-1"
          style={{
            color: "#5B4EC4",
            border: "1px solid rgba(91,78,196,0.30)",
          }}
        >
          Voir le profil
          <ArrowRight size={11} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
