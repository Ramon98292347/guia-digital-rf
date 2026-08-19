import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { GuideHome } from "@/features/public-guide/components/guide-home";
import { getPublicGuideData } from "@/features/public-guide/server/service";
import { requireTenantAccess } from "@/features/auth/server/admin-access";

type PublicGuidePageProps = {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export default async function PublicGuidePage({
  params,
  searchParams,
}: PublicGuidePageProps) {
  const { tenantSlug } = await params;
  const { preview } = await searchParams;
  const headerList = await headers();
  const hostHeader =
    headerList.get("x-forwarded-host") ?? headerList.get("host");
  const previewContext = preview === "1" ? await requireTenantAccess(tenantSlug) : null;
  const guide = await getPublicGuideData({
    tenantSlug,
    pathname: `/guia/${tenantSlug}`,
    hostname: hostHeader,
    tenantOverride: previewContext ? {
      tenant_id: previewContext.tenant.id,
      name: previewContext.tenant.name,
      slug: previewContext.tenant.slug,
      timezone: previewContext.tenant.timezone,
      locale: previewContext.tenant.locale,
      status: previewContext.tenant.status,
      domain_type: "platform_path",
      canonical_hostname: hostHeader ?? "localhost",
      path_prefix: `/guia/${previewContext.tenant.slug}`,
    } : undefined,
  });

  if (!guide) {
    notFound();
  }

  return <GuideHome data={guide} />;
}
