"use client";

import { useActionState, useState } from "react";
import { createTenantAction, updateTenantAction } from "../actions";
import { slugify } from "../validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TenantFormProps = { tenant?: { id: string; name: string; slug: string; type: string; status: string; timezone: string } };

export function TenantForm({ tenant }: TenantFormProps) {
  const action = tenant ? updateTenantAction.bind(null, tenant.id) : createTenantAction;
  const [state, formAction, pending] = useActionState(action, {});
  const [name, setName] = useState(tenant?.name ?? "");
  const [slug, setSlug] = useState(tenant?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(tenant));

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nome do estabelecimento</Label>
          <Input id="name" name="name" value={name} onChange={(event) => { const nextName = event.target.value; setName(nextName); if (!slugEdited) setSlug(slugify(nextName)); }} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" value={slug} onChange={(event) => { setSlugEdited(true); setSlug(event.target.value.toLowerCase()); }} required />
          <p className="text-xs text-muted-foreground">Será usado nos endereços da plataforma.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Input id="type" name="type" defaultValue={tenant?.type ?? "hospitality"} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select id="status" name="status" defaultValue={tenant?.status ?? "draft"} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="draft">Rascunho</option>
            <option value="active">Ativo</option>
            <option value="suspended">Suspenso</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="timezone">Fuso horário</Label>
          <Input id="timezone" name="timezone" defaultValue={tenant?.timezone ?? "America/Sao_Paulo"} required />
        </div>
      </div>
      {state.error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="bg-[var(--rf-primary)] text-white hover:bg-[var(--rf-navy)]">{pending ? "Salvando..." : tenant ? "Salvar alterações" : "Criar estabelecimento"}</Button>
    </form>
  );
}
