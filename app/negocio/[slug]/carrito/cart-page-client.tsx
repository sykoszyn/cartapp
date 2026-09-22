"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-context";
import { checkoutAction } from "./actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Business } from "@/lib/types";

export function CartPageClient({ business }: { business: Business }) {
  const { items, setQuantity, removeItem, subtotal, clear } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink-200 p-10 text-center">
        <p className="text-ink-400">Todavía no agregaste nada.</p>
        <Link
          href={`/negocio/${business.slug}`}
          className="link-underline mt-3 inline-block font-medium text-ink-900"
        >
          Ver el menú →
        </Link>
      </div>
    );
  }

  const handleCheckout = () => {
    setError(null);
    startTransition(async () => {
      const result = await checkoutAction(
        business.id,
        business.slug,
        items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      clear();

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }

      if (result.orderId) {
        router.push(`/negocio/${business.slug}/pedido/${result.orderId}`);
      }
    });
  };

  return (
    <div>
      <Card className="divide-y divide-ink-200">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 p-4">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-ink-100">
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-ink-900">{item.name}</p>
              <p className="text-sm text-ink-400">{formatCurrency(item.price)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="flex h-7 w-7 items-center justify-center rounded border border-ink-200 text-ink-600 hover:text-ink-900"
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                aria-label="Restar"
              >
                −
              </button>
              <span className="w-5 text-center font-mono text-sm">{item.quantity}</span>
              <button
                className="flex h-7 w-7 items-center justify-center rounded border border-ink-200 text-ink-600 hover:text-ink-900"
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                aria-label="Sumar"
              >
                +
              </button>
            </div>
            <button
              className="text-xs text-danger-600"
              onClick={() => removeItem(item.productId)}
              aria-label="Quitar"
            >
              Quitar
            </button>
          </div>
        ))}
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-ink-600">Subtotal</span>
        <span className="font-display text-2xl text-ink-900">{formatCurrency(subtotal)}</span>
      </div>

      {error && (
        <p className="mt-4 rounded border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-600">
          {error}
        </p>
      )}

      <Button className="mt-6 w-full" disabled={isPending} onClick={handleCheckout}>
        {isPending ? "Procesando…" : "Confirmar pedido"}
      </Button>
      <p className="mt-3 text-center text-xs text-ink-400">
        Al pagar sumás {business.points_label} automáticamente en tu cuenta.
      </p>
    </div>
  );
}
