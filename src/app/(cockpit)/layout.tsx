"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { onboardingApi } from "@/lib/api";
import { Sidebar } from "@/components/sidebar";
import { Footer } from "@/components/Footer";
import { MailWarning } from "lucide-react";
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
        } else if (!profile.validatedStatus) {
          router.replace("/validation-en-cours");
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

  const emailUnverified = user?.roleType === "PROVIDER" && !user?.emailVerifiedAt;

  return (
    <RecordingProvider>
      <ConsultationProvider>
        {emailUnverified && (
          <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-amber-800 bg-amber-50 border-b border-amber-200">
            <MailWarning className="w-3.5 h-3.5 shrink-0" />
            <span>Veuillez vérifier votre adresse email — consultez votre boîte de réception.</span>
          </div>
        )}
        <div className={`flex h-screen bg-background${emailUnverified ? " pt-9" : ""}`}>
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
            <Footer />
          </div>
        </div>
        <RecordingWidget />
        <ConsultationWidget />
      </ConsultationProvider>
    </RecordingProvider>
  );
}
