import OpenAI from "openai";
import { getAIDesignEnv } from "@/lib/env";
import type { DesignSpec } from "./registry";
import { componentRegistry } from "./registry";

export type AIDesignContext = {
  tenant: { id: string; name: string; type: string };
  branding: unknown;
  settings: unknown;
  accommodations: Array<{ id: string; name: string; cover_media_id: string | null }>;
  services: Array<{ id: string; name: string; cover_media_id: string | null }>;
  media: Array<{ id: string; media_type: string; status: string; alt_text: string | null; caption: string | null }>;
  localTips: Array<{ id: string; name: string; cover_media_id: string | null }>;
  booking: unknown;
  modules: unknown[];
  homeSections: unknown[];
};

export type AIDesignRequest = {
  style: DesignSpec["style"];
  description?: string;
};

export interface AIDesignProvider {
  generateDesign(request: AIDesignRequest, context: AIDesignContext): Promise<unknown>;
}

const designSpecJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["style", "hero", "quickActions", "sections", "navigation", "design"],
  properties: {
    style: { type: "string", enum: ["elegant", "romantic", "rustic", "modern", "nature", "familiar", "custom"] },
    hero: {
      type: "object",
      additionalProperties: false,
      required: ["variant", "mediaId", "showGreeting"],
      properties: {
        variant: { type: "string", enum: [...componentRegistry.hero] },
        mediaId: { type: ["string", "null"] },
        showGreeting: { type: "boolean" },
      },
    },
    quickActions: {
      type: "array",
      minItems: 1,
      maxItems: 6,
      items: { type: "string", enum: ["accommodations", "booking", "wifi", "gallery", "contact", "local_tips"] },
    },
    sections: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "variant"],
        properties: {
          type: { type: "string", enum: ["accommodations", "services", "gallery", "local_tips", "quick_actions", "booking_cta"] },
          variant: { type: "string" },
        },
      },
    },
    navigation: {
      type: "object",
      additionalProperties: false,
      required: ["variant"],
      properties: { variant: { type: "string", enum: [...componentRegistry.navigation] } },
    },
    design: {
      type: "object",
      additionalProperties: false,
      required: ["cardStyle", "radius", "spacing"],
      properties: {
        cardStyle: { type: "string", enum: ["soft", "bordered", "elevated"] },
        radius: { type: "string", enum: ["medium", "large"] },
        spacing: { type: "string", enum: ["compact", "comfortable"] },
      },
    },
  },
} as const;

const systemPrompt = `Você é o AI Designer da plataforma Guia Digital RF Tecnologia.
Monte uma experiência premium de Guia Digital para hospedagens usando SOMENTE os dados fornecidos, componentes registrados, variantes registradas e mídias autorizadas.
Nunca invente informações. Nunca produza HTML, CSS ou JavaScript. Nunca crie componentes.
Retorne somente a configuração permitida pelo schema. Priorize mobile-first, hospitalidade, clareza, estética premium, navegação simples e performance.`;

function safeContext(context: AIDesignContext) {
  return {
    tenant: context.tenant,
    branding: context.branding,
    settings: context.settings,
    accommodations: context.accommodations,
    services: context.services,
    media: context.media,
    localTips: context.localTips,
    booking: context.booking,
    modules: context.modules,
    homeSections: context.homeSections,
  };
}

export class OpenAIDesignProvider implements AIDesignProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    this.client = new OpenAI({ apiKey, timeout: 30_000, maxRetries: 1 });
    this.model = model;
  }

  async generateDesign(request: AIDesignRequest, context: AIDesignContext) {
    const allowedMediaIds = new Set(
      context.media.filter((media) => media.status === "published").map((media) => media.id),
    );
    const response = await this.client.responses.create({
      model: this.model,
      input: [
        { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
        {
          role: "user",
          content: [{ type: "input_text", text: JSON.stringify({ preference: request, context: safeContext(context) }) }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "guide_design_spec",
          strict: true,
          schema: designSpecJsonSchema,
        },
      },
    });

    if (!response.output_text) throw new Error("A resposta do provider veio vazia.");
    const parsed = JSON.parse(response.output_text) as { hero?: { mediaId?: string | null } };
    if (parsed.hero?.mediaId && !allowedMediaIds.has(parsed.hero.mediaId)) {
      throw new Error("A proposta selecionou uma mídia não autorizada.");
    }
    return parsed;
  }
}

export function createAIDesignProvider(): AIDesignProvider {
  const env = getAIDesignEnv();
  return env.OPENAI_API_KEY
    ? new OpenAIDesignProvider(env.OPENAI_API_KEY, env.AI_DESIGN_MODEL)
    : new LocalAIDesignProvider();
}

/** Provider temporário determinístico; pode ser trocado por um provider real sem alterar o fluxo. */
export class LocalAIDesignProvider implements AIDesignProvider {
  async generateDesign(request: AIDesignRequest, context: AIDesignContext) {
    const coverMedia = context.media.find(
      (media) => media.media_type === "image" && media.status === "published",
    );
    const sections: DesignSpec["sections"] = [];
    if (context.accommodations.length > 0) sections.push({ type: "accommodations", variant: "horizontal-cards" });
    if (context.services.length > 0) sections.push({ type: "services", variant: "cards" });
    if (context.media.length > 0) sections.push({ type: "gallery", variant: "mosaic" });
    if (context.localTips.length > 0) sections.push({ type: "local_tips", variant: "cards" });

    return {
      style: request.style,
      hero: {
        variant: coverMedia ? "immersive" : "compact",
        mediaId: coverMedia?.id ?? null,
        showGreeting: true,
      },
      quickActions: ["accommodations", "booking", "wifi", "gallery", "contact"],
      sections,
      navigation: { variant: "bottom" },
      design: {
        cardStyle: "soft",
        radius: "large",
        spacing: "comfortable",
      },
    } satisfies DesignSpec;
  }
}
