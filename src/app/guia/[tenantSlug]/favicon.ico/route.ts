import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getPublicGuideData } from "@/features/public-guide/server/service";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const { tenantSlug } = await params;
  const headerList = await headers();
  const guide = await getPublicGuideData({
    tenantSlug,
    pathname: `/guia/${tenantSlug}`,
    hostname: headerList.get("x-forwarded-host") ?? headerList.get("host"),
  });
  const iconPath = guide?.branding.iconPath ?? "/icons/rf-favicon.png";
  const iconUrl = new URL(iconPath, request.url);

  return NextResponse.redirect(iconUrl, {
    status: 307,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
