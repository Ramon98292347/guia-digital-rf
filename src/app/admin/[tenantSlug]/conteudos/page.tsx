import { ContentPage } from "@/features/admin/content-universal/components/content-page";
import { archiveContentAction, deleteContentAction, saveContentCollectionAction, saveContentItemAction } from "@/features/admin/content-universal/actions";
import { getUniversalContentAdminData } from "@/features/admin/content-universal/service";

type PageProps = {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ status?: string }>;
};

export default async function UniversalContentPage({ params, searchParams }: PageProps) {
  const [{ tenantSlug }, query] = await Promise.all([params, searchParams]);
  const data = await getUniversalContentAdminData(tenantSlug);
  if (!data) return null;

  return (
    <ContentPage
      collections={data.collections}
      items={data.items}
      itemMedia={data.itemMedia}
      accommodations={data.accommodations ?? []}
      media={data.media ?? []}
      saveCollection={saveContentCollectionAction.bind(null, tenantSlug)}
      saveItem={saveContentItemAction.bind(null, tenantSlug)}
      archiveCollection={archiveContentAction.bind(null, tenantSlug, "content_collections")}
      archiveItem={archiveContentAction.bind(null, tenantSlug, "content_items")}
      deleteCollection={deleteContentAction.bind(null, tenantSlug, "content_collections")}
      deleteItem={deleteContentAction.bind(null, tenantSlug, "content_items")}
      status={query.status ?? null}
    />
  );
}
