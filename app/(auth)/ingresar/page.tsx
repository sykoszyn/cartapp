"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { signInAction } from "../actions";
import { Label, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";

export default function LoginPage() {
  const [state, formAction] = useFormState(signInAction, {});

  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-wide text-rust-500">Bienvenido</p>
      <h1 className="mt-2 font-display text-3xl text-ink-800">Ingresá a tu cuenta</h1>
      <p className="mt-2 text-ink-400">Sumá puntos y canjeá recompensas en tus comercios.</p>

      <form action={formAction} className="mt-8 space-y-5">
        <FormMessage error={state?.error} />

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>

        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>

        <SubmitButton className="w-full" pendingLabel="Ingresando…">
          Ingresar
        </SubmitButton>
      </form>

      <p className="mt-8 text-center text-sm text-ink-400">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="link-underline font-medium text-ink-800">
          Creá una gratis
        </Link>
      </p>
    </div>
  );
}
