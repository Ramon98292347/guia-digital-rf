/* eslint-disable @next/next/no-img-element */
import { Archive, CheckCircle2, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { archiveMediaAction, deleteMediaAction, publishMediaAction } from "@/features/media/actions";
import { MediaTypeIcon } from "@/features/media/components/media-upload-form";
import { MediaUploadForm } from "@/features/media/components/media-upload-form";
import { MediaPreviewDialog } from "@/features/media/components/media-preview-dialog";
import { getAdminMediaData } from "@/features/media/server/admin-service";
import { ConfirmActionForm } from "@/components/ui/confirm-action-form";

type AdminMediaPageProps = {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ status?: string }>;
};

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  ready: "Pronta para publicar",
  published: "Publicada",
  archived: "Arquivada",
};

const feedbackMessages: Record<string, string> = {
  enviada: "Arquivo enviado com sucesso.",
  publicada: "Mídia publicada com sucesso.",
  arquivada: "Mídia arquivada com sucesso.",
  excluida: "Mídia excluída com sucesso.",
};

const categoryLabels: Record<string, string> = {
  branding: "Branding",
  accommodations: "Acomodações",
  gallery: "Galeria",
  services: "Serviços",
  "local-tips": "Dicas da Região",
  general: "Geral",
};

function formatSize(size: number | null) {
  if (!size) return "Tamanho não informado";
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminMediaPage({ params, searchParams }: AdminMediaPageProps) {
  const [{ tenantSlug }, query] = await Promise.all([params, searchParams]);
  const { context, media } = await getAdminMediaData(tenantSlug);
  const feedback = query.status ? feedbackMessages[query.status] : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Conteúdo do estabelecimento</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Fotos e vídeos</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Gerencie os arquivos usados no Guia Digital. Novos envios ficam privados até a publicação.</p>
      </div>

      {feedback ? <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm">{feedback}</div> : null}

      <MediaUploadForm tenantSlug={context.tenant.slug} />

      {media.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted"><ImagePlus className="size-5" aria-hidden="true" /></div>
            <div><p className="text-lg font-semibold">Nenhuma foto ou vídeo enviado ainda.</p><p className="mt-1 text-sm text-muted-foreground">Envie o primeiro arquivo para começar a montar o conteúdo visual do tenant.</p></div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {media.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-[16/10] bg-muted">
                {item.previewUrl && item.media_type === "image" ? <img src={item.previewUrl} alt={item.alt_text ?? item.original_filename ?? "Foto"} className="h-full w-full object-cover" /> : null}
                {item.previewUrl && item.media_type === "video" ? <video src={item.previewUrl} controls preload="metadata" className="h-full w-full object-cover" /> : null}
                {!item.previewUrl ? <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground"><MediaTypeIcon type={item.media_type} /><span className="text-xs">Preview indisponível</span></div> : null}
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium shadow-sm"><MediaTypeIcon type={item.media_type} />{item.media_type === "video" ? "Vídeo" : "Foto"}</span>
              </div>
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{item.original_filename ?? "Arquivo sem nome"}</p><p className="mt-1 text-xs text-muted-foreground">{categoryLabels[item.category] ?? item.category} · {formatSize(item.size_bytes)}</p></div><span className="shrink-0 rounded-full bg-muted px-2 py-1 text-xs">{statusLabels[item.status] ?? item.status}</span></div>
                {item.caption ? <p className="text-sm text-muted-foreground">{item.caption}</p> : null}
                <div className="flex flex-wrap gap-2"><MediaPreviewDialog previewUrl={item.previewUrl} mediaType={item.media_type} filename={item.original_filename ?? "Mídia"} />
                  {item.status !== "published" && item.status !== "archived" ? <form action={publishMediaAction.bind(null, { tenantSlug: context.tenant.slug, mediaId: item.id })}><Button type="submit" size="sm"><CheckCircle2 className="size-4" />Publicar</Button></form> : null}
                  {item.status !== "archived" ? <ConfirmActionForm action={archiveMediaAction.bind(null, { tenantSlug: context.tenant.slug, mediaId: item.id })} message="Arquivar esta mídia? Ela deixará de aparecer no Guia, mas será preservada."><Button type="submit" size="sm" variant="outline"><Archive className="size-4" />Arquivar</Button></ConfirmActionForm> : null}
                  {item.status === "archived" ? <ConfirmActionForm action={deleteMediaAction.bind(null, { tenantSlug: context.tenant.slug, mediaId: item.id })} message="Excluir esta mídia permanentemente? A exclusão só será permitida se ela não estiver em uso."><Button type="submit" size="sm" variant="destructive"><Trash2 className="size-4" />Excluir</Button></ConfirmActionForm> : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card><CardContent className="flex flex-col gap-2 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>Tenant atual: <span className="font-medium text-foreground">{context.tenant.name}</span></span><span>Uploads usam Storage privado e preview temporário.</span></CardContent></Card>
    </div>
  );
}
