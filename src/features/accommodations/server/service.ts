import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { PostgrestError, type SupabaseClient } from "@supabase/supabase-js";
import {
  getPrivatePreviewUrl,
  resolvePublicMediaUrl,
  uploadPrivateMedia,
  publishMedia,
} from "@/features/media/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireTenantAccess, type AdminTenantContext } from "@/features/auth/server/admin-access";
import {
  accommodationIntentSchema,
  accommodationFieldSchema,
  type AccommodationActionState,
} from "@/features/accommodations/validation";
import type { AccommodationStatus } from "@/features/accommodations/shared";
import type { Database } from "@/types/database.types";

type TypedSupabaseClient = SupabaseClient<Database>;
type AccommodationRow = Database["public"]["Tables"]["accommodations"]["Row"];
type AmenityRow = Database["public"]["Tables"]["amenities"]["Row"];
type MediaRow = Database["public"]["Tables"]["media"]["Row"];

export type AccommodationListItem = Pick<
  AccommodationRow,
  | "id"
  | "name"
  | "slug"
  | "short_description"
  | "capacity"
  | "status"
  | "sort_order"
  | "cover_media_id"
  | "updated_at"
>;

export type AccommodationMediaOption = Pick<
  MediaRow,
  | "id"
  | "media_type"
  | "alt_text"
  | "caption"
  | "status"
  | "storage_bucket"
  | "storage_path"
  | "original_filename"
>;

export type AccommodationEditorAmenity = Pick<
  AmenityRow,
  "id" | "name" | "description" | "status"
>;

export type AccommodationListData = {
  context: AdminTenantContext;
  accommodations: Array<
    AccommodationListItem & {
      coverUrl: string | null;
    }
  >;
};

export type AccommodationEditorData = {
  context: AdminTenantContext;
  accommodation: AccommodationRow | null;
  selectedAmenityIds: string[];
  selectedAccommodationMediaIds: string[];
  amenities: AccommodationEditorAmenity[];
  mediaOptions: Array<
    AccommodationMediaOption & {
      previewUrl: string;
    }
  >;
  nextSortOrder: number;
};

function isPostgrestError(value: unknown): value is PostgrestError {
  return typeof value === "object" && value !== null && "code" in value;
}

function getFriendlyAccommodationError(error: unknown) {
  if (isPostgrestError(error)) {
    if (error.code === "23505") {
      return "Já existe uma acomodação com este slug neste estabelecimento.";
    }

    return "Não foi possível salvar a acomodação agora.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Não foi possível concluir a operação.";
}

async function requireTenantContext(tenantSlug: string) {
  const context = await requireTenantAccess(tenantSlug);

  if (!context) {
    notFound();
  }

  return context;
}

async function resolveMediaPreviewUrl(
  supabase: TypedSupabaseClient,
  tenantId: string,
  media: Pick<MediaRow, "id" | "status" | "storage_bucket" | "storage_path">,
) {
  if (media.status === "published") {
    return resolvePublicMediaUrl(supabase, media);
  }

  return getPrivatePreviewUrl(supabase, {
    tenantId,
    mediaId: media.id,
  });
}

export async function getAccommodationListData(
  tenantSlug: string,
): Promise<AccommodationListData> {
  const context = await requireTenantContext(tenantSlug);
  const supabase = await createSupabaseServerClient();

  const { data: accommodations, error } = await supabase
    .from("accommodations")
    .select(
      "id, name, slug, short_description, capacity, status, sort_order, cover_media_id, updated_at",
    )
    .eq("tenant_id", context.tenant.id)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  const coverMediaIds = accommodations
    .map((accommodation) => accommodation.cover_media_id)
    .filter((value): value is string => Boolean(value));

  const mediaMap = new Map<string, string>();

  if (coverMediaIds.length > 0) {
    const { data: mediaRows, error: mediaError } = await supabase
      .from("media")
      .select(
        "id, status, storage_bucket, storage_path",
      )
      .eq("tenant_id", context.tenant.id)
      .in("id", coverMediaIds)
      .is("deleted_at", null);

    if (mediaError) {
      throw mediaError;
    }

    const previewEntries = await Promise.all(
      mediaRows.map(async (media) => [
        media.id,
        await resolveMediaPreviewUrl(supabase, context.tenant.id, media),
      ] as const),
    );

    previewEntries.forEach(([mediaId, url]) => {
      mediaMap.set(mediaId, url);
    });
  }

  return {
    context,
    accommodations: accommodations.map((accommodation) => ({
      ...accommodation,
      coverUrl: accommodation.cover_media_id
        ? mediaMap.get(accommodation.cover_media_id) ?? null
        : null,
    })),
  };
}

export async function getAccommodationEditorData(
  tenantSlug: string,
  accommodationId?: string,
): Promise<AccommodationEditorData> {
  const context = await requireTenantContext(tenantSlug);
  const supabase = await createSupabaseServerClient();

  const [{ data: amenities, error: amenitiesError }, { data: latest, error: latestError }] =
    await Promise.all([
      supabase
        .from("amenities")
        .select("id, name, description, status")
        .eq("tenant_id", context.tenant.id)
        .neq("status", "archived")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("accommodations")
        .select("sort_order")
        .eq("tenant_id", context.tenant.id)
        .is("deleted_at", null)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (amenitiesError) {
    throw amenitiesError;
  }

  if (latestError) {
    throw latestError;
  }

  let accommodation: AccommodationRow | null = null;
  let selectedAmenityIds: string[] = [];
  let selectedAccommodationMediaIds: string[] = [];

  if (accommodationId) {
    const [
      { data: row, error: rowError },
      { data: junctionRows, error: junctionError },
      { data: accommodationMediaRows, error: accommodationMediaError },
    ] = await Promise.all([
      supabase
        .from("accommodations")
        .select("*")
        .eq("tenant_id", context.tenant.id)
        .eq("id", accommodationId)
        .is("deleted_at", null)
        .maybeSingle(),
      supabase
        .from("accommodation_amenities")
        .select("amenity_id")
        .eq("tenant_id", context.tenant.id)
        .eq("accommodation_id", accommodationId),
      supabase
        .from("accommodation_media")
        .select("media_id, sort_order, is_cover")
        .eq("tenant_id", context.tenant.id)
        .eq("accommodation_id", accommodationId)
        .order("sort_order", { ascending: true }),
    ]);

    if (rowError) {
      throw rowError;
    }

    if (!row) {
      notFound();
    }

    if (junctionError) {
      throw junctionError;
    }

    if (accommodationMediaError) {
      throw accommodationMediaError;
    }

    accommodation = row;
    selectedAmenityIds = junctionRows.map((item) => item.amenity_id);
    selectedAccommodationMediaIds = (accommodationMediaRows ?? [])
      .map((item) => item.media_id)
      .filter((value): value is string => Boolean(value));
  }

  const selectedMediaId = accommodation?.cover_media_id ?? selectedAccommodationMediaIds[0] ?? null;

  const { data: mediaRows, error: mediaError } = await supabase
    .from("media")
    .select(
      "id, media_type, alt_text, caption, status, storage_bucket, storage_path, original_filename",
    )
    .eq("tenant_id", context.tenant.id)
    .eq("media_type", "image")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(12);

  if (mediaError) {
    throw mediaError;
  }

  const baseMediaRows = [...mediaRows];

  if (selectedMediaId && !mediaRows.some((media) => media.id === selectedMediaId)) {
    const { data: selectedMedia, error: selectedMediaError } = await supabase
      .from("media")
      .select(
        "id, media_type, alt_text, caption, status, storage_bucket, storage_path, original_filename",
      )
      .eq("tenant_id", context.tenant.id)
      .eq("id", selectedMediaId)
      .maybeSingle();

    if (selectedMediaError) {
      throw selectedMediaError;
    }

    if (selectedMedia) {
      baseMediaRows.unshift(selectedMedia);
    }
  }

  const seenMediaIds = new Set<string>();
  const uniqueMediaRows = baseMediaRows.filter((media) => {
    if (seenMediaIds.has(media.id)) {
      return false;
    }

    seenMediaIds.add(media.id);
    return true;
  });

  const mediaOptions = await Promise.all(
    uniqueMediaRows.map(async (media) => ({
      ...media,
      previewUrl: await resolveMediaPreviewUrl(supabase, context.tenant.id, media),
    })),
  );

  return {
    context,
    accommodation,
    selectedAmenityIds,
    selectedAccommodationMediaIds,
    amenities,
    mediaOptions,
    nextSortOrder: (latest?.sort_order ?? -10) + 10,
  };
}

async function syncAccommodationMedia(
  supabase: TypedSupabaseClient,
  tenantId: string,
  accommodationId: string,
  selectedMediaIds: string[],
  coverMediaId: string | null,
) {
  const uniqueMediaIds = [...new Set(selectedMediaIds.filter(Boolean))];

  if (uniqueMediaIds.length > 6) {
    throw new Error("Você pode selecionar até 6 fotos por acomodação.");
  }

  const resolvedCoverMediaId =
    coverMediaId && uniqueMediaIds.includes(coverMediaId)
      ? coverMediaId
      : uniqueMediaIds[0] ?? null;

  if (uniqueMediaIds.length > 0) {
    const { data: mediaRows, error: mediaError } = await supabase
      .from("media")
      .select("id")
      .eq("tenant_id", tenantId)
      .in("id", uniqueMediaIds)
      .eq("status", "published")
      .is("deleted_at", null);

    if (mediaError) {
      throw mediaError;
    }

    if (mediaRows.length !== uniqueMediaIds.length) {
      throw new Error("Uma ou mais fotos selecionadas não pertencem a este estabelecimento ou não estão publicadas.");
    }
  }

  await supabase
    .from("accommodation_media")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("accommodation_id", accommodationId);

  if (uniqueMediaIds.length > 0) {
    const rows = uniqueMediaIds.map((mediaId, index) => ({
      tenant_id: tenantId,
      accommodation_id: accommodationId,
      media_id: mediaId,
      sort_order: index + 1,
      is_cover: mediaId === resolvedCoverMediaId,
    }));

    const { error: insertError } = await supabase
      .from("accommodation_media")
      .insert(rows);

    if (insertError) {
      throw insertError;
    }
  }

  await supabase
    .from("accommodations")
    .update({
      cover_media_id: resolvedCoverMediaId,
      updated_by: (await supabase.auth.getUser()).data.user?.id ?? null,
    })
    .eq("tenant_id", tenantId)
    .eq("id", accommodationId);
}

async function syncAccommodationAmenities(
  supabase: TypedSupabaseClient,
  tenantId: string,
  accommodationId: string,
  amenityIds: string[],
) {
  if (amenityIds.length > 0) {
    const { data: amenities, error } = await supabase
      .from("amenities")
      .select("id")
      .eq("tenant_id", tenantId)
      .in("id", amenityIds)
      .neq("status", "archived");

    if (error) {
      throw error;
    }

    if (amenities.length !== amenityIds.length) {
      throw new Error("Selecione apenas comodidades válidas do estabelecimento.");
    }
  }

  const { data: currentRows, error: currentError } = await supabase
    .from("accommodation_amenities")
    .select("id, amenity_id")
    .eq("tenant_id", tenantId)
    .eq("accommodation_id", accommodationId);

  if (currentError) {
    throw currentError;
  }

  const currentAmenityIds = new Set(currentRows.map((row) => row.amenity_id));
  const nextAmenityIds = new Set(amenityIds);

  const idsToDelete = currentRows
    .filter((row) => !nextAmenityIds.has(row.amenity_id))
    .map((row) => row.id);

  const rowsToInsert = amenityIds
    .filter((amenityId) => !currentAmenityIds.has(amenityId))
    .map((amenityId) => ({
      tenant_id: tenantId,
      accommodation_id: accommodationId,
      amenity_id: amenityId,
    }));

  if (idsToDelete.length > 0) {
    const { error } = await supabase
      .from("accommodation_amenities")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("accommodation_id", accommodationId)
      .in("id", idsToDelete);

    if (error) {
      throw error;
    }
  }

  if (rowsToInsert.length > 0) {
    const { error } = await supabase
      .from("accommodation_amenities")
      .insert(rowsToInsert);

    if (error) {
      throw error;
    }
  }
}

async function resolveCoverMediaId(
  supabase: TypedSupabaseClient,
  context: AdminTenantContext,
  input: {
    selectedCoverMediaId: string | null;
    removeCover: boolean;
    coverFile: File | null;
  },
) {
  let resolvedCoverMediaId = input.removeCover ? null : input.selectedCoverMediaId;

  if (resolvedCoverMediaId) {
    const { data: media, error } = await supabase
      .from("media")
      .select("id")
      .eq("tenant_id", context.tenant.id)
      .eq("id", resolvedCoverMediaId)
      .eq("media_type", "image")
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!media) {
      throw new Error("A capa selecionada não pertence a este estabelecimento.");
    }
  }

  if (input.coverFile && input.coverFile.size > 0) {
    const uploaded = await uploadPrivateMedia(supabase, {
      tenantId: context.tenant.id,
      category: "accommodations",
      file: input.coverFile,
      uploadedBy: context.user.id,
      altText: null,
      caption: null,
    });

    resolvedCoverMediaId = uploaded.id;
  }

  return resolvedCoverMediaId;
}

export async function saveAccommodationFromForm(
  tenantSlug: string,
  accommodationId: string | undefined,
  formData: FormData,
): Promise<{ redirectTo: string } | AccommodationActionState> {
  const context = await requireTenantContext(tenantSlug);
  const supabase = await createSupabaseServerClient();
  const coverFileEntry = formData.get("coverFile");
  const coverFile = coverFileEntry instanceof File ? coverFileEntry : null;

  const parsed = accommodationFieldSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    capacity: formData.get("capacity"),
    areaM2: formData.get("areaM2"),
    viewDescription: formData.get("viewDescription"),
    bedDescription: formData.get("bedDescription"),
    bookingUrl: formData.get("bookingUrl"),
    sortOrder: formData.get("sortOrder"),
    coverMediaId: formData.get("coverMediaId"),
    removeCover: formData.get("removeCover"),
    amenityIds: formData.getAll("amenityIds"),
    intent: formData.get("intent"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      error: "Revise os campos destacados.",
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors)
          .filter(([, messages]) => messages && messages.length > 0)
          .map(([key, messages]) => [key, messages[0] ?? "Campo inválido."]),
      ),
    };
  }

  try {
    const coverMediaId = await resolveCoverMediaId(supabase, context, {
      selectedCoverMediaId: parsed.data.coverMediaId || null,
      removeCover: parsed.data.removeCover,
      coverFile,
    });
    const selectedAccommodationMediaIds = formData
      .getAll("accommodationMediaIds")
      .map((value) => String(value))
      .filter(Boolean);
    const galleryMediaIds = [...new Set([
      ...selectedAccommodationMediaIds,
      ...(coverMediaId ? [coverMediaId] : []),
    ])].slice(0, 6);

    const payload = {
      tenant_id: context.tenant.id,
      name: parsed.data.name,
      slug: parsed.data.slug,
      short_description: parsed.data.shortDescription || null,
      description: parsed.data.description || null,
      capacity: parsed.data.capacity,
      area_m2: parsed.data.areaM2,
      view_description: parsed.data.viewDescription || null,
      bed_description: parsed.data.bedDescription || null,
      booking_url: parsed.data.bookingUrl || null,
      cover_media_id: coverMediaId,
      status: parsed.data.intent satisfies AccommodationStatus,
      sort_order: parsed.data.sortOrder,
      updated_by: context.user.id,
    };

    let savedAccommodationId = accommodationId;

    if (accommodationId) {
      const { data, error } = await supabase
        .from("accommodations")
        .update(payload)
        .eq("tenant_id", context.tenant.id)
        .eq("id", accommodationId)
        .is("deleted_at", null)
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      savedAccommodationId = data.id;
    } else {
      const { data, error } = await supabase
        .from("accommodations")
        .insert({
          ...payload,
          created_by: context.user.id,
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      savedAccommodationId = data.id;
    }

    if (!savedAccommodationId) {
      throw new Error("Não foi possível identificar a acomodação salva.");
    }

    await syncAccommodationAmenities(
      supabase,
      context.tenant.id,
      savedAccommodationId,
      parsed.data.amenityIds,
    );

    if (galleryMediaIds.length > 0) {
      await syncAccommodationMedia(
        supabase,
        context.tenant.id,
        savedAccommodationId,
        galleryMediaIds,
        coverMediaId,
      );
    }

    if (parsed.data.intent === "published" && coverMediaId) {
      await publishMedia({
        tenantId: context.tenant.id,
        mediaId: coverMediaId,
      });
    }

    revalidatePath(`/admin/${tenantSlug}/acomodacoes`);
    revalidatePath(`/admin/${tenantSlug}`);
    revalidatePath(`/admin/${tenantSlug}/acomodacoes/${savedAccommodationId}/editar`);

    const successParam =
      accommodationId === undefined ? "criada" : parsed.data.intent === "published"
        ? "publicada"
        : parsed.data.intent === "archived"
          ? "arquivada"
          : "salva";

    return {
      redirectTo: `/admin/${tenantSlug}/acomodacoes/${savedAccommodationId}/editar?status=${successParam}`,
    };
  } catch (error) {
    return {
      error: getFriendlyAccommodationError(error),
    };
  }
}

export async function updateAccommodationStatus(
  tenantSlug: string,
  accommodationId: string,
  intent: string,
) {
  const parsedIntent = accommodationIntentSchema.parse(intent);
  const context = await requireTenantContext(tenantSlug);
  const supabase = await createSupabaseServerClient();

  const { data: accommodation, error } = await supabase
    .from("accommodations")
    .update({
      status: parsedIntent,
      updated_by: context.user.id,
    })
    .eq("tenant_id", context.tenant.id)
    .eq("id", accommodationId)
    .is("deleted_at", null)
    .select("id, cover_media_id")
    .single();

  if (error) {
    throw error;
  }

  if (parsedIntent === "published" && accommodation.cover_media_id) {
    await publishMedia({
      tenantId: context.tenant.id,
      mediaId: accommodation.cover_media_id,
    });
  }

  revalidatePath(`/admin/${tenantSlug}/acomodacoes`);
  revalidatePath(`/admin/${tenantSlug}`);
}

export async function deleteAccommodation(
  tenantSlug: string,
  accommodationId: string,
) {
  const context = await requireTenantContext(tenantSlug);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("accommodations")
    .delete()
    .eq("tenant_id", context.tenant.id)
    .eq("id", accommodationId)
    .eq("status", "archived")
    .is("deleted_at", null);
  if (error) throw error;
  revalidatePath(`/admin/${tenantSlug}/acomodacoes`);
  revalidatePath(`/admin/${tenantSlug}`);
}

export async function moveAccommodation(
  tenantSlug: string,
  accommodationId: string,
  direction: "up" | "down",
) {
  const context = await requireTenantContext(tenantSlug);
  const supabase = await createSupabaseServerClient();
  const { data: accommodations, error } = await supabase
    .from("accommodations")
    .select("id, sort_order")
    .eq("tenant_id", context.tenant.id)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: true });

  if (error) {
    throw error;
  }

  const currentIndex = accommodations.findIndex(
    (accommodation) => accommodation.id === accommodationId,
  );

  if (currentIndex < 0) {
    notFound();
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= accommodations.length) {
    return;
  }

  const reordered = [...accommodations];
  const [current] = reordered.splice(currentIndex, 1);
  reordered.splice(targetIndex, 0, current);

  await Promise.all(
    reordered.map((item, index) =>
      supabase
        .from("accommodations")
        .update({
          sort_order: (index + 1) * 10,
          updated_by: context.user.id,
        })
        .eq("tenant_id", context.tenant.id)
        .eq("id", item.id),
    ),
  );

  revalidatePath(`/admin/${tenantSlug}/acomodacoes`);
}
