"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPostHog, posthog } from "@/lib/posthog";
import { useAuthStore } from "@/lib/store";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const identified = useRef(false);

  // Init une seule fois
  useEffect(() => {
    initPostHog();
  }, []);

  // Identify dès que l'utilisateur est authentifié
  useEffect(() => {
    if (!user) {
      if (identified.current) {
        posthog.reset();
        identified.current = false;
      }
      return;
    }
    if (identified.current) return;
    posthog.identify(user.id, {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleType: user.roleType,
      specialties: user.providerProfile?.specialties ?? [],
    });
    identified.current = true;
  }, [user]);

  // Pageview à chaque changement de route
  useEffect(() => {
    if (!pathname) return;
    posthog.capture("$pageview", {
      $current_url: window.location.href,
    });
  }, [pathname, searchParams]);

  return <>{children}</>;
}
