import { z } from "zod";

export const componentRegistry = {
  hero: ["compact", "immersive", "split"],
  accommodations: ["horizontal-cards", "grid", "featured"],
  services: ["cards", "icons", "carousel"],
  gallery: ["carousel", "mosaic", "grid"],
  localTips: ["cards"],
  bookingCta: ["compact"],
  quickActions: ["grid", "horizontal"],
  navigation: ["bottom", "compact"],
} as const;

const sectionSchema = z.object({
  type: z.enum(["accommodations", "services", "gallery", "local_tips", "quick_actions", "booking_cta"]),
  variant: z.string(),
}).superRefine((section, context) => {
  const variants = {
    accommodations: componentRegistry.accommodations,
    services: componentRegistry.services,
    gallery: componentRegistry.gallery,
    local_tips: componentRegistry.localTips,
    quick_actions: componentRegistry.quickActions,
    booking_cta: componentRegistry.bookingCta,
  }[section.type];
  if (!(variants as readonly string[]).includes(section.variant)) {
    context.addIssue({ code: "custom", path: ["variant"], message: "Variante não registrada no Design System." });
  }
});

export const designSpecSchema = z.object({
  style: z.enum(["elegant", "romantic", "rustic", "modern", "nature", "familiar", "custom"]),
  hero: z.object({
    variant: z.enum(componentRegistry.hero),
    mediaId: z.string().uuid().nullable(),
    showGreeting: z.boolean(),
  }),
  quickActions: z.array(z.enum(["accommodations", "booking", "wifi", "gallery", "contact", "local_tips"])).min(1).max(6),
  sections: z.array(sectionSchema).max(6),
  navigation: z.object({ variant: z.enum(componentRegistry.navigation) }),
  design: z.object({
    cardStyle: z.enum(["soft", "bordered", "elevated"]),
    radius: z.enum(["medium", "large"]),
    spacing: z.enum(["compact", "comfortable"]),
  }),
});

export type DesignSpec = z.infer<typeof designSpecSchema>;

export function validateDesignSpec(input: unknown) {
  return designSpecSchema.safeParse(input);
}
