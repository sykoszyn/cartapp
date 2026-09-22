import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Business, Profile, UserRole } from "@/lib/types";

function generateMemberCode() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 7).toUpperCase();
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("getCurrentProfile: no hay usuario autenticado (getUser devolvió null)");
    return null;
  }

  console.log("getCurrentProfile: usuario autenticado", user.id);

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (data) return data as Profile;

  if (error) {
    console.error("getCurrentProfile: no se pudo leer el perfil", error);
  }

  // Red de seguridad: si el usuario está autenticado pero por algún motivo
  // (trigger que no llegó a correr, cuenta creada a mano en el dashboard
  // antes de aplicar la migración, etc.) no existe su fila en `profiles`,
  // la creamos ahora mismo en vez de dejarlo atrapado sin poder entrar.
  const role = (user.user_metadata?.role as UserRole) || "customer";
  const full_name = (user.user_metadata?.full_name as string) || "";

  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      role,
      full_name,
      member_code: role === "customer" ? generateMemberCode() : null,
    })
    .select("*")
    .single();

  if (insertError) {
    console.error("getCurrentProfile: no se pudo crear el perfil faltante", insertError);
    return null;
  }

  return created as Profile;
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/ingresar");
  return profile;
}

export async function requireBusinessProfile(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "business") redirect("/cuenta");
  return profile;
}

export async function getMyBusiness(): Promise<Business | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  return (data as Business) ?? null;
}
