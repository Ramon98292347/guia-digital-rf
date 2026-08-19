"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenantAccess } from "@/features/auth/server/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getResourceDefinition, type ResourceKey } from "./resource-config";

type GenericResult = { data: unknown; error: { message: string } | null };
type GenericQuery = {
  select: (columns?: string) => GenericQuery;
  eq: (column: string, value: unknown) => GenericQuery;
  order: (column: string, options?: { ascending?: boolean }) => GenericQuery;
  maybeSingle: () => Promise<GenericResult>;
  then: Promise<GenericResult>["then"];
  insert: (values: Record<string, unknown>) => GenericQuery;
  update: (values: Record<string, unknown>) => GenericQuery;
  upsert: (values: Record<string, unknown>, options?: { onConflict?: string }) => GenericQuery;
  delete: () => GenericQuery;
};

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

function table(supabase: ServerClient, name: string) {
  return (supabase.from as unknown as (tableName: string) => GenericQuery)(name);
}

function readValue(formData: FormData, name: string, type: string) {
  if (type === "checkbox") return formData.get(name) === "on";
  const value = String(formData.get(name) ?? "").trim();
  if (type === "number") return value === "" ? null : Number(value);
  return value === "" ? null : value;
}

export async function saveResourceAction(
  resourceKey: ResourceKey,
  tenantSlug: string,
  formData: FormData,
) {
  const definition = getResourceDefinition(resourceKey);
  if (!definition) return;
  const context = await requireTenantAccess(tenantSlug);
  if (!context) redirect("/admin/no-access");

  const payload: Record<string, unknown> = {};
  for (const field of definition.fields) {
    payload[field.name] = readValue(formData, field.name, field.type);
  }

  const mediaFields = ["image_media_id", "video_media_id", "video_cover_media_id"];
  const selectedMediaIds = mediaFields
    .map((field) => payload[field])
    .filter((value): value is string => typeof value === "string" && value.length > 0);
  if (selectedMediaIds.length > 0) {
    const mediaResult = await context.supabase
      .from("media")
      .select("id, media_type, status")
      .eq("tenant_id", context.tenant.id)
      .in("id", selectedMediaIds)
      .is("deleted_at", null);
    if (mediaResult.error) throw new Error(mediaResult.error.message);
    const mediaById = new Map((mediaResult.data ?? []).map((media) => [media.id, media]));
    if (selectedMediaIds.some((id) => !mediaById.has(id))) {
      throw new Error("A mídia selecionada não pertence a este estabelecimento ou não está disponível.");
    }
    const imageId = payload.image_media_id;
    const videoId = payload.video_media_id;
    const coverId = payload.video_cover_media_id;
    if (typeof imageId === "string" && mediaById.get(imageId)?.media_type !== "image") throw new Error("A foto selecionada precisa ser uma imagem.");
    if (typeof coverId === "string" && mediaById.get(coverId)?.media_type !== "image") throw new Error("A capa do vídeo precisa ser uma imagem.");
    if (typeof videoId === "string" && mediaById.get(videoId)?.media_type !== "video") throw new Error("O arquivo selecionado para vídeo precisa ser um vídeo.");
  }

  if (resourceKey === "servicos" && !payload.slug && typeof payload.name === "string") {
    payload.slug = payload.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  const id = String(formData.get("id") ?? "").trim();
  const query = table(context.supabase, definition.table);
  let result: GenericResult;

  if (definition.singleton) {
    result = await query.upsert({ tenant_id: context.tenant.id, ...payload }, { onConflict: "tenant_id" });
  } else if (id) {
    result = await query.update(payload).eq("tenant_id", context.tenant.id).eq("id", id);
  } else {
    result = await query.insert({ tenant_id: context.tenant.id, ...payload });
  }

  if (result.error) throw new Error(result.error.message);
  revalidatePath(`/admin/${tenantSlug}/${resourceKey}`);
  redirect(`/admin/${tenantSlug}/${resourceKey}?status=salvo`);
}

export async function archiveResourceAction(
  resourceKey: ResourceKey,
  tenantSlug: string,
  id: string,
) {
  const definition = getResourceDefinition(resourceKey);
  if (!definition || definition.singleton) return;
  const context = await requireTenantAccess(tenantSlug);
  if (!context) redirect("/admin/no-access");
  const result = await table(context.supabase, definition.table)
    .update({ status: "archived" })
    .eq("tenant_id", context.tenant.id)
    .eq("id", id);
  if (result.error) throw new Error(result.error.message);
  revalidatePath(`/admin/${tenantSlug}/${resourceKey}`);
  redirect(`/admin/${tenantSlug}/${resourceKey}?status=arquivado`);
}

export async function restoreResourceAction(resourceKey: ResourceKey, tenantSlug: string, id: string) {
  const definition = getResourceDefinition(resourceKey);
  if (!definition || definition.singleton) return;
  const context = await requireTenantAccess(tenantSlug);
  if (!context) redirect("/admin/no-access");
  const result = await table(context.supabase, definition.table)
    .update({ status: "draft" })
    .eq("tenant_id", context.tenant.id)
    .eq("id", id);
  if (result.error) throw new Error(result.error.message);
  revalidatePath(`/admin/${tenantSlug}/${resourceKey}`);
  redirect(`/admin/${tenantSlug}/${resourceKey}?status=restaurado`);
}

export async function deleteResourceAction(
  resourceKey: ResourceKey,
  tenantSlug: string,
  id: string,
) {
  const definition = getResourceDefinition(resourceKey);
  if (!definition || definition.singleton) return;
  const context = await requireTenantAccess(tenantSlug);
  if (!context) redirect("/admin/no-access");
  const result = await table(context.supabase, definition.table)
    .delete()
    .eq("tenant_id", context.tenant.id)
    .eq("id", id)
    .eq("status", "archived");
  if (result.error) throw new Error(result.error.message);
  revalidatePath(`/admin/${tenantSlug}/${resourceKey}`);
  redirect(`/admin/${tenantSlug}/${resourceKey}?status=excluido`);
}

export async function moveResourceAction(
  resourceKey: ResourceKey,
  tenantSlug: string,
  id: string,
  direction: "up" | "down",
  currentOrder: number,
) {
  const definition = getResourceDefinition(resourceKey);
  if (!definition || definition.singleton) return;
  const context = await requireTenantAccess(tenantSlug);
  if (!context) redirect("/admin/no-access");
  const nextOrder = Math.max(0, currentOrder + (direction === "up" ? -1 : 1));
  const result = await table(context.supabase, definition.table)
    .update({ sort_order: nextOrder })
    .eq("tenant_id", context.tenant.id)
    .eq("id", id);
  if (result.error) throw new Error(result.error.message);
  revalidatePath(`/admin/${tenantSlug}/${resourceKey}`);
}

export async function saveSchedulePeriodAction(tenantSlug: string, formData: FormData) {
  const context = await requireTenantAccess(tenantSlug);
  if (!context) redirect("/admin/no-access");
  const scheduleId = String(formData.get("schedule_id") ?? "").trim();
  if (!scheduleId) return;
  const isClosed = formData.get("is_closed") === "on";
  const result = await table(context.supabase, "schedule_periods").insert({
    tenant_id: context.tenant.id,
    schedule_id: scheduleId,
    day_of_week: Number(formData.get("day_of_week") ?? 0),
    opens_at: isClosed ? null : String(formData.get("opens_at") ?? "") || null,
    closes_at: isClosed ? null : String(formData.get("closes_at") ?? "") || null,
    is_closed: isClosed,
    label: String(formData.get("label") ?? "").trim() || null,
    sort_order: Number(formData.get("sort_order") ?? 0),
  });
  if (result.error) throw new Error(result.error.message);
  revalidatePath(`/admin/${tenantSlug}/horarios`);
}

export async function deleteSchedulePeriodAction(tenantSlug: string, periodId: string) {
  const context = await requireTenantAccess(tenantSlug);
  if (!context) redirect("/admin/no-access");
  const result = await table(context.supabase, "schedule_periods")
    .delete()
    .eq("tenant_id", context.tenant.id)
    .eq("id", periodId);
  if (result.error) throw new Error(result.error.message);
  revalidatePath(`/admin/${tenantSlug}/horarios`);
}
