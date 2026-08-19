import { z } from "zod";

export const tenantFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do estabelecimento.").max(160),
  slug: z
    .string()
    .trim()
    .min(1, "Informe o slug.")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens."),
  type: z.string().trim().min(1).max(80),
  status: z.enum(["draft", "active", "suspended", "archived"]),
  timezone: z.string().trim().min(1).max(80),
});

export type TenantFormState = { error?: string; success?: string };

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

