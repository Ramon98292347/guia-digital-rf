"use server";

import { redirect } from "next/navigation";
import {
  moveAccommodation,
  saveAccommodationFromForm,
  updateAccommodationStatus,
} from "@/features/accommodations/server/service";
import type { AccommodationActionState } from "@/features/accommodations/validation";

export async function saveAccommodationAction(
  params: { tenantSlug: string; accommodationId?: string },
  _previousState: AccommodationActionState,
  formData: FormData,
): Promise<AccommodationActionState> {
  const result = await saveAccommodationFromForm(
    params.tenantSlug,
    params.accommodationId,
    formData,
  );

  if ("redirectTo" in result) {
    redirect(result.redirectTo);
  }

  return result;
}

export async function changeAccommodationStatusAction(
  params: { tenantSlug: string; accommodationId: string; intent: string },
) {
  await updateAccommodationStatus(
    params.tenantSlug,
    params.accommodationId,
    params.intent,
  );

  redirect(
    `/admin/${params.tenantSlug}/acomodacoes?status=${params.intent === "published" ? "publicada" : params.intent === "archived" ? "arquivada" : "salva"}`,
  );
}

export async function moveAccommodationAction(
  params: { tenantSlug: string; accommodationId: string; direction: "up" | "down" },
) {
  await moveAccommodation(params.tenantSlug, params.accommodationId, params.direction);
  redirect(`/admin/${params.tenantSlug}/acomodacoes?status=ordem`);
}
