import { AccommodationForm } from "@/features/accommodations/components/accommodation-form";
import { getAccommodationEditorData } from "@/features/accommodations/server/service";

type NewAccommodationPageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function NewAccommodationPage({
  params,
}: NewAccommodationPageProps) {
  const { tenantSlug } = await params;
  const { amenities, context, mediaOptions, nextSortOrder } =
    await getAccommodationEditorData(tenantSlug);

  return (
    <div className="mx-auto max-w-6xl">
      <AccommodationForm
        tenantSlug={context.tenant.slug}
        amenities={amenities}
        selectedAmenityIds={[]}
        mediaOptions={mediaOptions}
        feedbackMessage={null}
        initialValues={{
          name: "",
          slug: "",
          shortDescription: "",
          description: "",
          capacity: "",
          areaM2: "",
          viewDescription: "",
          bedDescription: "",
          bookingUrl: "",
          sortOrder: String(nextSortOrder),
          coverMediaId: "",
          selectedMediaIds: [],
          status: "draft",
        }}
      />
    </div>
  );
}
