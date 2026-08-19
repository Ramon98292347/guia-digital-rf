import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/features/auth/server/admin-access";

export async function requireSuperAdmin() {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);
  const { data, error } = await supabase
    .from("super_admins")
    .select("user_id, is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    redirect("/admin/no-access");
  }

  return { supabase, user };
}

