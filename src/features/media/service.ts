import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MEDIA_STORAGE, type MediaCategory } from "@/features/media/config";
import {
  mediaFileInputSchema,
  mediaIdInputSchema,
  mediaPathInputSchema,
  type MediaFileInput,
} from "@/features/media/validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

type MediaRow = Database["public"]["Tables"]["media"]["Row"];
type MediaStatus = Database["public"]["Tables"]["media"]["Row"]["status"];
type TypedSupabaseClient = SupabaseClient<Database>;

export function generateMediaPath(input: {
  tenantId: string;
  category: MediaCategory;
  extension: string;
  fileId?: string;
}) {
  const parsed = mediaPathInputSchema.parse({
    tenantId: input.tenantId,
    category: input.category,
    fileId: input.fileId ?? randomUUID(),
    extension: input.extension,
  });

  return `${parsed.tenantId}/${parsed.category}/${parsed.fileId}.${parsed.extension}`;
}

export function validateMediaFile(input: MediaFileInput) {
  const parsed = mediaFileInputSchema.parse(input);
  const allowedExtensions = MEDIA_STORAGE.extensionsByMimeType[parsed.mimeType];

  if (!(allowedExtensions as readonly string[]).includes(parsed.extension)) {
    throw new Error("Extensão incompatível com o MIME informado.");
  }

  return parsed;
}

export async function getPrivatePreviewUrl(
  supabase: TypedSupabaseClient,
  input: { tenantId: string; mediaId: string },
) {
  const { tenantId, mediaId } = mediaIdInputSchema.parse(input);
  const media = await getTenantMedia(supabase, tenantId, mediaId);

  if (media.storage_bucket !== MEDIA_STORAGE.privateBucket) {
    throw new Error("Preview privado só é permitido para mídia privada.");
  }

  const { data, error } = await supabase.storage
    .from(media.storage_bucket)
    .createSignedUrl(
      media.storage_path,
      MEDIA_STORAGE.privatePreviewExpiresInSeconds,
    );

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

export async function uploadPrivateMedia(
  supabase: TypedSupabaseClient,
  input: {
    tenantId: string;
    category: MediaCategory;
    file: File;
    uploadedBy?: string | null;
    altText?: string | null;
    caption?: string | null;
  },
) {
  const extensionFromName = extname(input.file.name).replace(/^\./, "").toLowerCase();
  const validatedFile = validateMediaFile({
    mimeType: input.file.type as MediaFileInput["mimeType"],
    sizeBytes: input.file.size,
    originalFilename: input.file.name,
    extension: extensionFromName,
  });

  const storagePath = generateMediaPath({
    tenantId: input.tenantId,
    category: input.category,
    extension: validatedFile.extension,
  });

  const fileBuffer = Buffer.from(await input.file.arrayBuffer());
  const mediaType: MediaRow["media_type"] = validatedFile.mimeType.startsWith("image/")
    ? "image"
    : validatedFile.mimeType.startsWith("video/")
      ? "video"
      : "document";

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_STORAGE.privateBucket)
    .upload(storagePath, fileBuffer, {
      contentType: validatedFile.mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data, error } = await supabase
    .from("media")
    .insert({
      tenant_id: input.tenantId,
      media_type: mediaType,
      storage_bucket: MEDIA_STORAGE.privateBucket,
      storage_path: storagePath,
      original_filename: validatedFile.originalFilename,
      mime_type: validatedFile.mimeType,
      size_bytes: validatedFile.sizeBytes,
      alt_text: input.altText ?? null,
      caption: input.caption ?? null,
      status: "ready",
      created_by: input.uploadedBy ?? null,
      updated_by: input.uploadedBy ?? null,
    })
    .select()
    .single();

  if (error) {
    await supabase.storage.from(MEDIA_STORAGE.privateBucket).remove([storagePath]);
    throw error;
  }

  return data;
}

export async function publishMedia(input: {
  tenantId: string;
  mediaId: string;
  adminClient?: TypedSupabaseClient;
}) {
  const { tenantId, mediaId } = mediaIdInputSchema.parse(input);
  const supabase = input.adminClient ?? createSupabaseAdminClient();
  const media = await getTenantMedia(supabase, tenantId, mediaId);

  if (media.status === "published") {
    return media;
  }

  if (media.storage_bucket !== MEDIA_STORAGE.privateBucket) {
    throw new Error("Somente mídia privada pode ser publicada por este fluxo.");
  }

  const sourcePath = media.storage_path;
  const publicPath = sourcePath;

  const { error: copyError } = await supabase.storage
    .from(MEDIA_STORAGE.privateBucket)
    .copy(sourcePath, publicPath, {
      destinationBucket: MEDIA_STORAGE.publicBucket,
    });

  if (copyError && !copyError.message.toLowerCase().includes("already")) {
    throw copyError;
  }

  const { data, error } = await supabase
    .from("media")
    .update({
      status: "published" satisfies MediaStatus,
      storage_bucket: MEDIA_STORAGE.publicBucket,
      storage_path: publicPath,
    })
    .eq("id", mediaId)
    .eq("tenant_id", tenantId)
    .select()
    .single();

  if (error) {
    await supabase.storage.from(MEDIA_STORAGE.publicBucket).remove([publicPath]);
    throw error;
  }

  return data;
}

export async function removeMedia(input: {
  tenantId: string;
  mediaId: string;
  deleteFile?: boolean;
  permanently?: boolean;
  adminClient?: TypedSupabaseClient;
}) {
  const { tenantId, mediaId } = mediaIdInputSchema.parse(input);
  const supabase = input.adminClient ?? createSupabaseAdminClient();
  const media = await getTenantMedia(supabase, tenantId, mediaId);
  const references = await findMediaReferences(supabase, tenantId, mediaId);

  if (references.length > 0) {
    throw new MediaInUseError(references);
  }

  const query = input.permanently
    ? supabase.from("media").delete().eq("id", mediaId).eq("tenant_id", tenantId).select().single()
    : supabase.from("media").update({ status: "archived" satisfies MediaStatus }).eq("id", mediaId).eq("tenant_id", tenantId).select().single();
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  if (input.deleteFile) {
    const { error: removeError } = await supabase.storage
      .from(media.storage_bucket)
      .remove([media.storage_path]);

    if (removeError) {
      throw removeError;
    }
  }

  return data;
}

export class MediaInUseError extends Error {
  readonly references: string[];

  constructor(references: string[]) {
    super("Esta mídia está sendo utilizada em outros locais do Guia.");
    this.name = "MediaInUseError";
    this.references = references;
  }
}

export function resolvePublicMediaUrl(
  supabase: TypedSupabaseClient,
  media: Pick<MediaRow, "storage_bucket" | "storage_path" | "status">,
) {
  if (
    media.status !== "published" ||
    media.storage_bucket !== MEDIA_STORAGE.publicBucket
  ) {
    throw new Error("URL pública só pode ser resolvida para mídia publicada.");
  }

  return supabase.storage
    .from(MEDIA_STORAGE.publicBucket)
    .getPublicUrl(media.storage_path).data.publicUrl;
}

async function getTenantMedia(
  supabase: TypedSupabaseClient,
  tenantId: string,
  mediaId: string,
) {
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .eq("id", mediaId)
    .eq("tenant_id", tenantId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function findMediaReferences(
  supabase: TypedSupabaseClient,
  tenantId: string,
  mediaId: string,
) {
  const checks = await Promise.all([
    countReferences(supabase, "accommodations", tenantId, "cover_media_id", mediaId),
    countReferences(supabase, "accommodation_media", tenantId, "media_id", mediaId),
    countReferences(supabase, "services", tenantId, "cover_media_id", mediaId),
    countReferences(supabase, "gallery_items", tenantId, "media_id", mediaId),
    countReferences(supabase, "local_tips", tenantId, "cover_media_id", mediaId),
  ]);

  const labels: Record<string, string> = {
    accommodations: "Acomodação",
    accommodation_media: "Galeria da acomodação",
    services: "Serviço",
    gallery_items: "Galeria",
    local_tips: "Dica da Região",
  };
  return checks
    .filter((check) => check.count > 0)
    .map((check) => labels[check.table] ?? check.table);
}

async function countReferences(
  supabase: TypedSupabaseClient,
  table: "accommodations",
  tenantId: string,
  column: "cover_media_id",
  mediaId: string,
): Promise<{ table: string; count: number }>;
async function countReferences(
  supabase: TypedSupabaseClient,
  table: "accommodation_media",
  tenantId: string,
  column: "media_id",
  mediaId: string,
): Promise<{ table: string; count: number }>;
async function countReferences(
  supabase: TypedSupabaseClient,
  table: "services",
  tenantId: string,
  column: "cover_media_id",
  mediaId: string,
): Promise<{ table: string; count: number }>;
async function countReferences(
  supabase: TypedSupabaseClient,
  table: "gallery_items",
  tenantId: string,
  column: "media_id",
  mediaId: string,
): Promise<{ table: string; count: number }>;
async function countReferences(
  supabase: TypedSupabaseClient,
  table: "local_tips",
  tenantId: string,
  column: "cover_media_id",
  mediaId: string,
): Promise<{ table: string; count: number }>;
async function countReferences(
  supabase: TypedSupabaseClient,
  table:
    | "accommodations"
    | "accommodation_media"
    | "services"
    | "gallery_items"
    | "local_tips",
  tenantId: string,
  column: "cover_media_id" | "media_id",
  mediaId: string,
) {
  if (table === "accommodations" && column === "cover_media_id") {
    const { count, error } = await supabase
      .from("accommodations")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("cover_media_id", mediaId);

    if (error) throw error;
    return { table, count: count ?? 0 };
  }

  if (table === "accommodation_media" && column === "media_id") {
    const { count, error } = await supabase
      .from("accommodation_media")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("media_id", mediaId);

    if (error) throw error;
    return { table, count: count ?? 0 };
  }

  if (table === "services" && column === "cover_media_id") {
    const { count, error } = await supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("cover_media_id", mediaId);

    if (error) throw error;
    return { table, count: count ?? 0 };
  }

  if (table === "gallery_items" && column === "media_id") {
    const { count, error } = await supabase
      .from("gallery_items")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("media_id", mediaId);

    if (error) throw error;
    return { table, count: count ?? 0 };
  }

  const { count, error } = await supabase
    .from("local_tips")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("cover_media_id", mediaId);

  if (error) throw error;
  return { table, count: count ?? 0 };
}
