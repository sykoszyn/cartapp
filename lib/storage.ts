import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Sube un archivo a la carpeta del usuario dentro del bucket público "media"
// y devuelve la URL pública. Ver policies de storage en 0001_init.sql:
// cada usuario sólo puede escribir dentro de `${auth.uid()}/...`.
export async function uploadMedia(
  supabase: SupabaseClient<Database>,
  userId: string,
  folder: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}
