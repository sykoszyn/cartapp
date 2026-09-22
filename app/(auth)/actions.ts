"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import type { UserRole, FormState } from "@/lib/types";

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Completá tu email y contraseña." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email o contraseña incorrectos." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  revalidatePath("/", "layout");
  redirect(profile?.role === "business" ? "/panel" : "/cuenta");
}

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const role = String(formData.get("role") || "customer") as UserRole;
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!fullName || !email || password.length < 6) {
    return {
      error: "Revisá los datos: la contraseña debe tener al menos 6 caracteres.",
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, full_name: fullName },
      emailRedirectTo: `${getSiteUrl()}/ingresar`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Ya existe una cuenta con ese email." };
    }
    return { error: "No pudimos crear tu cuenta. Intentá de nuevo." };
  }

  revalidatePath("/", "layout");

  if (!data.session) {
    return {
      success:
        "¡Listo! Te enviamos un email para confirmar tu cuenta. Una vez confirmada, iniciá sesión.",
    };
  }

  redirect(role === "business" ? "/panel/negocio" : "/cuenta");
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
