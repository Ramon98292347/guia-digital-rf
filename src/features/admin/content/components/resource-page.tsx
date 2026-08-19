"use client";

import { useState } from "react";
import { Archive, ArrowDown, ArrowUp, BedDouble, BookOpen, CalendarClock, CheckCircle2, ContactRound, Edit3, GalleryHorizontal, House, MapPinned, Plus, Settings2, ShieldCheck, Trash2, Utensils, Wifi, X } from "lucide-react";
import type { ResourceDefinition, ResourceKey, ResourceOption } from "../resource-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ConfirmActionForm } from "@/components/ui/confirm-action-form";

type ResourceAction = (formData: FormData) => Promise<void>;
type Row = Record<string, unknown>;
const resourceIcons = { inicio: House, servicos: Utensils, wifi: Wifi, horarios: CalendarClock, regras: ShieldCheck, contatos: ContactRound, galeria: GalleryHorizontal, dicas: MapPinned, pwa: Settings2, reservas: BookOpen } as const;

function valueOf(row: Row, name: string) {
  return row[name];
}

function statusLabel(value: unknown) {
  return value === "published" ? "Publicado" : value === "archived" ? "Arquivado" : "Rascunho";
}

export function ResourcePage({
  tenantSlug,
  definition,
  rows,
  options,
  saveAction,
  archiveAction,
  deleteAction,
  restoreAction,
  moveAction,
  feedback,
}: {
  tenantSlug: string;
  definition: Omit<ResourceDefinition, "icon">;
  rows: Row[];
  options: Record<string, ResourceOption[]>;
  saveAction: ResourceAction;
  archiveAction: (id: string) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
  restoreAction: (id: string) => Promise<void>;
  moveAction: (id: string, direction: "up" | "down", order: number) => Promise<void>;
  feedback: string | null;
}) {
  const [editing, setEditing] = useState<Row | null>(null);
  const Icon = resourceIcons[definition.key as ResourceKey] ?? BedDouble;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--rf-primary)]">Conteúdo do estabelecimento</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--rf-text)] sm:text-3xl">{definition.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--rf-muted)]">{definition.description}</p>
        </div>
        <Button type="button" className="w-fit bg-[var(--rf-primary)] text-white hover:bg-[var(--rf-navy)]" onClick={() => setEditing({})}>
          <Plus className="size-4" aria-hidden="true" />Adicionar
        </Button>
      </header>

      {feedback ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{feedback}</div> : null}

      {editing ? (
        <Card className="border-[var(--rf-primary)]/20 shadow-[0_12px_34px_rgba(7,26,58,.06)]">
          <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-[var(--rf-border)]">
            <CardTitle className="text-[var(--rf-text)]">{editing.id ? "Editar item" : "Novo item"}</CardTitle>
            <Button type="button" variant="ghost" size="icon" aria-label="Fechar formulário" onClick={() => setEditing(null)}><X className="size-4" /></Button>
          </CardHeader>
          <CardContent className="pt-6">
            <form action={saveAction} className="space-y-5">
              <input type="hidden" name="id" value={String(editing.id ?? "")} />
              <div className="grid gap-4 sm:grid-cols-2">
                {definition.fields.map((field) => {
                  const current = valueOf(editing, field.name);
                  const common = { name: field.name, required: field.required, defaultValue: field.type === "checkbox" ? undefined : String(current ?? "") };
                  if (field.type === "checkbox") return <label key={field.name} className="flex min-h-11 items-center gap-3 rounded-lg border border-[var(--rf-border)] px-3 text-sm text-[var(--rf-text)]"><input type="checkbox" name={field.name} defaultChecked={current === true} className="size-4 accent-[var(--rf-primary)]" />{field.label}</label>;
                  if (field.type === "textarea") return <label key={field.name} className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-[var(--rf-text)]">{field.label}</span><textarea {...common} placeholder={field.placeholder} rows={4} className="w-full rounded-lg border border-[var(--rf-border)] bg-white px-3 py-2 text-sm outline-none ring-[var(--rf-primary)] focus:ring-2" /></label>;
                  const selectOptions = options[field.name] ?? field.options;
                  if (field.type === "select" || selectOptions) return <label key={field.name}><span className="mb-1.5 block text-sm font-medium text-[var(--rf-text)]">{field.label}</span><select {...common} className="h-10 w-full rounded-lg border border-[var(--rf-border)] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--rf-primary)]"><option value="">Selecione</option>{selectOptions?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
                  return <label key={field.name}><span className="mb-1.5 block text-sm font-medium text-[var(--rf-text)]">{field.label}</span><input {...common} type={field.type} placeholder={field.placeholder} className="h-10 w-full rounded-lg border border-[var(--rf-border)] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--rf-primary)]" /></label>;
                })}
              </div>
              <div className="flex flex-wrap gap-2"><Button type="submit" className="bg-[var(--rf-primary)] text-white hover:bg-[var(--rf-navy)]"><CheckCircle2 className="size-4" />Salvar</Button><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button></div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {rows.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center"><div className="flex size-12 items-center justify-center rounded-full bg-blue-50 text-[var(--rf-primary)]"><Icon className="size-5" /></div><p className="text-lg font-semibold text-[var(--rf-text)]">Nenhum item cadastrado ainda.</p><p className="text-sm text-[var(--rf-muted)]">Adicione o primeiro conteúdo deste módulo.</p><Button type="button" variant="outline" onClick={() => setEditing({})}><Plus className="size-4" />Adicionar</Button></CardContent></Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((row, index) => {
            const order = Number(row.sort_order ?? index);
            const title = String(row.name ?? row.title ?? row.section_type ?? definition.title);
            const status = row.status;
            return <Card key={String(row.id ?? index)} className="overflow-hidden"><CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-[var(--rf-border)]"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><CardTitle className="truncate text-[var(--rf-text)]">{title}</CardTitle>{status !== undefined ? <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", status === "published" ? "bg-emerald-50 text-emerald-700" : status === "archived" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700")}>{statusLabel(status)}</span> : null}</div><p className="mt-1 text-xs text-[var(--rf-muted)]">Ordem {order}</p></div><div className="flex shrink-0 gap-1"><form action={moveAction.bind(null, String(row.id), "up", order)}><Button type="submit" variant="ghost" size="icon-sm" aria-label="Mover para cima" disabled={index === 0}><ArrowUp className="size-4" /></Button></form><form action={moveAction.bind(null, String(row.id), "down", order)}><Button type="submit" variant="ghost" size="icon-sm" aria-label="Mover para baixo" disabled={index === rows.length - 1}><ArrowDown className="size-4" /></Button></form></div></CardHeader><CardContent className="space-y-4 pt-5"><p className="line-clamp-3 text-sm text-[var(--rf-muted)]">{String(row.short_description ?? row.description ?? row.content ?? row.ssid ?? row.value ?? row.subtitle ?? "Sem descrição cadastrada.")}</p><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setEditing(row)}><Edit3 className="size-4" />Editar</Button>{!definition.singleton && status !== "archived" ? <ConfirmActionForm action={archiveAction.bind(null, String(row.id))} message="Arquivar este registro? Ele deixará de aparecer como conteúdo publicado, mas será preservado."><Button type="submit" variant="ghost"><Archive className="size-4" />Arquivar</Button></ConfirmActionForm> : null}{status === "archived" ? <form action={restoreAction.bind(null, String(row.id))}><Button type="submit" variant="outline"><CheckCircle2 className="size-4" />Restaurar</Button></form> : null}{status === "archived" ? <ConfirmActionForm action={deleteAction.bind(null, String(row.id))} message="Excluir este cadastro permanentemente? Esta ação não poderá ser desfeita."><Button type="submit" variant="destructive"><Trash2 className="size-4" />Excluir</Button></ConfirmActionForm> : null}</div></CardContent></Card>;
          })}
        </div>
      )}

      <p className="text-xs text-[var(--rf-muted)]">Tenant atual: <span className="font-medium">{tenantSlug}</span>. As operações são protegidas por sessão, tenant validado, membership e RLS.</p>
    </div>
  );
}
