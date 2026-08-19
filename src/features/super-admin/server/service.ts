import { requireSuperAdmin } from "./access";

export async function getSuperAdminTenants() {
  const { supabase } = await requireSuperAdmin();
  const { data, error } = await supabase
    .from("tenants")
    .select("id, name, slug, status, type, timezone, locale, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getSuperAdminDashboard() {
  const tenants = await getSuperAdminTenants();
  return {
    tenants,
    total: tenants.length,
    active: tenants.filter((tenant) => tenant.status === "active").length,
    drafts: tenants.filter((tenant) => tenant.status === "draft").length,
  };
}

export async function getSuperAdminTenant(tenantSlug: string) {
  const { supabase } = await requireSuperAdmin();
  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("id, name, slug, status, type, timezone, locale, currency, created_at")
    .eq("slug", tenantSlug)
    .maybeSingle();

  if (error) throw error;
  if (!tenant) return null;

  const [branding, design, pwa, accommodationCount, mediaCount] = await Promise.all([
    supabase.from("tenant_branding").select("tenant_id, logo_path, primary_color, secondary_color, accent_color").eq("tenant_id", tenant.id).maybeSingle(),
    supabase.from("tenant_design_settings").select("tenant_id, template_key, design_config").eq("tenant_id", tenant.id).maybeSingle(),
    supabase.from("tenant_pwa_settings").select("tenant_id, enabled, name, short_name").eq("tenant_id", tenant.id).maybeSingle(),
    supabase.from("accommodations").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id),
    supabase.from("media").select("id", { count: "exact", head: true }).eq("tenant_id", tenant.id),
  ]);

  if (branding.error || design.error || pwa.error || accommodationCount.error || mediaCount.error) {
    throw branding.error ?? design.error ?? pwa.error ?? accommodationCount.error ?? mediaCount.error;
  }

  return {
    tenant,
    branding: branding.data,
    design: design.data,
    pwa: pwa.data,
    content: {
      accommodations: accommodationCount.count ?? 0,
      media: mediaCount.count ?? 0,
    },
  };
}

