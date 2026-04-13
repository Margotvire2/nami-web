import type { ReactNode } from "react";
import Link from "next/link";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F0F2FA]">
      <header className="bg-white border-b border-[#E8ECF4]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#4F46E5]">Nami</span>
            <span className="text-xs text-gray-400 font-normal">— Orchestration des parcours de soins</span>
          </Link>
          <nav className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="/cgu" className="hover:text-[#4F46E5] transition-colors">CGU</Link>
            <Link href="/confidentialite" className="hover:text-[#4F46E5] transition-colors">Confidentialité</Link>
            <Link href="/mentions-legales" className="hover:text-[#4F46E5] transition-colors">Mentions légales</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-10">
        {children}
      </main>
      <footer className="border-t border-[#E8ECF4] bg-white mt-16">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Nami — Tous droits réservés</span>
          <div className="flex gap-4">
            <Link href="/cgu" className="hover:text-[#4F46E5]">CGU</Link>
            <Link href="/confidentialite" className="hover:text-[#4F46E5]">Confidentialité</Link>
            <Link href="/mentions-legales" className="hover:text-[#4F46E5]">Mentions légales</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
