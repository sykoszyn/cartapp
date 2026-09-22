import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-ink-200 bg-cream-50 shadow-card", className)}
      {...props}
    />
  );
}

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "olive" | "rust" }) {
  const variants = {
    default: "bg-ink-100 text-ink-600",
    olive: "bg-olive-100 text-olive-600",
    rust: "bg-rust-100 text-rust-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-1 text-[0.7rem] font-medium uppercase tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
