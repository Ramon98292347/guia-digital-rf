import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPublicGuideData } from "@/features/public-guide/server/service";
import { PublicPromotionsPage } from "@/features/public-guide/components/public-promotions-page";

type PageProps = { params: Promise<{ tenantSlug: string }> };

async function getGuide(tenantSlug: string) {
  const headerList = await headers();
  return getPublicGuideData({
    tenantSlug,
    pathname: `/guia/${tenantSlug}/promocoes`,
    hostname: headerList.get("x-forwarded-host") ?? headerList.get("host"),
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tenantSlug = (await params).tenantSlug;
  const guide = await getGuide(tenantSlug);
  const name = guide?.tenant.name ?? "Estabelecimento";
  return {
    title: `Promoções | ${name}`,
    description: `Promoções e anúncios de ${name}.`,
    icons: {
      icon: `/guia/${tenantSlug}/favicon.ico`,
      shortcut: `/guia/${tenantSlug}/favicon.ico`,
      apple: `/guia/${tenantSlug}/favicon.ico`,
    },
  };
}

export default async function PublicPromotionsRoute({ params }: PageProps) {
  const guide = await getGuide((await params).tenantSlug);
  if (!guide) notFound();
  return <PublicPromotionsPage data={guide} />;
}
