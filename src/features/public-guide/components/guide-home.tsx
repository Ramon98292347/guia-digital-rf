/* eslint-disable @next/next/no-img-element */
"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  BadgePercent,
  BedDouble,
  Bot,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Compass,
  Copy,
  ExternalLink,
  Gift,
  House,
  Images,
  Maximize,
  MapPinned,
  MessageCircleMore,
  MoreHorizontal,
  PhoneCall,
  PlayCircle,
  ScrollText,
  ShieldCheck,
  SignpostBig,
  Users,
  UtensilsCrossed,
  Waves,
  Wifi,
  X,
  Bed,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { askPublicConciergeAction } from "@/features/concierge/server/actions";
import type {
  PublicGuideAccommodation,
  PublicGuideData,
  PublicGuideMedia,
  PublicGuideNavigationItem,
  PublicGuideQuickAction,
} from "@/features/public-guide/server/service";
import {
  ContactCard,
  AccommodationCard,
  GalleryCard,
  MediaViewer,
  ServiceCard,
  VideoCard,
} from "./universal-cards";
import {
  getGuideDictionary,
  normalizeLocale,
  resolveBrowserLocale,
  type GuideLocale,
} from "@/features/i18n/locales";

type GuideHomeProps = { data: PublicGuideData };
type ThemeStyle = CSSProperties & Record<`--${string}`, string>;
type SheetKind =
  | "wifi"
  | "accommodations"
  | "reservas"
  | "contact"
  | "map"
  | "gallery"
  | "videos"
  | "food"
  | "rules"
  | "benefit"
  | "tips"
  | "content"
  | "chat";

const iconMap = {
  badgepercent: BadgePercent,
  bed: BedDouble,
  bot: Bot,
  calendar: CalendarDays,
  chat: MessageCircleMore,
  clipboard: ClipboardList,
  compass: Compass,
  gallery: Images,
  gift: Gift,
  house: House,
  map: MapPinned,
  more: MoreHorizontal,
  phone: PhoneCall,
  play: PlayCircle,
  rule: ShieldCheck,
  rules: ShieldCheck,
  scroll: ScrollText,
  shield: ShieldCheck,
  signpost: SignpostBig,
  ticket: BadgePercent,
  utensils: UtensilsCrossed,
  video: PlayCircle,
  wifi: Wifi,
} as const;
function getIcon(name: string | null | undefined) {
  return iconMap[(name ?? "compass") as keyof typeof iconMap] ?? Compass;
}

function toCssColor(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  return /^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback;
}

function getReadableTextColor(background: string, fallback: string) {
  const hex = background.replace("#", "");
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return fallback;
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.68 ? "#111827" : "#ffffff";
}

function themeStyle(data: PublicGuideData): ThemeStyle {
  const headingFont = (data.theme.headingFont ?? "Trebuchet MS")
    .replace(/[^a-zA-Z0-9 -]/g, "")
    .trim();
  const radiusMap = {
    sm: "0.75rem",
    md: "1rem",
    lg: "1.25rem",
    xl: "1.75rem",
  } as const;
  const shadowMap = {
    none: "none",
    soft: "0 12px 26px rgba(17, 24, 39, 0.10)",
    medium: "0 18px 38px rgba(17, 24, 39, 0.14)",
    strong: "0 24px 54px rgba(17, 24, 39, 0.18)",
  } as const;
  const primaryText = getReadableTextColor(data.theme.primaryColor, "#ffffff");
  const surfaceText = getReadableTextColor(data.theme.surfaceColor, data.theme.foregroundColor);
  return {
    "--background": data.theme.backgroundColor,
    "--foreground": data.theme.foregroundColor,
    "--card": data.theme.surfaceColor,
    "--card-foreground": data.theme.foregroundColor,
    "--primary": data.theme.primaryColor,
    "--secondary": data.theme.secondaryColor,
    "--accent": data.theme.accentColor,
    "--border": data.theme.borderColor,
    "--ring": data.theme.primaryColor,
    "--guide-background": data.theme.backgroundColor,
    "--guide-surface": data.theme.surfaceColor,
    "--guide-foreground": data.theme.foregroundColor,
    "--guide-primary": data.theme.primaryColor,
    "--guide-accent": data.theme.accentColor,
    "--guide-title": data.theme.titleColor,
    "--guide-subtitle": data.theme.subtitleColor,
    "--guide-card-title": data.theme.cardTitleColor,
    "--guide-card-text": data.theme.cardTextColor,
    "--guide-card-subtitle": data.theme.cardSubtitleColor,
    "--guide-button-text": data.theme.buttonTextColor,
    "--guide-icon": data.theme.iconColor,
    "--guide-hero-title": toCssColor(data.design.heroTitleColor ?? data.theme.accentColor, data.theme.accentColor),
    "--guide-hero-font": `"${headingFont || "Trebuchet MS"}", "Trebuchet MS", sans-serif`,
    "--guide-border": data.theme.borderColor,
    "--guide-muted": data.theme.mutedColor,
    "--guide-muted-bg": data.theme.secondaryColor,
    "--guide-primary-text": primaryText,
    "--guide-surface-text": surfaceText,
    "--guide-radius-sm": radiusMap[(data.theme.radiusScale as keyof typeof radiusMap) ?? "md"],
    "--guide-radius-md": radiusMap[(data.theme.radiusScale as keyof typeof radiusMap) ?? "md"],
    "--guide-radius-lg": radiusMap[(data.theme.radiusScale as keyof typeof radiusMap) ?? "lg"],
    "--guide-radius-xl": radiusMap[(data.theme.radiusScale as keyof typeof radiusMap) ?? "xl"],
    "--guide-shadow-none": shadowMap.none,
    "--guide-shadow-soft": shadowMap[(data.theme.shadowLevel as keyof typeof shadowMap) ?? "soft"],
    "--guide-shadow-medium": shadowMap[(data.theme.shadowLevel as keyof typeof shadowMap) ?? "medium"],
    "--guide-shadow-strong": shadowMap[(data.theme.shadowLevel as keyof typeof shadowMap) ?? "strong"],
  };
}
function actionKind(action: PublicGuideQuickAction): SheetKind {
  const icon = action.icon.toLowerCase();
  const label = action.label.toLowerCase();

  if (icon === "wifi") return "wifi";
  if (icon === "bed") return "accommodations";
  if (icon === "calendar") return "reservas";
  if (icon === "phone") return "contact";
  if (icon === "map") return "map";
  if (icon === "gallery") return "gallery";
  if (icon === "play" || icon === "video") return "videos";
  if (icon === "utensils") return "food";
  if (
    icon === "shield" ||
    icon === "rule" ||
    icon === "rules" ||
    icon === "clipboard" ||
    icon === "scroll" ||
    label.includes("regra")
  ) {
    return "rules";
  }
  if (
    icon === "gift" ||
    icon === "badgepercent" ||
    icon === "ticket" ||
    label.includes("benef") ||
    label.includes("desconto") ||
    label.includes("retorno")
  ) {
    return "benefit";
  }
  if (icon === "signpost") return "tips";
  return "chat";
}

function navigationDestinationToSheet(destination: string): SheetKind | null {
  const target = destination.toLowerCase();

  if (target === "#topo") return null;
  if (target === "#concierge") return "chat";
  if (target === "#accommodations" || target === "#estadia") return "accommodations";
  if (target === "#explorar" || target === "#explore") return "content";
  if (target === "#tips" || target === "#mais" || target === "#more") return "tips";
  if (target === "#reservas") return "reservas";
  if (target === "#contact") return "contact";
  if (target === "#map") return "map";
  if (target === "#gallery") return "gallery";
  if (target === "#videos") return "videos";
  if (target === "#food" || target === "#services") return "food";
  if (target === "#rules") return "rules";
  if (target === "#benefit") return "benefit";
  if (target === "#content") return "content";

  return "tips";
}
function heroOverlayClass(value: string | null) {
  return value === "light"
    ? "bg-black/10"
    : value === "strong"
      ? "bg-black/55"
      : "bg-black/30";
}
function heroPosition(value: string | null) {
  return value === "top"
    ? "center top"
    : value === "bottom"
      ? "center bottom"
      : "center bottom";
}

function logoSizeClass(value: string) {
  return value === "small"
    ? "max-w-[55%]"
    : value === "large"
      ? "max-w-[68%]"
      : "max-w-[62%]";
}

function normalizedHeroText(value: string | null) {
  return value?.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() ?? "";
}

function guideTitle(value: string | null, locale: GuideLocale = "pt-BR") {
  const fallback = getGuideDictionary(locale).guestGuide;
  return /^bem vindo( \(a\))?$/.test(normalizedHeroText(value))
    ? fallback
    : value?.trim() || fallback;
}

function guideGreeting(value: string | null, locale: GuideLocale = "pt-BR") {
  const fallback = getGuideDictionary(locale).welcome;
  return normalizedHeroText(value) === "sua experiencia comeca aqui"
    ? fallback
    : value?.trim() || fallback;
}

function resolveTenantGuideLocale(defaultLocale: string | null | undefined): GuideLocale {
  return normalizeLocale(defaultLocale ?? "pt-BR");
}

function groupGuideVideosByCategory(videos: PublicGuideMedia[]) {
  const groups = new Map<string, PublicGuideMedia[]>();

  for (const video of videos) {
    const category = (video.category ?? "").trim() || "Geral";
    const next = groups.get(category) ?? [];
    if (!next.some((item) => item.id === video.id)) {
      groups.set(category, [...next, video]);
    }
  }

  return Array.from(groups.entries());
}

function ruleCategoryLabel(category: string) {
  return category.replace(/_/g, " ").replace(/\b\w/g, (letter) =>
    letter.toLocaleUpperCase("pt-BR"),
  );
}

function ruleSeverityLabel(severity: string, locale: GuideLocale = "pt-BR") {
  const dict = getGuideDictionary(locale);
  return (
    {
      info: dict.ruleInfo,
      important: dict.ruleImportant,
      critical: dict.ruleCritical,
    }[severity] ?? dict.ruleInfo
  );
}

function formatGuideDateTime(timezone: string) {
  const now = new Date();
  const timeZone = timezone || "America/Sao_Paulo";

  return {
    date: new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      timeZone,
    }).format(now),
    time: new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    }).format(now),
  };
}

function GuideEmptyState({
  title,
  message,
  icon: Icon = Compass,
}: {
  title: string;
  message: string;
  icon?: typeof Compass;
}) {
  return (
    <div className="flex min-h-[112px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--guide-border)] bg-[var(--guide-muted-bg)] px-4 py-5 text-center">
      <Icon
        className="mb-2 size-7 text-[var(--guide-icon)] opacity-75"
        aria-hidden="true"
      />
      <p className="font-medium text-[var(--guide-title)]">{title}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--guide-subtitle)]">{message}</p>
    </div>
  );
}

function FloatingConciergeButton({
  enabled,
  onOpen,
  prefersReducedMotion,
}: {
  enabled: boolean;
  onOpen: () => void;
  prefersReducedMotion: boolean;
}) {
  if (!enabled) return null;

  return (
    <div
      className="fixed bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-50"
      style={{
        right: "calc(max(1rem, ((100vw - min(100vw, 440px)) / 2) + 1rem))",
      }}
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full border border-[var(--guide-primary)]/40 bg-[var(--guide-primary)]/10 blur-md",
          prefersReducedMotion ? "hidden" : "animate-pulse",
        )}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "pointer-events-auto relative flex size-12 items-center justify-center rounded-full border border-white/60 bg-[var(--guide-primary)] text-[var(--guide-button-text)] shadow-[0_18px_42px_rgba(17,24,39,0.22)] ring-4 ring-[var(--guide-primary)]/10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--guide-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--guide-background)] sm:size-14",
          prefersReducedMotion ? "" : "hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(17,24,39,0.28)]",
        )}
        aria-label="Abrir concierge"
        style={{ touchAction: "manipulation" }}
      >
        <MessageCircleMore className="size-4 sm:size-5" aria-hidden="true" />
      </button>
    </div>
  );
}

function ConciergePanel({
  data,
  locale,
  onOpen,
}: {
  data: PublicGuideData;
  locale: GuideLocale;
  onOpen: (kind: SheetKind) => void;
}) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([{ role: "assistant", text: data.concierge.welcomeMessage }]);
  const [isSending, setIsSending] = useState(false);
  const dict = getGuideDictionary(locale);
  const suggestions =
    locale === "en"
      ? [
          "What is the Wi‑Fi password?",
          "How do I light the fireplace?",
          "How do I turn on the air conditioner?",
          "How do I make coffee?",
        ]
      : locale === "es"
        ? [
            "¿Cuál es la contraseña del Wi‑Fi?",
            "¿Cómo enciendo la chimenea?",
            "¿Cómo enciendo el aire acondicionado?",
            "¿Cómo hago café?",
          ]
        : [
            "Qual é a senha do Wi‑Fi?",
            "Como acender a lareira?",
            "Como ligar o ar-condicionado?",
            "Como fazer o café?",
          ];
  const actionKinds: Record<string, SheetKind> = {
    wifi: "wifi",
    contact: "contact",
    map: "map",
    accommodations: "accommodations",
    content: "content",
    tips: "tips",
    rules: "rules",
    reservas: "reservas",
    video: "videos",
    reception: "contact",
  };

  async function send(value = question) {
    const clean = value.trim();
    if (!clean || isSending) return;
    setQuestion("");
    setMessages((current) => [...current, { role: "user", text: clean }]);
    setIsSending(true);
    try {
      const response = await askPublicConciergeAction(data.tenant.slug, clean);
      setMessages((current) => [...current, { role: "assistant", text: response.text }]);
      if (response.actions.length > 0) {
        setMessages((current) => [...current, { role: "actions", text: response.actions.map((action) => `${action.label}::${action.kind}::${action.href ?? ""}`).join("||") }]);
      }
    } catch {
      setMessages((current) => [...current, { role: "assistant", text: "Não foi possível consultar o assistente agora. Você pode acessar as informações diretamente pelo Guia." }]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex min-h-[58dvh] flex-col gap-4">
      <div className="flex items-center gap-3 rounded-2xl bg-[var(--guide-muted-bg)] p-3">
        {data.concierge.avatarUrl ? <img src={data.concierge.avatarUrl} alt="" className="size-11 rounded-full object-cover" /> : <span className="flex size-11 items-center justify-center rounded-full bg-[var(--guide-primary)] text-[var(--guide-button-text)]"><Bot className="size-5" /></span>}
        <div><p className="font-semibold text-[var(--guide-title)]">{data.concierge.assistantName}</p><p className="text-xs text-[var(--guide-subtitle)]">{dict.consultantAvailable}</p></div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {messages.map((message, index) => message.role === "actions" ? (
          <div key={`actions-${index}`} className="flex flex-wrap gap-2">
            {message.text.split("||").map((action: string) => {
              const [label, kind, href = ""] = action.split("::");
              const commonClassName = "rounded-full bg-[var(--guide-primary)] px-3 py-1.5 text-xs font-medium text-[var(--guide-button-text)]";
              if (href) {
                return <a key={action} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className={commonClassName}>{label}</a>;
              }
              return <button key={action} type="button" onClick={() => onOpen(actionKinds[kind] ?? "content")} className={commonClassName}>{label}</button>;
            })}
          </div>
        ) : <div key={`${message.role}-${index}`} className={cn("max-w-[88%] rounded-[var(--guide-radius-lg)] p-3 text-sm", message.role === "user" ? "ml-auto bg-[var(--guide-primary)] text-[var(--guide-primary-text)]" : "bg-[var(--guide-muted-bg)] text-[var(--guide-card-text)]")}>{message.text}</div>) }
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">{suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => send(suggestion)} className="shrink-0 rounded-full border border-[var(--guide-border)] bg-[var(--guide-muted-bg)] px-3 py-1.5 text-xs font-medium text-[var(--guide-card-title)]">{suggestion}</button>)}</div>
      <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="flex gap-2 border-t border-[var(--guide-border)] pt-3"><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={dict.askQuestionPlaceholder} className="min-w-0 flex-1 rounded-[var(--guide-radius-md)] border border-[var(--guide-border)] bg-[var(--guide-surface)] px-3 py-2.5 text-sm text-[var(--guide-card-text)] outline-none focus:ring-2 focus:ring-[var(--guide-primary)]" disabled={isSending} /><button type="submit" disabled={isSending || !question.trim()} className="rounded-[var(--guide-radius-md)] bg-[var(--guide-primary)] px-4 py-2 text-sm font-semibold text-[var(--guide-primary-text)] disabled:opacity-50">{dict.send}</button></form>
    </div>
  );
}

function QuickActionGrid({
  actions,
  onOpen,
}: {
  actions: PublicGuideQuickAction[];
  onOpen: (kind: SheetKind) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {actions.map((action) => {
        const Icon = getIcon(action.icon);
        return (
          <button
            key={`${action.label}-${action.target}`}
            type="button"
            onClick={() => onOpen(actionKind(action))}
            className="flex min-h-[84px] flex-col items-center justify-center rounded-[var(--guide-radius-lg)] border border-[var(--guide-border)] bg-[var(--guide-surface)] px-1.5 py-3 text-center shadow-[var(--guide-shadow-soft)] transition-all hover:-translate-y-0.5 hover:border-[var(--guide-primary)] hover:bg-[var(--guide-primary)]/10 hover:shadow-[var(--guide-shadow-medium)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--guide-primary)] active:scale-[0.98] active:bg-[var(--guide-primary)]/15"
          >
            <Icon className="mb-2 size-6 text-[var(--guide-icon)]" aria-hidden="true" />
            <span className="text-[11px] font-medium leading-4 text-[var(--guide-card-title)]">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}


function renderBottomNavigationIcon(iconName: string | null | undefined) {
  const Icon = getIcon(iconName ?? "home");

  return <Icon className="size-4" aria-hidden="true" />;
}

function BottomNavigation({
  items,
  onOpen,
}: {
  items: PublicGuideNavigationItem[];
  onOpen: (kind: SheetKind) => void;
}) {
  const fallbackItem: PublicGuideNavigationItem = {
    id: "home-fallback",
    label: "Início",
    destination: "#topo",
    icon: "home",
    destination_type: "internal",
    highlighted: true,
  };

  const normalizedItems = items.filter((item) => {
    const current = item.label.trim().toLowerCase();
    return item.destination === "#topo" || current === "início" || current === "inicio";
  });

  const item = normalizedItems[0] ?? items[0] ?? fallbackItem;
  const targetSheet = navigationDestinationToSheet(item.destination);

  return (
    <nav
      className="w-full px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-4"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex max-w-[440px] justify-center">
        <button
          type="button"
          onClick={() => {
            if (item.destination === "#topo") {
              window.scrollTo({ top: 0, behavior: "smooth" });
              return;
            }

            if (targetSheet) {
              onOpen(targetSheet);
              return;
            }

            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-[var(--guide-border)] bg-[var(--guide-surface)]/95 px-4 py-2.5 shadow-[0_18px_36px_rgba(17,24,39,0.12)] backdrop-blur-md"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-[var(--guide-primary)] text-[var(--guide-button-text)] shadow-[0_10px_18px_rgba(17,24,39,0.18)]">
            {renderBottomNavigationIcon(item.icon ?? "home")}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--guide-card-title)]">
            {item.label || "Início"}
          </span>
        </button>
      </div>
    </nav>
  );
}

function AccommodationDetail({
  item,
  locale,
  onBack,
  onOpenMedia,
  reservationHref,
}: {
  item: PublicGuideAccommodation;
  locale: GuideLocale;
  onBack: () => void;
  onOpenMedia: (media: PublicGuideMedia) => void;
  reservationHref: string;
}) {
  const [activeAccommodationPhotoIndex, setActiveAccommodationPhotoIndex] = useState(0);
  const groupedVideosByCategory = groupGuideVideosByCategory(
    item.media.filter((media) => media.mediaType === "video"),
  );
  const dict = getGuideDictionary(locale);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-[var(--guide-primary)]"
      >
        ← {dict.allAccommodations}
      </button>
      {item.media.filter((media) => media.mediaType === "image").length > 0 ? (
        <div className="space-y-3">
          <button type="button" className="block w-full overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--guide-primary)]" onClick={() => onOpenMedia(item.media.filter((media) => media.mediaType === "image")[activeAccommodationPhotoIndex] ?? item.media.filter((media) => media.mediaType === "image")[0])} aria-label={`Abrir foto de ${item.name}`}>
            <img src={item.media.filter((media) => media.mediaType === "image")[activeAccommodationPhotoIndex]?.url ?? item.imageUrl ?? ""} alt={item.name} className="aspect-[16/9] w-full object-cover transition-transform hover:scale-[1.02]" />
          </button>
          {item.media.filter((media) => media.mediaType === "image").length > 1 && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {item.media.filter((media) => media.mediaType === "image").map((media, index) => (
                  <button key={media.id} type="button" onClick={() => setActiveAccommodationPhotoIndex(index)} className={cn("relative h-12 w-12 overflow-hidden rounded-lg border", activeAccommodationPhotoIndex === index ? "border-[var(--guide-primary)] ring-2 ring-[var(--guide-primary)]/20" : "border-[var(--guide-border)]")} aria-label={`Ver foto ${index + 1} de ${item.name}`}>
                    <img src={media.url} alt={media.altText ?? item.name} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--guide-subtitle)]">
                {activeAccommodationPhotoIndex + 1} / {item.media.filter((media) => media.mediaType === "image").length}
              </div>
            </div>
          )}
        </div>
      ) : item.imageUrl ? (
        <button type="button" className="block w-full overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--guide-primary)]" onClick={() => undefined} aria-label={`Abrir detalhes de ${item.name}`}>
          <img src={item.imageUrl} alt={item.name} className="aspect-[16/9] w-full object-cover transition-transform hover:scale-[1.02]" />
        </button>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center rounded-2xl bg-[var(--guide-muted-bg)]">
          <BedDouble
            className="size-12 text-[var(--guide-primary)] opacity-60"
            aria-hidden="true"
          />
        </div>
      )}
      <div>
        <h3 className="text-xl font-semibold text-[var(--guide-title)]">
          {item.name}
        </h3>
      </div>
      {(item.capacity || item.area_m2 || item.view_description || item.bed_description) && (
        <div className="grid grid-cols-2 gap-2">
          {item.capacity ? <AccommodationFact icon={Users} label={dict.maxOccupancy} value={`${item.capacity} pessoas`} /> : null}
          {item.area_m2 ? <AccommodationFact icon={Maximize} label={dict.areaLabel} value={`${item.area_m2} m²`} /> : null}
          {item.view_description ? <AccommodationFact icon={Waves} label={dict.viewLabel} value={item.view_description} /> : null}
          {item.bed_description ? <AccommodationFact icon={Bed} label={dict.bedLabel} value={item.bed_description} /> : null}
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-[var(--guide-title)]">{dict.descriptionLabel}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--guide-card-text)]">
          {item.description ?? item.short_description ?? dict.contentUpdating}
        </p>
      </div>
      {item.amenities.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--guide-title)]">
            {dict.mainAmenities}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {item.amenities.map((amenity) => {
              const Icon = getIcon(amenity.icon);
              return <span key={amenity.id} className="flex items-center gap-2 rounded-xl bg-[var(--guide-muted-bg)] px-3 py-2 text-sm text-[var(--guide-card-text)]"><Icon className="size-4 shrink-0 text-[var(--guide-icon)]" aria-hidden="true" />{amenity.name}</span>;
            })}
          </div>
        </div>
      )}
      {item.media.some((media) => media.mediaType === "image") && <p className="text-sm font-semibold uppercase tracking-wide text-[var(--guide-title)]">{dict.photosLabel}</p>}
      {item.rules.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-[var(--guide-title)]">
            {dict.orientationLabel}
          </p>
          <div className="space-y-2">
            {item.rules.map((rule) => (
              <article
                key={rule.id}
                className="rounded-xl bg-[var(--guide-muted-bg)] p-3"
              >
                <p className="font-medium text-[var(--guide-card-title)]">
                  {rule.title}
                </p>
                <p className="text-[var(--guide-card-text)]">{rule.content}</p>
              </article>
            ))}
          </div>
        </div>
      )}
      {item.contentItems.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-[var(--guide-title)]">
            {dict.guideInformation}
          </p>
          {item.contentItems.map((content) => (
            <article
              key={content.id}
              className="rounded-xl bg-[var(--guide-muted-bg)] p-3"
            >
              <p className="font-medium text-[var(--guide-card-title)]">
                {content.title}
              </p>
              <p className="text-[var(--guide-card-text)]">{content.description}</p>
            </article>
          ))}
        </div>
      )}
      {groupedVideosByCategory.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--guide-title)]">
            {dict.videos} / {dict.howToUse}
          </p>
          <div className="space-y-3">
            {groupedVideosByCategory.map(([category, videos]) => (
              <div key={category} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--guide-subtitle)]/80">
                  {category}
                </p>
                {videos.map((media) => (
                  <VideoCard
                    key={media.id}
                    media={media}
                    onClick={() => onOpenMedia(media)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {item.media.some((media) => media.mediaType === "image") && (
        <div className="grid grid-cols-2 gap-2">
          {item.media
            .filter((media) => media.mediaType === "image")
            .map((media) => (
              <button key={media.id} type="button" onClick={() => onOpenMedia(media)} className="block aspect-square overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--guide-primary)]" aria-label={`Abrir foto de ${item.name}`}>
                <img src={media.url} alt={media.altText ?? item.name} loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
        </div>
      )}
      {(item.booking_url ?? reservationHref) ? <a
        href={item.booking_url ?? reservationHref!}
        target="_blank"
        rel="noreferrer"
        className={cn(
          buttonVariants({ size: "sm" }),
          "mt-2 rounded-full bg-[var(--guide-primary)] text-[var(--guide-button-text)]",
        )}
      >
        {dict.bookNow} <ChevronRight className="size-4" />
      </a> : null}
    </div>
  );
}

function AccommodationFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[var(--guide-radius-md)] border border-[var(--guide-border)] bg-[var(--guide-surface)] p-3 text-[var(--guide-card-text)] shadow-[var(--guide-shadow-soft)]">
      <Icon className="mb-2 size-5 text-[var(--guide-icon)]" aria-hidden="true" />
      <p className="text-xs font-medium text-[var(--guide-card-subtitle)]">{label}</p>
      <p className="mt-0.5 font-semibold leading-5 text-[var(--guide-card-title)]">{value}</p>
    </div>
  );
}

function GuideSheet({
  kind,
  data,
  locale,
  onClose,
  initialAccommodationId,
  onOpenSheet,
}: {
  kind: SheetKind;
  data: PublicGuideData;
  locale: GuideLocale;
  onClose: () => void;
  initialAccommodationId?: string | null;
  onOpenSheet: (kind: SheetKind) => void;
}) {
  const [selectedAccommodation, setSelectedAccommodation] = useState<
    string | null
  >(initialAccommodationId ?? null);
  const [selectedVideo, setSelectedVideo] = useState<
    PublicGuideData["publishedMedia"][number] | null
  >(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null,
  );
  const [showWifiPassword, setShowWifiPassword] = useState(false);
  const [wifiFeedback, setWifiFeedback] = useState<string | null>(null);
  const reservationHref = data.booking.href ?? "";
  const dict = getGuideDictionary(locale);
  const title = {
    wifi: dict.wifi,
    accommodations: dict.accommodations,
    reservas: dict.reservations,
    contact: dict.contact,
    map: dict.howToGetThere,
    gallery: dict.gallery,
    videos: dict.videos,
    food: dict.services,
    rules: dict.rules,
    benefit: dict.benefits,
    tips: dict.localTips,
    content: dict.information,
    chat: "Anfitrião Virtual",
  }[kind];
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-0 sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-sheet-title"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className="max-h-[92dvh] w-full max-w-[720px] overflow-y-auto rounded-t-[28px] bg-[var(--guide-surface)] shadow-[var(--guide-shadow-strong)] sm:rounded-[28px]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--guide-border)] bg-[var(--guide-surface)]/95 px-5 py-4 backdrop-blur">
          <div>
            <span className="mb-1 block h-1 w-9 rounded-full bg-[var(--guide-border)] sm:hidden" />
            <h2
              id="guide-sheet-title"
              className="text-xl font-semibold text-[var(--guide-title)]"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.close}
            className="rounded-full p-2 text-[var(--guide-title)] hover:bg-[var(--guide-muted-bg)]"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-4 px-5 pb-7 pt-5 text-sm leading-6 text-[var(--guide-card-text)]">
          {kind === "wifi" && (
            <>
              {data.wifi ? (
                <>
                  <div className="rounded-2xl bg-[var(--guide-muted-bg)] p-4">
                    <p className="text-xs uppercase tracking-[.18em] text-[var(--guide-subtitle)]">Nome da rede</p>
                    <p className="font-medium text-[var(--guide-card-title)]">{data.wifi.name}</p>
                    <p className="mt-3 text-xs uppercase tracking-[.18em] text-[var(--guide-subtitle)]">SSID</p>
                    <p className="font-medium text-[var(--guide-card-title)]">
                      {data.wifi.ssid}
                    </p>
                    {data.wifi.area && <p className="mt-3 text-xs text-[var(--guide-card-subtitle)]">Área: {data.wifi.area}</p>}
                    <p className="mt-3 text-xs uppercase tracking-[.18em] text-[var(--guide-subtitle)]">
                      Senha
                    </p>
                    <p className="font-medium text-[var(--guide-card-title)]">
                      {showWifiPassword
                        ? (data.wifi.password ?? "Não informada")
                        : "••••••••"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowWifiPassword((visible) => !visible)}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "h-10 rounded-full",
                      )}
                    >
                      {showWifiPassword ? dict.hidePassword : dict.showPassword}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          if (!data.wifi?.password || !navigator.clipboard) throw new Error("clipboard-unavailable");
                          await navigator.clipboard.writeText(data.wifi.password);
                          setWifiFeedback("Senha copiada.");
                        } catch {
                          setWifiFeedback("Não foi possível copiar. Selecione a senha manualmente.");
                        }
                      }}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "h-10 rounded-full",
                      )}
                    >
                      {dict.copyPassword} <Copy className="size-4" />
                    </button>
                  </div>
                  {wifiFeedback && <p role="status" className="text-xs font-medium text-[var(--guide-card-text)]">{wifiFeedback}</p>}
                  {data.wifi.imageUrl && <img src={data.wifi.imageUrl} alt={dict.wifi} className="w-full rounded-xl object-cover" />}
                  {data.wifi.video && <button type="button" onClick={() => setSelectedVideo(data.wifi?.video ?? null)} className="inline-flex items-center gap-2 font-medium text-[var(--guide-primary)]">{dict.viewVideo} <PlayCircle className="size-4" /></button>}
                </>
              ) : (
                <p>O Wi-Fi ainda não foi configurado para os hóspedes.</p>
              )}
            </>
          )}
          {kind === "accommodations" &&
            (selectedAccommodation ? (
              <AccommodationDetail
                item={data.accommodations.find(
                  (item) => item.id === selectedAccommodation,
                )!}
                locale={locale}
                onBack={() => setSelectedAccommodation(null)}
                onOpenMedia={setSelectedVideo}
                reservationHref={reservationHref}
              />
            ) : data.accommodations.length ? (
              <div className="space-y-3">
                {data.accommodations.map((item) => (
                  <AccommodationCard
                    key={item.id}
                    item={item}
                    onClick={() => setSelectedAccommodation(item.id)}
                  />
                ))}
              </div>
            ) : (
              <GuideEmptyState
                title="Acomodações"
                message="As acomodações serão disponibilizadas aqui."
                icon={BedDouble}
              />
            ))}
          {kind === "reservas" && (
            <>
              <p>
                {data.booking.helperText ??
                  "Consulte disponibilidade e faça sua reserva pelo canal oficial."}
              </p>
              <a
                href={reservationHref}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full rounded-full bg-[var(--guide-accent)] text-[var(--guide-primary-text)]",
                )}
              >
                {data.booking.label} <ExternalLink className="size-4" />
              </a>
              {data.contact.phone && (
                <a
                  href={`tel:${data.contact.phone}`}
                  className="block text-center font-medium text-[var(--guide-primary)]"
                >
                  {data.contact.phone}
                </a>
              )}
            </>
          )}
          {kind === "contact" && (
            <div className="space-y-2">
              {data.contact.phone && (
                <ContactCard
                  label="Telefone"
                  value={data.contact.phone}
                  href={`tel:${data.contact.phone}`}
                />
              )}
              {data.contact.whatsapp && (
                <ContactCard
                  label="WhatsApp"
                  value={data.contact.whatsapp}
                  href={`https://wa.me/${data.contact.whatsapp.replace(/\D/g, "")}`}
                />
              )}
              {data.contact.email && (
                <ContactCard
                  label="E-mail"
                  value={data.contact.email}
                  href={`mailto:${data.contact.email}`}
                />
              )}
              {data.contact.instagram && (
                <ContactCard
                  label="Instagram"
                  value={data.contact.instagram}
                  href={data.contact.instagram}
                />
              )}
              {data.contact.website && (
                <ContactCard
                  label="Site"
                  value={data.contact.website}
                  href={data.contact.website}
                />
              )}
              {!data.contact.phone &&
                !data.contact.whatsapp &&
                !data.contact.email &&
                !data.contact.instagram &&
                !data.contact.website && (
                  <GuideEmptyState
                    title="Contato"
                    message="Informações de contato sendo atualizadas."
                    icon={PhoneCall}
                  />
                )}
            </div>
          )}
          {kind === "map" && (
            <>
              <div className="space-y-3">
                <div className="overflow-hidden rounded-2xl border border-[var(--guide-border)] bg-[var(--guide-muted-bg)]">
                  {data.location?.mapEmbedUrl ? (
                    <iframe
                      title={`Mapa de ${data.location.title}`}
                      src={data.location.mapEmbedUrl}
                      className="h-52 w-full border-0"
                      loading="lazy"
                    />
                  ) : data.location?.photoUrl ? (
                    <img
                      src={data.location.photoUrl}
                      alt={data.location.title}
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center px-4 text-center text-sm text-[var(--guide-muted)]">
                      Abra o endereço no Google Maps para iniciar a rota.
                    </div>
                  )}
                </div>
                <p className="font-semibold text-[var(--guide-foreground)]">
                  {data.location?.title ?? "Como chegar"}
                </p>
                <p>
                  {data.location?.address ??
                    data.contact.address ??
                    "Informações de localização sendo atualizadas."}
                </p>
                {data.location?.orientation && (
                  <p className="rounded-xl bg-[var(--guide-muted-bg)] p-3 text-sm text-[var(--guide-foreground)]">
                    {data.location.orientation}
                  </p>
                )}
                {data.location?.complement && (
                  <p className="text-sm text-[var(--guide-muted)]">Complemento: {data.location.complement}</p>
                )}
                <div className="grid gap-2">
                  {data.location?.googleMapsUrl && (
                    <a
                      href={data.location.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "w-full rounded-full bg-[var(--guide-primary)] text-[var(--guide-primary-text)]",
                      )}
                    >
                      Abrir no Google Maps <ExternalLink className="size-4" />
                    </a>
                  )}
                  {data.location?.wazeUrl && (
                    <a
                      href={data.location.wazeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "w-full rounded-full border border-[var(--guide-border)] bg-transparent text-[var(--guide-foreground)]",
                      )}
                    >
                      Abrir no Waze <ExternalLink className="size-4" />
                    </a>
                  )}
                  {data.location?.optionalUrl && (
                    <a
                      href={data.location.optionalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "w-full rounded-full border border-[var(--guide-border)] bg-transparent text-[var(--guide-foreground)]",
                      )}
                    >
                      Ver endereço completo <ExternalLink className="size-4" />
                    </a>
                  )}
                </div>
                {data.location?.video && (
                  <button
                    type="button"
                    onClick={() => setSelectedVideo(data.location?.video ?? null)}
                    className="inline-flex items-center gap-2 font-medium text-[var(--guide-primary)]"
                  >
                    Ver vídeo de orientação <PlayCircle className="size-4" />
                  </button>
                )}
                {!data.location && (
                  <p className="text-sm text-[var(--guide-muted)]">Informações de localização sendo atualizadas.</p>
                )}
              </div>
            </>
          )}
          {kind === "gallery" &&
            (data.publishedMedia.some((item) => item.mediaType === "image") ? (
              <div className="grid grid-cols-2 gap-2">
                {data.publishedMedia
                  .filter((item) => item.mediaType === "image")
                  .map((item) => (
                  <GalleryCard
                    key={item.id}
                    media={item}
                    onClick={() => setSelectedVideo(item)}
                  />
                ))}
              </div>
            ) : (
              <GuideEmptyState
                title="Galeria"
                message="Galeria sendo atualizada."
                icon={Images}
              />
            ))}
          {kind === "videos" &&
            (data.guideVideos.length ? (
              <div className="space-y-3">
                {groupGuideVideosByCategory(data.guideVideos).map(([category, videos]) => (
                  <div key={category} className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--guide-foreground)]/75">
                      {category}
                    </p>
                    {videos.map((item) => (
                      <VideoCard
                        key={item.id}
                        media={item}
                        onClick={() => setSelectedVideo(item)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p>
                Os vídeos informativos serão configurados pelo estabelecimento.
              </p>
            ))}
          {kind === "rules" && (
            <div className="space-y-3">
              {data.rules.length ? (
                data.rules.map((rule) => (
                  <article
                    key={rule.id}
                    className="rounded-2xl bg-[var(--guide-muted-bg)] p-4"
                  >
                    <p className="font-semibold text-[var(--guide-foreground)]">
                      {rule.title}
                    </p>
                    <p className="mt-1 text-xs font-medium text-[var(--guide-primary)]">
                      {ruleCategoryLabel(rule.category)} · {ruleSeverityLabel(rule.severity)}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--guide-foreground)]">
                      {rule.content}
                    </p>
                  </article>
                ))
              ) : (
                <GuideEmptyState
                  title="Regras"
                  message="Informações sendo atualizadas."
                  icon={ShieldCheck}
                />
              )}
            </div>
          )}
          {kind === "benefit" && (
            <div className="space-y-3">
              {data.hasBenefitContent ? (
                data.contentCollections
                  .flatMap((collection) =>
                    collection.items.map((item) => ({ collection, item })),
                  )
                  .filter(
                    ({ item }) =>
                      item.discountText ||
                      item.couponCode ||
                      item.validityText ||
                      item.description,
                  )
                  .map(({ item }) => (
                    <article
                      key={item.id}
                      className="rounded-2xl bg-[var(--guide-muted-bg)] p-4"
                    >
                      <p className="font-semibold text-[var(--guide-foreground)]">
                        {item.title || "Benefício de retorno"}
                      </p>
                      {item.description && (
                        <p className="mt-2 text-sm leading-6 text-[var(--guide-muted)]">
                          {item.description}
                        </p>
                      )}
                      {item.discountText && (
                        <p className="mt-2 font-medium text-[var(--guide-primary)]">
                          {item.discountText}
                        </p>
                      )}
                      {item.validityText && (
                        <p className="mt-2 text-xs">Validade: {item.validityText}</p>
                      )}
                      {item.couponCode && (
                        <p className="mt-1 text-xs">Cupom: {item.couponCode}</p>
                      )}
                      {(item.externalUrl || item.contactUrl) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.externalUrl && (
                            <a
                              href={item.externalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-[var(--guide-primary)]"
                            >
                              Abrir link
                            </a>
                          )}
                          {item.contactUrl && (
                            <a
                              href={item.contactUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-[var(--guide-primary)]"
                            >
                              Reservar / entrar em contato
                            </a>
                          )}
                        </div>
                      )}
                    </article>
                  ))
              ) : (
                <GuideEmptyState
                  title="Benefício de retorno"
                  message="Informações sendo atualizadas."
                  icon={Gift}
                />
              )}
            </div>
          )}
          {kind === "food" && (
            <div className="space-y-2">
              {data.services.length ? (
                data.services.map((item) => (
                  <ServiceCard
                    key={item.id}
                    item={item}
                    onClick={() => undefined}
                  />
                ))
              ) : data.breakfast ? (
                <>
                  <h3 className="text-lg font-semibold text-[#543f39]">
                    {data.breakfast.title}
                  </h3>
                  <p>{data.breakfast.body}</p>
                </>
              ) : (
                <GuideEmptyState
                  title="Gastronomia"
                  message="Informações sendo atualizadas."
                  icon={UtensilsCrossed}
                />
              )}
            </div>
          )}
          {kind === "tips" &&
            (data.localTips.length ? (
              data.localTips.map((tip) => (
                <article key={tip.id} className="overflow-hidden rounded-[var(--guide-radius-lg)] bg-[var(--guide-muted-bg)] shadow-[var(--guide-shadow-soft)]">
                  {tip.imageUrl ? (
                    <img
                      src={tip.imageUrl}
                      alt={tip.name}
                      loading="lazy"
                      className="h-40 w-full object-cover"
                    />
                  ) : null}
                  <div className="p-4">
                    <h3 className="font-semibold text-[var(--guide-foreground)]">{tip.name}</h3>
                    <p className="mt-2 text-sm text-[var(--guide-foreground)]">
                      {tip.short_description ??
                        tip.description ??
                        "Informação em configuração."}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <p>As dicas da região serão configuradas pelo estabelecimento.</p>
            ))}
          {kind === "content" &&
            (selectedCollection ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setSelectedCollection(null)}
                  className="text-sm font-medium text-[var(--guide-primary)]"
                >
                  ← Todas as áreas
                </button>
                {data.contentCollections
                  .find((collection) => collection.id === selectedCollection)
                  ?.items.map((item) => (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-2xl bg-[var(--guide-muted-bg)]"
                    >
                      {item.media.find((media) => media.mediaType === "image") ? (
                        <img
                          src={item.media.find((media) => media.mediaType === "image")?.url}
                          alt={item.title}
                          loading="lazy"
                          className="h-40 w-full object-cover"
                        />
                      ) : null}
                      <div className="p-4">
                        <h3 className="font-semibold text-[var(--guide-foreground)]">
                          {item.title}
                        </h3>
                      {item.subtitle && <p>{item.subtitle}</p>}
                      {item.description && (
                        <p className="mt-1">{item.description}</p>
                      )}
                      {item.price !== null && (
                        <p className="mt-2 font-medium">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(item.price)}
                        </p>
                      )}
                      {item.instructions && (
                        <p className="mt-2 text-xs">{item.instructions}</p>
                      )}
                      {item.alertText && (
                        <p className="mt-2 text-xs font-medium text-[#8d44a1]">
                          {item.alertText}
                        </p>
                      )}
                      {item.discountText && <p className="mt-2 font-medium text-[var(--guide-primary)]">{item.discountText}</p>}
                      {item.validityText && <p className="mt-1 text-xs">Validade: {item.validityText}</p>}
                      {item.couponCode && <p className="mt-1 text-xs">Cupom: {item.couponCode}</p>}
                      {item.address && <p className="mt-2 text-sm">Endereço: {item.address}</p>}
                      {(item.externalUrl || item.secondaryUrl || item.contactUrl) && <div className="mt-3 flex flex-wrap gap-2">{item.externalUrl && <a href={item.externalUrl} target="_blank" rel="noreferrer" className="font-medium text-[var(--guide-primary)]">Google Maps / Abrir link</a>}{item.secondaryUrl && <a href={item.secondaryUrl} target="_blank" rel="noreferrer" className="font-medium text-[var(--guide-primary)]">Waze</a>}{item.contactUrl && <a href={item.contactUrl} target="_blank" rel="noreferrer" className="font-medium text-[var(--guide-primary)]">Contato / Reserva</a>}</div>}
                      {item.media.map((media) =>
                        media.mediaType === "video" ? (
                          <button
                            key={media.id}
                            type="button"
                            onClick={() => setSelectedVideo(media)}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--guide-surface)] p-4 font-medium text-[var(--guide-primary)]"
                          >
                            <PlayCircle className="size-5" /> Ver vídeo
                          </button>
                        ) : (
                          <button key={media.id} type="button" onClick={() => setSelectedVideo(media)} className="mt-3 block w-full overflow-hidden rounded-xl">
                            <img
                            key={media.id}
                            src={media.url}
                            alt={media.altText ?? item.title}
                            loading="lazy"
                            className="mt-3 w-full rounded-xl"
                            />
                          </button>
                        ),
                      )}
                      </div>
                    </article>
                  ))}
              </div>
            ) : data.contentCollections.length ? (
              <div className="space-y-2">
                {data.contentCollections.map((collection) => (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => setSelectedCollection(collection.id)}
                    className="flex w-full items-center justify-between rounded-2xl bg-[var(--guide-muted-bg)] p-4 text-left"
                  >
                    <span>
                      <strong className="block text-[var(--guide-foreground)]">
                        {collection.title}
                      </strong>
                      <span>{collection.items.length} conteúdo(s)</span>
                    </span>
                    <ChevronRight className="size-4" />
                  </button>
                ))}
              </div>
            ) : (
              <GuideEmptyState
                title="Conteúdos do Guia"
                message="Conteúdo sendo atualizado."
                icon={Compass}
              />
            ))}
          {kind === "chat" && (
            <ConciergePanel data={data} locale={locale} onOpen={onOpenSheet} />
          )}
        </div>
      </section>
      {selectedVideo && (
        <MediaViewer
          media={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}

function UniversalSection({
  type,
  data,
  locale,
  onOpen,
  onOpenVideo,
  onOpenAccommodation,
}: {
  type: string;
  data: PublicGuideData;
  locale: GuideLocale;
  onOpen: (kind: SheetKind) => void;
  onOpenVideo: (media: PublicGuideMedia) => void;
  onOpenAccommodation: (id: string) => void;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoplayPausedRef = useRef(false);
  const dict = getGuideDictionary(locale);
  const galleryImages = data.gallery.filter((item) => Boolean(item.imageUrl));
  const [galleryIndex, setGalleryIndex] = useState(0);
  const moveCarousel = (direction: -1 | 1) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const maximumScroll = carousel.scrollWidth - carousel.clientWidth;
    const nextScroll = carousel.scrollLeft + direction * 240;
    carousel.scrollTo({
      left:
        nextScroll < 0
          ? maximumScroll
          : nextScroll > maximumScroll
            ? 0
            : nextScroll,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    if (type !== "accommodations" || data.accommodations.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const autoplayId = window.setInterval(() => {
      if (!autoplayPausedRef.current) moveCarousel(1);
    }, 10_000);

    return () => window.clearInterval(autoplayId);
  }, [data.accommodations.length, type]);

  useEffect(() => {
    if (galleryImages.length < 2) return;

    const autoplayId = window.setInterval(() => {
      setGalleryIndex((current) => {
        const next = Math.floor(Math.random() * galleryImages.length);
        return next === current ? (current + 1) % galleryImages.length : next;
      });
    }, 20000);

    return () => window.clearInterval(autoplayId);
  }, [galleryImages.length]);

  const safeGalleryIndex =
    galleryImages.length === 0 ? 0 : galleryIndex % galleryImages.length;

  const goToGallery = (direction: -1 | 1) => {
    if (galleryImages.length <= 1) return;
    setGalleryIndex((current) => {
      const next = (current + direction + galleryImages.length) % galleryImages.length;
      return next;
    });
  };
  if (type === "accommodations")
    return (
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--guide-foreground)]">
            {getGuideDictionary(locale).accommodations}
          </h2>
          <button
            type="button"
            onClick={() => onOpen("accommodations")}
            className="text-xs font-medium text-[var(--guide-primary)]"
          >
            {getGuideDictionary(locale).viewAll}
          </button>
        </div>
        {data.accommodations.length > 0 ? (
          <div className="relative">
            <div
              ref={carouselRef}
              onPointerDown={() => {
                autoplayPausedRef.current = true;
              }}
              onKeyDown={() => {
                autoplayPausedRef.current = true;
              }}
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pr-2"
            >
              {data.accommodations.map((item) => (
                <div key={item.id} className="w-[min(78vw,280px)] shrink-0 snap-start">
                  <AccommodationCard item={item} onClick={() => onOpenAccommodation(item.id)} />
                </div>
              ))}
            </div>
            {data.accommodations.length > 1 && (
              <div className="mt-1 flex items-center justify-between">
                <div className="flex gap-1">
                    <button type="button" aria-label="Acomodação anterior" onClick={() => moveCarousel(-1)} className="rounded-full border border-[var(--guide-border)] p-1.5 text-[var(--guide-foreground)]"><ChevronLeft className="size-4" /></button>
                    <button type="button" aria-label="Próxima acomodação" onClick={() => moveCarousel(1)} className="rounded-full border border-[var(--guide-border)] p-1.5 text-[var(--guide-foreground)]"><ChevronRight className="size-4" /></button>
                </div>
                <button type="button" aria-label={getGuideDictionary(locale).viewAll} onClick={() => onOpen("accommodations")} className="text-xs font-medium text-[var(--guide-primary)]">{getGuideDictionary(locale).viewAll}</button>
              </div>
            )}
          </div>
        ) : (
          <GuideEmptyState
            title="Acomodações"
            message="As acomodações serão disponibilizadas aqui."
            icon={BedDouble}
          />
        )}
      </section>
    );
  if (type === "videos") {
    const groupedVideos = groupGuideVideosByCategory(data.guideVideos);

    return (
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--guide-foreground)]">
            {getGuideDictionary(locale).videos}
          </h2>
          <button
            type="button"
            onClick={() => onOpen("videos")}
            className="text-xs font-medium text-[var(--guide-primary)]"
          >
            {getGuideDictionary(locale).viewVideos}
          </button>
        </div>
        {groupedVideos.length > 0 ? (
          <div className="space-y-3">
            {groupedVideos.slice(0, 2).map(([category, videos]) => (
              <div key={category} className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--guide-foreground)]/75">
                  {category}
                </p>
                {videos.slice(0, 2).map((item) => (
                  <VideoCard
                    key={item.id}
                    media={item}
                    onClick={() => onOpenVideo(item)}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <GuideEmptyState
            title="Como usar"
            message="Os vídeos de orientação serão disponibilizados aqui."
            icon={PlayCircle}
          />
        )}
      </section>
    );
  }
  if (type === "services")
    return (
      <section className="mt-5">
        <h2 className="mb-2 text-base font-semibold text-[var(--guide-foreground)]">
          {getGuideDictionary(locale).services}
        </h2>
        {data.services.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {data.services.slice(0, 4).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpen("food")}
                className="rounded-2xl bg-[var(--guide-muted-bg)] p-3 text-left text-sm text-[var(--guide-foreground)]"
              >
                {item.name}
              </button>
            ))}
          </div>
        ) : (
          <GuideEmptyState
            title="Serviços"
            message="Informações sendo atualizadas."
            icon={UtensilsCrossed}
          />
        )}
      </section>
    );
  if (type === "gallery") {
    return (
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--guide-title)]">
            {getGuideDictionary(locale).gallery}
          </h2>
          <button
            type="button"
            onClick={() => onOpen("gallery")}
            className="text-xs font-medium text-[var(--guide-primary)]"
          >
            {getGuideDictionary(locale).openGallery}
          </button>
        </div>
        {galleryImages.length > 0 ? (
          <div className="space-y-2">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={galleryImages[safeGalleryIndex]?.imageUrl}
                alt={galleryImages[safeGalleryIndex]?.title ?? "Galeria"}
                loading="lazy"
                className="aspect-[16/8] w-full object-cover"
              />
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Foto anterior"
                    onClick={() => goToGallery(-1)}
                    className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/20 text-white backdrop-blur-sm"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Próxima foto"
                    onClick={() => goToGallery(1)}
                    className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/20 text-white backdrop-blur-sm"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </>
              )}
            </div>
            {galleryImages.length > 1 && (
              <div className="flex items-center justify-center gap-1.5">
                {galleryImages.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Ver foto ${index + 1}`}
                    onClick={() => setGalleryIndex(index)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      index === galleryIndex ? "w-6 bg-[var(--guide-primary)]" : "w-1.5 bg-[var(--guide-border)]",
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <GuideEmptyState
            title="Galeria"
            message="Estamos preparando novas fotos."
            icon={Images}
          />
        )}
      </section>
    );
  }
  if (type === "local_tips")
    return (
      <section className="mt-5">
        <h2 className="mb-2 text-base font-semibold text-[var(--guide-title)]">
          {getGuideDictionary(locale).localTips}
        </h2>
        {data.localTips.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto">
            {data.localTips.slice(0, 3).map((tip) => (
              <button
                key={tip.id}
                type="button"
                onClick={() => onOpen("tips")}
                className="min-w-[150px] rounded-2xl bg-[var(--guide-muted-bg)] p-3 text-left text-sm text-[var(--guide-foreground)]"
              >
                {tip.name}
              </button>
            ))}
          </div>
        ) : (
          <GuideEmptyState
            title="Dicas da região"
            message="Conteúdo sendo atualizado."
            icon={SignpostBig}
          />
        )}
      </section>
    );
  if (type === "content")
    return (
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--guide-title)]">
            {getGuideDictionary(locale).information}
          </h2>
          <button
            type="button"
            onClick={() => onOpen("content")}
            className="text-xs font-medium text-[var(--guide-primary)]"
          >
            {getGuideDictionary(locale).information}
          </button>
        </div>
        {data.contentCollections.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {data.contentCollections.slice(0, 4).map((collection) => (
              <button
                key={collection.id}
                type="button"
                onClick={() => onOpen("content")}
                className="rounded-2xl bg-[var(--guide-muted-bg)] p-3 text-left text-sm text-[var(--guide-foreground)]"
              >
                {collection.title}
              </button>
            ))}
          </div>
        ) : (
          <GuideEmptyState
            title="Conteúdos do Guia"
            message="Conteúdo sendo atualizado."
            icon={Compass}
          />
        )}
      </section>
    );
  if (type === "booking_cta")
    return (
      <section className="mt-5">
        <button
          type="button"
          onClick={() => onOpen("reservas")}
          className="w-full rounded-2xl bg-[var(--guide-primary)] px-4 py-3 text-sm font-semibold text-[var(--guide-button-text)]"
        >
          {data.booking.href ? data.booking.label : getGuideDictionary(locale).reservations}
        </button>
      </section>
    );
  return null;
}

export function GuideRenderer({ data }: GuideHomeProps) {
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<PublicGuideMedia | null>(null);
  const [accommodations, setAccommodations] = useState(data.accommodations);
  const [guideDateTime, setGuideDateTime] = useState({ date: "...", time: "--:--" });
  const [locale, setLocale] = useState<GuideLocale>(() => resolveBrowserLocale(data.tenant.locale));
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const sourceAccommodations = data.accommodations;
  const tenantId = data.tenant.tenant_id;
  const conciergeEnabled = data.concierge.enabled;
  const localeDictionary = getGuideDictionary(locale);
  useEffect(() => {
    if (typeof window === "undefined") return;

    const nextLocale = resolveBrowserLocale(data.tenant.locale);
    setLocale((current) => (current === nextLocale ? current : nextLocale));

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [data.tenant.locale]);
  useEffect(() => {
    const updateDateTime = () => setGuideDateTime(formatGuideDateTime(data.tenant.timezone));

    updateDateTime();
    const intervalId = window.setInterval(updateDateTime, 30_000);

    return () => window.clearInterval(intervalId);
  }, [data.tenant.timezone]);
  useEffect(() => {
    const storageKey = `guide-accommodations:${tenantId}`;
    const storedOrder = window.sessionStorage.getItem(storageKey);
    const order = storedOrder ? (JSON.parse(storedOrder) as string[]) : null;
    const ids = new Set(sourceAccommodations.map((item) => item.id));
    const orderedIds = order?.filter((id) => ids.has(id)) ?? [];
    const remaining = sourceAccommodations.filter((item) => !orderedIds.includes(item.id));
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);
    const nextOrder = [...orderedIds, ...shuffled.map((item) => item.id)];
    window.sessionStorage.setItem(storageKey, JSON.stringify(nextOrder));
    startTransition(() => {
      setAccommodations(nextOrder.map((id) => sourceAccommodations.find((item) => item.id === id)).filter((item): item is typeof sourceAccommodations[number] => Boolean(item)));
    });
  }, [sourceAccommodations, tenantId]);
  const openAccommodation = (id: string) => {
    setSelectedAccommodation(id);
    setSheet("accommodations");
  };
  const configuredTypes = new Set(
    data.sections.map((section) => section.section_type),
  );
  const hasValidBenefitContent = data.hasBenefitContent;
  const fallbackTypes = [
    data.accommodations.length > 0 ? "accommodations" : null,
    data.guideVideos.length > 0 ? "videos" : null,
    data.publishedMedia.some((item) => item.mediaType === "image")
      ? "gallery"
      : null,
    data.services.length > 0 ? "services" : null,
    data.localTips.length > 0 ? "local_tips" : null,
    data.contentCollections.length > 0 ? "content" : null,
    hasValidBenefitContent ? "benefit" : null,
  ].filter(
    (type): type is string => type !== null && !configuredTypes.has(type),
  );
  const visibleSectionTypes = [
    ...data.sections
      .filter((section) => section.enabled && !(section.section_type === "benefit" && !hasValidBenefitContent))
      .map((section) => section.section_type),
    ...fallbackTypes.filter((type) => !(type === "benefit" && !hasValidBenefitContent)),
  ].filter((type) => type !== "videos");
  return (
    <main
      style={themeStyle(data)}
      className="relative min-h-dvh overflow-x-hidden bg-[var(--guide-background)] text-[var(--guide-foreground)]"
    >
      <div className="relative mx-auto min-h-dvh w-full max-w-[440px] px-3 pb-24 pt-3 sm:pt-6">
        <div className="overflow-hidden rounded-[34px] bg-transparent shadow-none">
          <div id="topo" className="px-0 pb-4">
            {data.design.heroEnabled && (
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[30px] rounded-b-none bg-[var(--guide-muted-bg)] [font-family:var(--guide-hero-font)]">
                {data.design.heroImagePath && (
                  <img
                    src={data.design.heroImagePath}
                    alt={data.tenant.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{
                      objectPosition: data.design.heroMediaPosition
                        ? heroPosition(data.design.heroMediaPosition)
                        : "center center",
                    }}
                  />
                )}
                <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pb-2 pt-4 text-xs text-white drop-shadow-[0_1px_2px_rgba(0,0,0,.6)]">
                  <span className="font-semibold text-white">{guideDateTime.time}</span>
                  <span className="text-white">{guideDateTime.date}</span>
                </div>
                <p className="absolute inset-x-0 top-[clamp(3rem,8vw,4rem)] z-30 px-5 text-center text-[clamp(1.5rem,3.8vw,2.2rem)] font-black uppercase tracking-[0.1em] leading-none text-[var(--guide-hero-title)] drop-shadow-[0_0_18px_rgba(255,255,255,0.22),0_4px_16px_rgba(0,0,0,.22)] opacity-100 brightness-110">
                  {guideTitle(data.design.heroTitle, locale)}
                </p>
                {data.design.logoEnabled && (
                  <div className="absolute inset-x-0 top-[clamp(4.6rem,14vw,6.4rem)] z-10 flex justify-center px-5">
                    {data.design.logoPath ? (
                      <img
                        src={data.design.logoPath}
                        alt={data.tenant.name}
                        className={cn(
                          "h-auto max-h-[170px] w-[72%] max-w-[260px] object-contain drop-shadow-[0_10px_22px_rgba(0,0,0,.42)] brightness-110 saturate-125",
                          logoSizeClass(data.design.logoSize),
                        )}
                      />
                    ) : (
                      <span className="max-w-full text-center text-lg font-black tracking-[.12em] text-[var(--guide-hero-title)] drop-shadow-[0_3px_10px_rgba(0,0,0,.45)]">
                        {data.tenant.name}
                      </span>
                    )}
                  </div>
                )}
                {data.design.heroImagePath && (
                  <div
                    className={cn(
                      "absolute inset-0",
                      heroOverlayClass(data.design.heroOverlay),
                    )}
                  />
                )}
                {!data.design.heroImagePath && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <House
                      className="size-12 text-[var(--guide-primary)] opacity-45"
                      aria-hidden="true"
                    />
                  </div>
                )}
                {data.design.heroLineImagePath && (
                  <img
                    src={data.design.heroLineImagePath}
                    alt=""
                    className="absolute bottom-0 left-0 z-20 w-full"
                  />
                )}
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/10 via-black/20 to-black/60" />

                <div className="absolute inset-x-0 bottom-[clamp(4.7rem,14vw,6.2rem)] z-30 flex flex-col items-center px-5 text-center">
                  {data.design.showGreeting && (
                    <h1 className="mt-[290px] text-[clamp(1.5rem,4.2vw,2.2rem)] font-bold leading-tight text-[var(--guide-hero-title)] drop-shadow-[0_1px_2px_rgba(0,0,0,.4)]">
                      {guideGreeting(data.design.heroSubtitle, locale)}
                    </h1>
                  )}

                  <p className="mx-auto mt-4 max-w-[20rem] text-[clamp(0.8rem,2vw,1rem)] font-medium leading-relaxed text-[var(--guide-hero-title)] drop-shadow-[0_1px_2px_rgba(0,0,0,.4)]">
                    {data.design.welcomeMessage?.trim() || localeDictionary.welcome}
                  </p>

                  <div className="mt-4 flex items-center justify-center gap-4" aria-hidden="true">
                    <span className="h-px w-8 bg-[var(--guide-accent)] opacity-80" />
                    <span className="h-px w-8 bg-[var(--guide-accent)] opacity-80" />
                  </div>

                  <p className="mt-4 break-words text-[clamp(1.2rem,3.6vw,1.8rem)] font-bold leading-tight text-[var(--guide-hero-title)] drop-shadow-[0_1px_2px_rgba(0,0,0,.35)]">
                    {data.design.heroCallToAction?.trim() || getGuideDictionary(locale).howCanWeHelp}
                  </p>
                </div>
              </div>
            )}
            {data.quickActions.length > 0 && (
              <div id="explorar" className="relative z-10 -mt-2">
                <QuickActionGrid
                  actions={data.quickActions}
                  onOpen={setSheet}
                />
              </div>
            )}
            <div className="px-1">
              {visibleSectionTypes.map((type, index) => (
                <UniversalSection
                  key={`${type}-${index}`}
                  type={type}
                  data={{ ...data, accommodations }}
                  locale={locale}
                  onOpen={setSheet}
                  onOpenVideo={setSelectedVideo}
                  onOpenAccommodation={openAccommodation}
                />
              ))}
            </div>
            <p
              className="px-2 pb-0 pt-5 text-center font-serif text-[21px] italic leading-tight"
              style={{ color: "var(--guide-accent)" }}
            >
              {data.design.signature}
            </p>
          </div>
          {data.navigation.length > 0 && (
            <BottomNavigation items={data.navigation} onOpen={setSheet} />
          )}
        </div>
      </div>
      <FloatingConciergeButton
        enabled={conciergeEnabled}
        prefersReducedMotion={prefersReducedMotion}
        onOpen={() => {
          setSheet("chat");
          setSelectedAccommodation(null);
        }}
      />
      {sheet && (
        <GuideSheet
          kind={sheet}
          data={{ ...data, accommodations }}
          locale={locale}
          initialAccommodationId={selectedAccommodation}
          onOpenSheet={setSheet}
          onClose={() => {
            setSheet(null);
            setSelectedAccommodation(null);
          }}
        />
      )}
      {selectedVideo && (
        <MediaViewer
          media={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </main>
  );
}

export const GuideHome = GuideRenderer;
