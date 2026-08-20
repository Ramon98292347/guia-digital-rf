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
const accentClasses = [
  "text-[#4eb5b3]",
  "text-[#e19442]",
  "text-[#4eb5b3]",
  "text-[#8d44a1]",
  "text-[#4eb5b3]",
  "text-[#e19442]",
  "text-[#e19442]",
  "text-[#4eb5b3]",
  "text-[#8d44a1]",
];

function getIcon(name: string | null | undefined) {
  return iconMap[(name ?? "compass") as keyof typeof iconMap] ?? Compass;
}
function themeStyle(data: PublicGuideData): ThemeStyle {
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
    "--guide-border": data.theme.borderColor,
    "--guide-muted": data.theme.mutedColor,
    "--guide-muted-bg": data.theme.secondaryColor,
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
    ? "max-w-[200px]"
    : value === "large"
      ? "max-w-[380px]"
      : "max-w-[300px]";
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
        className="mb-2 size-7 text-[var(--guide-primary)] opacity-75"
        aria-hidden="true"
      />
      <p className="font-medium text-[var(--guide-foreground)]">{title}</p>
      <p className="mt-1 text-xs leading-5">{message}</p>
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
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50"
      style={{
        right: "calc(max(1rem, ((100vw - min(100vw, 440px)) / 2) + 1rem))",
      }}
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full border border-[var(--guide-primary)]/45 bg-[var(--guide-primary)]/15",
          prefersReducedMotion ? "hidden" : "animate-pulse",
        )}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "pointer-events-auto relative flex size-12 items-center justify-center rounded-full border border-white/40 bg-[var(--guide-primary)] text-white shadow-[0_10px_30px_rgba(67,47,36,0.2)] transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--guide-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--guide-background)] sm:size-14",
          prefersReducedMotion ? "" : "hover:-translate-y-0.5",
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
  onOpen,
}: {
  data: PublicGuideData;
  onOpen: (kind: SheetKind) => void;
}) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([{ role: "assistant", text: data.concierge.welcomeMessage }]);
  const [isSending, setIsSending] = useState(false);
  const suggestions = [
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
        {data.concierge.avatarUrl ? <img src={data.concierge.avatarUrl} alt="" className="size-11 rounded-full object-cover" /> : <span className="flex size-11 items-center justify-center rounded-full bg-[var(--guide-primary)] text-white"><Bot className="size-5" /></span>}
        <div><p className="font-semibold text-[var(--guide-foreground)]">{data.concierge.assistantName}</p><p className="text-xs">Online para ajudar</p></div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {messages.map((message, index) => message.role === "actions" ? (
          <div key={`actions-${index}`} className="flex flex-wrap gap-2">
            {message.text.split("||").map((action: string) => {
              const [label, kind, href = ""] = action.split("::");
              const commonClassName = "rounded-full bg-[var(--guide-primary)] px-3 py-1.5 text-xs font-medium text-white";
              if (href) {
                return <a key={action} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className={commonClassName}>{label}</a>;
              }
              return <button key={action} type="button" onClick={() => onOpen(actionKinds[kind] ?? "content")} className={commonClassName}>{label}</button>;
            })}
          </div>
        ) : <div key={`${message.role}-${index}`} className={cn("max-w-[88%] rounded-2xl p-3 text-sm", message.role === "user" ? "ml-auto bg-[var(--guide-primary)] text-white" : "bg-[var(--guide-muted-bg)] text-[var(--guide-foreground)]")}>{message.text}</div>) }
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">{suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => send(suggestion)} className="shrink-0 rounded-full border border-[var(--guide-border)] bg-[var(--guide-muted-bg)] px-3 py-1.5 text-xs font-medium text-[var(--guide-foreground)]">{suggestion}</button>)}</div>
      <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="flex gap-2 border-t border-[var(--guide-border)] pt-3"><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Digite sua dúvida..." className="min-w-0 flex-1 rounded-xl border border-[var(--guide-border)] bg-white px-3 py-2.5 text-sm text-[var(--guide-foreground)] outline-none focus:ring-2 focus:ring-[var(--guide-primary)]" disabled={isSending} /><button type="submit" disabled={isSending || !question.trim()} className="rounded-xl bg-[var(--guide-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Enviar</button></form>
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
      {actions.map((action, index) => {
        const Icon = getIcon(action.icon);
        const accent = accentClasses[index % accentClasses.length];
        return (
          <button
            key={`${action.label}-${action.target}`}
            type="button"
            onClick={() => onOpen(actionKind(action))}
      className="flex min-h-[84px] flex-col items-center justify-center rounded-[18px] border border-[#efe2d5] bg-white px-1.5 py-3 text-center shadow-[0_10px_24px_rgba(117,95,74,0.16)] transition-all hover:-translate-y-0.5 hover:border-[var(--guide-primary)] hover:bg-[var(--guide-primary)]/10 hover:shadow-[0_12px_26px_color-mix(in_srgb,var(--guide-primary)_28%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--guide-primary)] active:scale-[0.98] active:bg-[var(--guide-primary)]/15"
          >
            <Icon className={cn("mb-2 size-6", accent)} aria-hidden="true" />
            <span className={cn("text-[11px] font-medium leading-4", accent)}>
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}


function BottomNavigation({
  items,
  onOpen,
}: {
  items: PublicGuideNavigationItem[];
  onOpen: (kind: SheetKind) => void;
}) {
  return (
    <nav
      className="border-t border-[var(--guide-border)] bg-[var(--guide-surface)]/95 px-1.5 pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur"
      aria-label="Navegação principal"
    >
      <div className="grid grid-cols-5 gap-0.5">
        {items.slice(0, 5).map((item) => {
          const Icon = getIcon(item.icon);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                item.destination === "#topo"
                  ? window.scrollTo({ top: 0, behavior: "smooth" })
                  : onOpen(item.destination === "#concierge" ? "chat" : "tips")
              }
              className={cn(
                "flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-[13px] px-1 text-[9px] font-medium text-[var(--guide-muted)]",
                item.highlighted && "bg-[var(--guide-primary)] text-white",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function AccommodationDetail({
  item,
  onBack,
  onOpenMedia,
  reservationHref,
}: {
  item: PublicGuideAccommodation;
  onBack: () => void;
  onOpenMedia: (media: PublicGuideMedia) => void;
  reservationHref: string;
}) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-[var(--guide-primary)]"
      >
        ← Todas as acomodações
      </button>
      {item.imageUrl ? (
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
        <h3 className="text-xl font-semibold text-[var(--guide-foreground)]">
          {item.name}
        </h3>
      </div>
      {(item.capacity || item.area_m2 || item.view_description || item.bed_description) && (
        <div className="grid grid-cols-2 gap-2">
          {item.capacity ? <AccommodationFact icon={Users} label="Ocup. máx." value={`${item.capacity} pessoas`} /> : null}
          {item.area_m2 ? <AccommodationFact icon={Maximize} label="Área" value={`${item.area_m2} m²`} /> : null}
          {item.view_description ? <AccommodationFact icon={Waves} label="Vista" value={item.view_description} /> : null}
          {item.bed_description ? <AccommodationFact icon={Bed} label="Cama" value={item.bed_description} /> : null}
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-[var(--guide-foreground)]">Descrição</p>
        <p className="mt-1 text-sm leading-6 text-[var(--guide-foreground)]">
          {item.description ?? item.short_description ?? "Informações desta acomodação estão sendo atualizadas."}
        </p>
      </div>
      {item.amenities.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--guide-foreground)]">
            Comodidades principais
          </p>
          <div className="grid grid-cols-2 gap-2">
            {item.amenities.map((amenity) => {
              const Icon = getIcon(amenity.icon);
              return <span key={amenity.id} className="flex items-center gap-2 rounded-xl bg-[var(--guide-muted-bg)] px-3 py-2 text-sm text-[var(--guide-foreground)]"><Icon className="size-4 shrink-0 text-[var(--guide-primary)]" aria-hidden="true" />{amenity.name}</span>;
            })}
          </div>
        </div>
      )}
      {item.media.some((media) => media.mediaType === "image") && <p className="text-sm font-semibold uppercase tracking-wide text-[var(--guide-foreground)]">Fotos da acomodação</p>}
      {item.rules.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-[var(--guide-foreground)]">
            Orientações
          </p>
          <div className="space-y-2">
            {item.rules.map((rule) => (
              <article
                key={rule.id}
                className="rounded-xl bg-[var(--guide-muted-bg)] p-3"
              >
                <p className="font-medium text-[var(--guide-foreground)]">
                  {rule.title}
                </p>
                <p>{rule.content}</p>
              </article>
            ))}
          </div>
        </div>
      )}
      {item.contentItems.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-[var(--guide-foreground)]">
            Informações
          </p>
          {item.contentItems.map((content) => (
            <article
              key={content.id}
              className="rounded-xl bg-[var(--guide-muted-bg)] p-3"
            >
              <p className="font-medium text-[var(--guide-foreground)]">
                {content.title}
              </p>
              <p>{content.description}</p>
            </article>
          ))}
        </div>
      )}
      {item.media.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {item.media.map((media) =>
            media.mediaType === "video" ? (
              <button key={media.id} type="button" onClick={() => onOpenMedia(media)} className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[var(--guide-muted-bg)] text-sm font-medium text-[var(--guide-primary)]">Ver vídeo</button>
            ) : (
              <button key={media.id} type="button" onClick={() => onOpenMedia(media)} className="block aspect-square overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--guide-primary)]" aria-label={`Abrir foto de ${item.name}`}>
                <img src={media.url} alt={media.altText ?? item.name} loading="lazy" className="h-full w-full object-cover" />
              </button>
            ),
          )}
        </div>
      )}
      {(item.booking_url ?? reservationHref) ? <a
        href={item.booking_url ?? reservationHref!}
        target="_blank"
        rel="noreferrer"
        className={cn(
          buttonVariants({ size: "sm" }),
          "mt-2 rounded-full bg-[var(--guide-primary)] text-white",
        )}
      >
        Fazer reserva <ChevronRight className="size-4" />
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
    <div className="rounded-xl border border-[var(--guide-border)] bg-[var(--guide-surface)] p-3 text-[var(--guide-foreground,#1f2937)] shadow-sm">
      <Icon className="mb-2 size-5 text-[var(--guide-primary,#365c4b)]" aria-hidden="true" />
      <p className="text-xs font-medium text-[var(--guide-foreground,#1f2937)]">{label}</p>
      <p className="mt-0.5 font-semibold leading-5 text-[var(--guide-foreground,#1f2937)]">{value}</p>
    </div>
  );
}

function GuideSheet({
  kind,
  data,
  onClose,
  initialAccommodationId,
  onOpenSheet,
}: {
  kind: SheetKind;
  data: PublicGuideData;
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
  const title = {
    wifi: "Wi-Fi",
    accommodations: "Acomodações",
    reservas: "Reservas",
    contact: "Contato",
    map: "Como chegar",
    gallery: "Galeria",
    videos: "Vídeos informativos",
    food: "Serviços",
    rules: "Regras",
    benefit: "Benefício de retorno",
    tips: "Dicas da região",
    content: "Conteúdos do Guia",
    chat: "Concierge 24h",
  }[kind];
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-0 sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-sheet-title"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className="max-h-[92dvh] w-full max-w-[720px] overflow-y-auto rounded-t-[28px] bg-[var(--guide-surface)] shadow-[0_-20px_70px_rgba(67,47,36,0.22)] sm:rounded-[28px]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--guide-border)] bg-[var(--guide-surface)]/95 px-5 py-4 backdrop-blur">
          <div>
            <span className="mb-1 block h-1 w-9 rounded-full bg-[var(--guide-border)] sm:hidden" />
            <h2
              id="guide-sheet-title"
              className="text-xl font-semibold text-[var(--guide-foreground)]"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-2 text-[var(--guide-foreground)] hover:bg-[var(--guide-muted-bg)]"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-4 px-5 pb-7 pt-5 text-sm leading-6 text-[var(--guide-muted)]">
          {kind === "wifi" && (
            <>
              {data.wifi ? (
                <>
                  <div className="rounded-2xl bg-[var(--guide-muted-bg)] p-4">
                    <p className="text-xs uppercase tracking-[.18em]">Nome da rede</p>
                    <p className="font-medium text-[var(--guide-foreground)]">{data.wifi.name}</p>
                    <p className="mt-3 text-xs uppercase tracking-[.18em]">SSID</p>
                    <p className="font-medium text-[var(--guide-foreground)]">
                      {data.wifi.ssid}
                    </p>
                    {data.wifi.area && <p className="mt-3 text-xs text-[var(--guide-foreground)]">Área: {data.wifi.area}</p>}
                    <p className="mt-3 text-xs uppercase tracking-[.18em]">
                      Senha
                    </p>
                    <p className="font-medium text-[var(--guide-foreground)]">
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
                      {showWifiPassword ? "Ocultar senha" : "Mostrar senha"}
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
                      Copiar senha <Copy className="size-4" />
                    </button>
                  </div>
                  {wifiFeedback && <p role="status" className="text-xs font-medium text-[var(--guide-foreground)]">{wifiFeedback}</p>}
                  {data.wifi.imageUrl && <img src={data.wifi.imageUrl} alt="Foto da rede Wi-Fi" className="w-full rounded-xl object-cover" />}
                  {data.wifi.video && <button type="button" onClick={() => setSelectedVideo(data.wifi?.video ?? null)} className="inline-flex items-center gap-2 font-medium text-[var(--guide-primary)]">Ver vídeo <PlayCircle className="size-4" /></button>}
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
                  "w-full rounded-full bg-[#8d44a1] text-white",
                )}
              >
                {data.booking.label} <ExternalLink className="size-4" />
              </a>
              {data.contact.phone && (
                <a
                  href={`tel:${data.contact.phone}`}
                  className="block text-center font-medium text-[#4eb5b3]"
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
              <p>
                {data.contact.address ??
                  "Endereço será configurado pelo estabelecimento."}
              </p>
              {data.contact.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.contact.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full rounded-full bg-[#5ec5c0] text-white",
                  )}
                >
                  Abrir no mapa <ExternalLink className="size-4" />
                </a>
              )}
            </>
          )}
          {kind === "gallery" &&
            (data.publishedMedia.length ? (
              <div className="grid grid-cols-2 gap-2">
                {data.publishedMedia.map((item) => (
                  <GalleryCard
                    key={item.id}
                    media={item}
                    onClick={() =>
                      item.mediaType === "video"
                        ? setSelectedVideo(item)
                        : undefined
                    }
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
            (data.publishedMedia.filter((item) => item.mediaType === "video")
              .length ? (
              <div className="space-y-2">
                {data.publishedMedia
                  .filter((item) => item.mediaType === "video")
                  .map((item) => (
                    <VideoCard
                      key={item.id}
                      media={item}
                      onClick={() => setSelectedVideo(item)}
                    />
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
                    <p className="mt-1 text-sm leading-6 text-[var(--guide-muted)]">
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
              {data.contentCollections.some((collection) =>
                collection.items.some(
                  (item) =>
                    item.discountText ||
                    item.couponCode ||
                    item.validityText ||
                    item.description ||
                    collection.kind === "promotion",
                ),
              ) ? (
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
                <article key={tip.id} className="rounded-2xl bg-[#f8efe6] p-4">
                  <h3 className="font-semibold text-[#543f39]">{tip.name}</h3>
                  <p>
                    {tip.short_description ??
                      tip.description ??
                      "Informação em configuração."}
                  </p>
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
                      className="rounded-2xl bg-[var(--guide-muted-bg)] p-4"
                    >
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
            <ConciergePanel data={data} onOpen={onOpenSheet} />
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
  onOpen,
  onOpenAccommodation,
}: {
  type: string;
  data: PublicGuideData;
  onOpen: (kind: SheetKind) => void;
  onOpenAccommodation: (id: string) => void;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoplayPausedRef = useRef(false);
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
  if (type === "accommodations")
    return (
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--guide-foreground)]">
            Acomodações
          </h2>
          <button
            type="button"
            onClick={() => onOpen("accommodations")}
            className="text-xs font-medium text-[var(--guide-primary)]"
          >
            Ver todas
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
                <button type="button" aria-label="Ver todas as acomodações" onClick={() => onOpen("accommodations")} className="text-xs font-medium text-[var(--guide-primary)]">Ver todas</button>
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
  if (type === "videos")
    return (
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--guide-foreground)]">
            Vídeos informativos
          </h2>
          <button
            type="button"
            onClick={() => onOpen("videos")}
            className="text-xs font-medium text-[var(--guide-primary)]"
          >
            Ver vídeos
          </button>
        </div>
        {data.publishedMedia.some((item) => item.mediaType === "video") ? (
          <div className="space-y-2">
            {data.publishedMedia
              .filter((item) => item.mediaType === "video")
              .slice(0, 2)
              .map((item) => (
                <VideoCard
                  key={item.id}
                  media={item}
                  onClick={() => onOpen("videos")}
                />
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
  if (type === "services")
    return (
      <section className="mt-5">
        <h2 className="mb-2 text-base font-semibold text-[var(--guide-foreground)]">
          Serviços
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
  if (type === "gallery")
    return (
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--guide-foreground)]">
            Galeria
          </h2>
          <button
            type="button"
            onClick={() => onOpen("gallery")}
            className="text-xs font-medium text-[var(--guide-primary)]"
          >
            Abrir galeria
          </button>
        </div>
        {data.publishedMedia.length > 0 ? (
          <img
            src={data.publishedMedia[0]?.url}
            alt={data.publishedMedia[0]?.altText ?? "Galeria"}
            loading="lazy"
            className="aspect-[16/8] w-full rounded-2xl object-cover"
          />
        ) : (
          <GuideEmptyState
            title="Galeria"
            message="Estamos preparando novas fotos."
            icon={Images}
          />
        )}
      </section>
    );
  if (type === "local_tips")
    return (
      <section className="mt-5">
        <h2 className="mb-2 text-base font-semibold text-[var(--guide-foreground)]">
          Dicas da região
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
          <h2 className="text-base font-semibold text-[var(--guide-foreground)]">
            Informações
          </h2>
          <button
            type="button"
            onClick={() => onOpen("content")}
            className="text-xs font-medium text-[var(--guide-primary)]"
          >
            Ver conteúdos
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
          className="w-full rounded-2xl bg-[var(--guide-primary)] px-4 py-3 text-sm font-semibold text-white"
        >
          {data.booking.href ? data.booking.label : "Reservas"}
        </button>
      </section>
    );
  return null;
}

export function GuideRenderer({ data }: GuideHomeProps) {
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState<string | null>(null);
  const [accommodations, setAccommodations] = useState(data.accommodations);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const sourceAccommodations = data.accommodations;
  const tenantId = data.tenant.tenant_id;
  const conciergeEnabled = data.concierge.enabled;
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
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
  const hasValidBenefitContent = data.contentCollections.some((collection) =>
    collection.kind === "promotion" ||
    collection.items.some((item) =>
      Boolean(
        item.title ||
          item.description ||
          item.discountText ||
          item.validityText ||
          item.couponCode ||
          item.instructions ||
          item.alertText ||
          item.externalUrl ||
          item.contactUrl,
      ),
    ),
  );
  const fallbackTypes = [
    data.accommodations.length > 0 ? "accommodations" : null,
    data.publishedMedia.some((item) => item.mediaType === "video")
      ? "videos"
      : null,
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
  ];
  return (
    <main
      style={themeStyle(data)}
      className="relative min-h-dvh overflow-x-hidden bg-[var(--guide-background)] text-[var(--guide-foreground)]"
    >
      <div className="relative mx-auto min-h-dvh w-full max-w-[440px] px-3 pb-3 pt-3 sm:pt-6">
        <div className="overflow-hidden rounded-[34px] bg-transparent shadow-none">
          <div id="topo" className="px-0 pb-4">
            {data.design.heroEnabled && (
              <div
                className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[30px] rounded-b-[26px] bg-[var(--guide-muted-bg)]"
                style={
                  data.design.heroImagePath
                    ? {
                        backgroundImage: `url(${data.design.heroImagePath})`,
                        backgroundPosition: data.design.heroMediaPosition
                          ? heroPosition(data.design.heroMediaPosition)
                          : "center bottom",
                        backgroundSize: "100% auto",
                        backgroundRepeat: "no-repeat",
                      }
                    : undefined
                }
              >
                <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pb-2 pt-4 text-xs text-black drop-shadow-[0_1px_2px_rgba(255,255,255,.75)]">
                  <span className="font-semibold">09:41</span>
                  <span suppressHydrationWarning>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date())}</span>
                </div>
                {data.design.logoEnabled && (
                  <div className="absolute inset-x-0 top-16 z-10 flex justify-center px-5">
                    {data.design.logoPath ? (
                      <img
                        src={data.design.logoPath}
                        alt={data.tenant.name}
                        className={cn(
                          "h-auto w-full object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,.2)]",
                          logoSizeClass(data.design.logoSize),
                        )}
                      />
                    ) : (
                      <span className="max-w-full text-center text-sm font-semibold tracking-[.12em] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,.45)]">
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
                    className="absolute bottom-0 left-0 w-full"
                  />
                )}
                  <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-28 pt-32 text-center text-[var(--guide-primary)] drop-shadow-[0_1px_3px_rgba(255,255,255,.9)]">
                  <h1 className="text-[28px] font-semibold leading-tight text-white">
                    {data.design.heroTitle ?? "Bem-vindo(a)!"}
                  </h1>
                  <p className="mt-1 text-base font-medium leading-6 text-white">
                    {data.design.heroSubtitle ??
                      data.design.welcomeMessage ??
                      "Sua experiência começa aqui."}
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
                  onOpen={setSheet}
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
          initialAccommodationId={selectedAccommodation}
          onOpenSheet={setSheet}
          onClose={() => {
            setSheet(null);
            setSelectedAccommodation(null);
          }}
        />
      )}
    </main>
  );
}

export const GuideHome = GuideRenderer;
