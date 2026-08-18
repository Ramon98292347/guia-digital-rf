import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

type Tenant = Pick<
  Database["public"]["Tables"]["tenants"]["Row"],
  "id" | "name" | "slug" | "status" | "timezone" | "locale"
>;

type Membership = Pick<
  Database["public"]["Tables"]["tenant_members"]["Row"],
  "id" | "tenant_id" | "user_id" | "role" | "status"
>;

export type AdminRole = Membership["role"];

export type AdminTenantSummary = Tenant & {
  role: AdminRole;
};

export type AdminTenantContext = {
  user: User;
  tenant: Tenant;
  membership: Membership;
  role: AdminRole;
  tenants: AdminTenantSummary[];
};

export async function requireUser(supabase?: SupabaseServerClient) {
  const resolvedClient = supabase ?? (await createSupabaseServerClient());
  const {
    data: { user },
    error,
  } = await resolvedClient.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return user;
}

export async function getAdminTenants(supabase: SupabaseServerClient) {
  const user = await requireUser(supabase);
  const { data: memberships, error } = await supabase
    .from("tenant_members")
    .select("id, tenant_id, user_id, role, status")
    .eq("user_id", user.id)
    .eq("status", "active");

  if (error) {
    throw error;
  }

  const tenantIds = memberships.map((membership) => membership.tenant_id);

  if (tenantIds.length === 0) {
    return [];
  }

  const { data: tenants, error: tenantsError } = await supabase
    .from("tenants")
    .select("id, name, slug, status, timezone, locale")
    .in("id", tenantIds)
    .order("name", { ascending: true });

  if (tenantsError) {
    throw tenantsError;
  }

  return tenants
    .map((tenant) => {
      const membership = memberships.find((item) => item.tenant_id === tenant.id);
      return membership ? { ...tenant, role: membership.role } : null;
    })
    .filter((tenant): tenant is AdminTenantSummary => tenant !== null);
}

export async function requireTenantAccess(tenantSlug: string) {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);
  const tenants = await getAdminTenants(supabase);
  const tenantSummary = tenants.find((tenant) => tenant.slug === tenantSlug);

  if (!tenantSummary) {
    return null;
  }

  const { data: membership, error } = await supabase
    .from("tenant_members")
    .select("id, tenant_id, user_id, role, status")
    .eq("tenant_id", tenantSummary.id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (error || !membership) {
    return null;
  }

  const tenant: Tenant = {
    id: tenantSummary.id,
    name: tenantSummary.name,
    slug: tenantSummary.slug,
    status: tenantSummary.status,
    timezone: tenantSummary.timezone,
    locale: tenantSummary.locale,
  };

  return {
    user,
    tenant,
    membership,
    role: membership.role,
    tenants,
  } satisfies AdminTenantContext;
}

export function formatAdminRole(role: AdminRole) {
  const labels: Record<AdminRole, string> = {
    tenant_admin: "Administrador",
    tenant_staff: "Colaborador",
  };

  return labels[role];
}
