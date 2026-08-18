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

  return <AdminShell context={context}>{children}</AdminShell>;
}
