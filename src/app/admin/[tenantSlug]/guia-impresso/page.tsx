import { notFound } from "next/navigation";
import { requireTenantAccess } from "@/features/auth/server/admin-access";
import { getPublicGuideData } from "@/features/public-guide/server/service";
import { PrintableGuideAdmin } from "@/features/admin/print-guide/components/printable-guide";

export default async function PrintableGuidePage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const context = await requireTenantAccess(tenantSlug);

  if (!context) {
    notFound();
  }

  const guide = await getPublicGuideData({
    tenantSlug,
    pathname: `/guia/${tenantSlug}`,
    hostname: "localhost",
    tenantOverride: {
      tenant_id: context.tenant.id,
      name: context.tenant.name,
      slug: context.tenant.slug,
      timezone: context.tenant.timezone,
      locale: context.tenant.locale,
      status: context.tenant.status,
      domain_type: "platform_path",
      canonical_hostname: "localhost",
      path_prefix: `/guia/${context.tenant.slug}`,
    },
  });

  if (!guide) {
    notFound();
  }

  return <PrintableGuideAdmin guide={guide} tenantSlug={tenantSlug} />;
}
