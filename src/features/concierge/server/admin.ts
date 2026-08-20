import { requireTenantAccess } from "@/features/auth/server/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Query = {
  select: (columns?: string) => Query;
  eq: (column: string, value: unknown) => Query;
  order: (column: string, options?: { ascending?: boolean }) => Query;
  maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }>;
  then: Promise<unknown>["then"];
};
type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;
const table = (client: Client, name: string) => (client.from as unknown as (tableName: string) => Query)(name);

export async function getConciergeAdminData(tenantSlug: string) {
  const context = await requireTenantAccess(tenantSlug);
  if (!context) return null;
  const [settings, knowledge, media, contacts] = await Promise.all([
    table(context.supabase, "concierge_settings").select("*").eq("tenant_id", context.tenant.id).maybeSingle(),
    table(context.supabase, "concierge_knowledge").select("*").eq("tenant_id", context.tenant.id).eq("status", "published").order("updated_at", { ascending: false }).maybeSingle(),
    context.supabase.from("media").select("id, original_filename, media_type").eq("tenant_id", context.tenant.id).eq("status", "published").is("deleted_at", null).in("media_type", ["image", "video"]).order("created_at", { ascending: false }),
    context.supabase.from("contacts").select("id, label, value, contact_type, status").eq("tenant_id", context.tenant.id).eq("status", "published").order("sort_order", { ascending: true }),
  ]);
  if ((settings as { error?: { message: string } }).error) throw new Error((settings as { error: { message: string } }).error.message);
  if ((knowledge as { error?: { message: string } }).error) throw new Error((knowledge as { error: { message: string } }).error.message);
  if (media.error) throw media.error;
  if (contacts.error) throw contacts.error;
  return {
    settings: ((settings as { data?: unknown }).data ?? null) as Record<string, unknown> | null,
    knowledge: ((knowledge as { data?: unknown }).data ?? null) as Record<string, unknown> | null,
    media: media.data,
    contacts: contacts.data,
  };
}
