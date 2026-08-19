import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TenantForm } from "@/features/super-admin/components/tenant-form";
import { getSuperAdminTenant } from "@/features/super-admin/server/service";

export default async function EditTenantPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const data = await getSuperAdminTenant(tenantSlug);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href={`/super-admin/estabelecimentos/${data.tenant.slug}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 text-[var(--rf-primary)]")}>
        <ArrowLeft className="size-4" />Voltar
      </Link>
      <div>
        <p className="text-sm font-medium text-[var(--rf-primary)]">Estabelecimento</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--rf-text)]">Editar estabelecimento</h1>
        <p className="mt-2 text-sm text-[var(--rf-muted)]">Atualize os dados administrativos sem alterar o conteúdo do Guia.</p>
      </div>
      <Card className="border-[var(--rf-border)]">
        <CardHeader><CardTitle>Dados do estabelecimento</CardTitle></CardHeader>
        <CardContent><TenantForm tenant={data.tenant} /></CardContent>
      </Card>
    </div>
  );
}
