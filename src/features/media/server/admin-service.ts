import { notFound } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MEDIA_STORAGE } from "@/features/media/config";
import { getPrivatePreviewUrl, resolvePublicMediaUrl } from "@/features/media/service";
import { requireTenantAccess, type AdminTenantContext } from "@/features/auth/server/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type TypedSupabaseClient = SupabaseClient<Database>;
type MediaRow = Database["public"]["Tables"]["media"]["Row"];

export type AdminMediaItem = Pick<
  MediaRow,
  | "id"
  | "media_type"
  | "storage_bucket"
  | "storage_path"
  | "original_filename"
  | "mime_type"
  | "size_bytes"
  | "alt_text"
  | "caption"
  | "status"
  | "created_at"
  | "updated_at"
> & { previewUrl: string | null };

export type AdminMediaData = {
  context: AdminTenantContext;
  media: AdminMediaItem[];
};

async function requireMediaContext(tenantSlug: string) {
  const context = await requireTenantAccess(tenantSlug);

  if (!context) {
    notFound();
  }

  return context;
}

async function getPreviewUrl(
  supabase: TypedSupabaseClient,
  tenantId: string,
  media: Pick<MediaRow, "id" | "status" | "storage_bucket" | "storage_path">,
) {
  if (media.status === "published") {
    return resolvePublicMediaUrl(supabase, media);
  }

  if (media.storage_bucket !== MEDIA_STORAGE.privateBucket || media.status === "archived") {
    return null;
  }

  return getPrivatePreviewUrl(supabase, { tenantId, mediaId: media.id });
}

export async function getAdminMediaData(tenantSlug: string): Promise<AdminMediaData> {
  const context = await requireMediaContext(tenantSlug);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("media")
    .select("id, media_type, storage_bucket, storage_path, original_filename, mime_type, size_bytes, alt_text, caption, status, created_at, updated_at")
    .eq("tenant_id", context.tenant.id)
    .is("deleted_at", null)
    .in("media_type", ["image", "video"])
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  const media = await Promise.all(
    data.map(async (item) => ({
      ...item,
      previewUrl: await getPreviewUrl(supabase, context.tenant.id, item),
    })),
  );

  return { context, media };
}
