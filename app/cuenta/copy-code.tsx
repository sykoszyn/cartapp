"use client";

import { useState } from "react";

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          // clipboard no disponible, ignoramos
        }
      }}
      className="mt-3 text-xs font-medium text-rust-500 hover:text-rust-600"
    >
      {copied ? "¡Copiado!" : "Copiar código"}
    </button>
  );
}
