import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "font-display text-xl italic tracking-tight text-ink-800",
        className
      )}
    >
      Fideliza
    </Link>
  );
}
