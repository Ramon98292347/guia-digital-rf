import { z } from "zod";
import { MEDIA_STORAGE } from "@/features/media/config";

const uuidSchema = z.string().uuid();
const categorySchema = z.enum(MEDIA_STORAGE.categories);
const mimeTypeSchema = z.enum(MEDIA_STORAGE.allowedMimeTypes);

export const mediaPathInputSchema = z.object({
  tenantId: uuidSchema,
  category: categorySchema,
  fileId: uuidSchema,
  extension: z
    .string()
    .toLowerCase()
    .regex(/^[a-z0-9]+$/),
});

export const mediaFileInputSchema = z.object({
  mimeType: mimeTypeSchema,
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(MEDIA_STORAGE.maxFileSizeBytes),
  originalFilename: z.string().min(1).max(255),
  extension: z
    .string()
    .toLowerCase()
    .regex(/^[a-z0-9]+$/),
});

export const mediaIdInputSchema = z.object({
  tenantId: uuidSchema,
  mediaId: uuidSchema,
});

export type MediaPathInput = z.infer<typeof mediaPathInputSchema>;
export type MediaFileInput = z.infer<typeof mediaFileInputSchema>;
