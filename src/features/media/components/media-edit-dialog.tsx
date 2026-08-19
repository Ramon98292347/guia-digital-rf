"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";

export function MediaEditDialog({ media, action }: { media: { caption: string | null; alt_text: string | null; status: string }; action: (formData: FormData) => Promise<void> }) {
  const ref = useRef<HTMLDialogElement>(null);
  return <>
    <Button type="button" size="sm" variant="outline" onClick={() => ref.current?.showModal()}><Edit3 className="size-4" />Editar</Button>
    <dialog ref={ref} className="w-[min(92vw,480px)] rounded-2xl border border-border bg-background p-0 shadow-xl backdrop:bg-black/50">
      <form action={action} className="space-y-4 p-5">
        <div><h2 className="text-lg font-semibold">Editar mídia</h2><p className="mt-1 text-sm text-muted-foreground">Atualize os metadados sem alterar o arquivo.</p></div>
        <label className="block text-sm font-medium">Descrição<textarea name="caption" defaultValue={media.caption ?? ""} rows={3} className="mt-1 w-full rounded-lg border px-3 py-2 font-normal" /></label>
        <label className="block text-sm font-medium">Texto alternativo<input name="alt_text" defaultValue={media.alt_text ?? ""} className="mt-1 h-10 w-full rounded-lg border px-3 font-normal" /></label>
        <label className="block text-sm font-medium">Status<select name="status" defaultValue={media.status} className="mt-1 h-10 w-full rounded-lg border px-3 font-normal"><option value="draft">Rascunho</option><option value="ready">Pronta para publicar</option><option value="published">Publicada</option><option value="archived">Arquivada</option></select></label>
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => ref.current?.close()}>Cancelar</Button><Button type="submit">Salvar</Button></div>
      </form>
    </dialog>
  </>;
}
