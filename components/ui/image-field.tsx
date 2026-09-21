"use client";

import { useState } from "react";
import { Label } from "@/components/ui/field";

export function ImageField({
  name,
  label,
  currentUrl,
  aspect = "aspect-square",
  hint,
}: {
  name: string;
  label: string;
  currentUrl?: string | null;
  aspect?: string;
  hint?: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);

  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <div className="flex items-center gap-4">
        <div
          className={`relative ${aspect} w-28 shrink-0 overflow-hidden rounded border border-dashed border-ink-800/20 bg-ink-800/[0.03]`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-400">
              Sin foto
            </div>
          )}
        </div>
        <div className="flex-1">
          <input
            id={name}
            name={name}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
            className="block w-full text-sm text-ink-600 file:mr-3 file:rounded file:border-0 file:bg-ink-800/5 file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-ink-800 hover:file:bg-ink-800/10"
          />
          {hint && <p className="mt-1.5 text-xs text-ink-400">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
