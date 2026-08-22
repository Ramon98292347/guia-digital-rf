import { notFound } from "next/navigation";
import Link from "next/link";
import { BedDouble, CheckCircle2, ExternalLink, GalleryHorizontal, MapPinned, Palette, QrCode, Wrench, Wifi } from "lucide-react";
import { requireTenantAccess } from "@/features/auth/server/admin-access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminDashboardPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

const dashboardMetrics = [
  { label: "Acomodações", table: "accommodations", icon: BedDouble },
  { label: "Serviços", table: "services", icon: Wrench },
  { label: "Fotos e vídeos", table: "media", icon: GalleryHorizontal },
  { label: "Conteúdos publicados", table: "local_tips", icon: MapPinned },
] as const;

export default async function AdminDashboardPage({
  params,
}: AdminDashboardPageProps) {
  const { tenantSlug } = await params;
  const context = await requireTenantAccess(tenantSlug);

  if (!context) {
    notFound();
  }

  const supabase = context.supabase;
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
    <div className="mx-auto max-w-7xl space-y-7">
      <div>
        <p className="text-sm font-medium text-[var(--rf-primary)]">Visão geral</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--rf-text)]">Visão Geral</h1><p className="mt-2 text-sm text-[var(--rf-muted)]">Gerencie as informações e a experiência digital do seu estabelecimento.</p>
      </div>

      {isSuspended ? (
          <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Estabelecimento suspenso</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-red-700">
            O painel permanece em modo restrito. Entre em contato com a RF
            Tecnologia para regularizar o acesso.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="border-[var(--rf-border)] shadow-[0_8px_24px_rgba(7,26,58,.05)]">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm text-[var(--rf-muted)]">{metric.label}</CardTitle><span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[var(--rf-primary)]"><Icon className="size-4" aria-hidden="true" /></span>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-[var(--rf-text)]">{metric.total}</p><p className="mt-2 text-xs text-[var(--rf-muted)]">
                  {metric.published} publicados · {metric.draft} rascunhos
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-[var(--rf-border)] shadow-[0_8px_24px_rgba(7,26,58,.04)]"><CardHeader><CardTitle className="text-[var(--rf-text)]">Guia Digital</CardTitle></CardHeader><CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className={cn("flex size-10 items-center justify-center rounded-xl", context.tenant.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}><CheckCircle2 className="size-5" /></span><div><p className="font-medium text-[var(--rf-text)]">{context.tenant.status === "active" ? "Publicado" : "Rascunho"}</p><p className="text-sm text-[var(--rf-muted)]">A experiência pública do estabelecimento.</p></div></div><div className="flex flex-wrap gap-2"><Link href={`/guia/${context.tenant.slug}${context.tenant.status === "active" ? "" : "?preview=1"}`} target="_blank" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-[var(--rf-border)] text-[var(--rf-primary)]")}><ExternalLink className="size-4" />Visualizar Guia</Link><Link href={`/admin/${context.tenant.slug}/aparencia`} className={cn(buttonVariants({ size: "sm" }), "bg-[var(--rf-primary)] text-white hover:bg-[var(--rf-navy)]")}><Palette className="size-4" />Aparência</Link><Link href={`/admin/${context.tenant.slug}/qrcode`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-[var(--rf-border)] text-[var(--rf-text)]")}><QrCode className="size-4" />QR Code</Link></div></CardContent></Card>

      <section className="space-y-3"><div><h2 className="text-lg font-semibold text-[var(--rf-text)]">Acessos rápidos</h2><p className="text-sm text-[var(--rf-muted)]">Atalhos para as áreas mais usadas do painel.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><QuickLink href={`/admin/${tenantSlug}/acomodacoes`} label="Gerenciar acomodações" icon={BedDouble} /><QuickLink href={`/admin/${tenantSlug}/midia`} label="Fotos e vídeos" icon={GalleryHorizontal} /><QuickLink href={`/admin/${tenantSlug}/servicos`} label="Serviços" icon={Wrench} /><QuickLink href={`/admin/${tenantSlug}/wifi`} label="Wi-Fi" icon={Wifi} /><QuickLink href={`/admin/${tenantSlug}/aparencia`} label="Aparência" icon={Palette} /><QuickLink href={`/guia/${tenantSlug}${context.tenant.status === "active" ? "" : "?preview=1"}`} label="Visualizar Guia" icon={ExternalLink} external /><QuickLink href={`/admin/${tenantSlug}/qrcode`} label="QR Code" icon={QrCode} /></div></section>
    </div>
  );
}

function QuickLink({ href, label, icon: Icon, external }: { href: string; label: string; icon: typeof BedDouble; external?: boolean }) {
  return <Link href={href} target={external ? "_blank" : undefined} className="flex items-center gap-3 rounded-xl border border-[var(--rf-border)] bg-white p-4 text-sm font-medium text-[var(--rf-text)] shadow-[0_6px_18px_rgba(7,26,58,.04)] transition hover:border-[var(--rf-primary)] hover:text-[var(--rf-primary)]"><span className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-[var(--rf-primary)]"><Icon className="size-4" /></span>{label}</Link>;
}
