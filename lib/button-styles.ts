import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded font-medium transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-800/20";

  const variants: Record<Variant, string> = {
    primary: "bg-ink-900 text-cream-50 hover:bg-ink-800",
    secondary: "bg-rust-500 text-ink-900 hover:bg-rust-600",
    outline: "border border-ink-200 text-ink-800 hover:border-ink-800 bg-transparent",
    ghost: "text-ink-600 hover:bg-ink-100",
  };

  const sizes: Record<Size, string> = {
    sm: "text-sm px-3.5 py-1.5",
    md: "text-[0.95rem] px-5 py-2.5",
    lg: "text-base px-7 py-3.5",
  };

  return cn(base, variants[variant], sizes[size], className);
}
