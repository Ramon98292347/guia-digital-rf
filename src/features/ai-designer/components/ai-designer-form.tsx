"use client";

import { useActionState, useState } from "react";
import {
  approveAIDesignAction,
  generateAIDesignAction,
  type AIDesignState,
} from "../actions";
import type { DesignSpec } from "../registry";
import { GuideRenderer } from "@/features/public-guide/components/guide-home";
import type { PublicGuideData } from "@/features/public-guide/server/service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const styleOptions: Array<[DesignSpec["style"], string]> = [
  ["elegant", "Elegante"],
  ["romantic", "Romântico"],
  ["rustic", "Rústico"],
  ["modern", "Moderno"],
  ["nature", "Natureza"],
  ["familiar", "Familiar"],
  ["custom", "Personalizado"],
];

function Proposal({
  tenantSlug,
  proposal,
}: {
  tenantSlug: string;
  proposal: DesignSpec;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [approval, approve] = useActionState<AIDesignState, FormData>(
    async () => approveAIDesignAction(tenantSlug),
    {},
  );
  const previewData = buildPreviewData(proposal);
  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle>Proposta pronta para revisão</CardTitle>
        <p className="text-sm text-muted-foreground">
          A proposta está salva como rascunho e ainda não altera o Guia
          publicado.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="text-muted-foreground">Estilo</p>
            <p className="mt-1 font-medium">{proposal.style}</p>
          </div>
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="text-muted-foreground">Hero</p>
            <p className="mt-1 font-medium">
              {proposal.hero.variant}
              {proposal.hero.mediaId ? " · mídia selecionada" : " · sem mídia"}
            </p>
          </div>
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="text-muted-foreground">Ações rápidas</p>
            <p className="mt-1 font-medium">
              {proposal.quickActions.length} selecionadas
            </p>
          </div>
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="text-muted-foreground">Seções</p>
            <p className="mt-1 font-medium">
              {proposal.sections.length} selecionadas
            </p>
          </div>
        </div>
        {showPreview ? (
          <div className="overflow-hidden rounded-md border border-border bg-muted/50 p-2">
            <p className="px-2 py-2 text-sm font-medium">
              Prévia real do renderer universal
            </p>
            <GuideRenderer data={previewData} />
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview((visible) => !visible)}
          >
            {showPreview ? "Ocultar proposta" : "Visualizar proposta"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              document
                .getElementById("gerar-proposta")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Gerar novamente
          </Button>
          <form action={approve}>
            <Button type="submit">Aprovar design</Button>
          </form>
        </div>
        {approval.error ? (
          <p className="text-sm text-destructive">{approval.error}</p>
        ) : null}
        {approval.approved ? (
          <p className="text-sm text-emerald-700">
            Design aprovado com sucesso.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function buildPreviewData(proposal: DesignSpec): PublicGuideData {
  return {
    tenant: {
      tenant_id: "00000000-0000-4000-8000-000000000001",
      name: "Prévia do estabelecimento",
      slug: "preview",
      timezone: "America/Sao_Paulo",
      locale: "pt-BR",
      status: "draft",
      domain_type: "platform_path",
      canonical_hostname: "preview.local",
      path_prefix: "/preview",
    },
    theme: {
      primaryColor: "#365c4b",
      secondaryColor: "#dfe9de",
      accentColor: "#8c5b64",
      backgroundColor: "#f3eee6",
      surfaceColor: "#fffaf5",
      foregroundColor: "#2d2926",
      mutedColor: "#ece3d7",
      borderColor: "#ded1c2",
      overlayFrom: "rgba(23,34,29,.18)",
      overlayTo: "rgba(23,34,29,.72)",
    },
    greeting: "Boa tarde",
    branding: { logoPath: null, iconPath: null },
    design: {
      logoPath: null,
      logoEnabled: true,
      logoSize: "medium",
      atmosphereLabel: proposal.style,
      heroImagePath: null,
      heroSecondaryImagePath: null,
      heroLineImagePath: null,
      heroMediaPosition: "center",
      heroOverlay: "medium",
      heroVariant: proposal.hero.variant,
      heroEnabled: true,
      showGreeting: proposal.hero.showGreeting,
      heroTitle: "Seu Guia Digital",
      heroSubtitle: "Uma experiência criada para o seu estabelecimento.",
      signature: null,
      welcomeMessage: null,
      footerMessage: null,
      footerVariant: null,
      serviceHighlights: [],
    },
    contact: {
      phone: null,
      whatsapp: null,
      email: null,
      instagram: null,
      website: null,
      address: null,
    },
    sections: proposal.sections.map((section, index) => ({
      id: `00000000-0000-4000-8000-${String(index + 2).padStart(12, "0")}`,
      tenant_id: "00000000-0000-4000-8000-000000000001",
      section_type: section.type,
      variant: section.variant,
      title: null,
      subtitle: null,
      enabled: true,
      sort_order: index,
      content_source: "system",
      settings: {},
      style_overrides: {},
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    })),
    navigation: [],
    quickActions: proposal.quickActions.map((target, index) => ({
      label: target,
      icon: "compass",
      target: `#preview-${index}`,
      description: null,
    })),
    staySummary: null,
    breakfast: null,
    concierge: null,
    booking: { label: "Reservar", href: null, mode: null, helperText: null },
    accommodations: [],
    services: [],
    localTips: [],
    gallery: [],
    publishedMedia: [],
    wifi: null,
    approvedDesign: proposal,
    rules: [],
    contentCollections: [],
  };
}

export function AIDesignerForm({ tenantSlug }: { tenantSlug: string }) {
  const [state, formAction, pending] = useActionState<AIDesignState, FormData>(
    generateAIDesignAction.bind(null, tenantSlug),
    {},
  );
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
      <Card id="gerar-proposta">
        <CardHeader>
          <CardTitle>Preferências do Guia</CardTitle>
          <p className="text-sm text-muted-foreground">
            A proposta usará somente os dados cadastrados neste estabelecimento.
          </p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Estilo desejado</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {styleOptions.map(([value, label]) => (
                  <label key={value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="style"
                      value={value}
                      defaultChecked={value === "nature"}
                      className="peer sr-only"
                    />
                    <span className="flex min-h-10 items-center justify-center rounded-md border border-border px-3 text-center text-sm transition peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:font-medium">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="space-y-2">
              <Label htmlFor="description">
                Descreva como você gostaria que o Guia ficasse{" "}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Quero um visual elegante, romântico e integrado à natureza..."
                rows={5}
              />
            </div>
            {state.error ? (
              <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {state.error}
              </p>
            ) : null}
            <Button type="submit" disabled={pending}>
              {pending ? "Gerando proposta..." : "Gerar Guia com IA"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Como funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            A IA escolhe apenas componentes e variantes existentes no Design
            System.
          </p>
          <p>A proposta passa por validação antes de ser salva.</p>
          <p>
            Nada é publicado automaticamente. Você revisa e aprova quando
            estiver pronto.
          </p>
        </CardContent>
      </Card>
      {state.proposal ? (
        <div className="lg:col-span-2">
          <Proposal tenantSlug={tenantSlug} proposal={state.proposal} />
        </div>
      ) : null}
    </div>
  );
}
