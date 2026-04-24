import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter, Playfair_Display } from "next/font/google";
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

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Nami — Coordination des parcours de soins complexes",
    template: "%s | Nami",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },
  description:
    "Nami coordonne les parcours de soins complexes entre professionnels de santé. TCA, obésité, pédiatrie, nutrition pluridisciplinaire. Annuaire de 564 000+ professionnels en France.",
  keywords: [
    "coordination soins", "parcours de soins", "TCA", "anorexie", "boulimie",
    "obésité", "pédiatrie", "nutrition", "diététicien", "psychologue",
    "adressage médical", "pluridisciplinaire", "APLV", "TDAH", "TSA",
    "annuaire santé", "professionnel de santé", "coordination clinique",
  ],
  authors: [{ name: "Nami", url: "https://namipourlavie.com" }],
  metadataBase: new URL("https://namipourlavie.com"),
  creator: "Nami",
  publisher: "Nami",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nami — Coordination des parcours de soins complexes",
    description:
      "Nami coordonne les parcours de soins complexes entre professionnels de santé. TCA, obésité, pédiatrie, nutrition pluridisciplinaire.",
    type: "website",
    siteName: "Nami",
    locale: "fr_FR",
    url: "https://namipourlavie.com",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nami — Coordination des parcours de soins complexes",
    description:
      "Coordination clinique pluridisciplinaire pour parcours de soins complexes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const globalJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Nami",
  url: "https://namipourlavie.com",
  description: "Coordination des parcours de soins complexes entre professionnels de santé.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://namipourlavie.com/trouver-un-soignant?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "Nami",
    url: "https://namipourlavie.com",
    logo: { "@type": "ImageObject", url: "https://namipourlavie.com/og-default.png" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${jakarta.variable} ${inter.variable} ${playfair.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://nami-production-f268.up.railway.app" />
        <link rel="dns-prefetch" href="https://nami-production-f268.up.railway.app" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }} />
      </head>
      <body className="h-full bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
