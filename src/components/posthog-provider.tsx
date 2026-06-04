"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPostHog, posthog } from "@/lib/posthog";
import { useAuthStore } from "@/lib/store";
import { useCookieConsent } from "@/hooks/useCookieConsent";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const { consent, hasHydrated } = useCookieConsent();
  const identified = useRef(false);

  // F-WEB-COOKIE-BANNER-GDPR-V1 : ne tente l'init qu'une fois le consent
  // hydraté ET accordé. Re-déclenché si l'utilisateur accepte pendant la
  // session (consent.analytics passe de false → true).
  useEffect(() => {
    if (!hasHydrated) return;
    if (!consent.analytics) return;
    initPostHog();
  }, [hasHydrated, consent.analytics]);

  // Identify dès que l'utilisateur est authentifié — uniquement si consent.
  useEffect(() => {
    if (!hasHydrated || !consent.analytics) return;
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
  }, [user, hasHydrated, consent.analytics]);

  // Pageview à chaque changement de route — uniquement si consent.
  useEffect(() => {
    if (!pathname) return;
    if (!hasHydrated || !consent.analytics) return;
    if (!posthog.__loaded) return;
    posthog.capture("$pageview", {
      $current_url: window.location.href,
    });
  }, [pathname, searchParams, hasHydrated, consent.analytics]);

  return <>{children}</>;
}
