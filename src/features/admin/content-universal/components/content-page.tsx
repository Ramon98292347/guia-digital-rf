"use client";

import { useState } from "react";
import { Archive, Edit3, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmActionForm } from "@/components/ui/confirm-action-form";

type Row = Record<string, unknown>;
type SaveAction = (formData: FormData) => Promise<void>;
type ArchiveAction = (id: string) => Promise<void>;
type MediaOption = { id: string; original_filename: string | null; media_type: string };

const kinds = [
  ["information", "Informação"],
  ["tutorials", "Tutorial / Como usar"],
  ["gastronomy", "Gastronomia"],
  ["experience", "Experiência"],
  ["promotion", "Promoção"],
  ["other", "Outro"],
];

function text(row: Row | null, key: string) {
  return row?.[key] == null ? "" : String(row[key]);
}

export function ContentPage({
  collections,
  items,
  itemMedia,
  accommodations,
  media,
  saveCollection,
  saveItem,
  archiveCollection,
  archiveItem,
  deleteCollection,
  deleteItem,
  status,
}: {
  collections: Row[];
  items: Row[];
  itemMedia: Row[];
  accommodations: { id: string; name: string }[];
  media: MediaOption[];
  saveCollection: SaveAction;
  saveItem: SaveAction;
  archiveCollection: ArchiveAction;
  archiveItem: ArchiveAction;
  deleteCollection: ArchiveAction;
  deleteItem: ArchiveAction;
  status: string | null;
}) {
  const [editingCollection, setEditingCollection] = useState<Row | null>(null);
  const [editingItem, setEditingItem] = useState<Row | null>(null);
  const mediaFor = (itemId: string, role: string) => text(itemMedia.find((relation) => String(relation.content_item_id) === itemId && relation.role === role) ?? null, "media_id");
  const mediaSelect = (name: string, label: string, type: string, current: string) => (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <select name={name} defaultValue={current} className="h-10 rounded-lg border bg-white px-3">
        <option value="">Não selecionar</option>
        {media.filter((entry) => entry.media_type === type).map((entry) => <option key={entry.id} value={entry.id}>{entry.original_filename ?? "Mídia"}</option>)}
      </select>
    </label>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm text-muted-foreground">Conteúdo universal do estabelecimento</p><h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Conteúdos do Guia</h1><p className="mt-2 text-sm text-muted-foreground">Organize informações, gastronomia, tutoriais e promoções usando a mesma fonte de conteúdo do Guia.</p></div>
        <Button type="button" onClick={() => setEditingItem({})}><Plus className="size-4" />Novo conteúdo</Button>
      </header>
      {status ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Alterações salvas com sucesso.</div> : null}

      {editingCollection ? <Card><CardHeader><CardTitle>{editingCollection.id ? "Editar área" : "Nova área"}</CardTitle></CardHeader><CardContent><form action={saveCollection} className="grid gap-3 sm:grid-cols-2"><input type="hidden" name="id" value={text(editingCollection, "id")} /><input name="title" required defaultValue={text(editingCollection, "title")} placeholder="Título (ex.: Como chegar)" className="h-10 rounded-lg border px-3" /><select name="kind" defaultValue={text(editingCollection, "kind") || "information"} className="h-10 rounded-lg border px-3">{kinds.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><textarea name="description" defaultValue={text(editingCollection, "description")} placeholder="Descrição da área" className="rounded-lg border px-3 py-2 sm:col-span-2" /><input name="slug" defaultValue={text(editingCollection, "slug")} placeholder="Slug opcional" className="h-10 rounded-lg border px-3" /><input name="sort_order" type="number" defaultValue={text(editingCollection, "sort_order") || "0"} placeholder="Ordem" className="h-10 rounded-lg border px-3" /><select name="status" defaultValue={text(editingCollection, "status") || "published"} className="h-10 rounded-lg border px-3"><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></select><div className="flex gap-2 sm:col-span-2"><Button type="submit">Salvar área</Button><Button type="button" variant="outline" onClick={() => setEditingCollection(null)}>Cancelar</Button></div></form></CardContent></Card> : <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Áreas do Guia</CardTitle><Button type="button" variant="outline" onClick={() => setEditingCollection({})}><Plus className="size-4" />Nova área</Button></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{collections.map((collection) => { const collectionItems = items.filter((item) => String(item.collection_id) === String(collection.id)); return <article key={String(collection.id)} className="rounded-xl border p-4"><div className="flex items-start justify-between gap-2"><div><h2 className="font-semibold">{text(collection, "title")}</h2><p className="mt-1 text-sm text-muted-foreground">{text(collection, "description") || `${collectionItems.length} item(ns)`}</p></div><span className="text-xs text-muted-foreground">{text(collection, "status")}</span></div><div className="mt-4 flex gap-2"><Button type="button" variant="outline" size="sm" onClick={() => setEditingCollection(collection)}><Edit3 className="size-3.5" />Editar</Button>{text(collection, "status") === "archived" ? <ConfirmActionForm action={deleteCollection.bind(null, String(collection.id))} message="Excluir esta área? A mídia não será apagada."><Button type="submit" variant="destructive" size="sm"><Trash2 className="size-3.5" />Excluir</Button></ConfirmActionForm> : <ConfirmActionForm action={archiveCollection.bind(null, String(collection.id))} message="Desativar esta área?"><Button type="submit" variant="ghost" size="sm"><Archive className="size-3.5" />Desativar</Button></ConfirmActionForm>}</div></article>; })}</div></CardContent></Card>}

      {editingItem ? <Card><CardHeader><CardTitle>{editingItem.id ? "Editar conteúdo" : "Novo conteúdo"}</CardTitle></CardHeader><CardContent><form action={saveItem} className="grid gap-4 sm:grid-cols-2"><input type="hidden" name="id" value={text(editingItem, "id")} /><label className="grid gap-1 text-sm"><span className="font-medium">Área</span><select name="collection_id" required defaultValue={text(editingItem, "collection_id")} className="h-10 rounded-lg border bg-white px-3"><option value="">Selecione</option>{collections.map((collection) => <option key={String(collection.id)} value={String(collection.id)}>{text(collection, "title")}</option>)}</select></label><label className="grid gap-1 text-sm"><span className="font-medium">Título</span><input name="title" required defaultValue={text(editingItem, "title")} className="h-10 rounded-lg border px-3" /></label><input name="subtitle" defaultValue={text(editingItem, "subtitle")} placeholder="Descrição curta / subtítulo" className="h-10 rounded-lg border px-3" /><input name="category" defaultValue={text(editingItem, "category")} placeholder="Categoria opcional" className="h-10 rounded-lg border px-3" /><textarea name="description" defaultValue={text(editingItem, "description")} placeholder="Descrição" className="rounded-lg border px-3 py-2 sm:col-span-2" /><textarea name="instructions" defaultValue={text(editingItem, "instructions")} placeholder="Orientação / instruções" className="rounded-lg border px-3 py-2 sm:col-span-2" /><input name="address" defaultValue={text(editingItem, "address")} placeholder="Endereço (Como chegar)" className="h-10 rounded-lg border px-3" /><input name="external_url" defaultValue={text(editingItem, "external_url")} placeholder="Google Maps / link principal" className="h-10 rounded-lg border px-3" /><input name="secondary_url" defaultValue={text(editingItem, "secondary_url")} placeholder="Waze / segundo link" className="h-10 rounded-lg border px-3" /><input name="contact_url" defaultValue={text(editingItem, "contact_url")} placeholder="Contato ou reserva opcional" className="h-10 rounded-lg border px-3" /><input name="price" defaultValue={text(editingItem, "price")} placeholder="Preço opcional" className="h-10 rounded-lg border px-3" /><input name="supplier" defaultValue={text(editingItem, "supplier")} placeholder="Fornecedor / restaurante" className="h-10 rounded-lg border px-3" /><input name="discount_text" defaultValue={text(editingItem, "discount_text")} placeholder="Texto do desconto" className="h-10 rounded-lg border px-3" /><input name="validity_text" defaultValue={text(editingItem, "validity_text")} placeholder="Prazo / validade" className="h-10 rounded-lg border px-3" /><input name="coupon_code" defaultValue={text(editingItem, "coupon_code")} placeholder="Cupom opcional" className="h-10 rounded-lg border px-3" /><select name="accommodation_id" defaultValue="" className="h-10 rounded-lg border bg-white px-3"><option value="">Global</option>{accommodations.map((accommodation) => <option key={accommodation.id} value={accommodation.id}>{accommodation.name}</option>)}</select><input name="sort_order" type="number" defaultValue={text(editingItem, "sort_order") || "0"} placeholder="Ordem" className="h-10 rounded-lg border px-3" /><select name="status" defaultValue={text(editingItem, "status") || "published"} className="h-10 rounded-lg border bg-white px-3"><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></select>{mediaSelect("cover_media_id", "Foto da Biblioteca", "image", mediaFor(text(editingItem, "id"), "cover"))}{mediaSelect("video_media_id", "Vídeo da Biblioteca", "video", mediaFor(text(editingItem, "id"), "video"))}{mediaSelect("video_cover_media_id", "Capa do vídeo", "image", mediaFor(text(editingItem, "id"), "thumbnail"))}<div className="flex gap-2 sm:col-span-2"><Button type="submit">Salvar conteúdo</Button><Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Cancelar</Button></div></form></CardContent></Card> : null}

      <section className="grid gap-3 md:grid-cols-2">{items.map((item) => { const collection = collections.find((entry) => String(entry.id) === String(item.collection_id)) ?? null; return <article key={String(item.id)} className="rounded-xl border p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-muted-foreground">{text(collection, "title") || "Conteúdo"}</p><h2 className="font-semibold">{text(item, "title")}</h2><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{text(item, "description") || "Informações sendo atualizadas."}</p></div><span className="text-xs text-muted-foreground">{text(item, "status")}</span></div><div className="mt-4 flex gap-2"><Button type="button" variant="outline" size="sm" onClick={() => setEditingItem(item)}><Edit3 className="size-3.5" />Editar</Button>{text(item, "status") === "archived" ? <ConfirmActionForm action={deleteItem.bind(null, String(item.id))} message="Excluir este conteúdo? A mídia não será apagada."><Button type="submit" variant="destructive" size="sm"><Trash2 className="size-3.5" />Excluir</Button></ConfirmActionForm> : <ConfirmActionForm action={archiveItem.bind(null, String(item.id))} message="Desativar este conteúdo?"><Button type="submit" variant="ghost" size="sm"><Archive className="size-3.5" />Desativar</Button></ConfirmActionForm>}</div></article>; })}</section>
    </div>
  );
}
