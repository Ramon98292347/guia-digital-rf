import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireTenantAccess } from "@/features/auth/server/admin-access";
import { uploadPrivateMedia } from "@/features/media/service";
import { inferMediaMimeType, MEDIA_STORAGE, type MediaCategory } from "@/features/media/config";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const { tenantSlug } = await params;
  try {
    const context = await requireTenantAccess(tenantSlug);

    if (!context) {
      return NextResponse.json({ error: "Você não tem acesso a este estabelecimento." }, { status: 403 });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Não foi possível ler o arquivo enviado. Tente novamente com uma foto JPG, PNG ou WebP." }, { status: 400 });
    }

    const category = formData.get("category")?.toString() as MediaCategory;
    const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ error: "Selecione uma foto ou vídeo para enviar." }, { status: 400 });
    }
    if (!MEDIA_STORAGE.categories.includes(category)) {
      return NextResponse.json({ error: "Selecione uma categoria válida." }, { status: 400 });
    }

    const oversized = files.find((file) => file.size > MEDIA_STORAGE.maxFileSizeBytes);
    if (oversized) {
      return NextResponse.json({ error: `O arquivo "${oversized.name}" ultrapassa o limite de ${Math.round(MEDIA_STORAGE.maxFileSizeBytes / (1024 * 1024))} MB.` }, { status: 400 });
    }

    const errors: string[] = [];
    for (const file of files) {
      const detectedMimeType = inferMediaMimeType(file.name, file.type);
      if (!detectedMimeType.startsWith("image/") && !detectedMimeType.startsWith("video/")) {
        errors.push(`${file.name}: tipo de arquivo não permitido.`);
        continue;
      }
      try {
        await uploadPrivateMedia(context.supabase, {
          tenantId: context.tenant.id,
          category,
          file,
          uploadedBy: context.user.id,
          altText: formData.get("altText")?.toString() || null,
          caption: formData.get("caption")?.toString() || null,
        });
      } catch (error) {
        errors.push(`${file.name}: ${error instanceof Error ? error.message : "falha no envio."}`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    revalidatePath(`/admin/${tenantSlug}/midia`);
    return NextResponse.json({ success: "Arquivo enviado com sucesso." });
  } catch (error) {
    console.error("Falha no upload de mídia:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível concluir o upload." },
      { status: 500 },
    );
  }
}
