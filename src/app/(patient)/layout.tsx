"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { PatientHeader } from "@/components/patient/PatientHeader";
import { PatientSidebar } from "@/components/patient/PatientSidebar";
import { PatientBottomNav } from "@/components/patient/PatientBottomNav";
import { PatientLegalFooter } from "@/components/patient/PatientLegalFooter";
import { EntityHubProvider } from "@/contexts/EntityHubContext";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Attend la fin de la rehydratation Zustand persist avant tout guard.
  // Sans ce flag, le useEffect fire au 1er render avec accessToken=null
  // (état initial du store, avant que persist ait lu localStorage) et déclenche
  // router.replace('/login') à tort sur cold-load de /parcours, /accueil, etc.
  // Pattern aligné avec src/app/(cockpit)/layout.tsx et (structure)/layout.tsx.
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() =>
      setHasHydrated(true),
    );
    return unsub;
  }, []);

  // Auth guard — gated sur hasHydrated
  useEffect(() => {
    if (!hasHydrated) return;
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    if (user && user.roleType !== "PATIENT") {
      router.replace("/aujourd-hui");
    }
  }, [hasHydrated, accessToken, user, router]);

  if (!hasHydrated || !accessToken || !user) return null;

  return (
    <EntityHubProvider>
      <div
        className="min-h-screen bg-[var(--nami-bg)]"
        style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}
      >
        <PatientHeader />
        <div className="flex">
          <PatientSidebar className="hidden md:flex" />
          <main className="flex-1 pb-24 md:pb-12 px-4 md:px-8 min-w-0">
            <Suspense fallback={null}>
              {children}
            </Suspense>
            <PatientLegalFooter />
          </main>
        </div>
        <PatientBottomNav className="md:hidden flex" />
      </div>
    </EntityHubProvider>
  );
}
