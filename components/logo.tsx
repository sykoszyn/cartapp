import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 text-ink-900", className)}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-ink-900 p-[5px]">
        <span className="flex h-full w-full items-center justify-center rounded-[1px] bg-cream-50 p-[3px]">
          <span className="h-full w-full rounded-[0.5px] bg-ink-900" />
        </span>
      </span>
      <span className="font-display text-lg tracking-tight">
        <span className="font-normal text-ink-400">qr</span>
        <span className="font-semibold text-ink-900">cartapp</span>
      </span>
    </Link>
  );
}
