"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/panel", label: "Resumen", exact: true },
  { href: "/panel/analytics", label: "Estadísticas" },
  { href: "/panel/negocio", label: "Mi negocio" },
  { href: "/panel/productos", label: "Productos" },
  { href: "/panel/categorias", label: "Categorías" },
  { href: "/panel/pedidos", label: "Pedidos" },
  { href: "/panel/recompensas", label: "Recompensas" },
  { href: "/panel/descuentos", label: "Descuentos" },
  { href: "/panel/puntos", label: "Puntos" },
  { href: "/panel/pagos", label: "Pagos" },
  { href: "/panel/qr", label: "Código QR" },
];

export function PanelNav({ hasBusiness }: { hasBusiness: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const activeItem = items.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded border border-ink-200 bg-cream-50 px-4 py-3 text-sm font-medium text-ink-900 lg:hidden"
        aria-expanded={open}
      >
        {activeItem?.label ?? "Menú"}
        <span className={cn("text-ink-400 transition-transform", open && "rotate-180")}>▾</span>
      </button>

      <nav
        className={cn(
          "mt-2 flex-col gap-1 rounded border border-ink-200 bg-cream-50 p-1 lg:mt-0 lg:flex lg:border-none lg:bg-transparent lg:p-0",
          open ? "flex" : "hidden lg:flex"
        )}
      >
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
    </div>
  );
}
