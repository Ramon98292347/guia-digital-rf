import { requireTenantAccess } from "@/features/auth/server/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Query = { select: (columns?: string) => Query; eq: (column: string, value: unknown) => Query; order: (column: string, options?: { ascending?: boolean }) => Query; then: Promise<unknown>["then"] };
type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;
const table = (client: Client, name: string) => (client.from as unknown as (tableName: string) => Query)(name);

export async function getUniversalContentAdminData(tenantSlug: string) {
  const context = await requireTenantAccess(tenantSlug); if (!context) return null;
  const [collections, items, itemMedia, accommodations, media] = await Promise.all([
    table(context.supabase, "content_collections").select("*").eq("tenant_id", context.tenant.id).order("sort_order", { ascending: true }),
    table(context.supabase, "content_items").select("*").eq("tenant_id", context.tenant.id).order("sort_order", { ascending: true }),
    table(context.supabase, "content_item_media").select("*").eq("tenant_id", context.tenant.id).order("sort_order", { ascending: true }),
    context.supabase.from("accommodations").select("id, name").eq("tenant_id", context.tenant.id).order("sort_order", { ascending: true }),
    context.supabase.from("media").select("id, original_filename, media_type, status").eq("tenant_id", context.tenant.id).eq("status", "published").is("deleted_at", null).order("created_at", { ascending: false }),
  ]);
  if ((collections as { error?: unknown }).error) throw (collections as { error: unknown }).error;
  if ((items as { error?: unknown }).error) throw (items as { error: unknown }).error;
  if ((itemMedia as { error?: unknown }).error) throw (itemMedia as { error: unknown }).error;
  if (accommodations.error) throw accommodations.error;
  if (media.error) throw media.error;
  return { context, collections: ((collections as { data?: unknown }).data ?? []) as Record<string, unknown>[], items: ((items as { data?: unknown }).data ?? []) as Record<string, unknown>[], itemMedia: ((itemMedia as { data?: unknown }).data ?? []) as Record<string, unknown>[], accommodations: accommodations.data, media: media.data };
}
