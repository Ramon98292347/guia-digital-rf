import Link from "next/link";
import { Building2 } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminTenants, requireUser } from "@/features/auth/server/admin-access";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function SelectTenantPage() {
  const supabase = await createSupabaseServerClient();
  await requireUser(supabase);
  const tenants = await getAdminTenants(supabase);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted px-4 py-10">
      <section className="w-full max-w-2xl rounded-lg border border-border bg-background p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Selecionar estabelecimento</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Escolha qual painel administrativo deseja acessar.
        </p>

        <div className="mt-6 grid gap-3">
          {tenants.map((tenant) => (
            <Link
              key={tenant.id}
              href={`/admin/${tenant.slug}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-auto justify-start gap-3 p-4",
              )}
            >
              <Building2 className="size-5" aria-hidden="true" />
              <span className="text-left">
                <span className="block font-medium">{tenant.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {tenant.status === "active" ? "Ativo" : "Atenção necessária"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
