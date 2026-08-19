import fs from "node:fs/promises";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const expectedUrl = "https://kqtmwmgtyqkxsbtohjjm.supabase.co";
const input = process.argv[2];
const apply = process.argv.includes("--apply");
const parsePrice = (value) => {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

if (!input) {
  console.error("Uso: node scripts/import-villa-content-package.mjs <pacote.json> [--apply]");
  process.exit(1);
}

if (process.env.NEXT_PUBLIC_SUPABASE_URL !== expectedUrl) {
  throw new Error("Importação abortada: NEXT_PUBLIC_SUPABASE_URL não aponta para o projeto remoto autorizado.");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Importação abortada: SUPABASE_SERVICE_ROLE_KEY não configurada.");
}

const pkg = JSON.parse(await fs.readFile(input, "utf8"));
const supabase = createClient(expectedUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const slug = pkg.tenant.slugExpected;
const { data: existingTenant, error: tenantReadError } = await supabase
  .from("tenants")
  .select("id, name, slug, status")
  .eq("slug", slug)
  .maybeSingle();
if (tenantReadError) throw tenantReadError;

let tenant = existingTenant;
let createdTenant = false;
if (!tenant) {
  if (!apply) {
    tenant = { id: "dry-run", name: pkg.tenant.name, slug, status: "draft" };
  } else {
    const result = await supabase.from("tenants").insert({
      name: pkg.tenant.name,
      slug,
      type: "hospitality",
      status: "draft",
      timezone: "America/Sao_Paulo",
      locale: "pt-BR",
      currency: "BRL",
    }).select("id, name, slug, status").single();
    if (result.error) throw result.error;
    tenant = result.data;
    createdTenant = true;
  }
}

const report = {
  mode: apply ? "apply" : "dry-run",
  tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug, status: tenant.status, created: createdTenant },
  accommodations: 0,
  generalRules: 0,
  accommodationRules: 0,
  contacts: 0,
  skipped: {
    accommodationRules: 0,
    collections: Object.values(pkg.collections ?? {}).reduce((total, value) => total + (Array.isArray(value) ? value.length : 0), 0),
    media: (pkg.media?.images?.length ?? 0) + (pkg.media?.videos?.length ?? 0),
    unsupportedContacts: 0,
  },
};

if (tenant.id !== "dry-run") {
  const accommodationIds = new Map();
  for (const [index, accommodation] of (pkg.accommodations ?? []).entries()) {
    const slugValue = accommodation.slugSuggested;
    const existing = await supabase.from("accommodations").select("id").eq("tenant_id", tenant.id).eq("slug", slugValue).maybeSingle();
    if (existing.error) throw existing.error;
    const values = {
      tenant_id: tenant.id,
      name: accommodation.name,
      slug: slugValue,
      short_description: accommodation.shortDescription ?? null,
      description: accommodation.description ?? null,
      capacity: accommodation.capacity ?? null,
      booking_url: accommodation.bookingLink ?? null,
      sort_order: index,
    };
    const result = existing.data
      ? await supabase.from("accommodations").update(values).eq("id", existing.data.id).eq("tenant_id", tenant.id)
      : await supabase.from("accommodations").insert({ ...values, status: "draft" }).select("id").single();
    if (result.error) throw result.error;
    accommodationIds.set(accommodation.name, existing.data?.id ?? result.data.id);
    report.accommodations += 1;
  }

  for (const [index, rule] of (pkg.generalRules ?? []).entries()) {
    const values = {
      tenant_id: tenant.id,
      category: String(rule.category ?? "geral").toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_|_$/g, "") || "geral",
      title: rule.title,
      content: rule.text,
      severity: rule.priority === "alta" ? "important" : "info",
      is_featured: rule.priority === "alta",
      sort_order: index,
    };
    const existing = await supabase.from("rules").select("id").eq("tenant_id", tenant.id).eq("title", values.title).eq("content", values.content).maybeSingle();
    if (existing.error) throw existing.error;
    const result = existing.data
      ? await supabase.from("rules").update(values).eq("id", existing.data.id).eq("tenant_id", tenant.id)
      : await supabase.from("rules").insert({ ...values, status: "draft" });
    if (result.error) throw result.error;
    report.generalRules += 1;
  }

  for (const [index, rule] of (pkg.accommodationRules ?? []).entries()) {
    const accommodationId = accommodationIds.get(rule.accommodation);
    if (!accommodationId) continue;
    const category = String(rule.category ?? "geral").toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_|_$/g, "") || "geral";
    const existing = await supabase.from("rules").select("id").eq("tenant_id", tenant.id).eq("category", category).eq("title", rule.title).eq("content", rule.text).maybeSingle();
    if (existing.error) throw existing.error;
    const ruleResult = existing.data
      ? existing
      : await supabase.from("rules").insert({ tenant_id: tenant.id, category, title: rule.title, content: rule.text, severity: rule.priority === "alta" ? "important" : "info", status: "draft", sort_order: index }).select("id").single();
    if (ruleResult.error) throw ruleResult.error;
    const relation = await supabase.from("accommodation_rules").upsert({ tenant_id: tenant.id, accommodation_id: accommodationId, rule_id: ruleResult.data.id, sort_order: index }, { onConflict: "tenant_id,accommodation_id,rule_id" });
    if (relation.error) throw relation.error;
    report.accommodationRules += 1;
  }

  const collectionLabels = { shop: "Lojinha", minibar: "Frigobar", gastronomy: "Gastronomia", tutorials: "Como usar", information: "Informações", experience: "Experiências", other: "Outros" };
  const collectionIds = new Map();
  for (const [kind, items] of Object.entries(pkg.collections ?? {})) {
    if (!Array.isArray(items) || !items.length) continue;
    const collectionSlug = kind.replace(/[^a-z0-9_]+/gi, "-").toLowerCase();
    const existing = await supabase.from("content_collections").select("id").eq("tenant_id", tenant.id).eq("slug", collectionSlug).maybeSingle();
    if (existing.error) throw existing.error;
    const collectionResult = existing.data
      ? existing
      : await supabase.from("content_collections").insert({ tenant_id: tenant.id, slug: collectionSlug, title: collectionLabels[kind] ?? kind, kind, status: "draft", sort_order: Object.keys(collectionLabels).indexOf(kind) }).select("id").single();
    if (collectionResult.error) throw collectionResult.error;
    collectionIds.set(kind, collectionResult.data.id);
    for (const [index, item] of items.entries()) {
      const title = item.title ?? item.name ?? item.subject ?? "Conteúdo sem título";
      const description = item.description ?? item.text ?? item.orientation ?? null;
      const existingItem = await supabase.from("content_items").select("id").eq("tenant_id", tenant.id).eq("collection_id", collectionResult.data.id).eq("title", title).maybeSingle();
      if (existingItem.error) throw existingItem.error;
      const values = { tenant_id: tenant.id, collection_id: collectionResult.data.id, title, subtitle: item.subtitle ?? null, description, price: parsePrice(item.price), supplier: item.supplier ?? null, instructions: item.instructions ?? item.orientation ?? null, alert_text: item.alert ?? null, external_url: item.externalLink ?? item.external_url ?? null, sort_order: item.recommendedOrder ?? index };
      const itemResult = existingItem.data
        ? await supabase.from("content_items").update(values).eq("id", existingItem.data.id).eq("tenant_id", tenant.id)
        : await supabase.from("content_items").insert({ ...values, status: "draft" });
      if (itemResult.error) throw itemResult.error;
    }
  }

  const supportedContacts = new Map([
    ["telefone", "phone"], ["email", "email"], ["instagram", "instagram"], ["site", "website"],
  ]);
  for (const [index, contact] of (pkg.contacts ?? []).entries()) {
    const contactType = supportedContacts.get(contact.type);
    if (!contactType || !contact.value) {
      report.skipped.unsupportedContacts += 1;
      continue;
    }
    const existing = await supabase.from("contacts").select("id").eq("tenant_id", tenant.id).eq("contact_type", contactType).eq("value", contact.value).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) continue;
    const result = await supabase.from("contacts").insert({
      tenant_id: tenant.id,
      contact_type: contactType,
      label: contact.type,
      value: contact.value,
      is_primary: index === 0,
      status: "draft",
      sort_order: index,
    });
    if (result.error) throw result.error;
    report.contacts += 1;
  }
} else {
  report.accommodations = pkg.accommodations?.length ?? 0;
  report.generalRules = pkg.generalRules?.length ?? 0;
  report.accommodationRules = pkg.accommodationRules?.length ?? 0;
  report.contacts = (pkg.contacts ?? []).filter((item) => ["telefone", "email", "instagram", "site"].includes(item.type) && item.value).length;
}

console.log(JSON.stringify(report, null, 2));
