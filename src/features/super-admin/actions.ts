"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { tenantFormSchema, type TenantFormState } from "./validation";
import { requireSuperAdmin } from "./server/access";

export async function createTenantAction(
  _previousState: TenantFormState,
  formData: FormData,
): Promise<TenantFormState> {
  const parsed = tenantFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    type: formData.get("type"),
    status: formData.get("status"),
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os dados informados." };
  }

  const { supabase } = await requireSuperAdmin();
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      type: parsed.data.type,
      status: parsed.data.status,
      timezone: parsed.data.timezone,
      locale: "pt-BR",
      currency: "BRL",
      published_at: parsed.data.status === "active" ? new Date().toISOString() : null,
    })
    .select("id, slug")
    .single();

  if (tenantError || !tenant) {
    return {
      error:
        tenantError?.code === "23505"
          ? "Este slug já está em uso. Escolha outro."
          : "Não foi possível criar o estabelecimento.",
    };
  }

  const tenantId = tenant.id;
  const [settings, branding, design, pwa] = await Promise.all([
    supabase.from("tenant_settings").insert({ tenant_id: tenantId }),
    supabase.from("tenant_branding").insert({ tenant_id: tenantId }),
    supabase.from("tenant_design_settings").insert({ tenant_id: tenantId }),
    supabase.from("tenant_pwa_settings").insert({ tenant_id: tenantId }),
  ]);

  if (settings.error || branding.error || design.error || pwa.error) {
    return { error: "O estabelecimento foi criado, mas houve erro ao preparar as configurações." };
  }

  revalidatePath("/super-admin");
  redirect(`/super-admin/estabelecimentos/${tenant.slug}`);
}

export async function updateTenantAction(
  tenantId: string,
  _previousState: TenantFormState,
  formData: FormData,
): Promise<TenantFormState> {
  const parsed = tenantFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    type: formData.get("type"),
    status: formData.get("status"),
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revise os dados informados." };
  }

  const { supabase } = await requireSuperAdmin();
  const { data: tenant, error } = await supabase
    .from("tenants")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      type: parsed.data.type,
      status: parsed.data.status,
      timezone: parsed.data.timezone,
      published_at: parsed.data.status === "active" ? new Date().toISOString() : null,
    })
    .eq("id", tenantId)
    .select("slug")
    .single();

  if (error || !tenant) {
    return { error: error?.code === "23505" ? "Este slug já está em uso. Escolha outro." : "Não foi possível salvar o estabelecimento." };
  }

  revalidatePath("/super-admin");
  revalidatePath(`/super-admin/estabelecimentos/${tenant.slug}`);
  redirect(`/super-admin/estabelecimentos/${tenant.slug}?status=salvo`);
}

export async function archiveTenantAction(tenantId: string) {
  const { supabase } = await requireSuperAdmin();
  const { error } = await supabase.from("tenants").update({ status: "archived", published_at: null }).eq("id", tenantId);
  if (error) throw new Error("Não foi possível arquivar o estabelecimento.");
  revalidatePath("/super-admin");
  redirect("/super-admin?status=arquivado");
}

export async function restoreTenantAction(tenantId: string) {
  const { supabase } = await requireSuperAdmin();
  const { error } = await supabase.from("tenants").update({ status: "draft" }).eq("id", tenantId);
  if (error) throw new Error("Não foi possível restaurar o estabelecimento.");
  revalidatePath("/super-admin");
  redirect("/super-admin?status=restaurado");
}

export async function publishTenantAction(tenantId: string, tenantSlug: string) {
  const { supabase } = await requireSuperAdmin();
  const { data: tenant, error } = await supabase
    .from("tenants")
    .update({ status: "active", published_at: new Date().toISOString() })
    .eq("id", tenantId)
    .select("slug")
    .single();

  if (error || !tenant) throw new Error("Não foi possível publicar o estabelecimento.");
  revalidatePath("/super-admin");
  revalidatePath(`/admin/${tenantSlug}`);
  revalidatePath(`/admin/${tenantSlug}/aparencia`);
  revalidatePath(`/guia/${tenant.slug}`);
  redirect(`/super-admin/estabelecimentos/${tenant.slug}?status=publicado`);
}
