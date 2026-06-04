import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LifeBuoy } from "lucide-react";

export const metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: false },
};

/**
 * F-WEB-PAGES-404-500-CUSTOM-ERROR-BOUNDARIES
 *
 * Page 404 patient-friendly. Pas de stack trace, pas de wording MDR.
 * Mascot Nami (asset /nami-mascot.png) + CTAs vers accueil et support.
 */
export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#FAFAF8" }}
    >
      <div
        className="bg-white rounded-2xl p-10 max-w-md w-full text-center"
        style={{ border: "1px solid rgba(26,26,46,0.06)", boxShadow: "0 10px 40px rgba(26,26,46,0.06)" }}
      >
        {/* Mascot Nami */}
        <div className="flex justify-center mb-6">
          <Image
            src="/nami-mascot.png"
            alt="Nami"
            width={72}
            height={72}
            style={{ width: 72, height: 72, borderRadius: 18, objectFit: "contain" }}
          />
        </div>

        <p
          className="text-5xl font-extrabold mb-3"
          style={{
            fontFamily: "var(--font-jakarta), system-ui",
            background: "linear-gradient(135deg, #5B4EC4, #2BA89C)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </p>

        <h1
          className="text-xl font-bold mb-2"
          style={{ fontFamily: "var(--font-jakarta), system-ui", color: "#1A1A2E" }}
        >
          Cette page n&apos;existe pas ou a été déplacée
        </h1>
        <p className="text-sm mb-8" style={{ color: "#6B7280" }}>
          Le lien que vous avez suivi semble incorrect. Revenez à votre accueil ou contactez-nous si besoin.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
            style={{ backgroundColor: "#5B4EC4", color: "#FFFFFF" }}
          >
            <ArrowLeft size={14} /> Retour à mon accueil
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-2"
            style={{ backgroundColor: "#EEEDFB", color: "#5B4EC4" }}
          >
            <LifeBuoy size={14} /> Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
