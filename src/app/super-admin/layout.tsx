import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireSuperAdmin } from "@/features/super-admin/server/access";
import { SuperAdminShell } from "@/features/super-admin/components/super-admin-shell";

export const metadata: Metadata = {
  title: "Super Admin",
};

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const { user } = await requireSuperAdmin();
  return <SuperAdminShell user={user}>{children}</SuperAdminShell>;
}
