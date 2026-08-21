"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenantAccess } from "@/features/auth/server/admin-access";

const sectionTypes = [
  "accommodations",
  "videos",
  "gallery",
  "services",
  "content",
  "local_tips",
  "booking_cta",
] as const;
const heroVariants = [
  "immersive",
  "image-overlay",
  "minimal",
  "organic",
] as const;
const overlays = ["light", "medium", "strong"] as const;
const positions = ["top", "center", "bottom"] as const;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}
function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}
function valid<T extends readonly string[]>(
  value: string,
  values: T,
): value is T[number] {
  return values.includes(value);
}
function color(formData: FormData, key: string) {
  const value = text(formData, key);
  if (value && !/^#[0-9A-Fa-f]{6}$/.test(value))
    throw new Error(`Cor inválida em ${key}.`);
  return value || null;
}
function maybeThemeValue(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? value : null;
}

export async function saveGuideHomeAction(
  tenantSlug: string,
  formData: FormData,
) {
  const context = await requireTenantAccess(tenantSlug);
  if (!context) redirect("/admin/no-access");
  const mediaId = text(formData, "heroMediaId");
  const logoMediaId = text(formData, "logoMediaId");
  for (const selectedId of [mediaId, logoMediaId].filter(Boolean)) {
    const { data: media, error } = await context.supabase
      .from("media")
      .select("id")
      .eq("id", selectedId)
      .eq("tenant_id", context.tenant.id)
      .eq("status", "published")
      .eq("media_type", "image")
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!media)
      throw new Error(
        "A imagem selecionada não pertence a este estabelecimento ou não está publicada.",
      );
  }
  const current = await context.supabase
    .from("tenant_design_settings")
    .select("design_config")
    .eq("tenant_id", context.tenant.id)
    .maybeSingle();
  if (current.error) throw current.error;
  const existing =
    current.data?.design_config &&
    typeof current.data.design_config === "object" &&
    !Array.isArray(current.data.design_config)
      ? (current.data.design_config as Record<string, unknown>)
      : {};
  const heroVariant = text(formData, "heroVariant");
  const overlay = text(formData, "heroOverlay");
  const position = text(formData, "heroMediaPosition");
  if (
    !valid(heroVariant, heroVariants) ||
    !valid(overlay, overlays) ||
    !valid(position, positions)
  )
    throw new Error("Configuração visual inválida.");
  const logoSize = text(formData, "logoSize");
  if (!valid(logoSize, ["small", "medium", "large"] as const))
    throw new Error("Tamanho de logo inválido.");
  const themeConfig = {
    primary_color: color(formData, "primary_color"),
    secondary_color: color(formData, "secondary_color"),
    accent_color: color(formData, "accent_color"),
    background_color: color(formData, "background_color"),
    surface_color: color(formData, "surface_color"),
    border_color: color(formData, "border_color"),
    text_color: color(formData, "text_color"),
    muted_text_color: color(formData, "muted_text_color"),
    title_color: color(formData, "title_color"),
    subtitle_color: color(formData, "subtitle_color"),
    card_title_color: color(formData, "card_title_color"),
    card_text_color: color(formData, "card_text_color"),
    card_subtitle_color: color(formData, "card_subtitle_color"),
    section_title_color: color(formData, "section_title_color"),
    section_subtitle_color: color(formData, "section_subtitle_color"),
    button_text_color: color(formData, "button_text_color"),
    icon_color: color(formData, "icon_color"),
    card_variant: maybeThemeValue(formData, "card_variant"),
    button_variant: maybeThemeValue(formData, "button_variant"),
    icon_style: maybeThemeValue(formData, "icon_style"),
    radius_scale: maybeThemeValue(formData, "radius_scale"),
    shadow_level: maybeThemeValue(formData, "shadow_level"),
  };

  const { error } = await context.supabase
    .from("tenant_design_settings")
    .upsert(
      {
        tenant_id: context.tenant.id,
        design_config: {
          ...existing,
          ...themeConfig,
          logoMediaId: logoMediaId || null,
          logoEnabled: checked(formData, "logoEnabled"),
          logoSize,
          heroMediaId: mediaId || null,
          heroTitle: text(formData, "heroTitle") || null,
          heroTitleColor: color(formData, "heroTitleColor"),
          heroSubtitle: text(formData, "heroSubtitle") || null,
          heroCallToAction: text(formData, "heroCallToAction") || null,
          welcomeMessage: text(formData, "welcomeMessage") || null,
          heroEnabled: checked(formData, "heroEnabled"),
          showGreeting: checked(formData, "showGreeting"),
          heroVariant,
          heroOverlay: overlay,
          heroMediaPosition: position,
        },
      },
      { onConflict: "tenant_id" },
    );
  if (error) throw error;
  revalidatePath(`/admin/${tenantSlug}/inicio`);
  revalidatePath(`/guia/${tenantSlug}`);
  redirect(`/admin/${tenantSlug}/inicio?status=salvo`);
}

export async function saveGuideHomeSectionAction(
  tenantSlug: string,
  formData: FormData,
) {
  const context = await requireTenantAccess(tenantSlug);
  if (!context) redirect("/admin/no-access");
  const id = text(formData, "id");
  const sectionType = text(formData, "section_type");
  if (!valid(sectionType, sectionTypes))
    throw new Error("Tipo de seção inválido.");
  const payload = {
    tenant_id: context.tenant.id,
    section_type: sectionType,
    title: text(formData, "title") || null,
    variant: text(formData, "variant") || null,
    enabled: checked(formData, "enabled"),
    sort_order: Number(text(formData, "sort_order") || 0),
    content_source: "manual" as const,
  };
  const query = id
    ? context.supabase
        .from("tenant_home_sections")
        .update(payload)
        .eq("tenant_id", context.tenant.id)
        .eq("id", id)
    : context.supabase.from("tenant_home_sections").insert(payload);
  const { error } = await query;
  if (error) throw error;
  revalidatePath(`/admin/${tenantSlug}/inicio`);
  revalidatePath(`/guia/${tenantSlug}`);
  redirect(`/admin/${tenantSlug}/inicio?status=salvo`);
}

export async function toggleGuideHomeSectionAction(
  tenantSlug: string,
  id: string,
  enabled: boolean,
) {
  const context = await requireTenantAccess(tenantSlug);
  if (!context) redirect("/admin/no-access");
  const { error } = await context.supabase
    .from("tenant_home_sections")
    .update({ enabled })
    .eq("tenant_id", context.tenant.id)
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/admin/${tenantSlug}/inicio`);
  revalidatePath(`/guia/${tenantSlug}`);
}

export async function moveGuideHomeSectionAction(
  tenantSlug: string,
  id: string,
  direction: "up" | "down",
  order: number,
) {
  const context = await requireTenantAccess(tenantSlug);
  if (!context) redirect("/admin/no-access");
  const { error } = await context.supabase
    .from("tenant_home_sections")
    .update({ sort_order: Math.max(0, order + (direction === "up" ? -1 : 1)) })
    .eq("tenant_id", context.tenant.id)
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/admin/${tenantSlug}/inicio`);
  revalidatePath(`/guia/${tenantSlug}`);
}
