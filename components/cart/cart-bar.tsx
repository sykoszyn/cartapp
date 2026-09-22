"use client";

import Link from "next/link";
import { useCart } from "./cart-context";
import { formatCurrency } from "@/lib/utils";

export function CartBar({ slug }: { slug: string }) {
  const { count, subtotal } = useCart();

  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-200 bg-cream-50 p-3 shadow-card print:hidden">
      <Link
        href={`/negocio/${slug}/carrito`}
        className="mx-auto flex max-w-md items-center justify-between rounded bg-ink-900 px-5 py-3 text-cream-50"
      >
        <span className="text-sm font-medium">
          Ver pedido · {count} producto{count === 1 ? "" : "s"}
        </span>
        <span className="font-mono text-sm">{formatCurrency(subtotal)}</span>
      </Link>
    </div>
  );
}
