import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogoMark } from "./logo-mark";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 text-ink-900", className)}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-ink-900">
        <LogoMark size={18} />
      </span>
      <span className="font-display text-lg tracking-tight">
        <span className="font-normal text-ink-400">qr</span>
        <span className="font-semibold text-ink-900">cartapp</span>
      </span>
    </Link>
  );
}
