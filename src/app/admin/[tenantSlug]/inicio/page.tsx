import { notFound } from "next/navigation";
import { GuideHomeEditor } from "@/features/admin/guide-home/components/guide-home-editor";
import { getGuideHomeEditorData } from "@/features/admin/guide-home/service";

export default async function AdminGuideHomePage({ params, searchParams }: { params: Promise<{ tenantSlug: string }>; searchParams: Promise<{ status?: string }> }) {
  const { tenantSlug } = await params;
  const query = await searchParams;
  const data = await getGuideHomeEditorData(tenantSlug);
  if (!data) notFound();
  return <GuideHomeEditor tenantSlug={tenantSlug} data={data} status={query.status} />;
}
