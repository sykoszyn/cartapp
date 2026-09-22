"use server";

import { createClient } from "@/lib/supabase/server";
import { createPaymentPreference, getValidMpAccessToken } from "@/lib/mercadopago";
import { getSiteUrl } from "@/lib/site-url";
import { notifyOrderReceived } from "@/lib/notifications";

export interface CheckoutResult {
  error?: string;
  redirectUrl?: string;
  orderId?: string;
}

export async function checkoutAction(
  businessId: string,
  slug: string,
  items: { productId: string; quantity: number }[]
): Promise<CheckoutResult> {
  if (items.length === 0) return { error: "Tu carrito está vacío." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Iniciá sesión para hacer tu pedido." };

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, active, business_id")
    .in(
      "id",
      items.map((i) => i.productId)
    );

  const orderItems: { product_id: string; name: string; unit_price: number; quantity: number }[] =
    [];

  for (const item of items) {
    const product = products?.find((p) => p.id === item.productId);
    if (!product || !product.active || product.business_id !== businessId) {
      return { error: "Alguno de los productos del carrito ya no está disponible." };
    }
    if (item.quantity <= 0) continue;
    orderItems.push({
      product_id: product.id,
      name: product.name,
      unit_price: product.price,
      quantity: item.quantity,
    });
  }

  if (orderItems.length === 0) return { error: "Tu carrito está vacío." };

  const subtotal = orderItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ business_id: businessId, customer_id: user.id, subtotal })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("checkoutAction: error creando el pedido", orderError);
    return { error: "No se pudo crear el pedido. Intentá de nuevo." };
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));

  if (itemsError) {
    console.error("checkoutAction: error guardando el detalle del pedido", itemsError);
    return { error: "No se pudo guardar el detalle del pedido." };
  }

  notifyOrderReceived({ businessId, orderId: order.id, subtotal }).catch((e) =>
    console.error("checkoutAction: no se pudo avisar al comercio", e)
  );

  const accessToken = await getValidMpAccessToken(supabase, businessId);

  if (!accessToken) {
    // El comercio todavía no conectó Mercado Pago: el pedido queda
    // pendiente para que lo confirmen manualmente en el mostrador.
    return { orderId: order.id };
  }

  const siteUrl = getSiteUrl();
  const statusUrl = `${siteUrl}/negocio/${slug}/pedido/${order.id}`;

  try {
    const preference = await createPaymentPreference({
      accessToken,
      items: orderItems.map((i) => ({
        title: i.name,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
      externalReference: order.id,
      backUrls: { success: statusUrl, failure: statusUrl, pending: statusUrl },
      notificationUrl: `${siteUrl}/api/webhooks/mercadopago?order_id=${order.id}`,
    });

    await supabase.from("orders").update({ mp_preference_id: preference.id }).eq("id", order.id);

    return { redirectUrl: preference.init_point };
  } catch (e) {
    console.error("checkoutAction: error creando preferencia de Mercado Pago", e);
    // El pedido ya quedó guardado: lo dejamos como pendiente de confirmar
    // manualmente en vez de perderlo por un error de la pasarela de pago.
    return { orderId: order.id };
  }
}
