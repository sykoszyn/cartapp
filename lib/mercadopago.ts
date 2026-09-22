// Wrapper mínimo sobre la API REST de Mercado Pago (Checkout Pro).
// No usamos el SDK oficial para mantener el bundle liviano; son dos
// llamadas HTTP bien simples.

const MP_API = "https://api.mercadopago.com";

export interface CreatePreferenceItem {
  title: string;
  quantity: number;
  unit_price: number;
}

export interface CreatePreferenceResult {
  id: string;
  init_point: string;
}

export async function createPaymentPreference({
  accessToken,
  items,
  externalReference,
  backUrls,
  notificationUrl,
}: {
  accessToken: string;
  items: CreatePreferenceItem[];
  externalReference: string;
  backUrls: { success: string; failure: string; pending: string };
  notificationUrl: string;
}): Promise<CreatePreferenceResult> {
  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: items.map((item) => ({ ...item, currency_id: "ARS" })),
      external_reference: externalReference,
      back_urls: backUrls,
      auto_return: "approved",
      notification_url: notificationUrl,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Mercado Pago rechazó la preferencia (${res.status}): ${detail}`);
  }

  const data = await res.json();
  return { id: data.id, init_point: data.init_point };
}

export interface MercadoPagoPayment {
  id: number;
  status: string;
  external_reference: string | null;
  transaction_amount: number;
}

export async function getPayment(
  accessToken: string,
  paymentId: string
): Promise<MercadoPagoPayment> {
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`No se pudo consultar el pago en Mercado Pago (${res.status}): ${detail}`);
  }

  return res.json();
}
