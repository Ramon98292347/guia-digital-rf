/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import {
  BedDouble,
  Bot,
  CalendarDays,
  Camera,
  ChevronRight,
  Compass,
  Copy,
  ExternalLink,
  House,
  Images,
  MapPinned,
  MessageCircleMore,
  MoreHorizontal,
  PhoneCall,
  PlayCircle,
  SignpostBig,
  UtensilsCrossed,
  Wifi,
  X,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  PublicGuideAccommodation,
  PublicGuideData,
  PublicGuideNavigationItem,
  PublicGuideQuickAction,
} from "@/features/public-guide/server/service";
import {
  ContactCard,
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
  | "tips"
  | "content"
  | "chat";

const iconMap = {
  bed: BedDouble,
  bot: Bot,
  calendar: CalendarDays,
  chat: MessageCircleMore,
  compass: Compass,
  gallery: Images,
  house: House,
  map: MapPinned,
  more: MoreHorizontal,
  phone: PhoneCall,
  play: PlayCircle,
  signpost: SignpostBig,
  utensils: UtensilsCrossed,
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
  if (icon === "wifi") return "wifi";
  if (icon === "bed") return "accommodations";
  if (icon === "calendar") return "reservas";
  if (icon === "phone") return "contact";
  if (icon === "map") return "map";
  if (icon === "gallery") return "gallery";
  if (icon === "play" || icon === "video") return "videos";
  if (icon === "utensils") return "food";
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

function GuideFooter({ data }: { data: PublicGuideData }) {
  const actions = [
    data.contact.whatsapp
      ? {
          label: "WhatsApp",
          href: `https://wa.me/${data.contact.whatsapp.replace(/\D/g, "")}`,
          icon: MessageCircleMore,
        }
      : null,
    data.contact.phone
      ? { label: "Contato", href: `tel:${data.contact.phone}`, icon: PhoneCall }
      : null,
    data.contact.instagram
      ? { label: "Instagram", href: data.contact.instagram, icon: Camera }
      : null,
    data.booking.href
      ? { label: "Reservas", href: data.booking.href, icon: CalendarDays }
      : null,
    data.contact.address
      ? {
          label: "Localização",
          href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.contact.address)}`,
          icon: MapPinned,
        }
      : null,
    data.contact.website
      ? { label: "Site", href: data.contact.website, icon: ExternalLink }
      : null,
  ]
    .filter(
      (
        action,
      ): action is {
        label: string;
        href: string;
        icon: typeof MessageCircleMore;
      } => Boolean(action),
    )
    .slice(0, 4);
  const variant = ["minimal", "elegant", "organic"].includes(
    data.design.footerVariant ?? "",
  )
    ? data.design.footerVariant
    : "elegant";
  return (
    <footer
      className={cn(
        "mt-7 border-t px-4 pb-7 pt-7 text-center",
        variant === "organic"
          ? "rounded-t-[38px] border-[var(--guide-border)] bg-[var(--guide-muted-bg)]"
          : "border-[var(--guide-border)]",
      )}
    >
      <div className="mx-auto flex max-w-[320px] flex-col items-center">
        <div className="flex min-h-12 items-center justify-center">
          {data.branding.logoPath ? (
            <img
              src={data.branding.logoPath}
              alt={data.tenant.name}
              loading="lazy"
              className="max-h-12 w-auto max-w-[180px] object-contain"
            />
          ) : (
            <span className="text-lg font-semibold text-[var(--guide-foreground)]">
              {data.tenant.name}
            </span>
          )}
        </div>
        <p className="mt-4 max-w-[270px] text-sm leading-6 text-[var(--guide-muted)]">
          {data.design.footerMessage ??
            "Esperamos que sua experiência seja inesquecível."}
        </p>
        {actions.length > 0 && (
          <div className="mt-5 flex max-w-full flex-wrap justify-center gap-2">
            {actions.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[var(--guide-border)] px-3 py-2 text-xs font-medium text-[var(--guide-foreground)] transition-colors hover:bg-[var(--guide-surface)]"
              >
                <Icon
                  className="size-3.5 text-[var(--guide-primary)]"
                  aria-hidden="true"
                />
                {label}
              </a>
            ))}
          </div>
        )}
        <p className="mt-6 text-[11px] text-[var(--guide-muted)]">
          © {new Date().getFullYear()} {data.tenant.name}
        </p>
        <p className="mt-1 text-[10px] tracking-wide text-[var(--guide-muted)]/75">
          Tecnologia por RF Tecnologia
        </p>
      </div>
    </footer>
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
  reservationHref,
}: {
  item: PublicGuideAccommodation;
  onBack: () => void;
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
        <img
          src={item.imageUrl}
          alt={item.name}
          className="aspect-[16/9] w-full rounded-2xl object-cover"
        />
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
        <p className="mt-2">
          {item.description ??
            item.short_description ??
            "Informações desta acomodação estão sendo atualizadas."}
        </p>
        {item.capacity && (
          <p className="mt-2 text-xs text-[var(--guide-muted)]">
            Capacidade: {item.capacity}
          </p>
        )}
      </div>
      {item.amenities.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-[var(--guide-foreground)]">
            Comodidades
          </p>
          <div className="flex flex-wrap gap-2">
            {item.amenities.map((amenity) => (
              <span
                key={amenity.id}
                className="rounded-full bg-[var(--guide-muted-bg)] px-3 py-1 text-xs"
              >
                {amenity.name}
              </span>
            ))}
          </div>
        </div>
      )}
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
              <video
                key={media.id}
                src={media.url}
                controls
                preload="metadata"
                className="aspect-square w-full rounded-xl object-cover"
              />
            ) : (
              <img
                key={media.id}
                src={media.url}
                alt={media.altText ?? item.name}
                loading="lazy"
                className="aspect-square w-full rounded-xl object-cover"
              />
            ),
          )}
        </div>
      )}
      <a
        href={item.booking_url ?? reservationHref}
        target="_blank"
        rel="noreferrer"
        className={cn(
          buttonVariants({ size: "sm" }),
          "mt-2 rounded-full bg-[var(--guide-primary)] text-white",
        )}
      >
        Ver detalhes / Reservar <ChevronRight className="size-4" />
      </a>
    </div>
  );
}

function GuideSheet({
  kind,
  data,
  onClose,
}: {
  kind: SheetKind;
  data: PublicGuideData;
  onClose: () => void;
}) {
  const [selectedAccommodation, setSelectedAccommodation] = useState<
    string | null
  >(null);
  const [selectedVideo, setSelectedVideo] = useState<
    PublicGuideData["publishedMedia"][number] | null
  >(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null,
  );
  const [showWifiPassword, setShowWifiPassword] = useState(false);
  const reservationHref = data.booking.href ?? "#";
  const title = {
    wifi: "Wi-Fi",
    accommodations: "Acomodações",
    reservas: "Reservas",
    contact: "Contato",
    map: "Como chegar",
    gallery: "Galeria",
    videos: "Vídeos informativos",
    food: "Serviços",
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
      <section className="max-h-[88dvh] w-full max-w-[520px] overflow-y-auto rounded-t-[28px] bg-[var(--guide-surface)] shadow-[0_-20px_70px_rgba(67,47,36,0.22)] sm:rounded-[28px]">
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
                    <p className="text-xs uppercase tracking-[.18em]">Rede</p>
                    <p className="font-medium text-[var(--guide-foreground)]">
                      {data.wifi.ssid}
                    </p>
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
                      onClick={() =>
                        data.wifi &&
                        navigator.clipboard?.writeText(data.wifi.password ?? "")
                      }
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "h-10 rounded-full",
                      )}
                    >
                      Copiar senha <Copy className="size-4" />
                    </button>
                  </div>
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
                reservationHref={reservationHref}
              />
            ) : data.accommodations.length ? (
              data.accommodations.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-[var(--guide-border)]"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="aspect-[16/9] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[16/9] items-center justify-center bg-[var(--guide-muted-bg)]">
                      <BedDouble
                        className="size-10 text-[var(--guide-primary)] opacity-60"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-[var(--guide-foreground)]">
                      {item.name}
                    </h3>
                    <p className="mt-1">
                      {item.short_description ??
                        "Informações desta acomodação estão sendo atualizadas."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedAccommodation(item.id)}
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "mt-4 rounded-full bg-[var(--guide-primary)] text-white",
                      )}
                    >
                      Conhecer <ChevronRight className="size-4" />
                    </button>
                  </div>
                </article>
              ))
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
                      {item.media.map((media) =>
                        media.mediaType === "video" ? (
                          <video
                            key={media.id}
                            src={media.url}
                            controls
                            preload="metadata"
                            className="mt-3 w-full rounded-xl"
                          />
                        ) : (
                          <img
                            key={media.id}
                            src={media.url}
                            alt={media.altText ?? item.title}
                            loading="lazy"
                            className="mt-3 w-full rounded-xl"
                          />
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
            <div className="min-h-[45dvh] space-y-3 rounded-2xl bg-[#f8efe6] p-4">
              <div className="max-w-[88%] rounded-2xl bg-white p-3">
                Olá! Como posso ajudar durante sua estadia?
              </div>
              <div className="ml-auto max-w-[88%] rounded-2xl bg-[#5ec5c0] p-3 text-white">
                O Concierge visual estará conectado aos dados do estabelecimento
                em uma próxima etapa.
              </div>
            </div>
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
}: {
  type: string;
  data: PublicGuideData;
  onOpen: (kind: SheetKind) => void;
}) {
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
          <div className="flex gap-3 overflow-x-auto pb-1">
            {data.accommodations.slice(0, 3).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpen("accommodations")}
                className="min-w-[190px] overflow-hidden rounded-2xl border border-[var(--guide-border)] bg-[var(--guide-surface)] text-left"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-[var(--guide-muted-bg)]">
                    <BedDouble
                      className="size-10 text-[var(--guide-primary)] opacity-60"
                      aria-hidden="true"
                    />
                  </div>
                )}
                <span className="block p-3 text-sm font-medium text-[var(--guide-foreground)]">
                  {item.name}
                </span>
              </button>
            ))}
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
  const configuredTypes = new Set(
    data.sections.map((section) => section.section_type),
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
  ].filter(
    (type): type is string => type !== null && !configuredTypes.has(type),
  );
  const visibleSectionTypes = [
    ...data.sections
      .filter((section) => section.enabled)
      .map((section) => section.section_type),
    ...fallbackTypes,
  ];
  return (
    <main
      style={themeStyle(data)}
      className="min-h-dvh overflow-x-hidden bg-[var(--guide-background)] text-[var(--guide-foreground)]"
    >
      <div className="mx-auto min-h-dvh w-full max-w-[440px] px-3 pb-3 pt-3 sm:pt-6">
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
                  data={data}
                  onOpen={setSheet}
                />
              ))}
            </div>
            <p
              className="px-2 pb-0 pt-5 text-center font-serif text-[21px] italic leading-tight"
              style={{ color: "var(--guide-accent)" }}
            >
              {data.design.signature}
            </p>
            <GuideFooter data={data} />
          </div>
          {data.navigation.length > 0 && (
            <BottomNavigation items={data.navigation} onOpen={setSheet} />
          )}
        </div>
      </div>
      {sheet && (
        <GuideSheet kind={sheet} data={data} onClose={() => setSheet(null)} />
      )}
    </main>
  );
}

export const GuideHome = GuideRenderer;
