import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/lib/button-styles";
import { signOutAction } from "@/app/(auth)/actions";

export async function SiteHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="border-b border-ink-800/10">
      <div className="container-prose flex h-20 items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/explorar" className="link-underline hidden text-ink-600 sm:inline">
            Explorar comercios
          </Link>

          {!profile && (
            <>
              <Link href="/ingresar" className="link-underline text-ink-600">
                Ingresar
              </Link>
              <Link href="/registro" className={buttonVariants({ size: "sm" })}>
                Crear cuenta
              </Link>
            </>
          )}

          {profile?.role === "customer" && (
            <>
              <Link href="/cuenta" className="link-underline text-ink-600">
                Mi cuenta
              </Link>
              <form action={signOutAction}>
                <button className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Salir
                </button>
              </form>
            </>
          )}

          {profile?.role === "business" && (
            <>
              <Link href="/panel" className="link-underline text-ink-600">
                Mi panel
              </Link>
              <form action={signOutAction}>
                <button className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Salir
                </button>
              </form>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
