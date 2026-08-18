import type { Database } from "@/types/database.types";

export type AccommodationStatus =
  Database["public"]["Tables"]["accommodations"]["Row"]["status"];

export const accommodationStatusLabels: Record<AccommodationStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

export function slugifyAccommodationName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
