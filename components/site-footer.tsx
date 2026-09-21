import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink-800/10">
      <div className="container-prose flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
        <div>
          <Logo />
          <p className="mt-2 max-w-sm text-sm text-ink-400">
            Puntos, recompensas y descuentos de los comercios de tu barrio, en un solo lugar.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-ink-600">
          <Link href="/explorar" className="link-underline">
            Explorar
          </Link>
          <Link href="/registro?rol=comercio" className="link-underline">
            Sumar mi comercio
          </Link>
        </div>
      </div>
    </footer>
  );
}
