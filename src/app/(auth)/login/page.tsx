import { redirect } from "next/navigation";
import { platformConfig } from "@/config/platform";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminTenants } from "@/features/auth/server/admin-access";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const tenants = await getAdminTenants(supabase);

    if (tenants.length === 1) {
      redirect(`/admin/${tenants[0].slug}`);
    }

    if (tenants.length > 1) {
      redirect("/admin/select");
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-10">
      <section className="w-full max-w-[420px] rounded-lg border border-border bg-background p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium text-muted-foreground">
            {platformConfig.companyName}
          </p>
          <h1 className="mt-2 text-2xl font-semibold">
            Acesse o painel administrativo
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Entre com as credenciais fornecidas pela plataforma.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
