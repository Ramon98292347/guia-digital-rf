import { requireTenantAccess } from "@/features/auth/server/admin-access";
import {
  getPrivatePreviewUrl,
  resolvePublicMediaUrl,
} from "@/features/media/service";
import { MEDIA_STORAGE } from "@/features/media/config";

export async function getGuideHomeEditorData(tenantSlug: string) {
  const context = await requireTenantAccess(tenantSlug);
  if (!context) return null;
  const [design, sections, media] = await Promise.all([
    context.supabase
      .from("tenant_design_settings")
      .select("design_config")
      .eq("tenant_id", context.tenant.id)
      .maybeSingle(),
    context.supabase
      .from("tenant_home_sections")
      .select(
        "id, section_type, title, subtitle, variant, enabled, sort_order, content_source",
      )
      .eq("tenant_id", context.tenant.id)
      .order("sort_order", { ascending: true }),
    context.supabase
      .from("media")
      .select(
        "id, original_filename, storage_bucket, storage_path, status, media_type",
      )
      .eq("tenant_id", context.tenant.id)
      .eq("media_type", "image")
      .eq("status", "published")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);
  if (design.error) throw design.error;
  if (sections.error) throw sections.error;
  if (media.error) throw media.error;
  const config =
    design.data?.design_config &&
    typeof design.data.design_config === "object" &&
    !Array.isArray(design.data.design_config)
      ? (design.data.design_config as Record<string, unknown>)
      : {};
  const mediaItems = await Promise.all(
    media.data.map(async (item) => ({
      ...item,
      previewUrl:
        item.storage_bucket === MEDIA_STORAGE.publicBucket
          ? resolvePublicMediaUrl(context.supabase, item as never)
          : await getPrivatePreviewUrl(context.supabase, {
              tenantId: context.tenant.id,
              mediaId: item.id,
            }),
    })),
  );
  return { config, sections: sections.data, media: mediaItems };
}
