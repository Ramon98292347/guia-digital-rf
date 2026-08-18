import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminTenants, requireUser } from "@/features/auth/server/admin-access";

export default async function AdminIndexPage() {
  const supabase = await createSupabaseServerClient();
  await requireUser(supabase);
  const tenants = await getAdminTenants(supabase);

  if (tenants.length === 0) {
    redirect("/admin/no-access");
  }

  if (tenants.length === 1) {
    redirect(`/admin/${tenants[0].slug}`);
  }

  redirect("/admin/select");
}
