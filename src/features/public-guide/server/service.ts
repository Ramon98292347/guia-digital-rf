import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { resolvePublicMediaUrl } from "@/features/media/service";
import {
  resolvePublicTenant,
  type ResolvedPublicTenant,
} from "@/features/tenant/server/public-resolver";
import type { Database, Json } from "@/types/database.types";
import {
  designSpecSchema,
  type DesignSpec,
} from "@/features/ai-designer/registry";

type Supabase = ReturnType<typeof createSupabaseAdminClient>;
type BrandingRow = Database["public"]["Tables"]["tenant_branding"]["Row"];
type HomeSectionRow =
  Database["public"]["Tables"]["tenant_home_sections"]["Row"];
type NavigationRow = Database["public"]["Tables"]["tenant_navigation"]["Row"];
type AccommodationRow = Database["public"]["Tables"]["accommodations"]["Row"];
type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
type LocalTipRow = Database["public"]["Tables"]["local_tips"]["Row"];
type AmenityRow = Database["public"]["Tables"]["amenities"]["Row"];
type GalleryItemRow = Database["public"]["Tables"]["gallery_items"]["Row"];
type LooseQuery = {
  select: (columns?: string) => LooseQuery;
  eq: (column: string, value: unknown) => LooseQuery;
  order: (column: string, options?: { ascending?: boolean }) => LooseQuery;
  then: Promise<unknown>["then"];
};

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
  amenities: Pick<AmenityRow, "id" | "name" | "icon">[];
  media: PublicGuideMedia[];
  rules: PublicGuideRule[];
  contentItems: PublicGuideContentItem[];
};

export type PublicGuideMedia = {
  id: string;
  mediaType: string;
  url: string;
  caption: string | null;
  altText: string | null;
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

export type PublicGuideRule = {
  id: string;
  title: string;
  content: string;
  severity: string;
  isFeatured: boolean;
};
export type PublicGuideContentItem = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  price: number | null;
  supplier: string | null;
  instructions: string | null;
  alertText: string | null;
  externalUrl: string | null;
  media: PublicGuideMedia[];
};
export type PublicGuideContentCollection = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  kind: string;
  items: PublicGuideContentItem[];
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
    logoPath: string | null;
    logoEnabled: boolean;
    logoSize: string;
    atmosphereLabel: string | null;
    heroImagePath: string | null;
    heroMediaPosition: string | null;
    heroOverlay: string | null;
    heroVariant: string | null;
    heroEnabled: boolean;
    showGreeting: boolean;
    heroSecondaryImagePath: string | null;
    heroLineImagePath: string | null;
    heroTitle: string | null;
    heroSubtitle: string | null;
    signature: string | null;
    welcomeMessage: string | null;
    footerMessage: string | null;
    footerVariant: string | null;
    serviceHighlights: string[];
  };
  contact: {
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    instagram: string | null;
    website: string | null;
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
  publishedMedia: PublicGuideMedia[];
  wifi: { name: string; ssid: string; password: string | null } | null;
  approvedDesign: DesignSpec | null;
  rules: PublicGuideRule[];
  contentCollections: PublicGuideContentCollection[];
};

function looseTable(supabase: Supabase, name: string) {
  return (supabase.from as unknown as (table: string) => LooseQuery)(name);
}

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

function readBoolean(
  record: Record<string, Json>,
  key: string,
  fallback: boolean,
) {
  return typeof record[key] === "boolean" ? (record[key] as boolean) : fallback;
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

  return value.filter(
    (item): item is Record<string, Json> =>
      typeof item === "object" && item !== null && !Array.isArray(item),
  );
}

function buildGuideTheme(
  branding: BrandingRow | null,
  designConfig: Record<string, Json>,
) {
  return {
    primaryColor: branding?.primary_color ?? "#365c4b",
    secondaryColor: branding?.secondary_color ?? "#dfe9de",
    accentColor: branding?.accent_color ?? "#8c5b64",
    backgroundColor: branding?.background_color ?? "#f3eee6",
    surfaceColor: branding?.surface_color ?? "#fffaf5",
    foregroundColor: branding?.foreground_color ?? "#2d2926",
    mutedColor: readString(designConfig, "mutedColor") ?? "#ece3d7",
    borderColor: readString(designConfig, "borderColor") ?? "#ded1c2",
    overlayFrom:
      readString(designConfig, "overlayFrom") ?? "rgba(23, 34, 29, 0.18)",
    overlayTo:
      readString(designConfig, "overlayTo") ?? "rgba(23, 34, 29, 0.72)",
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

  const entries = data.map(
    (media) => [media.id, resolvePublicMediaUrl(supabase, media)] as const,
  );

  return new Map(entries);
}

function toPublicMedia(
  media: Database["public"]["Tables"]["media"]["Row"],
  supabase: Supabase,
): PublicGuideMedia {
  return {
    id: media.id,
    mediaType: media.media_type,
    url: resolvePublicMediaUrl(supabase, media),
    caption: media.caption,
    altText: media.alt_text,
  };
}

function mapSectionInfo(
  section: HomeSectionRow | null,
): PublicGuideInfoBlock | null {
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
  tenantOverride?: ResolvedPublicTenant;
}): Promise<PublicGuideData | null> {
  const tenant =
    input.tenantOverride ??
    (await resolvePublicTenant({
      hostname: input.hostname,
      pathname: input.pathname,
      fallbackSlug: input.tenantSlug,
    }));

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
    { data: publishedMedia, error: mediaError },
    { data: wifi, error: wifiError },
    { data: accommodationMedia, error: accommodationMediaError },
    { data: accommodationAmenities, error: accommodationAmenitiesError },
    { data: amenities, error: amenitiesError },
    { data: contacts, error: contactsError },
    { data: galleryItems, error: galleryItemsError },
    { data: tenantModules, error: tenantModulesError },
    { data: modules, error: modulesError },
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
    supabase
      .from("media")
      .select(
        "id, media_type, storage_bucket, storage_path, caption, alt_text, status, tenant_id, original_filename, mime_type, size_bytes, created_by, updated_by, updated_at, created_at, deleted_at, duration_seconds, height, width",
      )
      .eq("tenant_id", tenant.tenant_id)
      .eq("status", "published")
      .is("deleted_at", null)
      .in("media_type", ["image", "video"])
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("wifi_networks")
      .select("name, ssid, password")
      .eq("tenant_id", tenant.tenant_id)
      .eq("status", "active")
      .eq("is_guest_visible", true)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("accommodation_media")
      .select("accommodation_id, media_id, sort_order")
      .eq("tenant_id", tenant.tenant_id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("accommodation_amenities")
      .select("accommodation_id, amenity_id")
      .eq("tenant_id", tenant.tenant_id),
    supabase
      .from("amenities")
      .select("id, name, icon, status")
      .eq("tenant_id", tenant.tenant_id)
      .eq("status", "published"),
    supabase
      .from("contacts")
      .select("contact_type, value, status, sort_order")
      .eq("tenant_id", tenant.tenant_id)
      .eq("status", "published")
      .order("sort_order", { ascending: true }),
    supabase
      .from("gallery_items")
      .select("id, media_id, title, caption, sort_order, status")
      .eq("tenant_id", tenant.tenant_id)
      .eq("status", "published")
      .order("sort_order", { ascending: true }),
    supabase
      .from("tenant_modules")
      .select("module_id, enabled")
      .eq("tenant_id", tenant.tenant_id),
    supabase.from("modules").select("id, key, status").eq("status", "active"),
  ]);

  if (brandingError) throw brandingError;
  if (designError) throw designError;
  if (sectionsError) throw sectionsError;
  if (navigationError) throw navigationError;
  if (bookingError) throw bookingError;
  if (accommodationsError) throw accommodationsError;
  if (servicesError) throw servicesError;
  if (localTipsError) throw localTipsError;
  if (mediaError) throw mediaError;
  if (wifiError) throw wifiError;
  if (accommodationMediaError) throw accommodationMediaError;
  if (accommodationAmenitiesError) throw accommodationAmenitiesError;
  if (amenitiesError) throw amenitiesError;
  if (contactsError) throw contactsError;
  if (galleryItemsError) throw galleryItemsError;
  if (tenantModulesError) throw tenantModulesError;
  if (modulesError) throw modulesError;

  const moduleKeyById = new Map(
    (modules ?? []).map((module) => [module.id, module.key]),
  );
  const enabledModuleKeys = new Set(
    (tenantModules ?? [])
      .filter((module) => module.enabled)
      .map((module) => moduleKeyById.get(module.module_id))
      .filter((key): key is string => Boolean(key)),
  );
  const hasModuleConfiguration = (tenantModules ?? []).length > 0;

  const defaultSectionTypes = [
    "accommodations",
    "content",
    "gallery",
    "services",
    "local_tips",
    "booking_cta",
  ].filter((type) => {
    if (!hasModuleConfiguration) return true;
    if (type === "accommodations")
      return enabledModuleKeys.has("accommodations");
    if (type === "gallery") return enabledModuleKeys.has("gallery");
    if (type === "services")
      return (
        enabledModuleKeys.has("services") || enabledModuleKeys.has("restaurant")
      );
    if (type === "content")
      return enabledModuleKeys.has("shop") || enabledModuleKeys.has("minibar");
    return true;
  });
  const resolvedSections =
    sections.length > 0
      ? sections
      : defaultSectionTypes.map(
          (section_type, sort_order) =>
            ({
              id: `default-${section_type}`,
              tenant_id: tenant.tenant_id,
              section_type,
              variant: null,
              title: null,
              subtitle: null,
              enabled: true,
              sort_order,
              content_source: "system",
              settings: {},
              style_overrides: {},
              created_at: "",
              updated_at: "",
            }) satisfies HomeSectionRow,
        );

  const [
    contentCollectionsResult,
    contentItemsResult,
    contentItemMediaResult,
    contentItemAccommodationResult,
    rulesResult,
    accommodationRulesResult,
  ] = await Promise.all([
    looseTable(supabase, "content_collections")
      .select("id, slug, title, description, kind, sort_order")
      .eq("tenant_id", tenant.tenant_id)
      .eq("status", "published")
      .order("sort_order", { ascending: true }),
    looseTable(supabase, "content_items")
      .select(
        "id, collection_id, title, subtitle, description, price, supplier, instructions, alert_text, external_url, sort_order",
      )
      .eq("tenant_id", tenant.tenant_id)
      .eq("status", "published")
      .order("sort_order", { ascending: true }),
    looseTable(supabase, "content_item_media")
      .select("content_item_id, media_id, role, sort_order")
      .eq("tenant_id", tenant.tenant_id)
      .order("sort_order", { ascending: true }),
    looseTable(supabase, "content_item_accommodations")
      .select("content_item_id, accommodation_id, sort_order")
      .eq("tenant_id", tenant.tenant_id)
      .order("sort_order", { ascending: true }),
    looseTable(supabase, "rules")
      .select("id, title, content, severity, is_featured, sort_order")
      .eq("tenant_id", tenant.tenant_id)
      .eq("status", "published")
      .order("sort_order", { ascending: true }),
    looseTable(supabase, "accommodation_rules")
      .select("accommodation_id, rule_id, sort_order")
      .eq("tenant_id", tenant.tenant_id)
      .order("sort_order", { ascending: true }),
  ]);
  const collectionRows =
    ((contentCollectionsResult as { data?: unknown }).data as Array<
      Record<string, unknown>
    >) ?? [];
  const itemRows =
    ((contentItemsResult as { data?: unknown }).data as Array<
      Record<string, unknown>
    >) ?? [];
  const itemMediaRows =
    ((contentItemMediaResult as { data?: unknown }).data as Array<
      Record<string, unknown>
    >) ?? [];
  const itemAccommodationRows =
    ((contentItemAccommodationResult as { data?: unknown }).data as Array<
      Record<string, unknown>
    >) ?? [];
  const ruleRows =
    ((rulesResult as { data?: unknown }).data as Array<
      Record<string, unknown>
    >) ?? [];
  const accommodationRuleRows =
    ((accommodationRulesResult as { data?: unknown }).data as Array<
      Record<string, unknown>
    >) ?? [];

  const designConfig = asRecord(designSettings?.design_config);

  const gallerySection =
    resolvedSections.find((section) => section.section_type === "gallery") ??
    null;
  const quickActionsSection =
    resolvedSections.find(
      (section) => section.section_type === "quick_actions",
    ) ?? null;
  const staySummarySection =
    resolvedSections.find(
      (section) => section.section_type === "stay_summary",
    ) ?? null;
  const breakfastSection =
    resolvedSections.find(
      (section) =>
        section.section_type === "custom_content" &&
        section.variant === "breakfast",
    ) ?? null;
  const conciergeSection =
    resolvedSections.find(
      (section) => section.section_type === "concierge_cta",
    ) ?? null;
  const bookingSection =
    resolvedSections.find(
      (section) => section.section_type === "booking_cta",
    ) ?? null;

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

  const publishedMediaMap = new Map(
    (publishedMedia ?? []).map((media) => [
      media.id,
      toPublicMedia(media, supabase),
    ]),
  );
  const amenityMap = new Map(
    (amenities ?? []).map((amenity) => [amenity.id, amenity]),
  );
  const accommodationMediaMap = new Map<string, PublicGuideMedia[]>();
  for (const relation of accommodationMedia ?? []) {
    const media = publishedMediaMap.get(relation.media_id);
    if (media)
      accommodationMediaMap.set(relation.accommodation_id, [
        ...(accommodationMediaMap.get(relation.accommodation_id) ?? []),
        media,
      ]);
  }
  const accommodationAmenityMap = new Map<
    string,
    Pick<AmenityRow, "id" | "name" | "icon">[]
  >();
  for (const relation of accommodationAmenities ?? []) {
    const amenity = amenityMap.get(relation.amenity_id);
    if (amenity)
      accommodationAmenityMap.set(relation.accommodation_id, [
        ...(accommodationAmenityMap.get(relation.accommodation_id) ?? []),
        amenity,
      ]);
  }
  const accommodationMediaIds = new Set(
    (accommodationMedia ?? []).map((relation) => relation.media_id),
  );
  const galleryMediaIds = new Set(
    (galleryItems ?? []).map((item) => item.media_id),
  );
  const globalPublishedMedia = (publishedMedia ?? []).filter(
    (media) =>
      galleryMediaIds.has(media.id) && !accommodationMediaIds.has(media.id),
  );
  const ruleMap = new Map(
    ruleRows.map((rule) => [
      String(rule.id),
      {
        id: String(rule.id),
        title: String(rule.title),
        content: String(rule.content),
        severity: String(rule.severity),
        isFeatured: rule.is_featured === true,
      },
    ]),
  );
  const rulesByAccommodation = new Map<string, PublicGuideRule[]>();
  for (const relation of accommodationRuleRows) {
    const rule = ruleMap.get(String(relation.rule_id));
    if (rule)
      rulesByAccommodation.set(String(relation.accommodation_id), [
        ...(rulesByAccommodation.get(String(relation.accommodation_id)) ?? []),
        rule,
      ]);
  }
  const contentMediaByItem = new Map<string, PublicGuideMedia[]>();
  for (const relation of itemMediaRows) {
    const media = publishedMediaMap.get(String(relation.media_id));
    if (media)
      contentMediaByItem.set(String(relation.content_item_id), [
        ...(contentMediaByItem.get(String(relation.content_item_id)) ?? []),
        media,
      ]);
  }
  const contentItems = itemRows.map((item) => ({
    id: String(item.id),
    title: String(item.title),
    subtitle: item.subtitle ? String(item.subtitle) : null,
    description: item.description ? String(item.description) : null,
    price: typeof item.price === "number" ? item.price : null,
    supplier: item.supplier ? String(item.supplier) : null,
    instructions: item.instructions ? String(item.instructions) : null,
    alertText: item.alert_text ? String(item.alert_text) : null,
    externalUrl: item.external_url ? String(item.external_url) : null,
    media: contentMediaByItem.get(String(item.id)) ?? [],
  }));
  const itemsByCollection = new Map<string, PublicGuideContentItem[]>();
  for (const item of contentItems) {
    const source = itemRows.find((row) => String(row.id) === item.id);
    const collectionId = String(source?.collection_id ?? "");
    itemsByCollection.set(collectionId, [
      ...(itemsByCollection.get(collectionId) ?? []),
      item,
    ]);
  }
  const contentCollections = collectionRows.map((collection) => ({
    id: String(collection.id),
    slug: String(collection.slug),
    title: String(collection.title),
    description: collection.description ? String(collection.description) : null,
    kind: String(collection.kind),
    items: itemsByCollection.get(String(collection.id)) ?? [],
  }));
  const contentItemsByAccommodation = new Map<
    string,
    PublicGuideContentItem[]
  >();
  for (const relation of itemAccommodationRows) {
    const item = contentItems.find(
      (candidate) => candidate.id === String(relation.content_item_id),
    );
    if (item)
      contentItemsByAccommodation.set(String(relation.accommodation_id), [
        ...(contentItemsByAccommodation.get(
          String(relation.accommodation_id),
        ) ?? []),
        item,
      ]);
  }

  const approvedDesignResult = designSpecSchema.safeParse(designConfig);
  const approvedHeroMediaId = approvedDesignResult.success
    ? approvedDesignResult.data.hero.mediaId
    : null;
  const manualHeroMediaId = readString(designConfig, "heroMediaId");
  const manualHeroImagePath = manualHeroMediaId
    ? (publishedMediaMap.get(manualHeroMediaId)?.url ?? null)
    : null;
  const approvedHeroImagePath = approvedHeroMediaId
    ? (publishedMediaMap.get(approvedHeroMediaId)?.url ?? null)
    : null;
  const manualLogoMediaId = readString(designConfig, "logoMediaId");
  const manualLogoPath = manualLogoMediaId
    ? (publishedMediaMap.get(manualLogoMediaId)?.url ?? null)
    : null;
  const contactMap = new Map(
    (contacts ?? []).map((contact) => [contact.contact_type, contact.value]),
  );

  const quickActionSettings = asRecord(quickActionsSection?.settings);
  const configuredQuickActions = readObjectArray(
    quickActionSettings,
    "items",
  ).map((item, index) => ({
    label: readString(item, "label") ?? `Acesso ${index + 1}`,
    icon: readString(item, "icon") ?? "sparkles",
    target: readString(item, "target") ?? "#topo",
    description: readString(item, "description"),
  }));
  const quickActions =
    configuredQuickActions.length > 0
      ? configuredQuickActions
      : [
          {
            label: "Acomodações",
            icon: "bed",
            target: "#accommodations",
            description: null,
          },
          {
            label: "Reservas",
            icon: "calendar",
            target: "#booking",
            description: null,
          },
          { label: "Wi-Fi", icon: "wifi", target: "#wifi", description: null },
          {
            label: "Como chegar",
            icon: "map",
            target: "#map",
            description: null,
          },
          {
            label: "Contato",
            icon: "phone",
            target: "#contact",
            description: null,
          },
          {
            label: "Galeria",
            icon: "gallery",
            target: "#gallery",
            description: null,
          },
          {
            label: "Gastronomia",
            icon: "utensils",
            target: "#food",
            description: null,
          },
          {
            label: "Dicas da região",
            icon: "signpost",
            target: "#tips",
            description: null,
          },
          {
            label: "Chat 24h",
            icon: "chat",
            target: "#concierge",
            description: null,
          },
        ];

  const gallery = ((galleryItems as GalleryItemRow[]) ?? [])
    .map((item) => {
      const media = publishedMediaMap.get(item.media_id);
      return media
        ? {
            id: item.id,
            imageUrl: media.url,
            title: item.title,
            caption: item.caption,
          }
        : null;
    })
    .filter((item): item is PublicGuideGalleryImage => item !== null);
  const legacyGallery = galleryImagePaths.map((imageUrl, index) => ({
    id: `gallery-legacy-${index + 1}`,
    imageUrl,
    title: null,
    caption: null,
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
      logoPath: manualLogoPath ?? branding?.logo_path ?? null,
      logoEnabled: readBoolean(designConfig, "logoEnabled", true),
      logoSize: readString(designConfig, "logoSize") ?? "medium",
      atmosphereLabel: readString(designConfig, "atmosphereLabel"),
      heroImagePath:
        manualHeroImagePath ??
        approvedHeroImagePath ??
        readString(designConfig, "heroImagePath") ??
        galleryImagePaths[0] ??
        null,
      heroMediaPosition:
        readString(designConfig, "heroMediaPosition") ?? "center",
      heroOverlay: readString(designConfig, "heroOverlay") ?? "medium",
      heroVariant: readString(designConfig, "heroVariant") ?? "immersive",
      heroEnabled: readBoolean(designConfig, "heroEnabled", true),
      showGreeting: readBoolean(designConfig, "showGreeting", true),
      heroSecondaryImagePath:
        readString(designConfig, "heroSecondaryImagePath") ??
        galleryImagePaths[1] ??
        null,
      heroLineImagePath: readString(designConfig, "heroLineImagePath"),
      heroTitle: readString(designConfig, "heroTitle"),
      heroSubtitle: readString(designConfig, "heroSubtitle"),
      signature: readString(designConfig, "signature"),
      welcomeMessage: readString(designConfig, "welcomeMessage"),
      footerMessage: readString(designConfig, "footerMessage"),
      footerVariant: readString(designConfig, "footerVariant"),
      serviceHighlights: readStringArray(designConfig, "serviceHighlights"),
    },
    contact: {
      phone:
        contactMap.get("phone") ??
        contactMap.get("reception") ??
        readString(designConfig, "contactPhone"),
      whatsapp: contactMap.get("whatsapp") ?? null,
      email:
        contactMap.get("email") ?? readString(designConfig, "contactEmail"),
      instagram: contactMap.get("instagram") ?? null,
      website: contactMap.get("website") ?? null,
      address: readString(designConfig, "contactAddress"),
    },
    sections: resolvedSections,
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
      imageUrl: item.cover_media_id
        ? (mediaMap.get(item.cover_media_id) ?? null)
        : null,
      amenities: accommodationAmenityMap.get(item.id) ?? [],
      media: accommodationMediaMap.get(item.id) ?? [],
      rules: rulesByAccommodation.get(item.id) ?? [],
      contentItems: contentItemsByAccommodation.get(item.id) ?? [],
    })),
    services: services.map((item) => ({
      ...item,
      imageUrl: item.cover_media_id
        ? (mediaMap.get(item.cover_media_id) ?? null)
        : null,
    })),
    localTips: localTips.map((item) => ({
      ...item,
      imageUrl: item.cover_media_id
        ? (mediaMap.get(item.cover_media_id) ?? null)
        : null,
    })),
    gallery: [...gallery, ...legacyGallery],
    publishedMedia: globalPublishedMedia.map((media) =>
      toPublicMedia(media, supabase),
    ),
    wifi: wifi ?? null,
    approvedDesign: approvedDesignResult.success
      ? approvedDesignResult.data
      : null,
    rules: Array.from(ruleMap.values()),
    contentCollections,
  };
}
