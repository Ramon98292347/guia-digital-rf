"use client";

import { Globe, Printer } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicGuideData } from "@/features/public-guide/server/service";
import { SUPPORTED_LOCALES, type GuideLocale } from "@/features/i18n/locales";

type PrintableGuideProps = {
  guide: PublicGuideData;
  tenantSlug: string;
};

type ManualDraft = {
  tenantName: string;
  city: string;
  address: string;
  publicUrl: string;
  coverTitle: string;
  coverText: string;
  welcomeMessage: string;
  arrivalMessage: string;
  logoImageUrl: string | null;
  coverImageUrl: string | null;
  institutionalImageUrl: string | null;
  aboutImageUrl: string | null;
  arrivalImageUrl: string | null;
  accommodationImageUrls: [string | null, string | null];
  galleryImageUrl: string | null;
  tipImageUrls: [string | null, string | null];
};

type MediaOption = {
  id: string;
  label: string;
  url: string;
  category: string;
};

type SectionKey =
  | "cover"
  | "welcome"
  | "location"
  | "accommodations"
  | "rules"
  | "services"
  | "tips"
  | "contact"
  | "digital"
  | "backcover";

const labels: Record<GuideLocale, Record<SectionKey, string>> = {
  "pt-BR": {
    cover: "Capa",
    welcome: "Índice",
    location: "Sobre",
    accommodations: "Chegada",
    rules: "Acomodações",
    services: "Regras",
    tips: "Dicas e serviços",
    contact: "Contatos",
    digital: "Guia Digital",
    backcover: "Contracapa",
  },
  en: {
    cover: "Cover",
    welcome: "Index",
    location: "About",
    accommodations: "Arrival",
    rules: "Accommodations",
    services: "Rules",
    tips: "Tips & services",
    contact: "Contacts",
    digital: "Digital Guide",
    backcover: "Back cover",
  },
  es: {
    cover: "Portada",
    welcome: "Índice",
    location: "Sobre",
    accommodations: "Llegada",
    rules: "Alojamientos",
    services: "Reglas",
    tips: "Consejos y servicios",
    contact: "Contactos",
    digital: "Guía digital",
    backcover: "Contraportada",
  },
};

const sectionCatalog: { key: SectionKey; icon: string }[] = [
  { key: "cover", icon: "01" },
  { key: "welcome", icon: "02" },
  { key: "location", icon: "03" },
  { key: "accommodations", icon: "04" },
  { key: "rules", icon: "05" },
  { key: "services", icon: "06" },
  { key: "tips", icon: "07" },
  { key: "digital", icon: "08" },
];

function localeText(locale: GuideLocale, pt: string, en: string, es: string) {
  if (locale === "en") return en;
  if (locale === "es") return es;
  return pt;
}

function buildThemeVariables(guide: PublicGuideData): CSSProperties {
  return {
    ["--primary" as string]: guide.theme.primaryColor || "#24382C",
    ["--secondary" as string]: guide.theme.secondaryColor || "#958652",
    ["--accent" as string]: guide.theme.accentColor || "#A76043",
    ["--background" as string]: guide.theme.backgroundColor || "#F3F0DF",
    ["--surface" as string]: guide.theme.surfaceColor || "#FFFDF7",
    ["--text" as string]: guide.theme.foregroundColor || "#2A1D16",
    ["--muted" as string]: guide.theme.mutedColor || "#756E62",
    ["--border" as string]: guide.theme.borderColor || "#D6CDBA",
    ["--soft" as string]: guide.theme.accentColor || "#DDE3CE",
  } as CSSProperties;
}

function QrCodeBlock({ value }: { value?: string }) {
  const target = value || "https://guia.digital/tenant";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(target)}&size=700x700&charset-source=UTF-8&charset-target=UTF-8&ecc=M&color=0-0-0&bgcolor=255-255-255`;

  return <img src={qrCodeUrl} alt="QR Code do guia" className="qr" />;
}

function getShortLocation(value: string | null | undefined) {
  if (!value) return "Região";
  const compact = value.split(",").slice(0, 2).join(", ");
  return compact || value;
}

function createManualDraft(guide: PublicGuideData): ManualDraft {
  return {
    tenantName: guide.tenant.name,
    city: getShortLocation(guide.contact.address || guide.location?.address || null),
    address: guide.contact.address || guide.location?.address || "Endereço completo da hospedagem",
    publicUrl: `https://guia.digital/${guide.tenant.slug}`,
    coverTitle: guide.design.heroSubtitle || "Tudo o que você precisa, em um só lugar.",
    coverText:
      "Informações importantes para aproveitar sua estadia com tranquilidade, conforto e praticidade.",
    welcomeMessage:
      guide.design.welcomeMessage ||
      "Este guia reúne as principais informações para que você aproveite a sua estadia com mais tranquilidade.",
    arrivalMessage:
      guide.location?.orientation ||
      "Orientações de chegada cadastradas pelo administrador.",
    logoImageUrl: guide.branding.logoPath || guide.design.logoPath || null,
    coverImageUrl: guide.design.heroImagePath || guide.design.heroSecondaryImagePath || null,
    institutionalImageUrl: guide.design.heroSecondaryImagePath || null,
    aboutImageUrl: guide.design.heroSecondaryImagePath || null,
    arrivalImageUrl: guide.location?.photoUrl || null,
    accommodationImageUrls: [
      guide.accommodations[0]?.imageUrl ?? null,
      guide.accommodations[1]?.imageUrl ?? null,
    ],
    galleryImageUrl: guide.gallery[0]?.imageUrl || null,
    tipImageUrls: [guide.localTips[0]?.imageUrl ?? null, guide.localTips[1]?.imageUrl ?? null],
  };
}

function buildAvailableMediaOptions(guide: PublicGuideData): MediaOption[] {
  const media = [
    ...guide.gallery.map((item) => ({
      id: item.id,
      url: item.imageUrl,
      label: item.title || "Foto da pousada",
      category: "Galeria",
    })),
    ...guide.publishedMedia.map((item) => ({
      id: item.id,
      url: item.url,
      label: item.caption || item.altText || "Mídia publicada",
      category: item.mediaType === "video" ? "Vídeo" : "Mídia",
    })),
    ...(guide.branding.logoPath ? [{ id: "branding-logo", url: guide.branding.logoPath, label: "Logo da pousada", category: "Marca" }] : []),
    ...(guide.design.heroImagePath ? [{ id: "design-hero", url: guide.design.heroImagePath, label: "Capa principal", category: "Capa" }] : []),
    ...(guide.design.heroSecondaryImagePath ? [{ id: "design-secondary", url: guide.design.heroSecondaryImagePath, label: "Imagem institucional", category: "Institucional" }] : []),
    ...(guide.location?.photoUrl ? [{ id: "location-photo", url: guide.location.photoUrl, label: "Imagem de chegada", category: "Localização" }] : []),
  ];

  const seen = new Set<string>();
  return media.filter((item) => {
    if (!item.url || seen.has(item.url)) {
      return false;
    }
    seen.add(item.url);
    return true;
  });
}

export function PrintableGuideAdmin({ guide }: PrintableGuideProps) {
  const [locale, setLocale] = useState<GuideLocale>("pt-BR");
  const [showEditor, setShowEditor] = useState(false);
  const [selectedSections, setSelectedSections] = useState<SectionKey[]>([
    "cover",
    "welcome",
    "location",
    "accommodations",
    "rules",
    "services",
    "tips",
    "digital",
  ]);
  const [draft, setDraft] = useState<ManualDraft>(() => createManualDraft(guide));
  const [savedDraft, setSavedDraft] = useState<ManualDraft>(() => createManualDraft(guide));

  const mediaOptions = useMemo(() => buildAvailableMediaOptions(guide), [guide]);
  const themeStyle = useMemo(() => buildThemeVariables(guide), [guide]);
  const selectedCatalog = sectionCatalog.filter((item) => selectedSections.includes(item.key));

  const groupedMediaOptions = useMemo(() => {
    return mediaOptions.reduce<Record<string, MediaOption[]>>((accumulator, item) => {
      const category = item.category || "Geral";
      accumulator[category] = accumulator[category] ?? [];
      accumulator[category].push(item);
      return accumulator;
    }, {});
  }, [mediaOptions]);

  const existingMediaSelect = (field: keyof ManualDraft, label: string, value: string | null) => (
    <div className="editor-field">
      <label>{label}</label>
      <select
        value={value ?? ""}
        onChange={(event) => updateDraft(field, event.target.value || null)}
        className="w-full rounded-xl border border-neutral-300 bg-white p-2.5"
      >
        <option value="">Usar imagem do guia</option>
        {Object.entries(groupedMediaOptions).map(([category, items]) => (
          <optgroup key={category} label={category}>
            {items.map((item) => (
              <option key={item.id} value={item.url}>{item.label}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );

  const updateDraft = <Key extends keyof ManualDraft>(key: Key, value: ManualDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleFileImage = (event: React.ChangeEvent<HTMLInputElement>, field: keyof ManualDraft) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const nextValue = typeof reader.result === "string" ? reader.result : null;
      updateDraft(field, nextValue as never);
    };
    reader.readAsDataURL(file);
  };

  const toggleSection = (key: SectionKey) => {
    setSelectedSections((current) => {
      if (current.includes(key)) {
        return current.filter((item) => item !== key);
      }
      return [...current, key];
    });
  };

  const localeTitle =
    locale === "pt-BR" ? "Guia Impresso" : locale === "en" ? "Printed Guide" : "Guía impresa";

  const handleSaveDraft = () => {
    setSavedDraft({ ...draft });
    setShowEditor(false);
  };

  const renderPage = (key: SectionKey) => {
    switch (key) {
      case "cover": {
        const heroImage = draft.coverImageUrl || guide.design.heroImagePath || guide.design.heroSecondaryImagePath || "";
        const logoImage = draft.logoImageUrl || guide.branding.logoPath || guide.design.logoPath || "";
        const subtitle = draft.coverTitle || localeText(locale, "Tudo o que você precisa, em um só lugar.", "Everything you need, in one place.", "Todo lo que necesitas, en un solo lugar.");

        return (
          <section className="page cover" data-document-role="page" data-label="01 Capa" style={themeStyle}>
            <div className="cover-photo" aria-label={draft.tenantName || guide.tenant.name}>
              {heroImage ? <img src={heroImage} alt={draft.tenantName || guide.tenant.name} /> : null}
            </div>
            <div className="paper-swoop" />
            <div className="page-inner">
              <div className="logo">
                {logoImage ? <img src={logoImage} alt={draft.tenantName || guide.tenant.name} /> : "LOGO\nDA POUSADA"}
              </div>
              <div className="cover-copy">
                <div className="kicker">{localeText(locale, "Guia de Boas-Vindas", "Welcome Guide", "Guía de Bienvenida")}</div>
                <h1>{subtitle}</h1>
                <div className="tenant">{draft.tenantName || guide.tenant.name}</div>
                <p data-i18n="coverText">{draft.coverText || localeText(locale, "Informações importantes para aproveitar sua estadia com tranquilidade, conforto e praticidade.", "Important information to enjoy your stay with comfort, peace of mind and convenience.", "Información importante para disfrutar de tu estadía con tranquilidad, comodidad y practicidad.")}</p>
              </div>
            </div>
            <div className="cover-footer">
              <span>{draft.city || getShortLocation(guide.contact.address || guide.location?.address || null)}</span>
              <span>Guia Digital RF</span>
            </div>
          </section>
        );
      }
      case "welcome": {
        const institutionalImage = draft.institutionalImageUrl || guide.design.heroSecondaryImagePath || "";
        return (
          <section className="page" data-document-role="page" data-label="02 Índice" style={themeStyle}>
            <div className="page-inner">
              <span className="page-num">02</span>
              <div className="kicker">{localeText(locale, "Conteúdos", "Contents", "Contenidos")}</div>
              <h1>{localeText(locale, "Seu guia para uma estadia melhor.", "Your guide to a better stay.", "Tu guía para una mejor estadía.")}</h1>
              <div className="photo index-hero">
                {institutionalImage ? <img src={institutionalImage} alt={draft.tenantName || guide.tenant.name} /> : "Foto institucional / paisagem"}
              </div>
              <div className="index-grid">
                <div className="index-item">
                  <div className="icon-dot">01</div>
                  <div>
                    <b>{localeText(locale, "Sobre a pousada", "About the property", "Sobre el alojamiento")}</b>
                    <br />
                    <span>{localeText(locale, "Conheça o espaço, a proposta e os principais diferenciais.", "Discover the space, concept and main highlights.", "Conoce el espacio, la propuesta y los principales diferenciales.")}</span>
                  </div>
                </div>
                <div className="index-item">
                  <div className="icon-dot">02</div>
                  <div>
                    <b>{localeText(locale, "Como chegar", "Getting here", "Cómo llegar")}</b>
                    <br />
                    <span>{localeText(locale, "Endereço, rota e orientações de chegada.", "Address, route and arrival instructions.", "Dirección, ruta e indicaciones de llegada.")}</span>
                  </div>
                </div>
                <div className="index-item">
                  <div className="icon-dot">03</div>
                  <div>
                    <b>{localeText(locale, "Acomodações", "Accommodations", "Alojamientos")}</b>
                    <br />
                    <span>{localeText(locale, "Fotos e informações dos espaços disponíveis.", "Photos and information about the available spaces.", "Fotos e información de los espacios disponibles.")}</span>
                  </div>
                </div>
                <div className="index-item">
                  <div className="icon-dot">04</div>
                  <div>
                    <b>{localeText(locale, "Regras", "Rules", "Reglas")}</b>
                    <br />
                    <span>{localeText(locale, "Orientações para uma estadia tranquila.", "Guidelines for a peaceful stay.", "Orientaciones para una estadía tranquila.")}</span>
                  </div>
                </div>
                <div className="index-item">
                  <div className="icon-dot">05</div>
                  <div>
                    <b>{localeText(locale, "Dicas da região", "Local tips", "Consejos de la región")}</b>
                    <br />
                    <span>{localeText(locale, "Experiências, gastronomia e passeios.", "Experiences, gastronomy and tours.", "Experiencias, gastronomía y paseos.")}</span>
                  </div>
                </div>
                <div className="index-item">
                  <div className="icon-dot">06</div>
                  <div>
                    <b>{localeText(locale, "Guia Digital", "Digital Guide", "Guía Digital")}</b>
                    <br />
                    <span>{localeText(locale, "Acesse informações atualizadas e o Anfitrião Virtual.", "Access updated information and the Virtual Host.", "Accede a información actualizada y al Anfitrión Virtual.")}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }
      case "location": {
        const aboutImage = draft.aboutImageUrl || guide.design.heroSecondaryImagePath || "";
        return (
          <section className="page" data-document-role="page" data-label="03 Sobre" style={themeStyle}>
            <div className="page-inner">
              <span className="page-num">03</span>
              <div className="kicker">{localeText(locale, "Sobre a pousada", "About the property", "Sobre el alojamiento")}</div>
              <h1>{localeText(locale, "Um lugar pensado para desacelerar.", "A place designed to slow down.", "Un lugar pensado para desacelerar.")}</h1>
              <div className="two-col">
                <div className="photo arch-photo">
                  {aboutImage ? <img src={aboutImage} alt={draft.tenantName || guide.tenant.name} /> : "Foto da pousada"}
                </div>
                <div>
                  <div className="story-card">
                    <div className="serif">{localeText(locale, "Hospitalidade que acolhe. Natureza que inspira.", "Warm hospitality. Inspiring nature.", "Hospitalidad que acoge. Naturaleza que inspira.")}</div>
                    <p>{draft.welcomeMessage || localeText(locale, "Este guia reúne as principais informações para que você aproveite a sua estadia com mais tranquilidade.", "This guide brings together the key information you need to enjoy your stay with more peace of mind.", "Esta guía reúne la información principal para que disfrutes de tu estadía con mayor tranquilidad.")}</p>
                  </div>
                  <div className="facts">
                    <div className="fact">
                      <small>{localeText(locale, "Destino", "Destination", "Destino")}</small>
                      <strong>{getShortLocation(guide.contact.address || guide.location?.address || null)}</strong>
                    </div>
                    <div className="fact">
                      <small>{localeText(locale, "Atendimento", "Support", "Atención")}</small>
                      <strong>{localeText(locale, "Anfitrião Virtual", "Virtual Host", "Anfitrión Virtual")}</strong>
                    </div>
                    <div className="fact">
                      <small>{localeText(locale, "Guia", "Guide", "Guía")}</small>
                      <strong>{localeText(locale, "Digital + Impresso", "Digital + Printed", "Digital + Impresa")}</strong>
                    </div>
                    <div className="fact">
                      <small>{localeText(locale, "Experiência", "Experience", "Experiencia")}</small>
                      <strong>{localeText(locale, "Personalizada", "Personalized", "Personalizada")}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }
      case "accommodations": {
        const arrivalImage = draft.arrivalImageUrl || guide.location?.photoUrl || "";
        return (
          <section className="page" data-document-role="page" data-label="04 Como chegar" style={themeStyle}>
            <div className="page-inner">
              <span className="page-num">04</span>
              <div className="kicker">{localeText(locale, "Como chegar", "Getting here", "Cómo llegar")}</div>
              <h1>{localeText(locale, "Chegue com tranquilidade.", "Arrive with peace of mind.", "Llega con tranquilidad.")}</h1>
              <p className="muted">{localeText(locale, "Tenha o endereço e as principais orientações à mão antes de iniciar o trajeto.", "Keep the address and key arrival instructions handy before starting your trip.", "Ten la dirección y las indicaciones clave a mano antes de iniciar el trayecto.")}</p>
              <div className="photo route-visual">
                {arrivalImage ? <img src={arrivalImage} alt={draft.tenantName || guide.tenant.name} /> : "Foto de acesso / estrada / fachada"}
              </div>
              <div className="route-grid">
                <div className="route-card">
                  <h3>{draft.tenantName || guide.tenant.name}</h3>
                  <p>{draft.address || guide.contact.address || guide.location?.address || localeText(locale, "Endereço completo da hospedagem", "Full property address", "Dirección completa del alojamiento")}</p>
                  <p>{draft.arrivalMessage || guide.location?.orientation || localeText(locale, "Orientações de chegada cadastradas pelo administrador.", "Arrival instructions registered by the administrator.", "Indicaciones de llegada registradas por el administrador.")}</p>
                </div>
                <div className="route-card" style={{ textAlign: "center" }}>
                  <QrCodeBlock value={draft.publicUrl || `https://guia.digital/${guide.tenant.slug}`} />
                  <strong>{localeText(locale, "Abrir no mapa", "Open map", "Abrir mapa")}</strong>
                  <p className="muted">{localeText(locale, "Escaneie com a câmera do celular.", "Scan with your phone camera.", "Escanea con la cámara de tu celular.")}</p>
                </div>
              </div>
            </div>
          </section>
        );
      }
      case "rules": {
        const cards = guide.accommodations.slice(0, 2);
        return (
          <section className="page" data-document-role="page" data-label="05 Acomodações" style={themeStyle}>
            <div className="page-inner">
              <span className="page-num">05</span>
              <div className="kicker">{localeText(locale, "Acomodações", "Accommodations", "Alojamientos")}</div>
              <h1>{localeText(locale, "Seu espaço para descansar.", "Your place to unwind.", "Tu espacio para descansar.")}</h1>
              {cards.map((accommodation, index) => {
                const imageOverride = draft.accommodationImageUrls[index] ?? accommodation.imageUrl;
                return (
                  <article key={accommodation.id} className="accommodation">
                    <div className="photo compact-photo">
                      {imageOverride ? <img src={imageOverride} alt={accommodation.name} /> : "Foto da acomodação"}
                    </div>
                    <div>
                      <h3>{accommodation.name}</h3>
                      <div className="facts-row">
                        {accommodation.capacity ? <span className="badge">{accommodation.capacity} {localeText(locale, "hóspedes", "guests", "huéspedes")}</span> : null}
                        {accommodation.area_m2 ? <span className="badge">{accommodation.area_m2} m²</span> : null}
                        {accommodation.view_description ? <span className="badge">{accommodation.view_description}</span> : null}
                      </div>
                      <p className="muted">{accommodation.short_description || localeText(locale, "Descrição breve da acomodação puxada do cadastro.", "Brief description of the accommodation from the registration.", "Descripción breve del alojamiento basada en el cadastro.")}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      }
      case "services": {
        const rules = guide.rules.slice(0, 3);
        return (
          <section className="page" data-document-role="page" data-label="06 Regras" style={themeStyle}>
            <div className="page-inner">
              <span className="page-num">06</span>
              <div className="kicker">{localeText(locale, "Regras e orientações", "Rules and guidance", "Reglas y orientaciones")}</div>
              <h1>{localeText(locale, "Para aproveitar com tranquilidade.", "For a peaceful stay.", "Para disfrutar con tranquilidad.")}</h1>
              <p className="muted">{localeText(locale, "As regras devem vir do cadastro, organizadas em itens legíveis e nunca em um bloco de texto gigante.", "Rules should come from the registration and be organized into readable items, never one giant text block.", "Las reglas deben venir del cadastro y organizarse en elementos legibles, nunca en un bloque de texto gigante.")}</p>
              <div className="rule-list">
                {rules.map((rule, index) => (
                  <div key={rule.id} className="rule">
                    <div className="icon-dot">{String(index + 1).padStart(2, "0")}</div>
                    <div>
                      <h3>{rule.title}</h3>
                      <p>{rule.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="policy-box">
                <div className="kicker">{localeText(locale, "Importante", "Important", "Importante")}</div>
                <h3>{localeText(locale, "Políticas completas", "Full policies", "Políticas completas")}</h3>
                <p className="muted">{localeText(locale, "Quando houver políticas muito extensas, o livreto pode resumir visualmente e encaminhar o hóspede ao Guia Digital para a versão completa e atualizada.", "When policies are very extensive, the booklet can summarize them visually and direct the guest to the Digital Guide for the complete and updated version.", "Cuando haya políticas muy extensas, el folleto puede resumir visualmente y enviar al huésped a la Guía Digital para la versión completa y actualizada.")}</p>
              </div>
            </div>
          </section>
        );
      }
      case "tips": {
        const services = guide.services.slice(0, 2);
        const tipItems = guide.localTips.slice(0, 2);

        return (
          <section className="page" data-document-role="page" data-label="07 Dicas e serviços" style={themeStyle}>
            <div className="page-inner">
              <span className="page-num">07</span>
              <div className="kicker">{localeText(locale, "Dicas da região", "Local tips", "Consejos de la región")}</div>
              <h1>{localeText(locale, "Viva a região além da hospedagem.", "Experience the region beyond the stay.", "Vive la región más allá del alojamiento.")}</h1>
              <p className="muted">{localeText(locale, "Gastronomia, natureza, passeios e experiências selecionadas para o hóspede.", "Gastronomy, nature, excursions and experiences selected for guests.", "Gastronomía, naturaleza, paseos y experiencias seleccionadas para el huésped.")}</p>
              <div className="feature-grid">
                {tipItems.length ? (
                  tipItems.map((tip, index) => {
                    const imageOverride = draft.tipImageUrls[index] ?? tip.imageUrl;
                    return (
                      <article key={tip.id} className="feature">
                        <div className="photo">
                          {imageOverride ? <img src={imageOverride} alt={tip.name} /> : "Foto da dica"}
                        </div>
                        <div className="feature-body">
                          <span className="badge">{localeText(locale, "Natureza", "Nature", "Naturaleza")}</span>
                          <h3>{tip.name}</h3>
                          <p className="muted">{tip.short_description || tip.description || localeText(locale, "Descrição breve da dica.", "Brief description of the tip.", "Descripción breve del consejo.")}</p>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  [0, 1].map((index) => (
                    <article key={index} className="feature">
                      <div className="photo">{draft.tipImageUrls[index] ? <img src={draft.tipImageUrls[index] || ""} alt={localeText(locale, "Dica", "Tip", "Consejo")} /> : "Foto da dica"}</div>
                      <div className="feature-body">
                        <span className="badge">{localeText(locale, "Natureza", "Nature", "Naturaleza")}</span>
                        <h3>{localeText(locale, "Nome da dica", "Tip name", "Nombre del consejo")}</h3>
                        <p className="muted">{localeText(locale, "Descrição breve da dica.", "Brief description of the tip.", "Descripción breve del consejo.")}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>
              <div className="kicker" style={{ marginTop: "7mm" }}>{localeText(locale, "Serviços", "Services", "Servicios")}</div>
              <div className="feature-grid" style={{ marginTop: "3mm" }}>
                {services.length ? (
                  services.map((service) => (
                    <article key={service.id} className="feature">
                      <div className="feature-body">
                        <h3>{service.name}</h3>
                        <p className="muted">{service.short_description || service.description || localeText(locale, "Horário e descrição do serviço.", "Service hours and description.", "Horario y descripción del servicio.")}</p>
                      </div>
                    </article>
                  ))
                ) : (
                  [0, 1].map((index) => (
                    <article key={index} className="feature">
                      <div className="feature-body">
                        <h3>{localeText(locale, "Serviço cadastrado", "Registered service", "Servicio registrado")}</h3>
                        <p className="muted">{localeText(locale, "Horário e descrição do serviço.", "Service hours and description.", "Horario y descripción del servicio.")}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
        );
      }
      case "digital": {
        return (
          <section className="page digital" data-document-role="page" data-label="08 Guia Digital" style={themeStyle}>
            <div className="page-inner digital-center">
              <div className="digital-card">
                <div className="kicker" style={{ color: "#dfca8d" }}>{localeText(locale, "Guia Digital", "Digital Guide", "Guía Digital")}</div>
                <h1>{localeText(locale, "Tem muito mais no seu celular.", "There is much more on your phone.", "Hay mucho más en tu celular.")}</h1>
                <QrCodeBlock value={draft.publicUrl || `https://guia.digital/${guide.tenant.slug}`} />
                <h3 style={{ color: "#fff", fontFamily: "Georgia, serif", fontSize: "16pt" }}>{guide.tenant.name}</h3>
                <p>{localeText(locale, "Acesse vídeos, Wi‑Fi, acomodações, regras, dicas da região, localização e o Anfitrião Virtual.", "Access videos, Wi‑Fi, accommodations, rules, local tips, location and the Virtual Host.", "Accede a vídeos, Wi‑Fi, alojamientos, reglas, consejos de la región, ubicación y el Anfitrión Virtual.")}</p>
                <p>{localeText(locale, "Obrigado por escolher nossa hospedagem. Desejamos uma estadia memorável.", "Thank you for choosing our property. We wish you a memorable stay.", "Gracias por elegir nuestro alojamiento. Te deseamos una estadía memorable.")}</p>
              </div>
              <div className="brand">Tecnologia por RF Tecnologia · Inovação · Automação · Confiança</div>
            </div>
          </section>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="guide-print-shell">
      <style>{`
        .editor-panel {
          max-width: 1200px;
          margin: 0 auto 1.25rem;
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 18px;
          box-shadow: 0 12px 28px rgba(0,0,0,0.08);
          padding: 1rem;
        }
        .editor-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }
        .editor-card {
          border: 1px solid #e5e5e5;
          border-radius: 16px;
          padding: 1rem;
          background: #fafafa;
        }
        .editor-card h3 {
          margin: 0 0 0.75rem;
          font-size: 0.9rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #333;
        }
        .editor-field {
          display: grid;
          gap: 0.35rem;
          margin-bottom: 0.8rem;
        }
        .editor-field label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #4b4b4b;
        }
        .editor-field input,
        .editor-field textarea {
          width: 100%;
          border: 1px solid #d4d4d4;
          border-radius: 10px;
          background: white;
          padding: 0.7rem 0.8rem;
          font: inherit;
          color: #1f1f1f;
        }
        .editor-field textarea {
          min-height: 76px;
          resize: vertical;
        }
        .image-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          border: 1px dashed #c7c7c7;
          background: white;
          border-radius: 10px;
          padding: 0.55rem 0.7rem;
          margin-bottom: 0.55rem;
        }
        .image-row span {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #525252;
          flex: 1;
        }
        .image-row input {
          max-width: 180px;
          font-size: 0.7rem;
        }
        .editor-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-top: 1rem;
        }
        .editor-actions button {
          border: 1px solid #d4d4d4;
          border-radius: 10px;
          background: white;
          color: #1f1f1f;
          padding: 0.65rem 0.9rem;
          font: inherit;
          cursor: pointer;
        }
        .editor-actions .primary {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          font-weight: 700;
        }
        .editor-actions .secondary {
          background: #f4f4f4;
        }
        :root {
          --page-width: 148mm;
          --page-height: 210mm;
          --pad: 10mm;
          --primary: ${guide.theme.primaryColor || "#24382C"};
          --secondary: ${guide.theme.secondaryColor || "#958652"};
          --accent: ${guide.theme.accentColor || "#A76043"};
          --paper: ${guide.theme.backgroundColor || "#F3F0DF"};
          --surface: ${guide.theme.surfaceColor || "#FFFDF7"};
          --ink: ${guide.theme.foregroundColor || "#2A1D16"};
          --muted: ${guide.theme.mutedColor || "#756E62"};
          --line: ${guide.theme.borderColor || "#D6CDBA"};
          --soft: ${guide.theme.accentColor || "#DDE3CE"};
        }
        *{box-sizing:border-box}
        html,body{margin:0;background:#d8d6cf;color:var(--ink);font-family:Arial,Helvetica,sans-serif}
        body{padding:28px 16px 60px}
        .guide-print-shell{width:100%;display:flex;flex-direction:column;gap:1.25rem}
        .guide-toolbar{max-width:1060px;margin:0 auto 22px;background:#fff;border:1px solid #ddd;border-radius:16px;padding:12px 14px;display:flex;gap:10px;align-items:center;position:sticky;top:10px;z-index:50;box-shadow:0 8px 30px rgba(0,0,0,.1)}
        .guide-toolbar strong{color:var(--primary);margin-right:auto}
        .guide-toolbar button,.guide-toolbar select{min-height:40px;border:1px solid #d6d6d6;background:#fff;border-radius:10px;padding:0 12px;font:inherit}
        .guide-toolbar .primary-action{background:var(--primary);color:#fff;border-color:var(--primary);font-weight:700}
        .book{display:grid;grid-template-columns:repeat(2,var(--page-width));gap:24px;justify-content:center}
        .page{width:var(--page-width);height:var(--page-h,210mm);min-height:210mm;background:var(--paper);position:relative;overflow:hidden;box-shadow:0 12px 32px rgba(0,0,0,.16);break-after:page;page-break-after:always;break-inside:avoid;page-break-inside:avoid;orphans:1;widows:1}
        .page-inner{position:relative;z-index:3;height:100%;padding:var(--pad)}
        .kicker{font-size:7.5pt;letter-spacing:.22em;text-transform:uppercase;font-weight:700;color:var(--secondary)}
        .page-num{position:absolute;right:8mm;top:7mm;font-size:7pt;letter-spacing:.14em;color:var(--muted);z-index:5}
        h1,h2,h3,p{margin-top:0}h1,h2{font-family:Georgia,'Times New Roman',serif;color:var(--primary)}
        h1{font-size:30pt;line-height:1;margin-bottom:5mm}h2{font-size:20pt;line-height:1.05;margin-bottom:4mm}
        h3{font-size:11pt;color:var(--primary);margin-bottom:2mm}p{font-size:9pt;line-height:1.5;margin-bottom:3mm}.muted{color:var(--muted)}
        .photo,.cover-photo,.arch-photo,.route-visual,.index-hero,.compact-photo,.feature .photo{background:linear-gradient(145deg,rgba(36,56,44,.22),rgba(167,96,67,.18)),repeating-linear-gradient(35deg,#b8b4a4 0 12px,#d9d1bd 12px 24px);display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;font-size:7pt;text-transform:uppercase;letter-spacing:.12em;overflow:hidden}
        .photo img,.cover-photo img,.arch-photo img,.route-visual img,.index-hero img,.compact-photo img,.feature .photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
        .badge{display:inline-flex;background:var(--soft);color:var(--primary);border-radius:999px;padding:2mm 3mm;font-size:7pt;font-weight:700}
        .icon-dot{width:7mm;height:7mm;border-radius:50%;display:grid;place-items:center;background:var(--primary);color:#fff;font-size:7pt;font-weight:800}
        .cover{background:var(--primary);color:#fff}.cover-photo{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(15,26,20,.08),rgba(15,26,20,.78)),linear-gradient(125deg,#6a7259,#2d4839 60%,#1c2b23)}
        .paper-swoop{position:absolute;left:-10mm;bottom:-24mm;width:176mm;height:80mm;background:var(--paper);border-radius:50% 50% 0 0/40% 40% 0 0;transform:rotate(-3deg);z-index:2}
        .cover .page-inner{display:flex;flex-direction:column;padding:12mm 11mm 9mm}.logo{align-self:center;margin-top:6mm;width:62mm;min-height:36mm;border:1px solid rgba(255,255,255,.55);border-radius:18px;background:rgba(255,255,255,.06);display:grid;place-items:center;text-align:center;font:700 12pt/1.1 Georgia,serif;padding:4mm}
        .cover-copy{margin-top:auto;margin-bottom:27mm;max-width:112mm}.cover .kicker{color:#e4d6a7}.cover h1{color:#fff;font-size:34pt;margin-bottom:2mm}.tenant{font:italic 18pt/1.1 Georgia,serif;color:#e1c884;margin-bottom:3mm}.cover p{color:rgba(255,255,255,.84);max-width:95mm}.cover-copy p[data-i18n="coverText"]{color:#000;font-weight:600}.cover-footer{position:absolute;left:11mm;right:11mm;bottom:7mm;z-index:5;color:var(--primary);display:flex;justify-content:space-between;font-size:7pt}
        .index-hero{height:48mm;border-radius:40mm 40mm 12mm 12mm;margin-top:6mm}.index-grid{display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-top:8mm}.index-item{min-height:24mm;border:1px solid var(--line);background:var(--surface);padding:4mm;border-radius:16px;display:grid;grid-template-columns:9mm 1fr;gap:3mm}.index-item b{font:700 10pt Georgia,serif;color:var(--primary)}.index-item span{font-size:7.5pt;color:var(--muted);line-height:1.35}
        .two-col{display:grid;grid-template-columns:52mm 1fr;gap:6mm}.arch-photo{height:122mm;border-radius:32mm 32mm 10mm 10mm}.story-card{background:var(--primary);color:#fff;border-radius:24px;padding:7mm;min-height:78mm;display:flex;flex-direction:column;justify-content:flex-end}.story-card .serif{font:19pt/1.05 Georgia,serif;color:#e8d6a1;margin-bottom:3mm}.story-card p{color:rgba(255,255,255,.84)}.facts{display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-top:4mm}.fact{background:var(--surface);border:1px solid var(--line);padding:4mm;border-radius:15px}.fact small{display:block;text-transform:uppercase;font-size:6.5pt;color:var(--secondary);margin-bottom:1mm}.fact strong{font-size:9pt}
        .route-visual{height:90mm;border-radius:28px;margin:6mm 0}.route-grid{display:grid;grid-template-columns:1fr 45mm;gap:5mm}.route-card{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:5mm}.qr{width:31mm;aspect-ratio:1;margin:0 auto 3mm;border:1px solid var(--primary);border-radius:6px;background:repeating-linear-gradient(0deg,#203128 0 2px,#fff 2px 4px),repeating-linear-gradient(90deg,transparent 0 3px,#203128 3px 5px);display:grid;grid-template-columns:repeat(7,1fr);gap:1px;padding:2px}.qr span{display:block;border-radius:1px}
        .accommodation{display:grid;grid-template-columns:51mm 1fr;gap:5mm;background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:4mm;margin-bottom:4mm}.compact-photo{height:46mm;border-radius:15px}.facts-row{display:flex;flex-wrap:wrap;gap:2mm;margin:2mm 0 2.5mm}
        .rule-list{margin-top:4mm}.rule{display:grid;grid-template-columns:9mm 1fr;gap:4mm;padding:4mm 0;border-bottom:1px solid var(--line)}.policy-box{margin-top:5mm;background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:5mm}
        .feature-grid{display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-top:5mm}.feature{background:var(--surface);border:1px solid var(--line);border-radius:18px;overflow:hidden}.feature .photo{height:42mm}.feature-body{padding:4mm}
        .digital{background:var(--primary);color:#fff}.digital h1{color:#fff}.digital .kicker{color:#dfca8d}.digital-center{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.digital-card{width:108mm;border:1px solid rgba(255,255,255,.28);border-radius:26px;padding:10mm;background:rgba(255,255,255,.06)}.digital .qr{width:48mm;border-color:rgba(255,255,255,.4);background:repeating-linear-gradient(0deg,#fff 0 2px,#1f3a2d 2px 4px),repeating-linear-gradient(90deg,transparent 0 3px,#fff 3px 5px)}.digital p{color:rgba(255,255,255,.82)}.brand{position:absolute;bottom:7mm;left:0;right:0;text-align:center;font-size:6.5pt;letter-spacing:.12em;color:rgba(255,255,255,.55);text-transform:uppercase}
        @media(max-width:1100px){.book{grid-template-columns:var(--page-width)}}
        @media print{
          @page{size:A5 portrait;margin:0}
          html,body{background:#fff!important;padding:0!important;margin:0!important;width:100%!important;height:auto!important;overflow:visible!important}
          .print-hidden,.guide-toolbar,.editor-panel{display:none!important}
          .guide-print-shell{display:block;width:100%;margin:0;padding:0}
          .book{display:block;width:100%;margin:0;padding:0;gap:0;grid-template-columns:none}
          .page{
            display:block;
            width:var(--page-width);
            max-width:var(--page-width);
            height:210mm;
            min-height:210mm;
            margin:0 auto;
            box-shadow:none;
            break-before:auto;
            page-break-before:auto;
            break-after:page;
            page-break-after:always;
            break-inside:avoid;
            page-break-inside:avoid;
            orphans:1;
            widows:1;
            -webkit-print-color-adjust:exact;
            print-color-adjust:exact;
          }
          .page:first-child{break-before:auto;page-break-before:auto}
          .page:last-child{break-after:auto;page-break-after:auto}
          .page + .page{margin-top:0}
        }
      `}</style>

      <div className="print-hidden guide-toolbar">
        <strong>Guia Impresso</strong>
        <select value={locale} onChange={(event) => setLocale(event.target.value as GuideLocale)}>
          {SUPPORTED_LOCALES.map((available) => (
            <option key={available} value={available}>{available === "pt-BR" ? "Português" : available === "en" ? "English" : "Español"}</option>
          ))}
        </select>
        <button type="button" onClick={() => setShowEditor((value) => !value)}>
          {showEditor ? "Ocultar editor" : "Editar guia"}
        </button>
        <button type="button" className="primary-action" onClick={handleSaveDraft}>Salvar edição</button>
        <button type="button" onClick={() => window.print()}>Imprimir / PDF</button>
      </div>

      {showEditor ? (
        <div className="print-hidden editor-panel">
          <div className="editor-grid">
            <div className="editor-card">
              <h3>Dados do guia</h3>
              <div className="editor-field">
                <label>Nome da pousada</label>
                <input value={draft.tenantName} onChange={(event) => updateDraft("tenantName", event.target.value)} />
              </div>
              <div className="editor-field">
                <label>Cidade / região</label>
                <input value={draft.city} onChange={(event) => updateDraft("city", event.target.value)} />
              </div>
              <div className="editor-field">
                <label>Endereço</label>
                <input value={draft.address} onChange={(event) => updateDraft("address", event.target.value)} />
              </div>
              <div className="editor-field">
                <label>Link público</label>
                <input value={draft.publicUrl} onChange={(event) => updateDraft("publicUrl", event.target.value)} />
              </div>
              <div className="editor-field">
                <label>Título da capa</label>
                <input value={draft.coverTitle} onChange={(event) => updateDraft("coverTitle", event.target.value)} />
              </div>
              <div className="editor-field">
                <label>Texto da capa</label>
                <textarea value={draft.coverText} onChange={(event) => updateDraft("coverText", event.target.value)} />
              </div>
              <div className="editor-field">
                <label>Mensagem institucional</label>
                <textarea value={draft.welcomeMessage} onChange={(event) => updateDraft("welcomeMessage", event.target.value)} />
              </div>
              <div className="editor-field">
                <label>Orientações de chegada</label>
                <textarea value={draft.arrivalMessage} onChange={(event) => updateDraft("arrivalMessage", event.target.value)} />
              </div>
            </div>

            <div className="editor-card">
              <h3>Imagens</h3>
              {existingMediaSelect("logoImageUrl", "Logo", draft.logoImageUrl)}
              {existingMediaSelect("coverImageUrl", "Capa", draft.coverImageUrl)}
              {existingMediaSelect("institutionalImageUrl", "Institucional", draft.institutionalImageUrl)}
              {existingMediaSelect("aboutImageUrl", "Sobre", draft.aboutImageUrl)}
              {existingMediaSelect("arrivalImageUrl", "Como chegar", draft.arrivalImageUrl)}
              <div className="editor-field">
                <label>Acomodação 1</label>
                <select
                  value={draft.accommodationImageUrls[0] ?? ""}
                  onChange={(event) => updateDraft("accommodationImageUrls", [event.target.value || null, draft.accommodationImageUrls[1]])}
                  className="w-full rounded-xl border border-neutral-300 bg-white p-2.5"
                >
                  <option value="">Usar imagem do guia</option>
                  {Object.entries(groupedMediaOptions).map(([category, items]) => (
                    <optgroup key={`${category}-a1`} label={category}>
                      {items.map((item) => (
                        <option key={`${item.id}-a1`} value={item.url}>{item.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="editor-field">
                <label>Acomodação 2</label>
                <select
                  value={draft.accommodationImageUrls[1] ?? ""}
                  onChange={(event) => updateDraft("accommodationImageUrls", [draft.accommodationImageUrls[0], event.target.value || null])}
                  className="w-full rounded-xl border border-neutral-300 bg-white p-2.5"
                >
                  <option value="">Usar imagem do guia</option>
                  {Object.entries(groupedMediaOptions).map(([category, items]) => (
                    <optgroup key={`${category}-a2`} label={category}>
                      {items.map((item) => (
                        <option key={`${item.id}-a2`} value={item.url}>{item.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              {existingMediaSelect("galleryImageUrl", "Galeria", draft.galleryImageUrl)}
              <div className="editor-field">
                <label>Dica 1</label>
                <select
                  value={draft.tipImageUrls[0] ?? ""}
                  onChange={(event) => updateDraft("tipImageUrls", [event.target.value || null, draft.tipImageUrls[1]])}
                  className="w-full rounded-xl border border-neutral-300 bg-white p-2.5"
                >
                  <option value="">Usar imagem do guia</option>
                  {Object.entries(groupedMediaOptions).map(([category, items]) => (
                    <optgroup key={`${category}-t1`} label={category}>
                      {items.map((item) => (
                        <option key={`${item.id}-t1`} value={item.url}>{item.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="editor-field">
                <label>Dica 2</label>
                <select
                  value={draft.tipImageUrls[1] ?? ""}
                  onChange={(event) => updateDraft("tipImageUrls", [draft.tipImageUrls[0], event.target.value || null])}
                  className="w-full rounded-xl border border-neutral-300 bg-white p-2.5"
                >
                  <option value="">Usar imagem do guia</option>
                  {Object.entries(groupedMediaOptions).map(([category, items]) => (
                    <optgroup key={`${category}-t2`} label={category}>
                      {items.map((item) => (
                        <option key={`${item.id}-t2`} value={item.url}>{item.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div className="editor-card">
              <h3>Configuração</h3>
              <div className="editor-field">
                <label>Idioma</label>
                <select value={locale} onChange={(event) => setLocale(event.target.value as GuideLocale)} className="w-full rounded-xl border border-neutral-300 bg-white p-2.5">
                  {SUPPORTED_LOCALES.map((available) => (
                    <option key={available} value={available}>{available === "pt-BR" ? "Português" : available === "en" ? "English" : "Español"}</option>
                  ))}
                </select>
              </div>
              <div className="editor-field">
                <label>Seções</label>
                <div className="flex flex-wrap gap-2">
                  {sectionCatalog.map((item) => {
                    const selected = selectedSections.includes(item.key);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => toggleSection(item.key)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition",
                          selected ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-600",
                        )}
                      >
                        {item.icon}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="editor-field">
                <label>QR do guia</label>
                <input value={draft.publicUrl} onChange={(event) => updateDraft("publicUrl", event.target.value)} />
              </div>
              <div className="editor-field">
                <label>Observação</label>
                <textarea value="As imagens enviadas aqui ficam apenas no preview do admin e podem ser trocadas manualmente antes da publicação final." readOnly />
              </div>
              <div className="editor-actions">
                <button type="button" className="primary" onClick={handleSaveDraft}>Salvar edição manual</button>
                <button type="button" className="secondary" onClick={() => setDraft(createManualDraft(guide))}>Restaurar</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="print-hidden flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Painel do tenant</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">{localeTitle}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 p-1">
              {SUPPORTED_LOCALES.map((available) => (
                <button
                  key={available}
                  type="button"
                  onClick={() => setLocale(available)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition",
                    locale === available ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100",
                  )}
                >
                  {available}
                </button>
              ))}
            </div>
            <Button type="button" variant="outline" onClick={() => window.print()} className="gap-2">
              <Printer className="size-4" aria-hidden="true" />
              Imprimir / PDF
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-600">
            <Globe className="size-3.5" aria-hidden="true" />
            Seções do livreto
          </div>
          <div className="flex flex-wrap gap-2">
            {sectionCatalog.map((item) => {
              const selected = selectedSections.includes(item.key);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleSection(item.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition",
                    selected ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300",
                  )}
                >
                  <span>{item.icon}</span>
                  <span>{labels[locale][item.key]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="book">
        {selectedCatalog.map((item) => renderPage(item.key))}
      </main>
    </div>
  );
}
