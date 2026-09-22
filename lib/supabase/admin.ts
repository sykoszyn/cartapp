import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Cliente con la service_role key: ignora RLS por completo. SOLO se usa en
// rutas server-to-server de confianza (el webhook de Mercado Pago) — nunca
// en una Server Action que responde a un pedido de un usuario, y nunca se
// importa desde código que corre en el navegador.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("Falta la variable de entorno SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
