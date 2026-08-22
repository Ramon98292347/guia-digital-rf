import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createConciergeProvider, type ConciergeAnswer, type ConciergeContext } from "./provider";

type Query = {
  select: (columns?: string) => Query;
  eq: (column: string, value: unknown) => Query;
  is: (column: string, value: unknown) => Query;
  order: (column: string, options?: { ascending?: boolean }) => Query;
  maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>;
  then: Promise<unknown>["then"];
};

type Action = {
  label: string;
  kind: "wifi" | "contact" | "map" | "accommodations" | "content" | "tips" | "rules" | "reservas" | "video" | "reception";
  href?: string;
};

type ReceptionContact = {
  type: "whatsapp" | "phone" | "contact";
  label: string;
  value: string;
  href: string;
};

export type ConciergeScope = "social" | "general" | "lodging";

type ConciergeSettings = {
  is_enabled: boolean;
  assistant_name: string;
  welcome_message: string | null;
  fallback_message: string | null;
  fallback_contact_id: string | null;
};

export type PublicConciergeConfig = {
  enabled: boolean;
  assistantName: string;
  welcomeMessage: string;
  avatarUrl: string | null;
};

export type ConciergeResponse = {
  text: string;
  actions: Action[];
};

function table(client: ReturnType<typeof createSupabaseAdminClient>, name: string) {
  return (client.from as unknown as (tableName: string) => Query)(name);
}

function normalize(value: string) {
  return value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSocial(value: string) {
  const normalized = normalize(value);
  return normalized.replace(/(.)\1{2,}/g, "$1").replace(/\s+/g, " ").trim();
}

function detectConciergeScope(message: string): ConciergeScope {
  const value = normalize(message);
  if (!value) return "general";

  if (/(^oi+$|^ola+$|^ol[aá]$|^bom dia$|^boa tarde$|^boa noite$|^obrigado$|^obrigada$|^obg$|^valeu$|^vlw$|^ok$|^okay$|^blz$|^beleza$|^entendi$|^certo$|^perfeito$|^legal$|^show$|^tchau$|^ate mais$|^tudo bem$|^tudo bom$|^como vai$|^como voce esta$|^como você está$|^como vai$)/.test(value)) {
    return "social";
  }

  if (/(que dia|qual e o dia|qual é o dia|que horas|qual a hora|dia da semana|hoje|agora|como voce esta|como você está|quem e voce|quem é você|o que voce faz|o que você faz|qual e a capital|conte uma piada|me explica|o que significa)/.test(value)) {
    return "general";
  }

  return "lodging";
}

function buildDateAnswer(timezone: string) {
  const now = new Date();
  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDate = dateFormatter.format(now).replace(/^./, (letter) => letter.toUpperCase());
  const formattedTime = timeFormatter.format(now);
  return `Hoje é ${formattedDate}. Agora são ${formattedTime}.`;
}

function socialLead(question: string, timezone: string) {
  const value = normalizeSocial(question);
  if (!value) return null;

  const greetingRegex = /^(oi+|ola+|olaa+|bom dia|bomdia|boa tarde|boa noite|e ai|tudo bem|tudo bom|como vai|beleza)(?:\s+.*)?$/;
  const thankRegex = /^(obrigado|obrigada|muito obrigado|muito obrigada|obg|vlw|valeu|agradeco|agradeço)(?:\s+.*)?$/;
  const farewellRegex = /^(tchau|ate mais|ate logo|falou|nos vemos|valeu tchau)(?:\s+.*)?$/;

  const match = value.match(/^(oi+|ola+|olaa+|bom dia|bomdia|boa tarde|boa noite|e ai|tudo bem|tudo bom|como vai|beleza|obrigado|obrigada|muito obrigado|muito obrigada|obg|vlw|valeu|agradeco|agradeço|ok|okay|blz|entendi|certo|perfeito|legal|show|tchau|ate mais|ate logo|falou|nos vemos|valeu tchau)(?:\s+(.*))?$/);
  if (!match) return null;

  const [, prefix, rest = ""] = match;
  const trimmedRest = rest.trim();

  const fullGreeting = /^(oi+|ola+|olaa+|bom dia|bomdia|boa tarde|boa noite|e ai|tudo bem|tudo bom|como vai|beleza|ok|okay|blz|entendi|certo|perfeito|legal|show)$/.test(prefix);
  if (fullGreeting && !trimmedRest) {
    const hour = Number(new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", hour12: false, timeZone: timezone }).format(new Date()));
    const daytime = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
    return { prefix: `${daytime}! 👋`, question: "", response: `${daytime}! 👋 Como posso ajudar?` };
  }

  if ((thankRegex.test(prefix) || /^(ok|okay|blz|beleza|entendi|certo|perfeito|legal|show)$/.test(prefix)) && !trimmedRest) {
    return { prefix: "Perfeito! 😊", question: "", response: "Perfeito! 😊 Se precisar de mais alguma coisa, estou por aqui." };
  }

  if (farewellRegex.test(prefix) && !trimmedRest) {
    return { prefix: "Até mais! 😊", question: "", response: "Até mais! Desejo uma ótima estadia. 😊" };
  }

  if (greetingRegex.test(value) && trimmedRest) {
    const hour = Number(new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", hour12: false, timeZone: timezone }).format(new Date()));
    const daytime = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
    return { prefix: `${daytime}! 👋`, question: trimmedRest, response: `${daytime}! 👋 Como posso ajudar?` };
  }

  if (thankRegex.test(value) && trimmedRest) {
    return { prefix: "Por nada! 😊", question: trimmedRest, response: "Por nada! 😊" };
  }

  if (/(^ok$|^okay$|^blz$|^beleza$|^entendi$|^certo$|^perfeito$|^legal$|^show$)/.test(value) && trimmedRest) {
    return { prefix: "Perfeito! 😊", question: trimmedRest, response: "Perfeito! 😊" };
  }

  if (farewellRegex.test(value) && trimmedRest) {
    return { prefix: "Até mais! 😊", question: trimmedRest, response: "Até mais! 😊" };
  }

  return null;
}

function intent(question: string) {
  const value = normalize(question);
  if (/(oi+|ola+|bom dia|boa tarde|boa noite|como vai|como voce esta|como você está|tudo bem|quem e voce|quem é você|o que voce pode fazer|o que você pode fazer|obrigado|obrigada|valeu|tchau|ate mais)/.test(value)) return "social";
  if (/(wifi|wi fi|wi-fi|wifii|senha.*wifi|rede.*wifi|qual.*wifi)/.test(value)) return "wifi";
  if (/(como.*acender.*lareira|acender.*lareira|lareira.*acender|como.*ligar.*lareira|lareira.*usar|lareira)/.test(value)) return "fireplace_tutorial";
  if (/(como.*ligar.*ar|como.*usar.*ar|ar condicionado|ar-condicionado|climatizador|climatizacao|ar condicionado)/.test(value)) return "air_conditioning_tutorial";
  if (/(como.*fazer.*cafe|como.*preparar.*cafe|cafe|cafeteira|maquina de cafe|capsula|cappuccino|caf[eé])/.test(value)) return "coffee_tutorial";
  if (/(chegar|localizacao|endereco|mapa|waze)/.test(value)) return "location";
  if (/(chal[eé]|acomodac|quarto|hidromassagem|banheira|comodidade)/.test(value)) return "accommodations";
  if (/(regra|silencio|check.?in|check.?out|pet|animal|visitante)/.test(value)) return "rules";
  if (/(horario|abre|fecha|cafe|caf[eé] da manha)/.test(value)) return "schedule";
  if (/(reserva|reservar|disponibilidade)/.test(value)) return "booking";
  if (/(contato|telefone|whatsapp|recepcao|falar)/.test(value)) return "contact";
  if (/(comer|restaurante|passeio|fazer|perto|regiao|dica)/.test(value)) return "tips";
  return "content";
}

const rateLimitByTenant = new Map<string, number[]>();

function checkRateLimit(tenantId: string) {
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 30;
  const bucket = rateLimitByTenant.get(tenantId) ?? [];
  const recent = bucket.filter((timestamp) => now - timestamp < windowMs);
  recent.push(now);
  rateLimitByTenant.set(tenantId, recent);
  return recent.length <= maxRequests;
}

function matchingJson(value: unknown, question: string): string[] {
  const tokens = normalize(question).split(/\s+/).filter((token) => token.length > 3);
  const matches: string[] = [];
  const visit = (item: unknown) => {
    if (typeof item === "string" && tokens.some((token) => normalize(item).includes(token))) matches.push(item);
    else if (Array.isArray(item)) item.forEach(visit);
    else if (item && typeof item === "object") Object.values(item).forEach(visit);
  };
  visit(value);
  return matches.slice(0, 5);
}

async function getSettings(tenantId: string) {
  const client = createSupabaseAdminClient();
  const result = await table(client, "concierge_settings").select("*").eq("tenant_id", tenantId).maybeSingle();
  if (result.error) throw new Error(result.error.message);
  return { client, settings: (result.data ?? null) as ConciergeSettings | null };
}

export async function getPublicConciergeConfig(tenantId: string): Promise<PublicConciergeConfig> {
  const { client, settings } = await getSettings(tenantId);
  const resolvedSettings = settings ?? {
    is_enabled: true,
    assistant_name: "Anfitrião Virtual",
    welcome_message: "Olá! Como posso ajudar?",
    fallback_message: null,
    fallback_contact_id: null,
  } as ConciergeSettings;

  let avatarUrl: string | null = null;
  if (resolvedSettings.is_enabled) {
    const avatarMediaId = (settings as Record<string, unknown> | null)?.avatar_media_id;
    const avatar = await client.from("media").select("id, storage_bucket, storage_path, status, deleted_at").eq("tenant_id", tenantId).eq("id", typeof avatarMediaId === "string" ? avatarMediaId : "").eq("status", "published").is("deleted_at", null).maybeSingle();
    if (!avatar.error && avatar.data) {
      const { resolvePublicMediaUrl } = await import("@/features/media/service");
      avatarUrl = resolvePublicMediaUrl(client, avatar.data as never);
    }
  }

  return {
    enabled: resolvedSettings.is_enabled,
    assistantName: resolvedSettings.assistant_name || "Anfitrião Virtual",
    welcomeMessage: resolvedSettings.welcome_message || "Olá! Como posso ajudar?",
    avatarUrl,
  };
}

function fallbackActions(contact: ReceptionContact | null): Action[] {
  if (!contact) return [];
  const label = contact.type === "whatsapp" ? "Falar no WhatsApp" : contact.type === "phone" ? "Ligar para a hospedagem" : "Falar com a hospedagem";
  return [{ label, kind: "reception", href: contact.href }];
}

async function resolveReceptionContact(client: ReturnType<typeof createSupabaseAdminClient>, tenantId: string, fallbackContactId?: string | null): Promise<ReceptionContact | null> {
  const fields = "id, tenant_id, contact_type, label, value, description, is_primary, status";

  if (fallbackContactId) {
    const explicit = await client.from("contacts").select(fields).eq("tenant_id", tenantId).eq("id", fallbackContactId).eq("status", "published").maybeSingle();
    if (!explicit.error && explicit.data) {
      const contact = explicit.data as Record<string, unknown>;
      const value = String(contact.value ?? "").trim();
      if (value) {
        const type = String(contact.contact_type ?? "contact");
        return { type: type === "whatsapp" ? "whatsapp" : type === "phone" ? "phone" : "contact", label: String(contact.label ?? "Contato"), value, href: type === "whatsapp" ? `https://wa.me/${value.replace(/\D/g, "")}` : type === "phone" ? `tel:${value.replace(/\D/g, "")}` : type === "email" ? `mailto:${value}` : type === "website" ? (value.startsWith("http") ? value : `https://${value}`) : value };
      }
    }
  }

  const result = await client.from("contacts").select(fields).eq("tenant_id", tenantId).eq("status", "published").order("is_primary", { ascending: false }).order("sort_order", { ascending: true });
  if (result.error) throw new Error(result.error.message);

  const contacts = (result.data ?? []) as Array<Record<string, unknown>>;
  const orderedTypes = ["whatsapp", "phone", "reception", "email", "website", "instagram", "contact"];

  for (const type of orderedTypes) {
    const contact = contacts.find((item) => String(item.contact_type).toLowerCase() === type && String(item.value ?? "").trim());
    if (!contact) continue;
    const value = String(contact.value ?? "").trim();
    if (!value) continue;
    const href = type === "whatsapp" ? `https://wa.me/${value.replace(/\D/g, "")}` : type === "phone" ? `tel:${value.replace(/\D/g, "")}` : type === "email" ? `mailto:${value}` : type === "website" ? (value.startsWith("http") ? value : `https://${value}`) : value;
    return { type: type === "whatsapp" ? "whatsapp" : type === "phone" ? "phone" : "contact", label: String(contact.label ?? "Contato"), value, href };
  }

  return null;
}

async function noContactMessage(client: ReturnType<typeof createSupabaseAdminClient>, tenantId: string, contactId: string | null) {
  const contact = await resolveReceptionContact(client, tenantId, contactId);
  const contactText = contact ? `${contact.label}: ${contact.value}` : null;
  return contactText
    ? `Não encontrei essa informação no Guia. Para confirmar, fale diretamente com a hospedagem. Contato: ${contactText}.`
    : "Não encontrei essa informação e o contato da hospedagem ainda não está disponível no Guia.";
}

async function findTutorialVideo(client: ReturnType<typeof createSupabaseAdminClient>, tenantId: string, keywords: string[]) {
  const normalizedKeywords = keywords.map((keyword) => normalize(keyword));
  const { resolvePublicMediaUrl } = await import("@/features/media/service");

  // Prioridade 1: vídeo vinculado a um content_item publicado (conteúdo universal do Guia).
  const [itemsResult, mediaRelationsResult] = await Promise.all([
    client.from("content_items").select("id, title, description, instructions, alert_text").eq("tenant_id", tenantId).eq("status", "published").order("sort_order", { ascending: true }),
    client.from("content_item_media").select("content_item_id, media_id, role").eq("tenant_id", tenantId),
  ]);
  if (itemsResult.error) throw itemsResult.error;
  if (mediaRelationsResult.error) throw mediaRelationsResult.error;

  const matchedItem = (itemsResult.data ?? []).find((item) => {
    const haystack = normalize(`${item.title ?? ""} ${item.description ?? ""} ${item.instructions ?? ""} ${item.alert_text ?? ""}`);
    return normalizedKeywords.some((keyword) => haystack.includes(keyword));
  });
  const linkedVideoMediaId = matchedItem
    ? (mediaRelationsResult.data ?? []).find(
        (relation) => String(relation.content_item_id) === String(matchedItem.id) && String(relation.role ?? "").toLowerCase() === "video",
      )?.media_id
    : null;

  if (matchedItem && linkedVideoMediaId) {
    const linkedMedia = await client
      .from("media")
      .select("id, media_type, storage_bucket, storage_path, status, caption, alt_text, original_filename")
      .eq("tenant_id", tenantId)
      .eq("id", linkedVideoMediaId)
      .eq("media_type", "video")
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle();
    if (linkedMedia.error) throw linkedMedia.error;
    if (linkedMedia.data) {
      return {
        title: String(matchedItem.title || "Orientação"),
        mediaId: linkedMedia.data.id,
        url: resolvePublicMediaUrl(client, linkedMedia.data as never),
      };
    }
  }

  // Prioridade 2: vídeo publicado diretamente na Biblioteca de Mídia, identificado pelo
  // próprio nome/legenda cadastrado (fluxo real de upload usado pelos tenants).
  const mediaResult = await client
    .from("media")
    .select("id, media_type, storage_bucket, storage_path, status, caption, alt_text, original_filename")
    .eq("tenant_id", tenantId)
    .eq("media_type", "video")
    .eq("status", "published")
    .is("deleted_at", null);
  if (mediaResult.error) throw mediaResult.error;

  const matchedMedia = (mediaResult.data ?? []).find((media) => {
    const haystack = normalize(`${media.caption ?? ""} ${media.alt_text ?? ""} ${media.original_filename ?? ""}`);
    return normalizedKeywords.some((keyword) => haystack.includes(keyword));
  });
  if (!matchedMedia) return null;

  return {
    title: String(matchedMedia.caption || matchedMedia.alt_text || matchedMedia.original_filename || "Orientação"),
    mediaId: matchedMedia.id,
    url: resolvePublicMediaUrl(client, matchedMedia as never),
  };
}

function summarizeNames(items: unknown, field: string, limit = 5): string | null {
  if (!Array.isArray(items) || items.length === 0) return null;
  const names = items
    .map((item) => (item && typeof item === "object" ? String((item as Record<string, unknown>)[field] ?? "").trim() : ""))
    .filter(Boolean)
    .slice(0, limit);
  return names.length > 0 ? names.join(", ") : null;
}

function summarizeContacts(items: unknown, limit = 3): string | null {
  if (!Array.isArray(items) || items.length === 0) return null;
  const formatted = items
    .slice(0, limit)
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const record = item as Record<string, unknown>;
      const label = String(record.label ?? "").trim();
      const value = String(record.value ?? "").trim();
      return label && value ? `${label}: ${value}` : "";
    })
    .filter(Boolean);
  return formatted.length > 0 ? formatted.join(" | ") : null;
}

// Monta a resposta usando somente os dados reais já cadastrados no Guia (mesma fonte
// consultada pelas telas públicas), evitando respostas genéricas quando a informação existe.
function buildDeterministicText(selectedIntent: string, structured: Record<string, unknown>): string {
  if (selectedIntent === "schedule") {
    const names = summarizeNames(structured.schedules, "name");
    return names ? `Encontrei os horários publicados no Guia para: ${names}.` : "Encontrei os horários publicados no Guia.";
  }
  if (selectedIntent === "location") {
    return "Encontrei as informações de localização.";
  }
  if (selectedIntent === "contact") {
    const formatted = summarizeContacts(structured.contacts);
    return formatted ? `Encontrei os contatos da hospedagem: ${formatted}.` : "Encontrei os contatos da hospedagem.";
  }
  if (selectedIntent === "accommodations") {
    const names = summarizeNames(structured.accommodations, "name");
    return names ? `Encontrei estas acomodações no Guia: ${names}.` : "Encontrei informações no Guia para ajudar com essa dúvida.";
  }
  if (selectedIntent === "rules") {
    const names = summarizeNames(structured.rules, "title");
    return names ? `Encontrei estas regras cadastradas no Guia: ${names}.` : "Encontrei informações no Guia para ajudar com essa dúvida.";
  }
  if (selectedIntent === "tips") {
    const names = summarizeNames(structured.localTips, "name");
    return names ? `Encontrei estas dicas da região no Guia: ${names}.` : "Encontrei informações no Guia para ajudar com essa dúvida.";
  }
  return "Encontrei informações no Guia para ajudar com essa dúvida.";
}

export async function answerConciergeQuestion(tenantId: string, question: string): Promise<ConciergeResponse> {
  if (!checkRateLimit(tenantId)) {
    return { text: "Muitas perguntas em sequência. Tente novamente em alguns instantes.", actions: [] };
  }

  const cleanQuestion = question.trim().slice(0, 500);
  const { client, settings } = await getSettings(tenantId);
  const resolvedSettings: ConciergeSettings = settings ?? {
    is_enabled: true,
    assistant_name: "Anfitrião Virtual",
    welcome_message: "Olá! Como posso ajudar?",
    fallback_message: null,
    fallback_contact_id: null,
  };
  const isEnabled = resolvedSettings.is_enabled;
  if (!isEnabled) return { text: "O Concierge está temporariamente indisponível. Você pode acessar as informações diretamente pelo Guia.", actions: [] };

  const tenantResult = await client.from("tenants").select("timezone").eq("id", tenantId).maybeSingle();
  if (tenantResult.error) throw tenantResult.error;
  const timezone = tenantResult.data?.timezone ?? "America/Sao_Paulo";

  const socialLeadInfo = socialLead(cleanQuestion, timezone);
  if (socialLeadInfo && socialLeadInfo.question === "") {
    return { text: socialLeadInfo.response, actions: [] };
  }

  const normalizedQuestion = socialLeadInfo ? socialLeadInfo.question : cleanQuestion;
  const scope = detectConciergeScope(normalizedQuestion);
  let aiCalled = false;

  if (scope === "social") {
    const fallbackText = socialLeadInfo?.response ?? "Perfeito! 😊 Se precisar de mais alguma coisa, estou por aqui.";
    if (process.env.NODE_ENV !== "production") {
      console.info("[concierge-debug]", { scope, intent: "social", localResult: "SKIP", aiCalled: false, contactResolved: false });
    }
    return { text: fallbackText, actions: [] };
  }

  if (scope === "general") {
    if (/(que dia|qual e o dia|qual é o dia|que horas|qual a hora|dia da semana|hoje|agora)/.test(normalize(normalizedQuestion))) {
      if (process.env.NODE_ENV !== "production") {
        console.info("[concierge-debug]", { scope, intent: "date_time", localResult: "FOUND", aiCalled: false, contactResolved: false });
      }
      return { text: buildDateAnswer(timezone), actions: [] };
    }

    try {
      const provider = createConciergeProvider();
      aiCalled = true;
      const generated = await provider.answer({ question: normalizedQuestion, structured: { scope: "general", timezone }, complementary: [] });
      if (process.env.NODE_ENV !== "production") {
        console.info("[concierge-debug]", { scope, intent: "general", localResult: "AI", aiCalled: true, contactResolved: false });
      }
      if (generated?.text) {
        return { text: generated.text, actions: generated.actions as Action[] | undefined ?? [] };
      }
    } catch {
      if (process.env.NODE_ENV !== "production") {
        console.info("[concierge-debug]", { scope, intent: "general", localResult: "AI_ERROR", aiCalled: true, contactResolved: false });
      }
    }

    return { text: "Não consegui responder essa pergunta agora. Posso continuar ajudando com as informações disponíveis no Guia.", actions: [] };
  }

  let selectedIntent = intent(normalizedQuestion);

  if (selectedIntent === "content") {
    try {
      const provider = createConciergeProvider();
      aiCalled = true;
      const aiIntent = await provider.classifyIntent?.(normalizedQuestion);
      if (aiIntent && aiIntent.confidence >= 0.6 && aiIntent.intent !== "unknown") {
        selectedIntent = aiIntent.intent;
      }
    } catch {
      selectedIntent = "content";
    }
  }

  const structured: Record<string, unknown> = {};
  const contact = await resolveReceptionContact(client, tenantId, resolvedSettings.fallback_contact_id);

  if (selectedIntent === "wifi") {
    const result = await client.from("wifi_networks").select("name, ssid, area").eq("tenant_id", tenantId).eq("status", "published").eq("is_guest_visible", true).order("sort_order", { ascending: true });
    if (result.error) throw result.error;
    structured.wifi = result.data;
  } else if (selectedIntent === "fireplace_tutorial") {
    const tutorial = await findTutorialVideo(client, tenantId, ["lareira", "acender", "aquecimento", "quarto", "chale"]);
    if (tutorial) {
      return { text: `Encontrei o vídeo "${tutorial.title}" com a orientação para usar a lareira.`, actions: [{ label: "▶ Ver vídeo", kind: "video", href: tutorial.url }] };
    }
    return { text: "Não encontrei essa orientação no Guia. Para utilizar corretamente, fale diretamente com a hospedagem.", actions: fallbackActions(contact) };
  } else if (selectedIntent === "air_conditioning_tutorial") {
    const tutorial = await findTutorialVideo(client, tenantId, ["ar condicionado", "ar-condicionado", "climatizacao", "climatizador", "controle do ar", "controle remoto"]);
    if (tutorial) {
      return { text: `Encontrei o vídeo "${tutorial.title}" com a orientação do ar-condicionado.`, actions: [{ label: "▶ Ver vídeo", kind: "video", href: tutorial.url }] };
    }
    return { text: "Não encontrei essa orientação no Guia. Para utilizar corretamente, fale diretamente com a hospedagem.", actions: fallbackActions(contact) };
  } else if (selectedIntent === "coffee_tutorial") {
    const tutorial = await findTutorialVideo(client, tenantId, ["cafe", "cafeteira", "cafetera", "maquina de cafe", "capsula", "preparo de cafe"]);
    if (tutorial) {
      return { text: `Encontrei o vídeo "${tutorial.title}" mostrando como preparar o café.`, actions: [{ label: "▶ Ver vídeo", kind: "video", href: tutorial.url }] };
    }
    return { text: "Não encontrei essa orientação no Guia. Para utilizar corretamente, fale diretamente com a hospedagem.", actions: fallbackActions(contact) };
  } else if (selectedIntent === "location") {
    const [contacts, content] = await Promise.all([
      client.from("contacts").select("label, value, description, contact_type").eq("tenant_id", tenantId).eq("status", "published").order("sort_order", { ascending: true }),
      table(client, "content_items").select("title, description, address, external_url, secondary_url, contact_url").eq("tenant_id", tenantId).eq("status", "published").order("sort_order", { ascending: true }),
    ]);
    structured.contact = contacts.data;
    const locationItems = (((content as { data?: unknown }).data as Array<Record<string, unknown>> | null) ?? []);
    structured.locationContent = locationItems.filter((item) => item.address || item.external_url || item.secondary_url);
  } else if (selectedIntent === "accommodations") {
    const [accommodations, amenities, relations] = await Promise.all([
      client.from("accommodations").select("id, name, short_description, description, capacity").eq("tenant_id", tenantId).eq("status", "published").is("deleted_at", null).order("sort_order", { ascending: true }),
      client.from("amenities").select("id, name, description").eq("tenant_id", tenantId).eq("status", "published"),
      client.from("accommodation_amenities").select("accommodation_id, amenity_id").eq("tenant_id", tenantId),
    ]);
    structured.accommodations = accommodations.data;
    structured.amenities = amenities.data;
    structured.accommodationAmenities = relations.data;
  } else if (selectedIntent === "rules") {
    const [rules, relations, accommodations] = await Promise.all([
      client.from("rules").select("id, title, content, category, severity").eq("tenant_id", tenantId).eq("status", "published").order("sort_order", { ascending: true }),
      client.from("accommodation_rules").select("accommodation_id, rule_id").eq("tenant_id", tenantId),
      client.from("accommodations").select("id, name").eq("tenant_id", tenantId).eq("status", "published"),
    ]);
    structured.rules = rules.data;
    structured.accommodationRules = relations.data;
    structured.accommodations = accommodations.data;
  } else if (selectedIntent === "schedule") {
    const [schedules, periods] = await Promise.all([
      client.from("schedules").select("id, name, schedule_type, description").eq("tenant_id", tenantId).eq("status", "published").order("sort_order", { ascending: true }),
      client.from("schedule_periods").select("schedule_id, day_of_week, opens_at, closes_at, is_closed, label").eq("tenant_id", tenantId).order("sort_order", { ascending: true }),
    ]);
    structured.schedules = schedules.data;
    structured.schedulePeriods = periods.data;
  } else if (selectedIntent === "booking") {
    const result = await client.from("booking_settings").select("provider, external_url, button_label, is_active").eq("tenant_id", tenantId).eq("is_active", true).maybeSingle();
    structured.booking = result.data;
  } else if (selectedIntent === "contact") {
    const result = await client.from("contacts").select("label, value, description, contact_type").eq("tenant_id", tenantId).eq("status", "published").order("sort_order", { ascending: true });
    structured.contacts = result.data;
  } else if (selectedIntent === "tips") {
    const result = await client.from("local_tips").select("name, short_description, description, address, distance_text, opening_hours_text, website").eq("tenant_id", tenantId).eq("status", "published").is("deleted_at", null).order("recommended", { ascending: false }).order("sort_order", { ascending: true });
    structured.localTips = result.data;
  } else {
    const [collections, items] = await Promise.all([
      client.from("content_collections").select("id, title, description, kind").eq("tenant_id", tenantId).eq("status", "published").order("sort_order", { ascending: true }),
      table(client, "content_items").select("collection_id, title, subtitle, description, instructions, alert_text, discount_text, validity_text, coupon_code, address, external_url, secondary_url, contact_url").eq("tenant_id", tenantId).eq("status", "published").order("sort_order", { ascending: true }),
    ]);
    structured.contentCollections = (collections as { data?: unknown }).data;
    structured.contentItems = (items as { data?: unknown }).data;
  }

  const knowledgeResult = await table(client, "concierge_knowledge").select("knowledge_json").eq("tenant_id", tenantId).eq("status", "published").order("updated_at", { ascending: false }).maybeSingle();
  if (knowledgeResult.error) throw new Error(knowledgeResult.error.message);
  const complementaryMatches = matchingJson(knowledgeResult.data?.knowledge_json, normalizedQuestion);
  const hasStructuredData = Object.values(structured).some((value) => Array.isArray(value) ? value.length > 0 : Boolean(value));
  if (process.env.NODE_ENV !== "production") {
    console.info("[concierge-debug]", { scope, intent: selectedIntent, localResult: hasStructuredData ? "FOUND" : "NOT_FOUND", aiCalled, contactResolved: Boolean(contact) });
  }

  if (selectedIntent === "wifi" && hasStructuredData) {
    const baseText = "Encontrei os dados do Wi-Fi.";
    return socialLeadInfo ? { text: `${socialLeadInfo.prefix} ${baseText}`.trim(), actions: [{ label: "Mostrar senha", kind: "wifi" }, { label: "Copiar senha", kind: "wifi" }] } : { text: baseText, actions: [{ label: "Mostrar senha", kind: "wifi" }, { label: "Copiar senha", kind: "wifi" }] };
  }
  if (selectedIntent === "wifi" && !hasStructuredData) {
    return { text: await noContactMessage(client, tenantId, resolvedSettings.fallback_contact_id), actions: fallbackActions(contact) };
  }
  if (hasStructuredData) {
    const provider = createConciergeProvider();
    let generated: ConciergeAnswer | null = null;
    try {
      const context: ConciergeContext = { question: normalizedQuestion, structured, complementary: complementaryMatches };
      generated = await provider.answer(context);
    } catch {
      generated = null;
    }
    if (generated?.text) {
      const baseText = generated.text;
      return socialLeadInfo ? { text: `${socialLeadInfo.prefix} ${baseText}`.trim(), actions: generated.actions as Action[] | undefined ?? [] } : { text: baseText, actions: generated.actions as Action[] | undefined ?? [] };
    }
    const action: Action | undefined = selectedIntent === "location" ? { label: "Como chegar no Guia", kind: "map" } : selectedIntent === "accommodations" ? { label: "Ver acomodações", kind: "accommodations" } : selectedIntent === "rules" ? { label: "Ver regras", kind: "rules" } : selectedIntent === "booking" ? { label: "Abrir reservas", kind: "reservas" } : selectedIntent === "tips" ? { label: "Ver dicas da região", kind: "tips" } : selectedIntent === "contact" ? { label: "Ver contatos", kind: "contact" } : undefined;
    const deterministicText = buildDeterministicText(selectedIntent, structured);
    const text = socialLeadInfo ? `${socialLeadInfo.prefix} ${deterministicText}`.trim() : deterministicText;
    return { text, actions: action ? [action] : [] };
  }
  if (complementaryMatches.length > 0) {
    const text = socialLeadInfo ? `${socialLeadInfo.prefix} ${complementaryMatches.join(" ")}`.trim() : complementaryMatches.join(" ");
    return { text, actions: [] };
  }
  const fallbackText = resolvedSettings.fallback_message || "Não encontrei essa informação no Guia. Posso indicar o contato da hospedagem para você confirmar.";
  const fallbackDetail = contact ? `${contact.label}: ${contact.value}` : null;
  const finalFallbackText = fallbackDetail ? `${fallbackText} Contato: ${fallbackDetail}.` : fallbackText;
  return { text: socialLeadInfo ? `${socialLeadInfo.prefix} ${finalFallbackText}`.trim() : finalFallbackText, actions: fallbackActions(contact) };
}
