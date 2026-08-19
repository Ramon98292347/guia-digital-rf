"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteMediaAction, type DeleteMediaState } from "../actions";

const initialState: DeleteMediaState = { error: null, references: [] };

export function DeleteMediaButton({ tenantSlug, mediaId }: { tenantSlug: string; mediaId: string }) {
  const [state, formAction, pending] = useActionState(deleteMediaAction.bind(null, { tenantSlug, mediaId }), initialState);
  const [open, setOpen] = useState(false);
  return <>
    <Button type="button" size="sm" variant="destructive" onClick={() => setOpen(true)}><Trash2 className="size-4" />Excluir</Button>
    {open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-background p-5 shadow-xl">
        <h2 className="text-lg font-semibold">{state.error ? "Mídia em uso" : "Excluir esta mídia?"}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{state.error ?? "Esta ação removerá o arquivo da Biblioteca de Mídia e não poderá ser desfeita."}</p>
        {state.references.length > 0 ? <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">{state.references.map((reference) => <li key={reference}>{reference}</li>)}</ul> : null}
        <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>{!state.error ? <form action={formAction}><Button type="submit" variant="destructive" disabled={pending}>{pending ? "Excluindo..." : "Excluir"}</Button></form> : <Button type="button" onClick={() => setOpen(false)}>Entendi</Button>}</div>
      </div>
    </div> : null}
  </>;
}
