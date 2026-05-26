import Link from "next/link";
import { ArrowLeft, MapPin, Video } from "lucide-react";
import type { BookingProviderHero } from "./page";

export default function BookingHero({ provider }: { provider: BookingProviderHero }) {
  const initials = `${provider.firstName[0] ?? ""}${provider.lastName[0] ?? ""}`.toUpperCase();
  return (
    <header className="bg-white border-b border-[rgba(26,26,46,0.06)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href={`/trouver-un-soignant/${provider.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Retour au profil
        </Link>

        <div className="flex items-start gap-4">
          <div
            aria-hidden="true"
            className="shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-[#5B4EC4] to-[#2BA89C] flex items-center justify-center text-white font-semibold text-xl overflow-hidden"
          >
            {provider.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={provider.photoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1A1A2E]">
              Demande de rendez-vous
            </h1>
            <p className="mt-1 text-base text-[#374151]">
              avec <strong className="font-semibold">{provider.firstName} {provider.lastName}</strong>
              {" — "}
              <span className="text-[#6B7280]">{provider.specialty}</span>
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[#6B7280]">
              {provider.city && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  {provider.city}
                </span>
              )}
              {provider.teleconsultAvailable && (
                <span className="inline-flex items-center gap-1.5">
                  <Video className="w-4 h-4" aria-hidden="true" />
                  Téléconsultation possible
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
