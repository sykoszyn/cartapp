import { Resend } from "resend";

let client: Resend | null = null;

function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

// Si todavía no se configuró RESEND_API_KEY, no rompe nada: sólo deja
// constancia en los logs y sigue de largo. Así el resto de la app (sumar
// puntos, canjear, pagar) funciona igual aunque el email no esté prendido.
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getClient();
  if (!resend) {
    console.log(`[email] RESEND_API_KEY no configurada — no se envía "${subject}" a ${to}`);
    return;
  }

  const from = process.env.EMAIL_FROM || "qrcartapp <notificaciones@qrcartapp.app>";
  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) throw new Error(error.message);
}
