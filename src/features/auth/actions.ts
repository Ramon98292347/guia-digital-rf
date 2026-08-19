"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminTenants } from "@/features/auth/server/admin-access";

type LoginState = {
  error?: string;
};

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os dados." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  const { data: superAdmin } = await supabase
    .from("super_admins")
    .select("user_id")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .eq("is_active", true)
    .maybeSingle();

  if (superAdmin) {
    redirect("/super-admin");
  }

  const tenants = await getAdminTenants(supabase);

  if (tenants.length === 0) {
    redirect("/admin/no-access");
  }

  if (tenants.length === 1) {
    redirect(`/admin/${tenants[0].slug}`);
  }

  redirect("/admin/select");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
