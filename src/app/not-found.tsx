import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F2F8]">
      <div className="bg-white rounded-2xl p-10 max-w-md text-center">
        <p
          className="text-6xl font-extrabold text-[#E2E8F0] mb-4"
          style={{ fontFamily: "var(--font-jakarta), system-ui" }}
        >
          404
        </p>
        <h1
          className="text-xl font-bold text-[#1E293B] mb-2"
          style={{ fontFamily: "var(--font-jakarta), system-ui" }}
        >
          Page introuvable
        </h1>
        <p className="text-sm text-[#64748B] mb-8">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="bg-[#4F46E5] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#3B55E0] transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
