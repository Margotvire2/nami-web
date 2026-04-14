import type { ReactNode } from "react";
import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#FAFAF8" }}>
      <PublicNavbar />
      <main style={{ flex: 1, maxWidth: 800, width: "100%", margin: "0 auto", padding: "60px 24px 80px" }}>
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
