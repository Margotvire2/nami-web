"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { onboardingApi } from "@/lib/api";
import { Sidebar } from "@/components/sidebar";
import { RecordingProvider } from "@/contexts/RecordingContext";
import { RecordingWidget } from "@/components/RecordingWidget";

export default function CockpitLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!accessToken) router.replace("/login");
  }, [accessToken, router]);

  // Onboarding guard — providers only
  useEffect(() => {
    if (!accessToken || !user) return;
    if (user.roleType !== "PROVIDER") {
      setOnboardingChecked(true);
      return;
    }

    onboardingApi
      .me(accessToken)
      .then(({ profile }) => {
        if (profile.onboardingStep !== "DONE") {
          router.replace("/onboarding");
        } else {
          setOnboardingChecked(true);
        }
      })
      .catch(() => {
        // Si erreur (profil inexistant, etc.), on laisse passer
        setOnboardingChecked(true);
      });
  }, [accessToken, user, router]);

  if (!accessToken || !onboardingChecked) return null;

  return (
    <RecordingProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
      <RecordingWidget />
    </RecordingProvider>
  );
}
