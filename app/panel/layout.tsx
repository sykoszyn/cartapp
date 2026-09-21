import Link from "next/link";
import { requireBusinessProfile, getMyBusiness } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/lib/button-styles";
import { signOutAction } from "@/app/(auth)/actions";
import { PanelNav } from "./panel-nav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireBusinessProfile();
  const business = await getMyBusiness();

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-800/10">
        <div className="container-prose flex h-20 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-5">
            <span className="hidden text-sm text-ink-400 sm:inline">
              {business?.name ?? profile.full_name}
            </span>
            <Link href="/" className="link-underline text-sm text-ink-600">
              Ver sitio
            </Link>
            <form action={signOutAction}>
              <button className={buttonVariants({ variant: "outline", size: "sm" })}>
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="container-prose grid gap-10 py-10 lg:grid-cols-[220px,1fr]">
        <PanelNav hasBusiness={!!business} />
        <main>{children}</main>
      </div>
    </div>
  );
}
