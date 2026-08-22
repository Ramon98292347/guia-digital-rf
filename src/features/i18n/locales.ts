export const SUPPORTED_LOCALES = ["pt-BR", "en", "es"] as const;

export type GuideLocale = (typeof SUPPORTED_LOCALES)[number];

export type GuideDictionary = {
  localeLabel: string;
  guestGuide: string;
  welcome: string;
  accommodations: string;
  reservations: string;
  wifi: string;
  howToGetThere: string;
  contact: string;
  gallery: string;
  localTips: string;
  videos: string;
  rules: string;
  viewAll: string;
  viewDetails: string;
  bookNow: string;
  openMap: string;
  openVideo: string;
  copyPassword: string;
  showPassword: string;
  close: string;
  noContent: string;
  allAreas: string;
  currentLocale: string;
  selectLanguage: string;
};

const dictionaries: Record<GuideLocale, GuideDictionary> = {
  "pt-BR": {
    localeLabel: "PT",
    guestGuide: "Guia do Hóspede",
    welcome: "Seja bem-vindo!",
    accommodations: "Acomodações",
    reservations: "Reservas",
    wifi: "Wi‑Fi",
    howToGetThere: "Como chegar",
    contact: "Contato",
    gallery: "Galeria",
    localTips: "Dicas da região",
    videos: "Vídeos",
    rules: "Regras",
    viewAll: "Ver todas",
    viewDetails: "Ver detalhes",
    bookNow: "Fazer reserva",
    openMap: "Abrir no mapa",
    openVideo: "Ver vídeo",
    copyPassword: "Copiar senha",
    showPassword: "Mostrar senha",
    close: "Fechar",
    noContent: "Conteúdo sendo atualizado.",
    allAreas: "Todas as áreas",
    currentLocale: "Idioma atual",
    selectLanguage: "Idioma",
  },
  en: {
    localeLabel: "EN",
    guestGuide: "Guest Guide",
    welcome: "Welcome!",
    accommodations: "Accommodations",
    reservations: "Reservations",
    wifi: "Wi‑Fi",
    howToGetThere: "How to get there",
    contact: "Contact",
    gallery: "Gallery",
    localTips: "Local tips",
    videos: "Videos",
    rules: "Rules",
    viewAll: "View all",
    viewDetails: "View details",
    bookNow: "Book now",
    openMap: "Open map",
    openVideo: "Watch video",
    copyPassword: "Copy password",
    showPassword: "Show password",
    close: "Close",
    noContent: "Content being updated.",
    allAreas: "All areas",
    currentLocale: "Current language",
    selectLanguage: "Language",
  },
  es: {
    localeLabel: "ES",
    guestGuide: "Guía del Huésped",
    welcome: "¡Bienvenido!",
    accommodations: "Alojamientos",
    reservations: "Reservas",
    wifi: "Wi‑Fi",
    howToGetThere: "Cómo llegar",
    contact: "Contacto",
    gallery: "Galería",
    localTips: "Consejos de la zona",
    videos: "Videos",
    rules: "Reglas",
    viewAll: "Ver todo",
    viewDetails: "Ver detalles",
    bookNow: "Reservar",
    openMap: "Abrir mapa",
    openVideo: "Ver video",
    copyPassword: "Copiar contraseña",
    showPassword: "Mostrar contraseña",
    close: "Cerrar",
    noContent: "Contenido en actualización.",
    allAreas: "Todas las áreas",
    currentLocale: "Idioma actual",
    selectLanguage: "Idioma",
  },
};

export function normalizeLocale(value?: string | null): GuideLocale {
  const candidate = (value ?? "pt-BR").trim();
  if (candidate.startsWith("pt")) return "pt-BR";
  if (candidate.startsWith("en")) return "en";
  if (candidate.startsWith("es")) return "es";
  return "pt-BR";
}

export function getGuideDictionary(locale?: string | null): GuideDictionary {
  return dictionaries[normalizeLocale(locale)];
}

export function getTenantLocaleSettings(settings: unknown): {
  defaultLocale: GuideLocale;
  enabledLocales: GuideLocale[];
} {
  const record =
    settings && typeof settings === "object" && !Array.isArray(settings)
      ? (settings as Record<string, unknown>)
      : {};
   const defaultLocale = normalizeLocale(
     typeof record.defaultLocale === "string"
       ? record.defaultLocale
       : typeof record.default_locale === "string"
         ? record.default_locale
         : undefined,
   );

  const enabledRaw = Array.isArray(record.enabledLocales)
    ? record.enabledLocales
    : Array.isArray(record.enabled_locales)
      ? record.enabled_locales
      : [defaultLocale];

  const enabledLocales = Array.from(
    new Set(
      enabledRaw
        .filter((value): value is string => typeof value === "string")
        .map((value) => normalizeLocale(value))
        .filter((value): value is GuideLocale => SUPPORTED_LOCALES.includes(value as GuideLocale)),
    ),
  );

  return {
    defaultLocale,
    enabledLocales: enabledLocales.length > 0 ? enabledLocales : [defaultLocale],
  };
}
