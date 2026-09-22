"use client";

import { useTransition } from "react";
import { useFormState } from "react-dom";
import { saveMpTokenAction, disconnectMpAction } from "./actions";
import { Label, Input, FieldHint } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";

export function MpForm({ connected }: { connected: boolean }) {
  const [state, formAction] = useFormState(saveMpTokenAction, {});
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-5">
      <FormMessage error={state?.error} success={state?.success} />

      {connected && (
        <div className="flex items-center justify-between rounded border border-olive-300/50 bg-olive-100/60 px-4 py-3 text-sm text-olive-600">
          <span>Mercado Pago conectado.</span>
          <button
            className="font-medium text-danger-600 disabled:opacity-50"
            disabled={isPending}
            onClick={() => {
              if (confirm("¿Desconectar Mercado Pago? Los pedidos van a quedar como pago en el local.")) {
                startTransition(() => disconnectMpAction());
              }
            }}
          >
            Desconectar
          </button>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="mp_access_token">
            {connected ? "Reemplazar Access Token" : "Access Token de Mercado Pago"}
          </Label>
          <Input
            id="mp_access_token"
            name="mp_access_token"
            type="password"
            placeholder="APP_USR-..."
            autoComplete="off"
          />
          <FieldHint>
            Lo sacás de tu cuenta de Mercado Pago → Tu negocio → Configuración → Credenciales de
            producción → Access Token. El dinero entra directo a tu cuenta, nunca pasa por
            nosotros.
          </FieldHint>
        </div>
        <SubmitButton pendingLabel="Guardando…">
          {connected ? "Actualizar" : "Conectar Mercado Pago"}
        </SubmitButton>
      </form>
    </div>
  );
}
