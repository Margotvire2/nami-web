"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { onboardingApi } from "@/lib/api";
import { Sidebar } from "@/components/sidebar";
import { RecordingProvider } from "@/contexts/RecordingContext";
import { RecordingWidget } from "@/components/RecordingWidget";
import { ConsultationProvider } from "@/contexts/ConsultationContext";
import { ConsultationWidget } from "@/components/consultation/ConsultationWidget";

export default function CockpitLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!accessToken) router.replace("/login");
    else if (user?.roleType === "PATIENT") router.replace("/accueil");
  }, [accessToken, user, router]);

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
      <ConsultationProvider>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        <RecordingWidget />
        <ConsultationWidget />
      </ConsultationProvider>
    </RecordingProvider>
  );
}
