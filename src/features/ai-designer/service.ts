import { requireTenantAccess } from "@/features/auth/server/admin-access";
import { designSpecSchema, type DesignSpec } from "./registry";
import { createAIDesignProvider, type AIDesignContext, type AIDesignRequest } from "./provider";

export async function loadAIDesignContext(tenantSlug: string): Promise<{ tenantId: string; context: AIDesignContext }> {
  const access = await requireTenantAccess(tenantSlug);
  if (!access || access.role !== "tenant_admin") return { tenantId: "", context: null as never };

  const { supabase, tenant } = access;
  const [branding, settings, accommodations, services, media, localTips, booking, modules, homeSections] = await Promise.all([
    supabase.from("tenant_branding").select("*").eq("tenant_id", tenant.id).maybeSingle(),
    supabase.from("tenant_settings").select("*").eq("tenant_id", tenant.id).maybeSingle(),
    supabase.from("accommodations").select("id, name, cover_media_id").eq("tenant_id", tenant.id).is("deleted_at", null),
    supabase.from("services").select("id, name, cover_media_id").eq("tenant_id", tenant.id).is("deleted_at", null),
    supabase.from("media").select("id, media_type, status, alt_text, caption").eq("tenant_id", tenant.id).is("deleted_at", null),
    supabase.from("local_tips").select("id, name, cover_media_id").eq("tenant_id", tenant.id).is("deleted_at", null),
    supabase.from("booking_settings").select("*").eq("tenant_id", tenant.id).maybeSingle(),
    supabase.from("tenant_modules").select("*").eq("tenant_id", tenant.id),
    supabase.from("tenant_home_sections").select("*").eq("tenant_id", tenant.id).order("sort_order"),
  ]);

  const error = [branding, settings, accommodations, services, media, localTips, booking, modules, homeSections].find((result) => result.error)?.error;
  if (error) throw error;

  return {
    tenantId: tenant.id,
    context: {
      tenant: { id: tenant.id, name: tenant.name, type: "hospitality" },
      branding: branding.data,
      settings: settings.data,
      accommodations: accommodations.data ?? [],
      services: services.data ?? [],
      media: media.data ?? [],
      localTips: localTips.data ?? [],
      booking: booking.data,
      modules: modules.data ?? [],
      homeSections: homeSections.data ?? [],
    },
  };
}

export class AIDesignService {
  constructor(private readonly provider = createAIDesignProvider()) {}

  async generate(request: AIDesignRequest, context: AIDesignContext): Promise<DesignSpec> {
    const raw = await this.provider.generateDesign(request, context);
    return designSpecSchema.parse(raw);
  }
}
