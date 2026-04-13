import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-neutral-100 bg-white py-4 px-6 shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-400">
        <span>Nami · Coordination des soins pluridisciplinaires</span>
        <div className="flex items-center gap-3">
          <Link href="/cgu" className="hover:text-neutral-600 transition-colors">CGU</Link>
          <span>·</span>
          <Link href="/confidentialite" className="hover:text-neutral-600 transition-colors">Confidentialité</Link>
          <span>·</span>
          <Link href="/mentions-legales" className="hover:text-neutral-600 transition-colors">Mentions légales</Link>
          <span>·</span>
          <a href="mailto:contact@namipourlavie.com" className="hover:text-neutral-600 transition-colors">Contact</a>
        </div>
        <span>© 2026 Nami</span>
      </div>
    </footer>
  )
}
