import OpenAI from "openai";
import { getConciergeEnv } from "@/lib/env";

export type ConciergeContext = {
  question: string;
  structured: unknown;
  complementary: unknown;
};

export type ConciergeAnswer = {
  text: string;
  actions?: { label: string; kind: string }[];
};

export interface ConciergeAIProvider {
  answer(context: ConciergeContext): Promise<ConciergeAnswer | null>;
  classifyIntent?(question: string): Promise<{ intent: string; confidence: number } | null>;
}

const systemPrompt = `Você é o Concierge Virtual de uma hospedagem do Guia Digital RF Tecnologia.
Responda em português do Brasil, de forma breve, natural e acolhedora.
REGRAS ABSOLUTAS:
- nunca invente informações sobre o estabelecimento;
- nunca crie horários, preços, regras, serviços, contatos, senhas, promoções ou localização;
- dados reais da pousada só podem vir do contexto fornecido pelo sistema;
- se o contexto não tiver informação suficiente, retorne null;
- quando a base indicar ausência de dado, não tente completar;
- encaminhe para a recepção quando a resposta depender de informação específica da hospedagem;
- não responda credenciais, tokens, chaves ou dados privados;
- use somente o contexto fornecido e mantenha a resposta curta.`;

const intentSchema = {
  type: "object",
  properties: {
    intent: {
      type: "string",
      enum: [
        "greeting",
        "thanks",
        "farewell",
        "small_talk",
        "wifi",
        "fireplace_tutorial",
        "air_conditioning_tutorial",
        "coffee_tutorial",
        "accommodation",
        "schedule",
        "rule",
        "location",
        "local_tip",
        "booking",
        "contact",
        "unknown",
      ],
    },
    confidence: { type: "number" },
  },
  required: ["intent", "confidence"],
  additionalProperties: false,
} as const;

export function resolveConciergeModel(): string {
  const env = getConciergeEnv();
  return env.OPENAI_CONCIERGE_MODEL || env.CONCIERGE_MODEL || "gpt-4o-mini";
}

export class OpenAIConciergeProvider implements ConciergeAIProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    this.client = new OpenAI({ apiKey, timeout: 15_000, maxRetries: 1 });
    this.model = model;
  }

  async answer(context: ConciergeContext) {
    const response = await this.client.responses.create({
      model: this.model,
      input: [
        { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
        { role: "user", content: [{ type: "input_text", text: JSON.stringify(context) }] },
      ],
    });
    const text = response.output_text?.trim();
    return text ? { text } : null;
  }

  async classifyIntent(question: string) {
    const response = await this.client.responses.create({
      model: this.model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: "Classifique a intenção da mensagem em português do Brasil. Responda somente com JSON de intenção e confiança. Não responda informações da pousada." }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: question }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "concierge_intent",
          strict: true,
          schema: intentSchema,
        },
      },
    });

    const raw = response.output_text?.trim();
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as { intent?: string; confidence?: number };
      if (!parsed.intent) return null;
      return { intent: parsed.intent, confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0 };
    } catch {
      return null;
    }
  }
}

export class LocalConciergeProvider implements ConciergeAIProvider {
  async answer() {
    return null;
  }

  async classifyIntent() {
    return null;
  }
}

export function createConciergeProvider(): ConciergeAIProvider {
  const env = getConciergeEnv();
  const model = resolveConciergeModel();
  return env.OPENAI_API_KEY
    ? new OpenAIConciergeProvider(env.OPENAI_API_KEY, model)
    : new LocalConciergeProvider();
}
