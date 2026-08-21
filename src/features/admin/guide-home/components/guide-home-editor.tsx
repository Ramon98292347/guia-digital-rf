/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  Image as ImageIcon,
  Plus,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  moveGuideHomeSectionAction,
  saveGuideHomeAction,
  saveGuideHomeSectionAction,
  toggleGuideHomeSectionAction,
} from "../actions";

type EditorData = Awaited<
  ReturnType<typeof import("../service").getGuideHomeEditorData>
>;
type Props = {
  tenantSlug: string;
  data: NonNullable<EditorData>;
  status?: string;
};
const sectionOptions = [
  ["accommodations", "Acomodações"],
  ["videos", "Como Usar"],
  ["gallery", "Galeria"],
  ["services", "Serviços"],
  ["content", "Conteúdos do Guia"],
  ["local_tips", "Dicas da Região"],
  ["booking_cta", "Reservas"],
];
const variants = {
  immersive: "Imersivo",
  "image-overlay": "Imagem com sobreposição",
  minimal: "Minimalista",
  organic: "Orgânico",
};

function value(config: Record<string, unknown>, key: string, fallback = "") {
  return typeof config[key] === "string" ? (config[key] as string) : fallback;
}

export function GuideHomeEditor({ tenantSlug, data, status }: Props) {
  const [selectedMedia, setSelectedMedia] = useState(
    value(data.config, "heroMediaId"),
  );
  const [preview, setPreview] = useState(selectedMedia);
  const [selectedLogo, setSelectedLogo] = useState(
    value(data.config, "logoMediaId"),
  );
  const [logoPreview, setLogoPreview] = useState(selectedLogo);
  const [editing, setEditing] = useState<string | null>(null);
  const saveSection = saveGuideHomeSectionAction.bind(null, tenantSlug);
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--rf-primary)]">
            Personalização do estabelecimento
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--rf-text)] sm:text-3xl">
            Início do Guia
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--rf-muted)]">
            Configure o hero e a ordem das seções que aparecem na Home pública.
          </p>
        </div>
        <a
          href={`/guia/${tenantSlug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-[var(--rf-border)] px-4 text-sm font-medium hover:bg-slate-50"
        >
          <ExternalLink className="size-4" />
          Visualizar Guia
        </a>
      </header>
      {status === "salvo" && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Alterações salvas com sucesso.
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Hero do Guia</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={saveGuideHomeAction.bind(null, tenantSlug)}
            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"
          >
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    name="heroEnabled"
                    defaultChecked={data.config.heroEnabled !== false}
                    className="size-4 accent-[var(--rf-primary)]"
                  />
                  Ativar Hero
                </label>
                <label className="flex items-center gap-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    name="showGreeting"
                    defaultChecked={data.config.showGreeting !== false}
                    className="size-4 accent-[var(--rf-primary)]"
                  />
                  Mostrar saudação automática
                </label>
              </div>
              <div className="rounded-lg border border-[var(--rf-border)] bg-slate-50/70 p-4">
                <p className="text-sm font-semibold text-[var(--rf-text)]">
                  Logo do estabelecimento
                </p>
                <div className="mt-3 grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center">
                  <div className="flex h-24 items-center justify-center rounded-lg border border-[var(--rf-border)] bg-white p-2">
                    {logoPreview &&
                    data.media.find((item) => item.id === logoPreview)
                      ?.previewUrl ? (
                      <img
                        src={
                          data.media.find((item) => item.id === logoPreview)
                            ?.previewUrl ?? ""
                        }
                        alt="Prévia da logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-center text-xs text-[var(--rf-muted)]">
                        Sem logo
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    <select
                      value={selectedLogo}
                      onChange={(event) => {
                        setSelectedLogo(event.target.value);
                        setLogoPreview(event.target.value);
                      }}
                      className="h-10 w-full rounded-lg border bg-white px-3 text-sm"
                    >
                      <option value="">Remover logo / usar nome</option>
                      {data.media.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.original_filename}
                        </option>
                      ))}
                    </select>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="logoEnabled"
                          defaultChecked={data.config.logoEnabled !== false}
                          className="size-4 accent-[var(--rf-primary)]"
                        />
                        Exibir no Hero
                      </label>
                      <label>
                        <span className="sr-only">Tamanho da logo</span>
                        <select
                          name="logoSize"
                          defaultValue={value(
                            data.config,
                            "logoSize",
                            "medium",
                          )}
                          className="h-10 w-full rounded-lg border bg-white px-3 text-sm"
                        >
                          <option value="small">Pequena</option>
                          <option value="medium">Média</option>
                          <option value="large">Grande</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
                <input type="hidden" name="logoMediaId" value={selectedLogo} />
                <p className="mt-3 text-xs leading-5 text-[var(--rf-muted)]">
                  A logo é centralizada no Hero, preserva a proporção e usa
                  somente mídia publicada deste tenant.
                </p>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  Título superior
                </span>
                <input
                  name="heroTitle"
                  defaultValue={value(data.config, "heroTitle")}
                  placeholder="Guia do Hóspede"
                  className="h-10 w-full rounded-lg border border-[var(--rf-border)] bg-white px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  Cor do título superior
                </span>
                <input
                  type="color"
                  name="heroTitleColor"
                  defaultValue={value(data.config, "heroTitleColor", "#4eb5b3")}
                  className="h-10 w-full rounded-lg border border-[var(--rf-border)] bg-white p-1"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  Saudação
                </span>
                <input
                  name="heroSubtitle"
                  defaultValue={value(data.config, "heroSubtitle")}
                  placeholder="Seja bem-vindo!"
                  className="h-10 w-full rounded-lg border border-[var(--rf-border)] bg-white px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  Mensagem de acolhimento
                </span>
                <textarea
                  name="welcomeMessage"
                  defaultValue={value(data.config, "welcomeMessage")}
                  rows={3}
                  className="w-full rounded-lg border border-[var(--rf-border)] bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  Chamada
                </span>
                <input
                  name="heroCallToAction"
                  defaultValue={value(data.config, "heroCallToAction")}
                  placeholder="Como podemos ajudar?"
                  className="h-10 w-full rounded-lg border border-[var(--rf-border)] bg-white px-3 text-sm"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                <label>
                  <span className="mb-1.5 block text-sm font-medium">
                    Variante
                  </span>
                  <select
                    name="heroVariant"
                    defaultValue={value(
                      data.config,
                      "heroVariant",
                      "immersive",
                    )}
                    className="h-10 w-full rounded-lg border bg-white px-3 text-sm"
                  >
                    {Object.entries(variants).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="mb-1.5 block text-sm font-medium">
                    Overlay
                  </span>
                  <select
                    name="heroOverlay"
                    defaultValue={value(data.config, "heroOverlay", "medium")}
                    className="h-10 w-full rounded-lg border bg-white px-3 text-sm"
                  >
                    <option value="light">Leve</option>
                    <option value="medium">Médio</option>
                    <option value="strong">Forte</option>
                  </select>
                </label>
                <label>
                  <span className="mb-1.5 block text-sm font-medium">
                    Posição
                  </span>
                  <select
                    name="heroMediaPosition"
                    defaultValue={value(
                      data.config,
                      "heroMediaPosition",
                      "center",
                    )}
                    className="h-10 w-full rounded-lg border bg-white px-3 text-sm"
                  >
                    <option value="top">Topo</option>
                    <option value="center">Centro</option>
                    <option value="bottom">Inferior</option>
                  </select>
                </label>
              </div>
              <input type="hidden" name="heroMediaId" value={selectedMedia} />
              <Button
                type="submit"
                className="bg-[var(--rf-primary)] text-white hover:bg-[var(--rf-navy)]"
              >
                <Save className="size-4" />
                Salvar alterações
              </Button>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium">Imagem de fundo</p>
              <div className="overflow-hidden rounded-xl border border-[var(--rf-border)] bg-slate-50">
                {preview &&
                data.media.find((item) => item.id === preview)?.previewUrl ? (
                  <img
                    src={
                      data.media.find((item) => item.id === preview)
                        ?.previewUrl ?? ""
                    }
                    alt="Prévia do hero"
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 text-sm text-[var(--rf-muted)]">
                    <ImageIcon className="size-8" />
                    Nenhuma imagem selecionada
                  </div>
                )}
              </div>
              <select
                value={selectedMedia}
                onChange={(event) => {
                  setSelectedMedia(event.target.value);
                  setPreview(event.target.value);
                }}
                className="h-10 w-full rounded-lg border bg-white px-3 text-sm"
              >
                <option value="">Sem imagem</option>
                {data.media.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.original_filename}
                  </option>
                ))}
              </select>
              <p className="text-xs leading-5 text-[var(--rf-muted)]">
                Somente imagens publicadas deste tenant aparecem no seletor.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Seções da Home</CardTitle>
            <p className="mt-1 text-sm text-[var(--rf-muted)]">
              Tipos controlados pelo registro universal do Guia.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditing("new")}
          >
            <Plus className="size-4" />
            Adicionar seção
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {editing === "new" && (
            <form
              action={saveSection}
              className="grid gap-3 rounded-lg border border-blue-200 bg-blue-50/30 p-4 sm:grid-cols-4"
            >
              <select
                name="section_type"
                required
                className="h-10 rounded-lg border bg-white px-3 text-sm"
              >
                {sectionOptions.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                name="title"
                placeholder="Título opcional"
                className="h-10 rounded-lg border bg-white px-3 text-sm"
              />
              <input
                name="variant"
                placeholder="Variante opcional"
                className="h-10 rounded-lg border bg-white px-3 text-sm"
              />
              <input
                type="hidden"
                name="sort_order"
                value={data.sections.length}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="enabled"
                  defaultChecked
                  className="size-4 accent-[var(--rf-primary)]"
                />
                Ativa{" "}
                <Button type="submit" size="sm" className="ml-auto">
                  Salvar
                </Button>
              </label>
            </form>
          )}
          {data.sections.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-[var(--rf-muted)]">
              Nenhuma seção personalizada. A Home padrão universal continuará
              disponível.
            </div>
          )}
          {data.sections.map((section, index) =>
            editing === section.id ? (
              <form
                key={section.id}
                action={saveSection}
                className="grid gap-3 rounded-lg border border-blue-200 bg-blue-50/30 p-4 sm:grid-cols-5"
              >
                <input type="hidden" name="id" value={section.id} />
                <select
                  name="section_type"
                  defaultValue={section.section_type}
                  className="h-10 rounded-lg border bg-white px-3 text-sm"
                >
                  {sectionOptions.map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  name="title"
                  defaultValue={section.title ?? ""}
                  placeholder="Título"
                  className="h-10 rounded-lg border bg-white px-3 text-sm"
                />
                <input
                  name="variant"
                  defaultValue={section.variant ?? ""}
                  placeholder="Variante"
                  className="h-10 rounded-lg border bg-white px-3 text-sm"
                />
                <input
                  type="hidden"
                  name="sort_order"
                  value={section.sort_order}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="enabled"
                    defaultChecked={section.enabled}
                    className="size-4 accent-[var(--rf-primary)]"
                  />
                  Ativa
                </label>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">
                    Salvar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div
                key={section.id}
                className="flex flex-col gap-3 rounded-lg border border-[var(--rf-border)] p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-[var(--rf-text)]">
                      {section.title ?? section.section_type}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        section.enabled
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {section.enabled ? "Ativa" : "Desativada"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--rf-muted)]">
                    Tipo: {section.section_type} · Variante:{" "}
                    {section.variant ?? "padrão"} · Ordem: {section.sort_order}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <form
                    action={moveGuideHomeSectionAction.bind(
                      null,
                      tenantSlug,
                      section.id,
                      "up",
                      section.sort_order,
                    )}
                  >
                    <Button
                      type="submit"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Mover para cima"
                      disabled={index === 0}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                  </form>
                  <form
                    action={moveGuideHomeSectionAction.bind(
                      null,
                      tenantSlug,
                      section.id,
                      "down",
                      section.sort_order,
                    )}
                  >
                    <Button
                      type="submit"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Mover para baixo"
                      disabled={index === data.sections.length - 1}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                  </form>
                  <form
                    action={toggleGuideHomeSectionAction.bind(
                      null,
                      tenantSlug,
                      section.id,
                      !section.enabled,
                    )}
                  >
                    <Button
                      type="submit"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={
                        section.enabled ? "Desativar seção" : "Ativar seção"
                      }
                    >
                      {section.enabled ? (
                        <Check className="size-4" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                    </Button>
                  </form>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(section.id)}
                  >
                    Editar
                  </Button>
                </div>
              </div>
            ),
          )}
        </CardContent>
      </Card>
    </div>
  );
}
