import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const aiDesignEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1).optional(),
  AI_DESIGN_MODEL: z.string().min(1).default("gpt-5.6-luna"),
});

const conciergeEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_CONCIERGE_MODEL: z.string().min(1).default("gpt-4o-mini"),
  CONCIERGE_MODEL: z.string().min(1).optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type AIDesignEnv = z.infer<typeof aiDesignEnvSchema>;
export type ConciergeEnv = z.infer<typeof conciergeEnvSchema>;

export function getAIDesignEnv(): AIDesignEnv {
  return aiDesignEnvSchema.parse({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AI_DESIGN_MODEL: process.env.AI_DESIGN_MODEL,
  });
}

export function getConciergeEnv(): ConciergeEnv {
  return conciergeEnvSchema.parse({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_CONCIERGE_MODEL:
      process.env.OPENAI_CONCIERGE_MODEL || process.env.CONCIERGE_MODEL || "gpt-4o-mini",
    CONCIERGE_MODEL: process.env.CONCIERGE_MODEL || process.env.OPENAI_CONCIERGE_MODEL,
  });
}

export function getSupabasePublicEnv(): PublicEnv {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY para usar o Supabase.",
    );
  }

  return parsed.data;
}

export function getSupabaseServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    throw new Error(
      "Configure SUPABASE_SERVICE_ROLE_KEY apenas no servidor para operações privilegiadas.",
    );
  }

  return parsed.data;
}
