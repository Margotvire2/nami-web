"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    if (user && user.roleType !== "PATIENT") {
      router.replace("/aujourd-hui");
    }
  }, [accessToken, user, router]);

  if (!accessToken || !user) return null;

  return (
    <EntityHubProvider>
      <div
        className="min-h-screen bg-[#FAFAF8]"
        style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}
      >
        <PatientHeader />
        <div className="flex">
          <PatientSidebar className="hidden md:flex" />
          <main className="flex-1 pb-24 md:pb-12 px-4 md:px-8 max-w-screen-xl mx-auto w-full">
            {children}
            <PatientLegalFooter />
          </main>
        </div>
        <PatientBottomNav className="md:hidden flex" />
      </div>
    </EntityHubProvider>
  );
}
