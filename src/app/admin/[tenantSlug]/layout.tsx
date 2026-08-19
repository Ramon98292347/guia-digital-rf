import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { requireTenantAccess } from "@/features/auth/server/admin-access";

type AdminTenantLayoutProps = {
  children: ReactNode;
  params: Promise<{ tenantSlug: string }>;
};

export default async function AdminTenantLayout({
  children,
  params,
}: AdminTenantLayoutProps) {
  const { tenantSlug } = await params;
  const context = await requireTenantAccess(tenantSlug);

  if (!context) {
    notFound();
  }

  const { data: branding } = await context.supabase
    .from("tenant_branding")
    .select("logo_path")
    .eq("tenant_id", context.tenant.id)
    .maybeSingle();

  return <AdminShell context={context} tenantLogoPath={branding?.logo_path ?? null}>{children}</AdminShell>;
}
