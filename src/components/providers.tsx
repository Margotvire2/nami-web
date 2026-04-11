"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { useState, useEffect, useRef, Suspense } from "react";
import { useNamiStore } from "@/lib/nami-store";
import { getInitialData } from "@/lib/nami-store/initialData";
import { PostHogProvider } from "@/components/posthog-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      })
  );

  // Initialize the Nami store with mock data — once
  const initialized = useRef(false);
  const initializeStore = useNamiStore((s) => s.initializeStore);
  useEffect(() => {
    if (!initialized.current) {
      initializeStore(getInitialData());
      initialized.current = true;
    }
  }, [initializeStore]);

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense>
        <PostHogProvider>
          {children}
          <Toaster richColors position="top-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </PostHogProvider>
      </Suspense>
    </QueryClientProvider>
  );
}
