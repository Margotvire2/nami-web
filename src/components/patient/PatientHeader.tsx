"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type SwitchableProfile } from "@/lib/api";
import { usePatientNotifications } from "@/hooks/usePatientNotifications";
import { ProfileSwitcher } from "./ProfileSwitcher";
import { PatientAvatarMenu } from "./PatientAvatarMenu";
import { PatientNotificationsPanel } from "./PatientNotificationsPanel";

export function PatientHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const [notifsOpen, setNotifsOpen] = useState(false);
  const { data: notifsData } = usePatientNotifications({ limit: 20 });
  const unreadCount = notifsData?.unreadCount ?? 0;
  const notifItems = notifsData?.items ?? [];

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

          {/* Zone 3 — Bell + ProfileSwitcher + Avatar */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="relative">
              <button
                type="button"
                aria-label={
                  unreadCount > 0
                    ? `Notifications (${unreadCount} non lue${unreadCount > 1 ? "s" : ""})`
                    : "Notifications"
                }
                aria-expanded={notifsOpen}
                aria-haspopup="dialog"
                onClick={() => setNotifsOpen((o) => !o)}
                className="relative p-2 rounded-full text-[#6B7280] hover:bg-[rgba(91,78,196,0.08)] hover:text-[#5B4EC4] transition-colors"
              >
                <Bell className="w-5 h-5" strokeWidth={1.8} />
                {unreadCount > 0 && (
                  <span
                    aria-live="polite"
                    className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notifsOpen && (
                <PatientNotificationsPanel
                  items={notifItems}
                  unreadCount={unreadCount}
                  onClose={() => setNotifsOpen(false)}
                />
              )}
            </div>

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
