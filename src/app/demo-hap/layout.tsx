import { PublicFooter } from "@/components/public/PublicFooter";

// Pas de PublicNavbar : la page injecte HAPNav comme header contextuel
// (micro-site démo Hôpital Américain de Paris). Doctrine F-UX-DOUBLE-LOGO :
// un seul header par page.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PublicFooter />
    </>
  );
}

