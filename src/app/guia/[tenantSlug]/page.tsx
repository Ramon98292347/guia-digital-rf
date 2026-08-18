import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { GuideHome } from "@/features/public-guide/components/guide-home";
import { getPublicGuideData } from "@/features/public-guide/server/service";

type PublicGuidePageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function PublicGuidePage({
  params,
}: PublicGuidePageProps) {
  const { tenantSlug } = await params;
  const headerList = await headers();
  const hostHeader =
    headerList.get("x-forwarded-host") ?? headerList.get("host");
  const guide = await getPublicGuideData({
    tenantSlug,
    pathname: `/guia/${tenantSlug}`,
    hostname: hostHeader,
  });

  if (!guide) {
    notFound();
  }

  return <GuideHome data={guide} />;
}
