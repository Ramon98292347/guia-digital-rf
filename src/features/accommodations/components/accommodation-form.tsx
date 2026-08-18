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
    bookingUrl: string;
    sortOrder: string;
    coverMediaId: string;
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
  const [submitIntent, setSubmitIntent] = useState<SubmitIntent>(
    initialValues.status === "archived" ? "draft" : initialValues.status,
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="coverMediaId" value={selectedCoverMediaId} />
      <input type="hidden" name="removeCover" value={removeCover ? "true" : "false"} />

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
                    aria-invalid={Boolean(state.fieldErrors?.description)}
                    className="min-h-40"
                  />
                  {state.fieldErrors?.description ? (
                    <p className="text-sm text-destructive">
                      {state.fieldErrors.description}
                    </p>
                  ) : null}
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
              <CardTitle>Imagem de capa</CardTitle>
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
                  A imagem é enviada para a mídia privada do tenant e pode ser
                  publicada junto com a acomodação.
                </p>
              </div>

              {mediaOptions.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Selecionar capa existente</p>
                  <div className="grid gap-3">
                    {mediaOptions.map((media) => {
                      const isSelected =
                        !removeCover && selectedCoverMediaId === media.id;

                      return (
                        <label
                          key={media.id}
                          className={cn(
                            "flex cursor-pointer gap-3 rounded-lg border p-3 transition",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border bg-background hover:border-ring",
                          )}
                        >
                          <input
                            type="radio"
                            name="coverMediaChoice"
                            value={media.id}
                            checked={isSelected}
                            onChange={() => {
                              setRemoveCover(false);
                              setSelectedCoverMediaId(media.id);
                            }}
                            className="mt-1 size-4"
                          />
                          <div className="flex min-w-0 flex-1 gap-3">
                            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={media.previewUrl}
                                alt={media.alt_text ?? media.original_filename ?? "Capa"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {media.original_filename ?? "Imagem"}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                  {media.status === "published"
                                    ? "Publicado"
                                    : media.status === "archived"
                                      ? "Arquivado"
                                      : "Rascunho"}
                              </p>
                              {media.caption ? (
                                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                                  {media.caption}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                  Nenhuma imagem disponível ainda. Envie uma capa para começar.
                </div>
              )}

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
