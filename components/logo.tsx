import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2 text-ink-900", className)}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-ink-900 font-display text-sm font-semibold text-cream-50">
        F
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">Fideliza</span>
    </Link>
  );
}
