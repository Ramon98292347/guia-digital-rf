"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ImagePlus, Loader2, Save, Send, Trash2 } from "lucide-react";
import { saveAccommodationAction } from "@/features/accommodations/actions";
import {
  accommodationStatusLabels,
  slugifyAccommodationName,
  type AccommodationStatus,
} from "@/features/accommodations/shared";
import type {
  AccommodationEditorAmenity,
  AccommodationMediaOption,
} from "@/features/accommodations/server/service";
import type { AccommodationActionState } from "@/features/accommodations/validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type AccommodationFormProps = {
  tenantSlug: string;
  accommodationId?: string;
  initialValues: {
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    capacity: string;
    areaM2: string;
    viewDescription: string;
    bedDescription: string;
    bookingUrl: string;
    sortOrder: string;
    coverMediaId: string;
    selectedMediaIds: string[];
    status: AccommodationStatus;
  };
  amenities: AccommodationEditorAmenity[];
  selectedAmenityIds: string[];
  mediaOptions: Array<
    AccommodationMediaOption & {
      previewUrl: string;
    }
  >;
  feedbackMessage?: string | null;
};

const initialState: AccommodationActionState = {};

type SubmitIntent = AccommodationStatus;

export function AccommodationForm({
  tenantSlug,
  accommodationId,
  initialValues,
  amenities,
  selectedAmenityIds,
  mediaOptions,
  feedbackMessage = null,
}: AccommodationFormProps) {
  const action = saveAccommodationAction.bind(null, {
    tenantSlug,
    accommodationId,
  });
  const [state, formAction, pending] = useActionState(action, initialState);
  const [name, setName] = useState(initialValues.name);
  const [slug, setSlug] = useState(initialValues.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(accommodationId));
  const [selectedCoverMediaId, setSelectedCoverMediaId] = useState(
    initialValues.coverMediaId,
  );
  const [removeCover, setRemoveCover] = useState(false);
  const [selectedAccommodationMediaIds, setSelectedAccommodationMediaIds] = useState<string[]>(
    initialValues.selectedMediaIds,
  );
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [descriptionLength, setDescriptionLength] = useState(initialValues.description.length);
  const [submitIntent, setSubmitIntent] = useState<SubmitIntent>(
    initialValues.status === "archived" ? "draft" : initialValues.status,
  );

  const orderedSelectedMedia = selectedAccommodationMediaIds
    .map((mediaId) => mediaOptions.find((media) => media.id === mediaId))
    .filter((media): media is (typeof mediaOptions)[number] => Boolean(media));

  function toggleMedia(mediaId: string, selected: boolean) {
    setGalleryError(null);
    setSelectedAccommodationMediaIds((current) => {
      if (selected) {
        if (current.length >= 6) {
          setGalleryError("Você pode selecionar até 6 fotos por acomodação.");
          return current;
        }

        const next = [...current, mediaId];
        if (!selectedCoverMediaId) {
          setSelectedCoverMediaId(mediaId);
        }
        return next;
      }

      const next = current.filter((id) => id !== mediaId);
      if (selectedCoverMediaId === mediaId) {
        setSelectedCoverMediaId(next[0] ?? "");
      }
      return next;
    });
  }

  function moveSelectedMedia(index: number, direction: -1 | 1) {
    setSelectedAccommodationMediaIds((current) => {
      const next = [...current];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) {
        return current;
      }
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="coverMediaId" value={selectedCoverMediaId} />
      <input type="hidden" name="removeCover" value={removeCover ? "true" : "false"} />
      {selectedAccommodationMediaIds.map((mediaId) => (
        <input key={mediaId} type="hidden" name="accommodationMediaIds" value={mediaId} />
      ))}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">CRUD de acomodações</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
            {accommodationId ? "Editar acomodação" : "Nova acomodação"}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            name="intent"
            value="draft"
            variant="outline"
            size="lg"
            disabled={pending}
            onClick={() => setSubmitIntent("draft")}
          >
            {pending && submitIntent === "draft" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            Salvar rascunho
          </Button>
          <Button
            type="submit"
            name="intent"
            value="published"
            size="lg"
            disabled={pending}
            onClick={() => setSubmitIntent("published")}
          >
            {pending && submitIntent === "published" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="size-4" aria-hidden="true" />
            )}
            Publicar
          </Button>
          {accommodationId ? (
            <Button
              type="submit"
              name="intent"
              value="archived"
              variant="ghost"
              size="lg"
              disabled={pending}
              onClick={() => setSubmitIntent("archived")}
            >
              {pending && submitIntent === "archived" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="size-4" aria-hidden="true" />
              )}
              Arquivar
            </Button>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        {feedbackMessage ? (
          <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm">
            {feedbackMessage}
          </div>
        ) : null}
        {state.error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados principais</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(event) => {
                      const nextName = event.target.value;
                      setName(nextName);

                      if (!slugTouched) {
                        setSlug(slugifyAccommodationName(nextName));
                      }
                    }}
                    aria-invalid={Boolean(state.fieldErrors?.name)}
                    required
                  />
                  {state.fieldErrors?.name ? (
                    <p className="text-sm text-destructive">{state.fieldErrors.name}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slugVisible">Slug</Label>
                  <Input
                    id="slugVisible"
                    value={slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      setSlug(slugifyAccommodationName(event.target.value));
                    }}
                    aria-invalid={Boolean(state.fieldErrors?.slug)}
                    required
                  />
                  {state.fieldErrors?.slug ? (
                    <p className="text-sm text-destructive">{state.fieldErrors.slug}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Você pode ajustar o slug antes de salvar.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min={1}
                    defaultValue={initialValues.capacity}
                    aria-invalid={Boolean(state.fieldErrors?.capacity)}
                  />
                  {state.fieldErrors?.capacity ? (
                    <p className="text-sm text-destructive">
                      {state.fieldErrors.capacity}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookingUrl">URL de reserva</Label>
                  <Input
                    id="bookingUrl"
                    name="bookingUrl"
                    type="url"
                    placeholder="https://"
                    defaultValue={initialValues.bookingUrl}
                    aria-invalid={Boolean(state.fieldErrors?.bookingUrl)}
                  />
                  {state.fieldErrors?.bookingUrl ? (
                    <p className="text-sm text-destructive">
                      {state.fieldErrors.bookingUrl}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Ordem</Label>
                  <Input
                    id="sortOrder"
                    name="sortOrder"
                    type="number"
                    min={0}
                    step={1}
                    defaultValue={initialValues.sortOrder}
                    aria-invalid={Boolean(state.fieldErrors?.sortOrder)}
                  />
                  {state.fieldErrors?.sortOrder ? (
                    <p className="text-sm text-destructive">
                      {state.fieldErrors.sortOrder}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="shortDescription">Descrição curta</Label>
                  <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    rows={3}
                    defaultValue={initialValues.shortDescription}
                    aria-invalid={Boolean(state.fieldErrors?.shortDescription)}
                    className="min-h-24"
                  />
                  {state.fieldErrors?.shortDescription ? (
                    <p className="text-sm text-destructive">
                      {state.fieldErrors.shortDescription}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">Descrição completa</Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={8}
                    defaultValue={initialValues.description}
                    maxLength={600}
                    onChange={(event) => setDescriptionLength(event.target.value.length)}
                    aria-invalid={Boolean(state.fieldErrors?.description)}
                    className="min-h-40"
                  />
                  <p className="text-right text-xs text-muted-foreground">{descriptionLength} / 600 caracteres</p>
                  {state.fieldErrors?.description ? (
                    <p className="text-sm text-destructive">
                      {state.fieldErrors.description}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="areaM2">Área da acomodação (m²)</Label>
                  <Input id="areaM2" name="areaM2" type="number" min={0.01} step="0.01" defaultValue={initialValues.areaM2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="viewDescription">Vista</Label>
                  <Input id="viewDescription" name="viewDescription" maxLength={120} defaultValue={initialValues.viewDescription} placeholder="Ex.: Vista para a mata" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedDescription">Tipo de cama</Label>
                  <Input id="bedDescription" name="bedDescription" maxLength={120} defaultValue={initialValues.bedDescription} placeholder="Ex.: Queen" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comodidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {amenities.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma comodidade cadastrada ainda.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {amenities.map((amenity) => (
                    <label
                      key={amenity.id}
                      className="flex items-start gap-3 rounded-lg border border-border bg-background p-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        name="amenityIds"
                        value={amenity.id}
                        defaultChecked={selectedAmenityIds.includes(amenity.id)}
                        className="mt-1 size-4 rounded border border-input"
                      />
                      <span className="space-y-1">
                        <span className="block font-medium">{amenity.name}</span>
                        {amenity.description ? (
                          <span className="block text-muted-foreground">
                            {amenity.description}
                          </span>
                        ) : null}
                        <span className="block text-xs text-muted-foreground">
                          {accommodationStatusLabels[amenity.status as AccommodationStatus]}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fotos da acomodação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coverFile">Enviar nova capa</Label>
                <Input
                  id="coverFile"
                  name="coverFile"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                />
                <p className="text-xs text-muted-foreground">
                  A imagem pode entrar na Biblioteca e também ser usada como capa da acomodação.
                </p>
              </div>

              {galleryError ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {galleryError}
                </div>
              ) : null}

              <div className="space-y-3">
                <p className="text-sm font-medium">Seleção ativa</p>
                {orderedSelectedMedia.length > 0 ? (
                  <div className="space-y-3">
                    {orderedSelectedMedia.map((media, index) => {
                      const isCover = selectedCoverMediaId === media.id;
                      return (
                        <div key={media.id} className="flex items-center gap-3 rounded-lg border border-border bg-background p-2">
                          <div className="relative h-16 w-20 overflow-hidden rounded-md border border-border bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={media.previewUrl} alt={media.alt_text ?? media.original_filename ?? "Foto da acomodação"} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{media.original_filename ?? "Imagem"}</p>
                            {isCover ? <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-primary">Foto de capa</p> : null}
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setRemoveCover(false);
                                setSelectedCoverMediaId(media.id);
                              }}
                              className="text-xs font-medium text-primary"
                              disabled={isCover}
                            >
                              {isCover ? "Capa" : "Definir como capa"}
                            </button>
                            <button type="button" onClick={() => toggleMedia(media.id, false)} className="text-xs text-muted-foreground hover:text-foreground">Remover</button>
                            <div className="flex gap-1">
                              <button type="button" onClick={() => moveSelectedMedia(index, -1)} disabled={index === 0} className="rounded border border-border px-1.5 text-[10px] disabled:opacity-40">↑</button>
                              <button type="button" onClick={() => moveSelectedMedia(index, 1)} disabled={index === orderedSelectedMedia.length - 1} className="rounded border border-border px-1.5 text-[10px] disabled:opacity-40">↓</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma foto adicionada ainda. Selecione até 6 fotos da Biblioteca.</p>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Biblioteca de mídia</p>
                <div className="grid gap-2">
                  {mediaOptions.filter((media) => !selectedAccommodationMediaIds.includes(media.id)).map((media) => (
                    <button
                      key={media.id}
                      type="button"
                      disabled={selectedAccommodationMediaIds.length >= 6}
                      onClick={() => toggleMedia(media.id, true)}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-2 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
                        selectedAccommodationMediaIds.length >= 6 && "cursor-not-allowed",
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="relative h-12 w-16 overflow-hidden rounded-md border border-border bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={media.previewUrl} alt={media.alt_text ?? media.original_filename ?? "Foto da biblioteca"} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{media.original_filename ?? "Imagem"}</p>
                          <p className="text-xs text-muted-foreground">{media.status === "published" ? "Publicada" : "Rascunho"}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-primary">{selectedAccommodationMediaIds.length >= 6 ? "Limite" : "+ Adicionar foto"}</span>
                    </button>
                  ))}
                </div>
                {mediaOptions.filter((media) => !selectedAccommodationMediaIds.includes(media.id)).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Todas as imagens disponíveis já foram adicionadas.</p>
                ) : null}
              </div>

              {selectedCoverMediaId ? (
                <label className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={removeCover}
                    onChange={(event) => setRemoveCover(event.target.checked)}
                    className="size-4 rounded border border-input"
                  />
                  Remover capa atual ao salvar
                </label>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Status atual:{" "}
                <span className="font-medium text-foreground">
                  {accommodationStatusLabels[initialValues.status]}
                </span>
              </p>
              <p>
                O tenant é validado no servidor antes de cada operação. A
                interface nunca envia `tenant_id` como prova de autorização.
              </p>
              <Link
                href={`/admin/${tenantSlug}/acomodacoes`}
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                <ImagePlus className="size-4" aria-hidden="true" />
                Voltar para acomodações
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
