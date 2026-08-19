import { Palette, ShieldCheck } from "lucide-react";
import { requireTenantAccess } from "@/features/auth/server/admin-access";
import { AIDesignerForm } from "@/features/ai-designer/components/ai-designer-form";
import { GuidePublicationActions } from "@/features/ai-designer/components/guide-publication-actions";

export default async function AppearancePage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const context = await requireTenantAccess(tenantSlug);
  if (!context) return null;
  return <div className="mx-auto max-w-6xl space-y-6"><header><div className="flex items-center gap-2 text-sm text-muted-foreground"><Palette className="size-4" />Aparência do estabelecimento</div><h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Crie seu Guia com Inteligência Artificial</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Monte uma proposta visual reutilizável para {context.tenant.name}, com componentes seguros e compatíveis com a plataforma.</p><div className="mt-4"><GuidePublicationActions tenantSlug={tenantSlug} isPublished={context.tenant.status === "active"} /></div></header><div className="flex items-start gap-3 rounded-lg border border-border bg-background p-4 text-sm"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" /><p>A proposta considera apenas informações e mídia do tenant atual. A validação impede HTML, CSS, JavaScript e variantes não registradas.</p></div><AIDesignerForm tenantSlug={tenantSlug} /></div>;
}
