"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireTenantAccess } from "@/features/auth/server/admin-access";
import { resolvePublicTenant } from "@/features/tenant/server/public-resolver";
import { answerConciergeQuestion } from "./service";

type GenericQuery = {
  upsert: (values: Record<string, unknown>, options?: { onConflict?: string }) => Promise<{ error: { message: string } | null }>;
  delete: () => GenericQuery;
  eq: (column: string, value: unknown) => GenericQuery;
  then: Promise<{ error: { message: string } | null }>["then"];
};

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function containsSensitiveData(value: unknown, path = ""): boolean {
  const forbiddenKey = /(senha|password|token|api.?key|secret|credential|credencial|private|privad)/i;
  if (path && forbiddenKey.test(path)) return true;
  if (typeof value === "string") return /(sk-[a-z0-9_-]{12,}|bearer\s+[a-z0-9._-]{12,})/i.test(value);
  if (Array.isArray(value)) return value.some((item, index) => containsSensitiveData(item, `${path}[${index}]`));
  if (value && typeof value === "object") return Object.entries(value).some(([key, item]) => containsSensitiveData(item, path ? `${path}.${key}` : key));
  return false;
}

function table(client: Awaited<ReturnType<typeof import("@/lib/supabase/server").createSupabaseServerClient>>, name: string) {
  return (client.from as unknown as (tableName: string) => GenericQuery)(name);
}

function parseKnowledge(raw: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw || "{}");
  } catch (error) {
    const message = error instanceof SyntaxError ? error.message : "JSON inválido.";
    throw new Error(`A base complementar precisa ser um JSON válido. ${message}`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("A base complementar deve começar com um objeto JSON.");
  if (containsSensitiveData(parsed)) throw new Error("Não utilize esta área para senhas ou credenciais.");
  return parsed;
}

async function accessForAdmin(tenantSlug: string) {
  const context = await requireTenantAccess(tenantSlug);
  if (!context || context.role !== "tenant_admin") redirect("/admin/no-access");
  return context;
}

export async function saveConciergeSettingsAction(tenantSlug: string, formData: FormData) {
  const context = await accessForAdmin(tenantSlug);
  const avatarMediaId = value(formData, "avatar_media_id") || null;
  const fallbackContactId = value(formData, "fallback_contact_id") || null;
  if (avatarMediaId) {
    const media = await context.supabase.from("media").select("id").eq("id", avatarMediaId).eq("tenant_id", context.tenant.id).eq("status", "published").maybeSingle();
    if (media.error) throw media.error;
    if (!media.data) throw new Error("O avatar selecionado não pertence a este estabelecimento ou não está publicado.");
  }
  if (fallbackContactId) {
    const contact = await context.supabase.from("contacts").select("id").eq("id", fallbackContactId).eq("tenant_id", context.tenant.id).eq("status", "published").maybeSingle();
    if (contact.error) throw contact.error;
    if (!contact.data) throw new Error("O contato selecionado não pertence a este estabelecimento ou não está publicado.");
  }
  const result = await table(context.supabase, "concierge_settings").upsert({
    tenant_id: context.tenant.id,
    is_enabled: formData.get("is_enabled") === "on",
    assistant_name: value(formData, "assistant_name") || "Anfitrião Virtual",
    avatar_media_id: avatarMediaId,
    welcome_message: value(formData, "welcome_message") || null,
    fallback_message: value(formData, "fallback_message") || null,
    fallback_contact_id: fallbackContactId,
    behavior_notes: value(formData, "behavior_notes") || null,
  }, { onConflict: "tenant_id" });
  if (result.error) throw result.error;
  revalidatePath(`/admin/${tenantSlug}/concierge`);
  revalidatePath(`/guia/${tenantSlug}`);
  redirect(`/admin/${tenantSlug}/concierge?status=salvo`);
}

export async function saveConciergeKnowledgeAction(tenantSlug: string, formData: FormData) {
  const context = await accessForAdmin(tenantSlug);
  const knowledge = parseKnowledge(value(formData, "knowledge_json"));
  const result = await table(context.supabase, "concierge_knowledge").upsert({
    tenant_id: context.tenant.id,
    title: "Base complementar",
    knowledge_json: knowledge as Record<string, unknown>,
    status: "published",
  }, { onConflict: "tenant_id" });
  if (result.error) throw result.error;
  revalidatePath(`/admin/${tenantSlug}/concierge`);
  revalidatePath(`/guia/${tenantSlug}`);
  redirect(`/admin/${tenantSlug}/concierge?status=base-salva`);
}

export async function clearConciergeKnowledgeAction(tenantSlug: string) {
  const context = await accessForAdmin(tenantSlug);
  const result = await table(context.supabase, "concierge_knowledge").delete().eq("tenant_id", context.tenant.id);
  if (result.error) throw result.error;
  revalidatePath(`/admin/${tenantSlug}/concierge`);
  revalidatePath(`/guia/${tenantSlug}`);
  redirect(`/admin/${tenantSlug}/concierge?status=base-limpa`);
}

export async function testConciergeAction(tenantSlug: string, question: string) {
  const context = await accessForAdmin(tenantSlug);
  return answerConciergeQuestion(context.tenant.id, question);
}

export async function askPublicConciergeAction(tenantSlug: string, question: string) {
  const headerList = await headers();
  const hostname = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const tenant = await resolvePublicTenant({
    hostname,
    pathname: `/guia/${tenantSlug}`,
    fallbackSlug: tenantSlug,
  });
  if (!tenant || tenant.slug !== tenantSlug) throw new Error("Tenant público não encontrado.");
  return answerConciergeQuestion(tenant.tenant_id, question);
}
