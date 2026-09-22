import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPayment } from "@/lib/mercadopago";
import { notifyPointsEarned } from "@/lib/notifications";

// Mercado Pago llama acá cuando cambia el estado de un pago. Nunca
// confiamos en el contenido de la notificación en sí: sólo la usamos para
// saber QUÉ pago consultar, y después le preguntamos a la propia API de
// Mercado Pago (con el access token del comercio dueño del pedido) cuál es
// el estado real antes de sumar puntos.
async function handle(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const orderId = params.get("order_id");
  const paymentId = params.get("data.id") || params.get("id");
  const type = params.get("type") || params.get("topic");

  if (!orderId || !paymentId || (type && type !== "payment")) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    const admin = createAdminClient();

    const { data: order } = await admin
      .from("orders")
      .select("id, business_id, customer_id, status")
      .eq("id", orderId)
      .maybeSingle();

    if (!order || order.status !== "pending") {
      return NextResponse.json({ ok: true, alreadyHandled: true });
    }

    const { data: paymentSettings } = await admin
      .from("business_payment_settings")
      .select("mp_access_token")
      .eq("business_id", order.business_id)
      .maybeSingle();

    if (!paymentSettings?.mp_access_token) {
      return NextResponse.json({ ok: true, noToken: true });
    }

    const payment = await getPayment(paymentSettings.mp_access_token, paymentId);

    if (payment.external_reference !== order.id) {
      console.error("webhook mercadopago: external_reference no coincide con el pedido", {
        orderId: order.id,
        externalReference: payment.external_reference,
      });
      return NextResponse.json({ ok: true, mismatch: true });
    }

    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true, status: payment.status });
    }

    await admin.from("orders").update({ mp_payment_id: String(payment.id) }).eq("id", order.id);

    const { data: result } = await admin.rpc("award_points_for_order", {
      p_order_id: order.id,
    });

    const awarded = result?.[0];
    if (awarded && awarded.points_added > 0) {
      await notifyPointsEarned({
        customerId: order.customer_id,
        businessId: order.business_id,
        points: awarded.points_added,
        reason: "Por tu pedido online.",
      }).catch((e) => console.error("webhook mercadopago: no se pudo enviar el email", e));
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("webhook mercadopago: error procesando la notificación", e);
    // Devolvemos 200 igual: si el error es nuestro, Mercado Pago reintentar
    // con backoff no lo va a arreglar, y no queremos que nos deje de avisar.
    return NextResponse.json({ ok: false });
  }
}

export async function POST(request: NextRequest) {
  return handle(request);
}

export async function GET(request: NextRequest) {
  return handle(request);
}
