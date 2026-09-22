import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/utils";

function emailShell(title: string, bodyHtml: string) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #161618;">
      <p style="font-weight: 600; font-size: 15px; letter-spacing: -0.01em; margin: 0 0 24px;">qrcartapp</p>
      <h1 style="font-size: 20px; margin: 0 0 16px;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #7B7B84;">
        Recibiste este email porque tenés una cuenta en qrcartapp.
      </p>
    </div>
  `;
}

// Le avisa al cliente que sumó puntos, ya sea por un pedido pagado online o
// porque el comercio se los cargó manualmente en el mostrador.
export async function notifyPointsEarned({
  customerId,
  businessId,
  points,
  reason,
}: {
  customerId: string;
  businessId: string;
  points: number;
  reason?: string;
}) {
  if (points <= 0) return;

  const admin = createAdminClient();

  const [{ data: authUser }, { data: business }, { data: balance }] = await Promise.all([
    admin.auth.admin.getUserById(customerId),
    admin.from("businesses").select("name, points_label").eq("id", businessId).single(),
    admin
      .from("customer_points")
      .select("points")
      .eq("customer_id", customerId)
      .eq("business_id", businessId)
      .maybeSingle(),
  ]);

  const email = authUser?.user?.email;
  if (!email || !business) return;

  await sendEmail({
    to: email,
    subject: `Sumaste ${points} ${business.points_label} en ${business.name}`,
    html: emailShell(
      `Sumaste ${points} ${business.points_label} en ${business.name}`,
      `
        ${reason ? `<p style="color:#3F3F46;">${reason}</p>` : ""}
        <p style="color:#3F3F46;">Tu saldo ahora es <strong>${balance?.points ?? points} ${business.points_label}</strong>.</p>
      `
    ),
  });
}

export async function notifyRewardRedeemed({
  customerId,
  businessId,
  rewardName,
  pointsCost,
}: {
  customerId: string;
  businessId: string;
  rewardName: string;
  pointsCost: number;
}) {
  const admin = createAdminClient();

  const [{ data: authUser }, { data: business }] = await Promise.all([
    admin.auth.admin.getUserById(customerId),
    admin.from("businesses").select("name, points_label").eq("id", businessId).single(),
  ]);

  const email = authUser?.user?.email;
  if (!email || !business) return;

  await sendEmail({
    to: email,
    subject: `Canjeaste "${rewardName}" en ${business.name}`,
    html: emailShell(
      `Canjeaste "${rewardName}"`,
      `<p style="color:#3F3F46;">Usaste ${pointsCost} ${business.points_label} en ${business.name}. Mostrale este email o tu código de socio en el mostrador.</p>`
    ),
  });
}

export async function notifyOrderReceived({
  businessId,
  orderId,
  subtotal,
}: {
  businessId: string;
  orderId: string;
  subtotal: number;
}) {
  const admin = createAdminClient();

  const { data: business } = await admin
    .from("businesses")
    .select("owner_id, name")
    .eq("id", businessId)
    .single();

  if (!business) return;

  const { data: authUser } = await admin.auth.admin.getUserById(business.owner_id);
  const email = authUser?.user?.email;
  if (!email) return;

  await sendEmail({
    to: email,
    subject: `Nuevo pedido en ${business.name}`,
    html: emailShell(
      "Tenés un nuevo pedido",
      `<p style="color:#3F3F46;">Por ${formatCurrency(subtotal)}. Revisalo en tu panel, en Pedidos.</p>
       <p style="font-family: monospace; font-size: 12px; color:#7B7B84;">#${orderId}</p>`
    ),
  });
}
