import { notFound } from "next/navigation";
import { AccommodationForm } from "@/features/accommodations/components/accommodation-form";
import { getAccommodationEditorData } from "@/features/accommodations/server/service";

type EditAccommodationPageProps = {
  params: Promise<{ tenantSlug: string; accommodationId: string }>;
  searchParams: Promise<{ status?: string }>;
};

const feedbackMessages: Record<string, string> = {
  criada: "Acomodação criada com sucesso.",
  salva: "Acomodação salva com sucesso.",
  publicada: "Acomodação publicada com sucesso.",
  arquivada: "Acomodação arquivada com sucesso.",
};

export default async function EditAccommodationPage({
  params,
  searchParams,
}: EditAccommodationPageProps) {
  const { tenantSlug, accommodationId } = await params;
  const resolvedSearchParams = await searchParams;
  const { accommodation, amenities, context, mediaOptions, selectedAmenityIds } =
    await getAccommodationEditorData(tenantSlug, accommodationId);

  if (!accommodation) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <AccommodationForm
        tenantSlug={context.tenant.slug}
        accommodationId={accommodation.id}
        amenities={amenities}
        selectedAmenityIds={selectedAmenityIds}
        mediaOptions={mediaOptions}
        feedbackMessage={
          resolvedSearchParams.status
            ? feedbackMessages[resolvedSearchParams.status] ?? null
            : null
        }
        initialValues={{
          name: accommodation.name,
          slug: accommodation.slug,
          shortDescription: accommodation.short_description ?? "",
          description: accommodation.description ?? "",
          capacity: accommodation.capacity ? String(accommodation.capacity) : "",
          bookingUrl: accommodation.booking_url ?? "",
          sortOrder: String(accommodation.sort_order),
          coverMediaId: accommodation.cover_media_id ?? "",
          status: accommodation.status as "draft" | "published" | "archived",
        }}
      />
    </div>
  );
}
