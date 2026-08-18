"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { publishMedia, removeMedia, uploadPrivateMedia } from "@/features/media/service";
import { requireTenantAccess } from "@/features/auth/server/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  const fileEntry = formData.get("file");

  if (!context || !(fileEntry instanceof File) || fileEntry.size === 0) {
    return { error: "Selecione uma foto ou vídeo para enviar." };
  }

  if (!fileEntry.type.startsWith("image/") && !fileEntry.type.startsWith("video/")) {
    return { error: "Envie somente arquivos de imagem ou vídeo." };
  }

  try {
    await uploadPrivateMedia(await createSupabaseServerClient(), {
      tenantId: context.tenant.id,
      category: "general",
      file: fileEntry,
      uploadedBy: context.user.id,
      altText: formData.get("altText")?.toString() || null,
      caption: formData.get("caption")?.toString() || null,
    });
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

export async function deleteMediaAction(params: { tenantSlug: string; mediaId: string }) {
  const context = await requireMediaAdmin(params.tenantSlug);
  await removeMedia({ tenantId: context.tenant.id, mediaId: params.mediaId, deleteFile: true });
  revalidatePath(`/admin/${params.tenantSlug}/midia`);
  redirect(`/admin/${params.tenantSlug}/midia?status=excluida`);
}
