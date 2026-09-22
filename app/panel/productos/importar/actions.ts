"use server";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import {
  MenuSchema,
  fetchPageText,
  isMenuImportConfigured,
  MAX_SOURCE_LENGTH,
  type ParsedMenu,
} from "@/lib/menu-import";

export interface ParseMenuResult {
  error?: string;
  menu?: ParsedMenu;
}

export async function parseMenuAction(
  _prev: ParseMenuResult | undefined,
  formData: FormData
): Promise<ParseMenuResult> {
  if (!isMenuImportConfigured()) {
    return { error: "La importación de menú no está disponible todavía." };
  }

  const business = await getMyBusiness();
  if (!business) return { error: "Primero creá tu negocio." };

  const url = String(formData.get("url") || "").trim();
  const pastedText = String(formData.get("text") || "").trim();

  let sourceText = pastedText;

  if (!sourceText && url) {
    try {
      sourceText = await fetchPageText(url);
    } catch (e) {
      console.error("parseMenuAction: error bajando el link", e);
      return {
        error:
          "No pudimos leer ese link automáticamente (algunas plataformas arman el menú con JavaScript y no se puede leer así). Copiá y pegá el texto de tu menú en el campo de abajo.",
      };
    }
  }

  if (!sourceText) {
    return { error: "Pegá un link o el texto de tu menú." };
  }

  if (sourceText.length < 20) {
    return {
      error:
        "Ese link no trajo casi texto (puede ser una página que arma el menú con JavaScript). Pegá el texto de tu menú directamente.",
    };
  }

  sourceText = sourceText.slice(0, MAX_SOURCE_LENGTH);

  const client = new Anthropic();

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 8000,
      system:
        "Extraés menús de restaurantes/cafeterías/take away a partir de texto desordenado " +
        "(bajado de una web, de otra app de pedidos, o pegado a mano por el dueño del " +
        "negocio). Agrupá los productos en categorías razonables para ESTE menú en " +
        "particular (ej: Entradas, Platos principales, Postres, Bebidas, Promos — las que " +
        "tengan sentido, no una lista fija). Ignorá navegación, reseñas, horarios, " +
        "publicidad, redes sociales y cualquier cosa que no sea un producto con precio. " +
        "Los precios están en pesos argentinos: devolvé solo el número, sin símbolo de " +
        "moneda ni separadores de miles. Si un producto no tiene un precio claro, no lo " +
        "incluyas. Si el texto no parece un menú, devolvé una lista de categorías vacía.",
      messages: [
        { role: "user", content: `Extraé el menú de este texto:\n\n${sourceText}` },
      ],
      output_config: { format: zodOutputFormat(MenuSchema) },
    });

    if (!response.parsed_output) {
      return {
        error: "No pudimos entender ese contenido como un menú. Probá pegando el texto directamente.",
      };
    }

    const menu = response.parsed_output;
    const totalItems = menu.categories.reduce((sum, c) => sum + c.products.length, 0);

    if (totalItems === 0) {
      return { error: "No encontramos productos con precio en ese contenido." };
    }

    return { menu };
  } catch (e) {
    console.error("parseMenuAction: error llamando a la API de Claude", e);
    return { error: "Hubo un error leyendo el menú. Intentá de nuevo en un rato." };
  }
}

export async function confirmImportAction(
  categories: { name: string; products: { name: string; description: string | null; price: number }[] }[]
): Promise<{ error?: string; imported?: number }> {
  const business = await getMyBusiness();
  if (!business) return { error: "Primero creá tu negocio." };

  const supabase = createClient();

  const { data: existing } = await supabase
    .from("product_categories")
    .select("id, name")
    .eq("business_id", business.id);

  const existingByName = new Map(
    (existing ?? []).map((c) => [c.name.trim().toLowerCase(), c.id])
  );

  let imported = 0;

  for (const category of categories) {
    if (category.products.length === 0) continue;

    const key = category.name.trim().toLowerCase();
    let categoryId = existingByName.get(key);

    if (!categoryId) {
      const { data: created, error } = await supabase
        .from("product_categories")
        .insert({ business_id: business.id, name: category.name.trim() })
        .select("id")
        .single();
      if (error || !created) continue;
      categoryId = created.id;
      existingByName.set(key, categoryId);
    }

    const { error: insertError, count } = await supabase
      .from("products")
      .insert(
        category.products.map((p) => ({
          business_id: business.id,
          category_id: categoryId,
          name: p.name,
          description: p.description,
          price: p.price,
        })),
        { count: "exact" }
      );

    if (!insertError) imported += count ?? category.products.length;
  }

  revalidatePath("/panel/productos");
  revalidatePath("/panel/categorias");

  return { imported };
}
