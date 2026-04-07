import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nami — Cockpit clinique de coordination des soins",
  description:
    "Nami organise le soin pour qu'il devienne coordonné, anticipable et actionnable. Coordination clinique pluridisciplinaire pour parcours complexes.",
  openGraph: {
    title: "Nami — Cockpit clinique de coordination des soins",
    description:
      "Nami organise le soin pour qu'il devienne coordonné, anticipable et actionnable. Coordination clinique pluridisciplinaire pour parcours complexes.",
    type: "website",
    siteName: "Nami",
    locale: "fr_FR",
    url: "https://nami-web-orpin.vercel.app",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nami — Cockpit clinique de coordination des soins",
    description:
      "Coordination clinique pluridisciplinaire pour parcours de soins complexes.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${jakarta.variable} ${inter.variable} h-full`}>
      <body className="h-full bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
