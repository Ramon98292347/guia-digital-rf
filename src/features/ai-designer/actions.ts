"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { requireTenantAccess } from "@/features/auth/server/admin-access";
import { AIDesignService, loadAIDesignContext } from "./service";
import { designSpecSchema, type DesignSpec } from "./registry";
import type { Json } from "@/types/database.types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AIDesignState = { error?: string; proposal?: DesignSpec; approved?: boolean };

function asRecord(value: Json | null | undefined): Record<string, Json> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, Json> : {};
}

function isDraftSection(value: Json) {
  const settings = asRecord(value);
  return settings.aiProposal === true && settings.proposalState === "draft";
}

export async function generateAIDesignAction(
  tenantSlug: string,
  _previousState: AIDesignState,
  formData: FormData,
): Promise<AIDesignState> {
  const style = String(formData.get("style") ?? "custom");
  const description = String(formData.get("description") ?? "").trim();
  if (!["elegant", "romantic", "rustic", "modern", "nature", "familiar", "custom"].includes(style)) {
    return { error: "Selecione um estilo válido." };
  }

  const access = await requireTenantAccess(tenantSlug);
  if (!access || access.role !== "tenant_admin") return { error: "Você não tem permissão para gerar um design." };

  try {
    const { tenantId, context } = await loadAIDesignContext(tenantSlug);
    const proposal = await new AIDesignService().generate({ style: style as DesignSpec["style"], description }, context);
    const { data: existingSettings, error: existingSettingsError } = await access.supabase
      .from("tenant_design_settings")
      .select("design_config")
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (existingSettingsError) throw existingSettingsError;
    const proposalId = randomUUID();
    const currentConfig = asRecord(existingSettings?.design_config);
    const currentAi = asRecord(currentConfig._ai);
    const { error } = await access.supabase.from("tenant_design_settings").upsert(
      {
        tenant_id: tenantId,
        design_config: {
          ...currentConfig,
          _ai: { ...currentAi, draft: proposal, draftId: proposalId },
        },
      },
      { onConflict: "tenant_id" },
    );
    if (error) throw error;

    const { data: existingSections, error: existingSectionsError } = await access.supabase
      .from("tenant_home_sections")
      .select("id, settings")
      .eq("tenant_id", tenantId);
    if (existingSectionsError) throw existingSectionsError;
    const draftSectionIds = (existingSections ?? [])
      .filter((section) => isDraftSection(section.settings))
      .map((section) => section.id);
    if (draftSectionIds.length > 0) {
      const { error: deleteError } = await access.supabase.from("tenant_home_sections").delete().in("id", draftSectionIds).eq("tenant_id", tenantId);
      if (deleteError) throw deleteError;
    }
    await access.supabase.from("tenant_home_sections").insert(
      proposal.sections.map((section, index) => ({
        tenant_id: tenantId,
        section_type: section.type,
        variant: section.variant,
        enabled: false,
        sort_order: index,
        content_source: "system" as const,
        settings: { aiProposal: true, proposalId, proposalState: "draft" },
      })),
    );

    revalidatePath(`/admin/${tenantSlug}/aparencia`);
    revalidatePath(`/guia/${tenantSlug}`);
    return { proposal };
  } catch {
    return { error: "Não foi possível validar a proposta. Nenhuma configuração foi publicada." };
  }
}

export async function approveAIDesignAction(tenantSlug: string): Promise<AIDesignState> {
  const access = await requireTenantAccess(tenantSlug);
  if (!access || access.role !== "tenant_admin") return { error: "Você não tem permissão para aprovar este design." };
  const { data: current, error: readError } = await access.supabase.from("tenant_design_settings").select("design_config").eq("tenant_id", access.tenant.id).maybeSingle();
  if (readError) return { error: "Não foi possível carregar a proposta." };
  const currentConfig = asRecord(current?.design_config);
  const aiConfig = asRecord(currentConfig._ai);
  const draft = aiConfig.draft ?? currentConfig.draft;
  const draftId = typeof aiConfig.draftId === "string" ? aiConfig.draftId : "legacy";
  const parsed = designSpecSchema.safeParse(draft);
  if (!parsed.success) return { error: "A proposta não é válida e não pode ser aprovada." };

  const { error } = await access.supabase.from("tenant_design_settings").upsert(
    {
      tenant_id: access.tenant.id,
      design_config: {
        ...parsed.data,
        _ai: { approvedProposalId: draftId },
      },
    },
    { onConflict: "tenant_id" },
  );
  if (error) return { error: "Não foi possível aprovar o design." };
  const { data: sections, error: sectionsError } = await access.supabase
    .from("tenant_home_sections")
    .select("id, settings")
    .eq("tenant_id", access.tenant.id);
  if (sectionsError) return { error: "Não foi possível preparar as seções aprovadas." };
  for (const section of sections ?? []) {
    const settings = asRecord(section.settings);
    if (settings.aiProposal !== true) continue;
    const isApprovedProposal = settings.proposalId === draftId || (draftId === "legacy" && settings.proposalId === undefined);
    const { error: updateError } = await access.supabase
      .from("tenant_home_sections")
      .update({ enabled: isApprovedProposal })
      .eq("id", section.id)
      .eq("tenant_id", access.tenant.id);
    if (updateError) return { error: "Não foi possível habilitar as seções aprovadas." };
  }
  revalidatePath(`/admin/${tenantSlug}/aparencia`);
  revalidatePath(`/guia/${tenantSlug}`);
  return { approved: true };
}

export async function publishGuideAction(tenantSlug: string): Promise<AIDesignState> {
  const access = await requireTenantAccess(tenantSlug);
  if (!access || access.role !== "tenant_admin") return { error: "Você não tem permissão para publicar este Guia." };
  const { data: settings, error: settingsError } = await access.supabase
    .from("tenant_design_settings")
    .select("design_config")
    .eq("tenant_id", access.tenant.id)
    .maybeSingle();
  if (settingsError) return { error: "Não foi possível verificar o design aprovado." };
  const config = asRecord(settings?.design_config);
  const approved = designSpecSchema.safeParse(config);
  const aiConfig = asRecord(config._ai);
  if (!approved.success || typeof aiConfig.approvedProposalId !== "string") {
    return { error: "Aprove um design antes de publicar o Guia." };
  }
  // A policy existente protege tenants contra alterações comuns; a publicação é
  // uma transição controlada após a autorização explícita do administrador.
  const { error } = await createSupabaseAdminClient()
    .from("tenants")
    .update({ status: "active", published_at: new Date().toISOString() })
    .eq("id", access.tenant.id);
  if (error) return { error: "A publicação foi bloqueada pelas permissões atuais do tenant." };
  revalidatePath(`/admin/${tenantSlug}/aparencia`);
  revalidatePath(`/guia/${tenantSlug}`);
  return { approved: true };
}
