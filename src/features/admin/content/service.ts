import { requireTenantAccess } from "@/features/auth/server/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getResourceDefinition, type ResourceKey, type ResourceOption } from "./resource-config";

type GenericResult = { data: unknown; error: { message: string } | null };
type GenericQuery = {
  select: (columns?: string) => GenericQuery;
  eq: (column: string, value: unknown) => GenericQuery;
  order: (column: string, options?: { ascending?: boolean }) => GenericQuery;
  maybeSingle: () => Promise<GenericResult>;
  then: Promise<GenericResult>["then"];
};

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

function table(supabase: ServerClient, name: string) {
  return (supabase.from as unknown as (tableName: string) => GenericQuery)(name);
}

export async function getResourcePageData(tenantSlug: string, resourceKey: ResourceKey) {
  const definition = getResourceDefinition(resourceKey);
  if (!definition) return null;
  const context = await requireTenantAccess(tenantSlug);
  if (!context) return null;
  const query = table(context.supabase, definition.table).select("*").eq("tenant_id", context.tenant.id);
  const result = definition.singleton
    ? await query.maybeSingle()
    : await query.order("sort_order", { ascending: true });
  if (result.error) throw new Error(result.error.message);
  const rows = definition.singleton ? (result.data ? [result.data] : []) : Array.isArray(result.data) ? result.data : [];
  const options: Record<string, ResourceOption[]> = {};
  if (resourceKey === "galeria" || resourceKey === "dicas") {
    const categoryTable = resourceKey === "galeria" ? "gallery_categories" : "local_tip_categories";
    const categoryResult = await table(context.supabase, categoryTable).select("id, name").eq("tenant_id", context.tenant.id).order("sort_order", { ascending: true });
    if (categoryResult.error) throw new Error(categoryResult.error.message);
    options.category_id = (Array.isArray(categoryResult.data) ? categoryResult.data : []).map((item) => ({ value: String(item.id), label: String(item.name) }));
  }
  if (["servicos", "wifi", "regras", "contatos", "localizacao", "galeria", "dicas"].includes(resourceKey)) {
    const mediaResult = await table(context.supabase, "media").select("id, original_filename, media_type").eq("tenant_id", context.tenant.id).eq("status", "published").order("created_at", { ascending: false });
    if (mediaResult.error) throw new Error(mediaResult.error.message);
    const mediaOptions = (Array.isArray(mediaResult.data) ? mediaResult.data : []).map((item) => ({ value: String(item.id), label: `${String(item.original_filename ?? "Mídia")} (${String(item.media_type)})` }));
    options.media_id = mediaOptions;
    options.image_media_id = mediaOptions.filter((item) => item.label.endsWith("(image)"));
    options.video_media_id = mediaOptions.filter((item) => item.label.endsWith("(video)"));
    options.video_cover_media_id = options.image_media_id;
  }
  let periods: Record<string, unknown>[] = [];
  if (resourceKey === "horarios") {
    const periodResult = await table(context.supabase, "schedule_periods").select("*").eq("tenant_id", context.tenant.id).order("day_of_week", { ascending: true });
    if (periodResult.error) throw new Error(periodResult.error.message);
    periods = (Array.isArray(periodResult.data) ? periodResult.data : []) as Record<string, unknown>[];
  }
  return { context, definition, rows: rows as Record<string, unknown>[], options, periods };
}
