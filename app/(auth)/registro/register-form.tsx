"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { signUpAction } from "../actions";
import { Label, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

export function RegisterForm({ initialRole }: { initialRole: UserRole }) {
  const [state, formAction] = useFormState(signUpAction, {});
  const [role, setRole] = useState<UserRole>(initialRole);

  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-wide text-rust-500">Empecemos</p>
      <h1 className="mt-2 font-display text-3xl text-ink-800">Creá tu cuenta</h1>
      <p className="mt-2 text-ink-400">Elegí cómo querés usar qrcartapp.</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <RoleCard
          active={role === "customer"}
          onClick={() => setRole("customer")}
          title="Soy cliente"
          description="Quiero sumar puntos y ver descuentos"
        />
        <RoleCard
          active={role === "business"}
          onClick={() => setRole("business")}
          title="Tengo un comercio"
          description="Quiero cargar mi negocio y fidelizar clientes"
        />
      </div>

      <form action={formAction} className="mt-8 space-y-5">
        <input type="hidden" name="role" value={role} />
        <FormMessage error={state?.error} success={state?.success} />

        <div>
          <Label htmlFor="full_name">
            {role === "business" ? "Tu nombre y apellido" : "Nombre y apellido"}
          </Label>
          <Input id="full_name" name="full_name" required autoComplete="name" />
        </div>

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
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        <SubmitButton className="w-full" pendingLabel="Creando cuenta…">
          {role === "business" ? "Crear cuenta de comercio" : "Crear cuenta"}
        </SubmitButton>
      </form>

      <p className="mt-8 text-center text-sm text-ink-400">
        ¿Ya tenés cuenta?{" "}
        <Link href="/ingresar" className="link-underline font-medium text-ink-800">
          Ingresá
        </Link>
      </p>
    </div>
  );
}

function RoleCard({
  active,
  onClick,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border p-4 text-left transition",
        active
          ? "border-rust-500 bg-rust-50/60 ring-1 ring-rust-500"
          : "border-ink-800/15 hover:border-ink-800/30"
      )}
    >
      <p className="font-medium text-ink-800">{title}</p>
      <p className="mt-1 text-xs text-ink-400">{description}</p>
    </button>
  );
}
