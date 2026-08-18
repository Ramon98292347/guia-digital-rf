import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { resolvePublicMediaUrl } from "@/features/media/service";
import {
  resolvePublicTenant,
  type ResolvedPublicTenant,
} from "@/features/tenant/server/public-resolver";
import type { Database, Json } from "@/types/database.types";

type Supabase = ReturnType<typeof createSupabaseAdminClient>;
type BrandingRow = Database["public"]["Tables"]["tenant_branding"]["Row"];
type HomeSectionRow = Database["public"]["Tables"]["tenant_home_sections"]["Row"];
type NavigationRow = Database["public"]["Tables"]["tenant_navigation"]["Row"];
type AccommodationRow = Database["public"]["Tables"]["accommodations"]["Row"];
type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
type LocalTipRow = Database["public"]["Tables"]["local_tips"]["Row"];

export type PublicGuideTheme = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  foregroundColor: string;
  mutedColor: string;
  borderColor: string;
  overlayFrom: string;
  overlayTo: string;
};

export type PublicGuideQuickAction = {
  label: string;
  icon: string;
  target: string;
  description: string | null;
};

export type PublicGuideInfoBlock = {
  title: string;
  body: string;
  eyebrow: string | null;
  ctaLabel: string | null;
  ctaTarget: string | null;
};

export type PublicGuideAccommodation = Pick<
  AccommodationRow,
  | "id"
  | "name"
  | "short_description"
  | "description"
  | "capacity"
  | "booking_url"
  | "slug"
  | "sort_order"
> & {
  imageUrl: string | null;
};

export type PublicGuideService = Pick<
  ServiceRow,
  | "id"
  | "name"
  | "short_description"
  | "description"
  | "booking_url"
  | "requires_booking"
  | "contact_action"
  | "slug"
  | "sort_order"
> & {
  imageUrl: string | null;
};

export type PublicGuideLocalTip = Pick<
  LocalTipRow,
  | "id"
  | "name"
  | "short_description"
  | "description"
  | "distance_text"
  | "opening_hours_text"
  | "website"
  | "sort_order"
> & {
  imageUrl: string | null;
};

export type PublicGuideGalleryImage = {
  id: string;
  title: string | null;
  caption: string | null;
  imageUrl: string;
};

export type PublicGuideNavigationItem = Pick<
  NavigationRow,
  "id" | "label" | "icon" | "destination" | "destination_type" | "highlighted"
>;

export type PublicGuideData = {
  tenant: ResolvedPublicTenant;
  theme: PublicGuideTheme;
  greeting: string;
  branding: {
    logoPath: string | null;
    iconPath: string | null;
  };
  design: {
    atmosphereLabel: string | null;
    heroImagePath: string | null;
    heroSecondaryImagePath: string | null;
    heroLineImagePath: string | null;
    heroTitle: string | null;
    heroSubtitle: string | null;
    signature: string | null;
    welcomeMessage: string | null;
    serviceHighlights: string[];
  };
  contact: {
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  sections: HomeSectionRow[];
  navigation: PublicGuideNavigationItem[];
  quickActions: PublicGuideQuickAction[];
  staySummary: PublicGuideInfoBlock | null;
  breakfast: PublicGuideInfoBlock | null;
  concierge: PublicGuideInfoBlock | null;
  booking: {
    label: string;
    href: string | null;
    mode: string | null;
    helperText: string | null;
  };
  accommodations: PublicGuideAccommodation[];
  services: PublicGuideService[];
  localTips: PublicGuideLocalTip[];
  gallery: PublicGuideGalleryImage[];
};

function asRecord(value: Json | null | undefined): Record<string, Json> {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return {};
  }

  return value as Record<string, Json>;
}

function readString(record: Record<string, Json>, key: string) {
  const value = record[key];
  return typeof value === "string" ? value : null;
}

function readStringArray(record: Record<string, Json>, key: string) {
  const value = record[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function readObjectArray(record: Record<string, Json>, key: string) {
  const value = record[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is Record<string, Json> =>
        typeof item === "object" && item !== null && !Array.isArray(item),
    );
}

function buildGuideTheme(branding: BrandingRow | null, designConfig: Record<string, Json>) {
  return {
    primaryColor: branding?.primary_color ?? "#365c4b",
    secondaryColor: branding?.secondary_color ?? "#dfe9de",
    accentColor: branding?.accent_color ?? "#8c5b64",
    backgroundColor: branding?.background_color ?? "#f3eee6",
    surfaceColor: branding?.surface_color ?? "#fffaf5",
    foregroundColor: branding?.foreground_color ?? "#2d2926",
    mutedColor: readString(designConfig, "mutedColor") ?? "#ece3d7",
    borderColor: readString(designConfig, "borderColor") ?? "#ded1c2",
    overlayFrom: readString(designConfig, "overlayFrom") ?? "rgba(23, 34, 29, 0.18)",
    overlayTo: readString(designConfig, "overlayTo") ?? "rgba(23, 34, 29, 0.72)",
  };
}

function getGreeting(timezone: string) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    hour: "numeric",
    hour12: false,
    timeZone: timezone,
  });

  const hour = Number(formatter.format(new Date()));

  if (hour < 12) {
    return "Bom dia";
  }

  if (hour < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

async function loadPublicMediaMap(
  supabase: Supabase,
  tenantId: string,
  mediaIds: string[],
) {
  if (mediaIds.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase
    .from("media")
    .select("id, status, storage_bucket, storage_path")
    .eq("tenant_id", tenantId)
    .in("id", mediaIds)
    .eq("status", "published")
    .is("deleted_at", null);

  if (error) {
    throw error;
  }

  const entries = data.map((media) => [
    media.id,
    resolvePublicMediaUrl(supabase, media),
  ] as const);

  return new Map(entries);
}

function mapSectionInfo(section: HomeSectionRow | null): PublicGuideInfoBlock | null {
  if (!section) {
    return null;
  }

  const settings = asRecord(section.settings);
  const body =
    readString(settings, "body") ??
    section.subtitle ??
    "Este conteúdo será configurado pelo estabelecimento.";

  return {
    title: section.title ?? readString(settings, "title") ?? "Em configuração",
    body,
    eyebrow: readString(settings, "eyebrow"),
    ctaLabel: readString(settings, "ctaLabel"),
    ctaTarget: readString(settings, "ctaTarget"),
  };
}

export async function getPublicGuideData(input: {
  tenantSlug: string;
  pathname: string;
  hostname: string | null | undefined;
}): Promise<PublicGuideData | null> {
  const tenant = await resolvePublicTenant({
    hostname: input.hostname,
    pathname: input.pathname,
    fallbackSlug: input.tenantSlug,
  });

  if (!tenant || tenant.slug !== input.tenantSlug) {
    return null;
  }

  const supabase = createSupabaseAdminClient();

  const [
    { data: branding, error: brandingError },
    { data: designSettings, error: designError },
    { data: sections, error: sectionsError },
    { data: navigation, error: navigationError },
    { data: bookingSettings, error: bookingError },
    { data: accommodations, error: accommodationsError },
    { data: services, error: servicesError },
    { data: localTips, error: localTipsError },
  ] = await Promise.all([
    supabase
      .from("tenant_branding")
      .select("*")
      .eq("tenant_id", tenant.tenant_id)
      .maybeSingle(),
    supabase
      .from("tenant_design_settings")
      .select("*")
      .eq("tenant_id", tenant.tenant_id)
      .maybeSingle(),
    supabase
      .from("tenant_home_sections")
      .select("*")
      .eq("tenant_id", tenant.tenant_id)
      .eq("enabled", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("tenant_navigation")
      .select("id, label, icon, destination, destination_type, highlighted")
      .eq("tenant_id", tenant.tenant_id)
      .eq("enabled", true)
      .eq("position", "primary")
      .order("sort_order", { ascending: true }),
    supabase
      .from("booking_settings")
      .select("*")
      .eq("tenant_id", tenant.tenant_id)
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("accommodations")
      .select(
        "id, name, short_description, description, capacity, booking_url, slug, sort_order, cover_media_id",
      )
      .eq("tenant_id", tenant.tenant_id)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .limit(6),
    supabase
      .from("services")
      .select(
        "id, name, short_description, description, booking_url, requires_booking, contact_action, slug, sort_order, cover_media_id",
      )
      .eq("tenant_id", tenant.tenant_id)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .limit(6),
    supabase
      .from("local_tips")
      .select(
        "id, name, short_description, description, distance_text, opening_hours_text, website, sort_order, cover_media_id",
      )
      .eq("tenant_id", tenant.tenant_id)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("recommended", { ascending: false })
      .order("sort_order", { ascending: true })
      .limit(6),
  ]);

  if (brandingError) throw brandingError;
  if (designError) throw designError;
  if (sectionsError) throw sectionsError;
  if (navigationError) throw navigationError;
  if (bookingError) throw bookingError;
  if (accommodationsError) throw accommodationsError;
  if (servicesError) throw servicesError;
  if (localTipsError) throw localTipsError;

  const designConfig = asRecord(designSettings?.design_config);

  const gallerySection =
    sections.find((section) => section.section_type === "gallery") ?? null;
  const quickActionsSection =
    sections.find((section) => section.section_type === "quick_actions") ?? null;
  const staySummarySection =
    sections.find((section) => section.section_type === "stay_summary") ?? null;
  const breakfastSection =
    sections.find(
      (section) =>
        section.section_type === "custom_content" && section.variant === "breakfast",
    ) ?? null;
  const conciergeSection =
    sections.find((section) => section.section_type === "concierge_cta") ?? null;
  const bookingSection =
    sections.find((section) => section.section_type === "booking_cta") ?? null;

  const gallerySettings = asRecord(gallerySection?.settings);
  const galleryImagePaths = readStringArray(gallerySettings, "imagePaths");

  const mediaIds = [
    ...accommodations
      .map((item) => item.cover_media_id)
      .filter((value): value is string => Boolean(value)),
    ...services
      .map((item) => item.cover_media_id)
      .filter((value): value is string => Boolean(value)),
    ...localTips
      .map((item) => item.cover_media_id)
      .filter((value): value is string => Boolean(value)),
  ];

  const mediaMap = await loadPublicMediaMap(
    supabase,
    tenant.tenant_id,
    Array.from(new Set(mediaIds)),
  );

  const quickActionSettings = asRecord(quickActionsSection?.settings);
  const quickActions = readObjectArray(quickActionSettings, "items").map((item, index) => ({
    label: readString(item, "label") ?? `Acesso ${index + 1}`,
    icon: readString(item, "icon") ?? "sparkles",
    target: readString(item, "target") ?? "#topo",
    description: readString(item, "description"),
  }));

  const gallery = galleryImagePaths.map((imageUrl, index) => ({
    id: `gallery-${index + 1}`,
    imageUrl,
    title: null,
    caption: index === 0 ? "Visual de demonstração da experiência do Guia." : null,
  }));

  const resolvedBookingLabel =
    bookingSettings?.button_label ??
    readString(asRecord(bookingSection?.settings), "label") ??
    "Reserva";
  const resolvedBookingHref =
    bookingSettings?.external_url ??
    readString(asRecord(bookingSection?.settings), "href");

  return {
    tenant,
    theme: buildGuideTheme(branding, designConfig),
    greeting: getGreeting(tenant.timezone),
    branding: {
      logoPath: branding?.logo_path ?? null,
      iconPath: branding?.icon_path ?? null,
    },
    design: {
      atmosphereLabel: readString(designConfig, "atmosphereLabel"),
      heroImagePath:
        readString(designConfig, "heroImagePath") ??
        galleryImagePaths[0] ??
        null,
      heroSecondaryImagePath:
        readString(designConfig, "heroSecondaryImagePath") ??
        galleryImagePaths[1] ??
        null,
      heroLineImagePath: readString(designConfig, "heroLineImagePath"),
      heroTitle: readString(designConfig, "heroTitle"),
      heroSubtitle: readString(designConfig, "heroSubtitle"),
      signature: readString(designConfig, "signature"),
      welcomeMessage: readString(designConfig, "welcomeMessage"),
      serviceHighlights: readStringArray(designConfig, "serviceHighlights"),
    },
    contact: {
      phone: readString(designConfig, "contactPhone"),
      email: readString(designConfig, "contactEmail"),
      address: readString(designConfig, "contactAddress"),
    },
    sections,
    navigation,
    quickActions,
    staySummary: mapSectionInfo(staySummarySection),
    breakfast: mapSectionInfo(breakfastSection),
    concierge: mapSectionInfo(conciergeSection),
    booking: {
      label: resolvedBookingLabel,
      href: resolvedBookingHref,
      mode: bookingSettings?.open_mode ?? null,
      helperText:
        readString(asRecord(bookingSection?.settings), "helperText") ??
        "Canal de reservas configurável por tenant.",
    },
    accommodations: accommodations.map((item) => ({
      ...item,
      imageUrl: item.cover_media_id ? mediaMap.get(item.cover_media_id) ?? null : null,
    })),
    services: services.map((item) => ({
      ...item,
      imageUrl: item.cover_media_id ? mediaMap.get(item.cover_media_id) ?? null : null,
    })),
    localTips: localTips.map((item) => ({
      ...item,
      imageUrl: item.cover_media_id ? mediaMap.get(item.cover_media_id) ?? null : null,
    })),
    gallery,
  };
}
