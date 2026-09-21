import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container-prose flex h-20 items-center justify-between">
        <Logo />
        <Link href="/" className="link-underline text-sm text-ink-600">
          Volver al inicio
        </Link>
      </div>
      <main className="flex flex-1 items-center justify-center px-6 pb-24">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
