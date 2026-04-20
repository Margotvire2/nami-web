import { PublicNavbar } from "@/components/public/PublicNavbar";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNavbar />
      {children}
      <PublicFooter />
    </>
  );
}

