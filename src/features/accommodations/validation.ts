import { z } from "zod";
import { slugifyAccommodationName } from "@/features/accommodations/shared";

export const accommodationStatusSchema = z.enum([
  "draft",
  "published",
  "archived",
]);

export const accommodationIntentSchema = z.enum([
  "draft",
  "published",
  "archived",
]);

export const accommodationFieldSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome da acomodação.")
    .max(160, "O nome deve ter no máximo 160 caracteres."),
  slug: z
    .string()
    .trim()
    .min(1, "Informe o slug da acomodação.")
    .max(160, "O slug deve ter no máximo 160 caracteres.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use apenas letras minúsculas, números e hífens no slug.",
    ),
  shortDescription: z
    .string()
    .trim()
    .max(300, "A descrição curta deve ter no máximo 300 caracteres.")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(5000, "A descrição completa deve ter no máximo 5000 caracteres.")
    .optional()
    .or(z.literal("")),
  capacity: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? Number(value) : null))
    .refine(
      (value) => value === null || (Number.isInteger(value) && value > 0),
      "Informe uma capacidade inteira maior que zero.",
    ),
  bookingUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || /^https?:\/\/.+/i.test(value),
      "Informe uma URL de reserva válida começando com http:// ou https://.",
    ),
  sortOrder: z
    .string()
    .trim()
    .transform((value) => Number(value))
    .refine(
      (value) => Number.isInteger(value) && value >= 0,
      "Informe uma ordem inteira maior ou igual a zero.",
    ),
  coverMediaId: z.string().uuid().optional().or(z.literal("")),
  removeCover: z
    .union([z.literal("true"), z.literal("false"), z.literal("")])
    .optional()
    .transform((value) => value === "true"),
  amenityIds: z.array(z.string().uuid()).default([]),
  intent: accommodationIntentSchema,
});

export type AccommodationFields = z.infer<typeof accommodationFieldSchema>;

export const accommodationActionStateSchema = z.object({
  error: z.string().optional(),
  fieldErrors: z.record(z.string(), z.string()).optional(),
});

export type AccommodationActionState = z.infer<
  typeof accommodationActionStateSchema
>;

export function normalizeAccommodationSlug(value: string) {
  return slugifyAccommodationName(value);
}
