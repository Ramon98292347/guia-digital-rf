"use client";

import { useActionState } from "react";
import { Film, ImagePlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMediaAction } from "@/features/media/actions";

export function MediaUploadForm({ tenantSlug }: { tenantSlug: string }) {
  const [state, formAction, pending] = useActionState(
    uploadMediaAction.bind(null, { tenantSlug }),
    {},
  );

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-xs">
      <div>
        <h2 className="text-base font-semibold">Enviar foto ou vídeo</h2>
        <p className="mt-1 text-sm text-muted-foreground">Arquivos de até 50 MB. A mídia ficará privada até ser publicada.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="media-file">Arquivo</Label>
          <Input id="media-file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="media-alt">Texto alternativo</Label>
          <Input id="media-alt" name="altText" placeholder="Ex.: Vista do chalé" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="media-caption">Legenda</Label>
          <Input id="media-caption" name="caption" placeholder="Opcional" />
        </div>
      </div>
      {state.error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        <Upload className="size-4" aria-hidden="true" />
        {pending ? "Enviando..." : "Enviar arquivo"}
      </Button>
    </form>
  );
}

export function MediaTypeIcon({ type }: { type: string }) {
  return type === "video" ? <Film className="size-5" aria-hidden="true" /> : <ImagePlus className="size-5" aria-hidden="true" />;
}
