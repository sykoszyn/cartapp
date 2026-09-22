import { z } from "zod";

export const MenuItemSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
});

export const MenuCategorySchema = z.object({
  name: z.string(),
  products: z.array(MenuItemSchema),
});

export const MenuSchema = z.object({
  categories: z.array(MenuCategorySchema),
});

export type ParsedMenu = z.infer<typeof MenuSchema>;

export function isMenuImportConfigured() {
  return !!process.env.ANTHROPIC_API_KEY;
}

// Convierte el HTML crudo de una página a texto legible: saca scripts,
// estilos y etiquetas, y colapsa espacios. No renderiza JavaScript, así que
// páginas que arman el menú del todo por JS pueden no traer nada útil — por
// eso siempre ofrecemos "pegar el texto" como alternativa.
export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchPageText(url: string): Promise<string> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Ese link no es válido.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Ese link no es válido.");
  }

  const res = await fetch(parsed.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; qrcartappBot/1.0; +https://qrcartapp.vercel.app)",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`No pudimos abrir ese link (código ${res.status}).`);
  }

  const html = await res.text();
  return stripHtml(html);
}

// Tope de caracteres que mandamos al modelo: suficiente para un menú
// completo, sin dejar que una página gigante dispare un costo enorme.
export const MAX_SOURCE_LENGTH = 20000;
