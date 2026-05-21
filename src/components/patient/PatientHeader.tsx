"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type SwitchableProfile } from "@/lib/api";
import { ProfileSwitcher } from "./ProfileSwitcher";
import { PatientAvatarMenu } from "./PatientAvatarMenu";

export function PatientHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const { data: profiles } = useQuery<SwitchableProfile[]>({
    queryKey: ["patient-switchable-profiles"],
    queryFn: () => apiWithToken(accessToken!).patient.switchableProfiles(),
    enabled: !!accessToken,
  });

  const selfProfile = profiles?.find((p) => p.isSelf) ?? null;
  const urlProfileId = searchParams.get("profile");
  const currentProfileId = urlProfileId ?? selfProfile?.personId ?? null;
  const activeProfile = profiles?.find((p) => p.personId === currentProfileId) ?? null;

  function handleSwitch(personId: string) {
    const params = new URLSearchParams(searchParams);
    if (selfProfile && personId === selfProfile.personId) {
      params.delete("profile");
    } else {
      params.set("profile", personId);
    }
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : window.location.pathname);
  }

  if (!user) return null;

  return (
    <>
      <header
        className="sticky top-0 z-40 h-16 border-b border-[rgba(26,26,46,0.06)] bg-white/85 backdrop-blur-md"
        aria-label="En-tête patient"
      >
        <div className="flex h-full items-center justify-between gap-4 px-4 md:px-8 max-w-screen-xl mx-auto">
          {/* Zone 1 — Mascotte + Logo */}
          <Link
            href="/accueil"
            className="flex items-center gap-2 shrink-0"
            aria-label="Retour à l'accueil"
          >
            <Image
              src="/nami-mascot.png"
              alt="Mascotte Nami"
              width={36}
              height={36}
              priority
              className="rounded-lg"
            />
            <span className="text-lg font-extrabold tracking-tight text-[#5B4EC4]">
              Nami
            </span>
          </Link>

          {/* Zone 2 — Recherche placeholder (desktop only, non-fonctionnelle V1) */}
          {/* TODO F6.3-CONTEXTUAL-SEARCH P2 */}
          <input
            type="text"
            placeholder="Rechercher..."
            disabled
            aria-label="Recherche (bientôt disponible)"
            className="hidden md:block flex-1 max-w-md bg-[#F5F3EF] rounded-xl px-4 py-2 text-sm text-[#6B7280] cursor-not-allowed border border-transparent focus:outline-none"
          />

          {/* Zone 3 — Bell + ProfileSwitcher + Avatar */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* TODO F-NOTIF-PATIENT-FEED-ENDPOINT P1
                Placeholder Bell static — pas d'endpoint patient dédié (cf. Phase 0 F6) */}
            <button
              type="button"
              aria-label="Notifications (bientôt disponible)"
              disabled
              className="p-2 rounded-full text-[#6B7280] hover:bg-[rgba(91,78,196,0.08)] hover:text-[#5B4EC4] transition-colors cursor-not-allowed opacity-60"
            >
              <Bell className="w-5 h-5" strokeWidth={1.8} />
            </button>

            {profiles && profiles.length > 1 && currentProfileId && (
              <div className="hidden md:block">
                <ProfileSwitcher
                  profiles={profiles}
                  currentPersonId={currentProfileId}
                  onSwitch={handleSwitch}
                />
              </div>
            )}

            <PatientAvatarMenu firstName={user.firstName} lastName={user.lastName} />
          </div>
        </div>
      </header>

      {/* Banner contextuel délégation — affiché si profil actif ≠ self */}
      {activeProfile && !activeProfile.isSelf && (
        <div
          role="status"
          className="bg-[rgba(91,78,196,0.08)] border-b border-[rgba(91,78,196,0.16)] px-4 py-2 text-sm text-[#5B4EC4] text-center"
        >
          Vous consultez l&apos;espace de{" "}
          <strong className="font-bold">{activeProfile.firstName}</strong>
        </div>
      )}
    </>
  );
}
