import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

type ResolvedTenantRow = Database["public"]["Functions"]["resolve_tenant"]["Returns"][number];

export type ResolvedPublicTenant = ResolvedTenantRow;

function normalizeHostname(hostname: string | null | undefined) {
  if (!hostname) {
    return null;
  }

  const firstValue = hostname.split(",")[0]?.trim().toLowerCase();

  if (!firstValue) {
    return null;
  }

  return firstValue.replace(/:\d+$/, "");
}

export async function resolvePublicTenant(input: {
  hostname: string | null | undefined;
  pathname: string;
  fallbackSlug?: string;
}): Promise<ResolvedPublicTenant | null> {
  const supabase = createSupabaseAdminClient();
  const normalizedHostname = normalizeHostname(input.hostname) ?? "localhost";
  const normalizedPathnameRaw =
    input.pathname.startsWith("/") ? input.pathname : `/${input.pathname}`;
  const normalizedPathname = normalizedPathnameRaw.startsWith("/guia/")
    ? normalizedPathnameRaw.replace(/^\/guia/, "")
    : normalizedPathnameRaw;

  const { data: domains, error: domainsError } = await supabase
    .from("tenant_domains")
    .select(
      "tenant_id, hostname, path_prefix, domain_type, status, verification_status, is_primary, created_at",
    )
    .eq("hostname", normalizedHostname)
    .eq("status", "active")
    .eq("verification_status", "verified");

  if (domainsError) {
    throw domainsError;
  }

  const matchedDomain = domains
    .filter((domain) => {
      if (domain.domain_type !== "platform_path") {
        return true;
      }

      if (!domain.path_prefix) {
        return false;
      }

      return (
        normalizedPathname === domain.path_prefix ||
        normalizedPathname.startsWith(`${domain.path_prefix}/`)
      );
    })
    .sort((left, right) => {
      if (left.is_primary === right.is_primary) {
        return left.created_at.localeCompare(right.created_at);
      }

      return left.is_primary ? -1 : 1;
    })[0];

  if (matchedDomain) {
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, name, slug, timezone, locale, status")
      .eq("id", matchedDomain.tenant_id)
      .eq("status", "active")
      .not("published_at", "is", null)
      .maybeSingle();

    if (tenantError) {
      throw tenantError;
    }

    if (tenant) {
      return {
        tenant_id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        timezone: tenant.timezone,
        locale: tenant.locale,
        status: tenant.status,
        domain_type: matchedDomain.domain_type,
        canonical_hostname: matchedDomain.hostname,
        path_prefix: matchedDomain.path_prefix ?? `/${tenant.slug}`,
      };
    }
  }

  if (!input.fallbackSlug) {
    return null;
  }

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, name, slug, timezone, locale, status")
    .eq("slug", input.fallbackSlug)
    .eq("status", "active")
    .not("published_at", "is", null)
    .maybeSingle();

  if (tenantError) {
    throw tenantError;
  }

  if (!tenant) {
    return null;
  }

  return {
    tenant_id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    timezone: tenant.timezone,
    locale: tenant.locale,
    status: tenant.status,
    domain_type: "platform_path",
    canonical_hostname: normalizedHostname,
    path_prefix: `/guia/${tenant.slug}`,
  };
}
