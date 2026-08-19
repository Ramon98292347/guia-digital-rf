"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { MediaTypeIcon } from "./media-upload-form";

type MediaPreviewDialogProps = {
  previewUrl: string | null;
  mediaType: string;
  filename: string;
};

export function MediaPreviewDialog({ previewUrl, mediaType, filename }: MediaPreviewDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  if (!previewUrl) return <span className="text-xs text-muted-foreground">Preview indisponível</span>;

  return <>
    <Button type="button" variant="outline" size="sm" onClick={() => dialogRef.current?.showModal()}>
      <MediaTypeIcon type={mediaType} />Abrir preview
    </Button>
    <dialog ref={dialogRef} className="max-h-[90dvh] max-w-[min(92vw,800px)] rounded-lg border border-border bg-background p-0 shadow-xl backdrop:bg-black/60">
      <div className="relative p-3">
        {mediaType === "video" ? <video src={previewUrl} controls preload="metadata" className="max-h-[78dvh] w-full rounded-md object-contain" /> : <img src={previewUrl} alt={filename} className="max-h-[78dvh] w-full rounded-md object-contain" />}
        <div className="mt-3 flex justify-end"><Button type="button" variant="outline" onClick={() => dialogRef.current?.close()}>Fechar</Button></div>
      </div>
    </dialog>
  </>;
}
