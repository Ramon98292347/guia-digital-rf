"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenantAccess } from "@/features/auth/server/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Query = {
  select: (columns?: string) => Query;
  eq: (column: string, value: unknown) => Query;
  maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>;
  single: () => Promise<{ data: Record<string, unknown>; error: { message: string } | null }>;
  insert: (values: Record<string, unknown>) => Query;
  update: (values: Record<string, unknown>) => Query;
  upsert: (values: Record<string, unknown>, options?: { onConflict?: string }) => Query;
  delete: () => Query;
  then: Promise<{ data: unknown; error: { message: string } | null }>["then"];
};
type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;
const table = (client: Client, name: string) => (client.from as unknown as (tableName: string) => Query)(name);

function value(formData: FormData, name: string) { const raw = String(formData.get(name) ?? "").trim(); return raw || null; }
function slugify(raw: string) { return raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function price(raw: string | null) { if (!raw) return null; const parsed = Number(raw.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".")); return Number.isFinite(parsed) ? parsed : null; }

export async function saveContentCollectionAction(tenantSlug: string, formData: FormData) {
  const context = await requireTenantAccess(tenantSlug); if (!context) redirect("/admin/no-access");
  const title = value(formData, "title"); if (!title) throw new Error("Informe o nome da área.");
  const id = value(formData, "id");
  const payload = { tenant_id: context.tenant.id, slug: value(formData, "slug") || slugify(title), title, description: value(formData, "description"), kind: value(formData, "kind") || "information", status: value(formData, "status") || "draft", sort_order: Number(formData.get("sort_order") ?? 0) };
  const result = id ? await table(context.supabase, "content_collections").update(payload).eq("tenant_id", context.tenant.id).eq("id", id) : await table(context.supabase, "content_collections").insert(payload);
  if (result.error) throw new Error(result.error.message);
  revalidatePath(`/admin/${tenantSlug}/conteudos`); revalidatePath(`/guia/${tenantSlug}`); redirect(`/admin/${tenantSlug}/conteudos?status=salvo`);
}

export async function saveContentItemAction(tenantSlug: string, formData: FormData) {
  const context = await requireTenantAccess(tenantSlug); if (!context) redirect("/admin/no-access");
  const title = value(formData, "title"); const collectionId = value(formData, "collection_id"); if (!title || !collectionId) throw new Error("Informe o título e a área do conteúdo.");
  const id = value(formData, "id");
  const payload = { tenant_id: context.tenant.id, collection_id: collectionId, title, subtitle: value(formData, "subtitle"), description: value(formData, "description"), price: price(value(formData, "price")), supplier: value(formData, "supplier"), instructions: value(formData, "instructions"), alert_text: value(formData, "alert_text"), external_url: value(formData, "external_url"), status: value(formData, "status") || "draft", sort_order: Number(formData.get("sort_order") ?? 0) };
  const result = id ? await table(context.supabase, "content_items").update(payload).eq("tenant_id", context.tenant.id).eq("id", id) : await table(context.supabase, "content_items").insert(payload).select("id").single();
  if (result.error) throw new Error(result.error.message);
  const accommodationId = value(formData, "accommodation_id");
  const itemId = id ?? String((result as { data?: Record<string, unknown> }).data?.id ?? "");
  if (itemId) await table(context.supabase, "content_item_accommodations").delete().eq("tenant_id", context.tenant.id).eq("content_item_id", itemId);
  if (accommodationId && itemId) { const relation = await table(context.supabase, "content_item_accommodations").upsert({ tenant_id: context.tenant.id, content_item_id: itemId, accommodation_id: accommodationId }, { onConflict: "tenant_id,content_item_id,accommodation_id" }); if (relation.error) throw new Error(relation.error.message); }
  revalidatePath(`/admin/${tenantSlug}/conteudos`); revalidatePath(`/guia/${tenantSlug}`); redirect(`/admin/${tenantSlug}/conteudos?status=salvo`);
}

export async function archiveContentAction(tenantSlug: string, tableName: "content_collections" | "content_items", id: string) {
  const context = await requireTenantAccess(tenantSlug); if (!context) redirect("/admin/no-access");
  const result = await table(context.supabase, tableName).update({ status: "archived" }).eq("tenant_id", context.tenant.id).eq("id", id);
  if (result.error) throw new Error(result.error.message);
  revalidatePath(`/admin/${tenantSlug}/conteudos`); revalidatePath(`/guia/${tenantSlug}`); redirect(`/admin/${tenantSlug}/conteudos?status=arquivado`);
}
