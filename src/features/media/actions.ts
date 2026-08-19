"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MediaInUseError, publishMedia, removeMedia, uploadPrivateMedia } from "@/features/media/service";
import { requireTenantAccess } from "@/features/auth/server/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MEDIA_STORAGE, type MediaCategory } from "@/features/media/config";

type MediaActionState = { error?: string };

async function requireMediaAdmin(tenantSlug: string) {
  const context = await requireTenantAccess(tenantSlug);

  if (!context || context.role !== "tenant_admin") {
    throw new Error("Apenas administradores podem publicar ou excluir mídia.");
  }

  return context;
}

export async function uploadMediaAction(
  params: { tenantSlug: string },
  _previousState: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  const context = await requireTenantAccess(params.tenantSlug);
  const fileEntries = formData.getAll("files");
  const category = formData.get("category")?.toString() as MediaCategory;

  if (!context || !fileEntries.some((entry) => entry instanceof File && entry.size > 0)) {
    return { error: "Selecione uma foto ou vídeo para enviar." };
  }

  if (!MEDIA_STORAGE.categories.includes(category)) {
    return { error: "Selecione uma categoria válida." };
  }

  try {
    const errors: string[] = [];
    for (const entry of fileEntries) {
      if (!(entry instanceof File) || entry.size === 0) continue;
      if (!entry.type.startsWith("image/") && !entry.type.startsWith("video/")) {
        errors.push(`${entry.name}: tipo de arquivo não permitido.`);
        continue;
      }
      try {
        await uploadPrivateMedia(context.supabase, {
          tenantId: context.tenant.id,
          category,
          file: entry,
          uploadedBy: context.user.id,
          altText: formData.get("altText")?.toString() || null,
          caption: formData.get("caption")?.toString() || null,
        });
      } catch (error) {
        errors.push(`${entry.name}: ${error instanceof Error ? error.message : "falha no envio."}`);
      }
    }
    if (errors.length > 0) return { error: errors.join(" ") };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Não foi possível enviar a mídia.",
    };
  }

  revalidatePath(`/admin/${params.tenantSlug}/midia`);
  redirect(`/admin/${params.tenantSlug}/midia?status=enviada`);
}

export async function publishMediaAction(params: { tenantSlug: string; mediaId: string }) {
  const context = await requireMediaAdmin(params.tenantSlug);
  await publishMedia({ tenantId: context.tenant.id, mediaId: params.mediaId });
  revalidatePath(`/admin/${params.tenantSlug}/midia`);
  redirect(`/admin/${params.tenantSlug}/midia?status=publicada`);
}

export async function archiveMediaAction(params: { tenantSlug: string; mediaId: string }) {
  const context = await requireMediaAdmin(params.tenantSlug);
  const supabase = await createSupabaseServerClient();
  const { data: media, error } = await supabase
    .from("media")
    .select("id, storage_bucket, storage_path")
    .eq("id", params.mediaId)
    .eq("tenant_id", context.tenant.id)
    .is("deleted_at", null)
    .single();

  if (error || !media) {
    throw new Error("Mídia não encontrada.");
  }

  await removeMedia({ tenantId: context.tenant.id, mediaId: media.id, deleteFile: false, adminClient: supabase });
  revalidatePath(`/admin/${params.tenantSlug}/midia`);
  redirect(`/admin/${params.tenantSlug}/midia?status=arquivada`);
}

export type DeleteMediaState = { error: string | null; references: string[] };

export async function deleteMediaAction(
  params: { tenantSlug: string; mediaId: string },
  _previousState: DeleteMediaState,
  _formData: FormData,
): Promise<DeleteMediaState> {
  void _previousState;
  void _formData;
  try {
    const context = await requireMediaAdmin(params.tenantSlug);
    await removeMedia({ tenantId: context.tenant.id, mediaId: params.mediaId, deleteFile: true, permanently: true });
    revalidatePath(`/admin/${params.tenantSlug}/midia`);
    revalidatePath(`/guia/${params.tenantSlug}`);
    redirect(`/admin/${params.tenantSlug}/midia?status=excluida`);
  } catch (error) {
    if (error instanceof MediaInUseError) return { error: error.message, references: error.references };
    throw error;
  }
}

export async function updateMediaAction(params: { tenantSlug: string; mediaId: string }, formData: FormData) {
  const context = await requireMediaAdmin(params.tenantSlug);
  const status = String(formData.get("status") ?? "").trim();
  if (!["draft", "ready", "published", "archived"].includes(status)) throw new Error("Status de mídia inválido.");
  const current = await context.supabase.from("media").select("storage_bucket, status").eq("id", params.mediaId).eq("tenant_id", context.tenant.id).is("deleted_at", null).maybeSingle();
  if (current.error || !current.data) throw new Error("Mídia não encontrada.");
  if (status === "published" && current.data.storage_bucket === MEDIA_STORAGE.privateBucket && current.data.status !== "published") {
    throw new Error("Use a ação Publicar para mover o arquivo ao Storage público com segurança.");
  }
  const { error } = await context.supabase
    .from("media")
    .update({
      caption: String(formData.get("caption") ?? "").trim() || null,
      alt_text: String(formData.get("alt_text") ?? "").trim() || null,
      status,
      updated_by: context.user.id,
    })
    .eq("id", params.mediaId)
    .eq("tenant_id", context.tenant.id)
    .is("deleted_at", null);
  if (error) throw new Error("Não foi possível atualizar a mídia.");
  revalidatePath(`/admin/${params.tenantSlug}/midia`);
  redirect(`/admin/${params.tenantSlug}/midia?status=atualizada`);
}
