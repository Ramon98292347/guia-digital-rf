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
  services: string;
  information: string;
  benefits: string;
  viewAll: string;
  viewDetails: string;
  bookNow: string;
  openMap: string;
  openVideo: string;
  copyPassword: string;
  showPassword: string;
  hidePassword: string;
  close: string;
  noContent: string;
  allAreas: string;
  currentLocale: string;
  selectLanguage: string;
  howCanWeHelp: string;
  openGallery: string;
  viewVideos: string;
  bookOrContact: string;
  allAreasShort: string;
  networkName: string;
  password: string;
  passwordFallback: string;
  wifiNotConfigured: string;
  copySuccess: string;
  copyError: string;
  allAccommodations: string;
  maxOccupancy: string;
  areaLabel: string;
  viewLabel: string;
  bedLabel: string;
  descriptionLabel: string;
  mainAmenities: string;
  photosLabel: string;
  orientationLabel: string;
  guideInformation: string;
  howToUse: string;
  openingSoon: string;
  contactUpdating: string;
  locationUpdating: string;
  galleryUpdating: string;
  localTipsUpdating: string;
  contentUpdating: string;
  details: string;
  mapOpen: string;
  wazeOpen: string;
  fullAddress: string;
  viewVideo: string;
  validUntil: string;
  coupon: string;
  address: string;
  virtualHost: string;
  network: string;
  ssid: string;
  area: string;
  unavailable: string;
  reserved: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
  contactInstagram: string;
  contactWebsite: string;
  openConcierge: string;
  consultantAvailable: string;
  askQuestionPlaceholder: string;
  send: string;
  homeLabel: string;
  general: string;
  ruleInfo: string;
  ruleImportant: string;
  ruleCritical: string;
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
    services: "Serviços",
    information: "Informações",
    benefits: "Benefícios",
    viewAll: "Ver todas",
    viewDetails: "Ver detalhes",
    bookNow: "Fazer reserva",
    openMap: "Abrir no mapa",
    openVideo: "Ver vídeo",
    copyPassword: "Copiar senha",
    showPassword: "Mostrar senha",
    hidePassword: "Ocultar senha",
    close: "Fechar",
    noContent: "Conteúdo sendo atualizado.",
    allAreas: "Todas as áreas",
    currentLocale: "Idioma atual",
    selectLanguage: "Idioma",
    howCanWeHelp: "Como podemos ajudar?",
    openGallery: "Abrir galeria",
    viewVideos: "Ver vídeos",
    bookOrContact: "Reservar / entrar em contato",
    allAreasShort: "Todas as áreas",
    networkName: "Nome da rede",
    password: "Senha",
    passwordFallback: "Não informada",
    wifiNotConfigured: "O Wi‑Fi ainda não foi configurado para os hóspedes.",
    copySuccess: "Senha copiada.",
    copyError: "Não foi possível copiar. Selecione a senha manualmente.",
    allAccommodations: "Todas as acomodações",
    maxOccupancy: "Ocup. máx.",
    areaLabel: "Área",
    viewLabel: "Vista",
    bedLabel: "Cama",
    descriptionLabel: "Descrição",
    mainAmenities: "Comodidades principais",
    photosLabel: "Fotos da acomodação",
    orientationLabel: "Orientações",
    guideInformation: "Informações",
    howToUse: "Como usar",
    openingSoon: "Em breve",
    contactUpdating: "Informações de contato sendo atualizadas.",
    locationUpdating: "Informações de localização sendo atualizadas.",
    galleryUpdating: "Galeria sendo atualizada.",
    localTipsUpdating: "As dicas da região serão configuradas pelo estabelecimento.",
    contentUpdating: "Conteúdo sendo atualizado.",
    details: "Detalhes",
    mapOpen: "Abrir no Google Maps",
    wazeOpen: "Abrir no Waze",
    fullAddress: "Ver endereço completo",
    viewVideo: "Ver vídeo",
    validUntil: "Validade",
    coupon: "Cupom",
    address: "Endereço",
    virtualHost: "Anfitrião Virtual",
    network: "Nome da rede",
    ssid: "SSID",
    area: "Área",
    unavailable: "Disponível para ajudar",
    reserved: "Reservado",
    contactPhone: "Telefone",
    contactWhatsapp: "WhatsApp",
    contactEmail: "E-mail",
    contactInstagram: "Instagram",
    contactWebsite: "Site",
    openConcierge: "Abrir concierge",
    consultantAvailable: "Disponível para ajudar",
    askQuestionPlaceholder: "Digite sua dúvida...",
    send: "Enviar",
    homeLabel: "Início",
    general: "Geral",
    ruleInfo: "Informativa",
    ruleImportant: "Importante",
    ruleCritical: "Crítica",
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
    services: "Services",
    information: "Information",
    benefits: "Benefits",
    viewAll: "View all",
    viewDetails: "View details",
    bookNow: "Book now",
    openMap: "Open map",
    openVideo: "Watch video",
    copyPassword: "Copy password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    close: "Close",
    noContent: "Content being updated.",
    allAreas: "All areas",
    currentLocale: "Current language",
    selectLanguage: "Language",
    howCanWeHelp: "How can we help?",
    openGallery: "Open gallery",
    viewVideos: "View videos",
    bookOrContact: "Book / contact us",
    allAreasShort: "All areas",
    networkName: "Network name",
    password: "Password",
    passwordFallback: "Not provided",
    wifiNotConfigured: "Wi‑Fi is not configured for guests yet.",
    copySuccess: "Password copied.",
    copyError: "Could not copy. Please select the password manually.",
    allAccommodations: "All accommodations",
    maxOccupancy: "Max. occupancy",
    areaLabel: "Area",
    viewLabel: "View",
    bedLabel: "Bed",
    descriptionLabel: "Description",
    mainAmenities: "Main amenities",
    photosLabel: "Accommodation photos",
    orientationLabel: "Guidance",
    guideInformation: "Information",
    howToUse: "How to use",
    openingSoon: "Coming soon",
    contactUpdating: "Contact information is being updated.",
    locationUpdating: "Location information is being updated.",
    galleryUpdating: "Gallery is being updated.",
    localTipsUpdating: "Local tips will be configured by the establishment.",
    contentUpdating: "Content is being updated.",
    details: "Details",
    mapOpen: "Open in Google Maps",
    wazeOpen: "Open in Waze",
    fullAddress: "View full address",
    viewVideo: "Watch video",
    validUntil: "Validity",
    coupon: "Coupon",
    address: "Address",
    virtualHost: "Virtual Host",
    network: "Network name",
    ssid: "SSID",
    area: "Area",
    unavailable: "Available to help",
    reserved: "Reserved",
    contactPhone: "Phone",
    contactWhatsapp: "WhatsApp",
    contactEmail: "E-mail",
    contactInstagram: "Instagram",
    contactWebsite: "Website",
    openConcierge: "Open concierge",
    consultantAvailable: "Available to help",
    askQuestionPlaceholder: "Type your question...",
    send: "Send",
    homeLabel: "Home",
    general: "General",
    ruleInfo: "Informative",
    ruleImportant: "Important",
    ruleCritical: "Critical",
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
    services: "Servicios",
    information: "Información",
    benefits: "Beneficios",
    viewAll: "Ver todo",
    viewDetails: "Ver detalles",
    bookNow: "Reservar",
    openMap: "Abrir mapa",
    openVideo: "Ver video",
    copyPassword: "Copiar contraseña",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    close: "Cerrar",
    noContent: "Contenido en actualización.",
    allAreas: "Todas las áreas",
    currentLocale: "Idioma actual",
    selectLanguage: "Idioma",
    howCanWeHelp: "¿Cómo podemos ayudar?",
    openGallery: "Abrir galería",
    viewVideos: "Ver videos",
    bookOrContact: "Reservar / contactar",
    allAreasShort: "Todas las áreas",
    networkName: "Nombre de la red",
    password: "Contraseña",
    passwordFallback: "No informada",
    wifiNotConfigured: "El Wi‑Fi aún no está configurado para los huéspedes.",
    copySuccess: "Contraseña copiada.",
    copyError: "No se pudo copiar. Selecciona la contraseña manualmente.",
    allAccommodations: "Todos los alojamientos",
    maxOccupancy: "Ocup. máx.",
    areaLabel: "Área",
    viewLabel: "Vista",
    bedLabel: "Cama",
    descriptionLabel: "Descripción",
    mainAmenities: "Comodidades principales",
    photosLabel: "Fotos del alojamiento",
    orientationLabel: "Orientaciones",
    guideInformation: "Información",
    howToUse: "Cómo usar",
    openingSoon: "Próximamente",
    contactUpdating: "La información de contacto se está actualizando.",
    locationUpdating: "La información de ubicación se está actualizando.",
    galleryUpdating: "La galería se está actualizando.",
    localTipsUpdating: "Los consejos de la zona serán configurados por el establecimiento.",
    contentUpdating: "Contenido en actualización.",
    details: "Detalles",
    mapOpen: "Abrir en Google Maps",
    wazeOpen: "Abrir en Waze",
    fullAddress: "Ver dirección completa",
    viewVideo: "Ver video",
    validUntil: "Vigencia",
    coupon: "Cupón",
    address: "Dirección",
    virtualHost: "Anfitrión Virtual",
    network: "Nombre de la red",
    ssid: "SSID",
    area: "Área",
    unavailable: "Disponible para ayudar",
    reserved: "Reservado",
    contactPhone: "Teléfono",
    contactWhatsapp: "WhatsApp",
    contactEmail: "Correo",
    contactInstagram: "Instagram",
    contactWebsite: "Sitio web",
    openConcierge: "Abrir concierge",
    consultantAvailable: "Disponible para ayudar",
    askQuestionPlaceholder: "Escribe tu duda...",
    send: "Enviar",
    homeLabel: "Inicio",
    general: "General",
    ruleInfo: "Informativa",
    ruleImportant: "Importante",
    ruleCritical: "Crítica",
  },
};

export function normalizeLocale(value?: string | null): GuideLocale {
  const candidate = (value ?? "pt-BR").trim();
  if (candidate.startsWith("pt")) return "pt-BR";
  if (candidate.startsWith("en")) return "en";
  if (candidate.startsWith("es")) return "es";
  return "pt-BR";
}

export function resolveBrowserLocale(fallbackLocale?: string | null): GuideLocale {
  if (typeof navigator === "undefined") {
    return normalizeLocale(fallbackLocale ?? "pt-BR");
  }

  const browserLocale =
    navigator.languages?.[0] ?? navigator.language ?? fallbackLocale ?? "pt-BR";

  return normalizeLocale(browserLocale);
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
