"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/panel", label: "Resumen", exact: true },
  { href: "/panel/negocio", label: "Mi negocio" },
  { href: "/panel/productos", label: "Productos" },
  { href: "/panel/categorias", label: "Categorías" },
  { href: "/panel/recompensas", label: "Recompensas" },
  { href: "/panel/descuentos", label: "Descuentos" },
  { href: "/panel/puntos", label: "Puntos" },
  { href: "/panel/qr", label: "Código QR" },
];

export function PanelNav({ hasBusiness }: { hasBusiness: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const disabled = !hasBusiness && item.href !== "/panel" && item.href !== "/panel/negocio";

        return (
          <Link
            key={item.href}
            href={disabled ? "/panel/negocio" : item.href}
            className={cn(
              "whitespace-nowrap rounded px-3.5 py-2.5 text-sm font-medium transition",
              active
                ? "bg-ink-800 text-cream-50"
                : disabled
                ? "text-ink-400/50"
                : "text-ink-600 hover:bg-ink-800/5"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
