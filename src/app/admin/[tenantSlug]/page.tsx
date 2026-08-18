import { notFound } from "next/navigation";
import { BedDouble, GalleryHorizontal, MapPinned, Wrench } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireTenantAccess } from "@/features/auth/server/admin-access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminDashboardPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

const dashboardMetrics = [
  { label: "Acomodações", table: "accommodations", icon: BedDouble },
  { label: "Serviços", table: "services", icon: Wrench },
  { label: "Galeria", table: "gallery_items", icon: GalleryHorizontal },
  { label: "Dicas da região", table: "local_tips", icon: MapPinned },
] as const;

export default async function AdminDashboardPage({
  params,
}: AdminDashboardPageProps) {
  const { tenantSlug } = await params;
  const context = await requireTenantAccess(tenantSlug);

  if (!context) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const metrics = await Promise.all(
    dashboardMetrics.map(async (metric) => {
      const [{ count: total }, { count: published }, { count: draft }] =
        await Promise.all([
          supabase
            .from(metric.table)
            .select("id", { count: "exact", head: true })
            .eq("tenant_id", context.tenant.id),
          supabase
            .from(metric.table)
            .select("id", { count: "exact", head: true })
            .eq("tenant_id", context.tenant.id)
            .eq("status", "published"),
          supabase
            .from(metric.table)
            .select("id", { count: "exact", head: true })
            .eq("tenant_id", context.tenant.id)
            .eq("status", "draft"),
        ]);

      return {
        ...metric,
        total: total ?? 0,
        published: published ?? 0,
        draft: draft ?? 0,
      };
    }),
  );

  const isSuspended = context.tenant.status === "suspended";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Painel administrativo</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
          {context.tenant.name}
        </h1>
      </div>

      {isSuspended ? (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardHeader>
            <CardTitle>Estabelecimento suspenso</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            O painel permanece em modo restrito. Entre em contato com a RF
            Tecnologia para regularizar o acesso.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{metric.label}</CardTitle>
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{metric.total}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {metric.published} publicados · {metric.draft} rascunhos
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos passos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          Os cadastros completos de conteúdo serão implementados no próximo
          passo. Por enquanto, este painel valida sessão, tenant atual,
          permissões e estrutura administrativa.
        </CardContent>
      </Card>
    </div>
  );
}
