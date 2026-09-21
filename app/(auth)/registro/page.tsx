import { RegisterForm } from "./register-form";

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { rol?: string };
}) {
  const initialRole = searchParams.rol === "comercio" ? "business" : "customer";

  return <RegisterForm initialRole={initialRole} />;
}
