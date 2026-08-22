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
    welcome: "Boas-vindas",
    location: "Como chegar",
    accommodations: "Acomodações",
    rules: "Regras",
    services: "Serviços",
    tips: "Dicas da região",
    contact: "Contatos",
    digital: "Guia Digital",
    backcover: "Contracapa",
  },
  en: {
    cover: "Cover",
    welcome: "Welcome",
    location: "How to get there",
    accommodations: "Accommodations",
    rules: "Rules",
    services: "Services",
    tips: "Local tips",
    contact: "Contacts",
    digital: "Digital Guide",
    backcover: "Back cover",
  },
  es: {
    cover: "Portada",
    welcome: "Bienvenida",
    location: "Cómo llegar",
    accommodations: "Alojamientos",
    rules: "Reglas",
    services: "Servicios",
    tips: "Consejos de la zona",
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
  { key: "contact", icon: "08" },
  { key: "digital", icon: "09" },
  { key: "backcover", icon: "10" },
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
    ["--surface" as string]: guide.theme.surfaceColor || "#FFFDF8",
    ["--text" as string]: guide.theme.foregroundColor || "#2A1D16",
    ["--muted" as string]: guide.theme.mutedColor || "#6D675B",
    ["--border" as string]: guide.theme.borderColor || "#D9CFB8",
    ["--soft" as string]: guide.theme.accentColor || "#DDE3CE",
  } as CSSProperties;
}

function QrCodeBlock() {
  const cells = useMemo(
    () =>
      Array.from({ length: 49 }, (_, index) => {
        const row = Math.floor(index / 7);
        const col = index % 7;
        const border = row === 0 || col === 0 || row === 6 || col === 6;
        const shouldFill =
          border ||
          ((row + col) % 3 === 0 && row > 1 && col > 1) ||
          (row % 2 === 0 && col % 2 === 0 && row > 2 && col > 2) ||
          (row > 2 && col > 2 && (row + col) % 2 === 1);
        return shouldFill ? "solid" : "transparent";
      }),
    [],
  );

  return (
    <div className="qr">
      {cells.map((fill, index) => (
        <span key={index} style={{ background: fill === "solid" ? "#17261e" : "transparent" }} />
      ))}
    </div>
  );
}

function getShortLocation(value: string | null | undefined) {
  if (!value) return "Região";
  const compact = value.split(",").slice(0, 2).join(", ");
  return compact || value;
}

export function PrintableGuideAdmin({ guide }: PrintableGuideProps) {
  const [locale, setLocale] = useState<GuideLocale>("pt-BR");
  const [selectedSections, setSelectedSections] = useState<SectionKey[]>([
    "cover",
    "welcome",
    "location",
    "accommodations",
    "rules",
    "services",
    "tips",
    "contact",
    "digital",
    "backcover",
  ]);

  const themeStyle = useMemo(() => buildThemeVariables(guide), [guide]);
  const selectedCatalog = sectionCatalog.filter((item) => selectedSections.includes(item.key));

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

  const renderPage = (key: SectionKey) => {
    switch (key) {
      case "cover": {
        const heroImage = guide.design.heroImagePath || guide.design.heroSecondaryImagePath || "";
        const subtitle =
          guide.design.heroSubtitle ||
          localeText(locale, "A sua experiência começa aqui.", "Your experience begins here.", "Su experiencia empieza aquí.");

        return (
          <section className="page cover" style={themeStyle}>
            <div className="hero-photo" aria-label={guide.tenant.name}>
              {heroImage ? <img src={heroImage} alt={guide.tenant.name} /> : null}
            </div>
            <div className="page-inner cover-page">
              <div className="cover-top">
                <div className="brand-mark">{guide.tenant.name.toUpperCase()}</div>
              </div>
              <div className="cover-copy">
                <div className="eyebrow">{localeText(locale, "Guia de Boas-Vindas", "Welcome Guide", "Guía de Bienvenida")}</div>
                <h1>{subtitle}</h1>
                <div className="tenant-name">{guide.tenant.name}</div>
                <p>
                  {localeText(
                    locale,
                    "Informações essenciais para aproveitar sua hospedagem com tranquilidade, conforto e praticidade.",
                    "Essential information to enjoy your stay with peace of mind, comfort and practicality.",
                    "Información esencial para disfrutar de tu estadía con tranquilidad, comodidad y practicidad.",
                  )}
                </p>
              </div>
              <div className="cover-bottom">
                <span>{getShortLocation(guide.contact.address || guide.location?.address || null)}</span>
                <span>Guia Digital RF</span>
              </div>
            </div>
          </section>
        );
      }
      case "welcome": {
        const welcomeText =
          guide.design.welcomeMessage ||
          localeText(
            locale,
            "Este guia reúne as principais informações para que você aproveite a sua estadia com mais tranquilidade.",
            "This guide brings together the key information you need to enjoy your stay with more peace of mind.",
            "Esta guía reúne la información principal para que disfrutes de tu estadía con mayor tranquilidad.",
          );

        return (
          <section className="page" style={themeStyle}>
            <div className="page-inner">
              <span className="page-no">02</span>
              <div className="eyebrow">{localeText(locale, "Boas-vindas", "Welcome", "Bienvenida")}</div>
              <h1>{localeText(locale, "Bem-vindo ao seu refúgio.", "Welcome to your retreat.", "Bienvenido a tu refugio.")}</h1>
              <div className="welcome-layout">
                <div className="hero-photo welcome-photo">
                  {guide.design.heroSecondaryImagePath ? <img src={guide.design.heroSecondaryImagePath} alt={guide.tenant.name} /> : null}
                </div>
                <div>
                  <div className="quote-box">
                    <div className="quote-title">{guide.tenant.name}</div>
                    <p>{welcomeText}</p>
                  </div>
                  <div className="mini-grid">
                    <div className="mini-card">
                      <span>{localeText(locale, "Hospedagem", "Stay", "Alojamiento")}</span>
                      <strong>{guide.tenant.name}</strong>
                    </div>
                    <div className="mini-card">
                      <span>{localeText(locale, "Destino", "Destination", "Destino")}</span>
                      <strong>{getShortLocation(guide.contact.address || guide.location?.address || null)}</strong>
                    </div>
                    <div className="mini-card">
                      <span>{localeText(locale, "Guia", "Guide", "Guía")}</span>
                      <strong>{localeText(locale, "Digital + Impresso", "Digital + Printed", "Digital + Impresa")}</strong>
                    </div>
                    <div className="mini-card">
                      <span>{localeText(locale, "Ajuda", "Support", "Ayuda")}</span>
                      <strong>{localeText(locale, "Anfitrião Virtual", "Virtual Host", "Anfitrión Virtual")}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }
      case "location": {
        return (
          <section className="page" style={themeStyle}>
            <div className="page-inner">
              <span className="page-no">03</span>
              <div className="eyebrow">{localeText(locale, "Como chegar", "How to get there", "Cómo llegar")}</div>
              <h1>{localeText(locale, "Chegue com tranquilidade.", "Arrive with peace of mind.", "Llega con tranquilidad.")}</h1>
              <p className="section-intro muted">
                {localeText(
                  locale,
                  "Tenha à mão o endereço da hospedagem e use o QR Code para abrir a rota no mapa.",
                  "Keep the address handy and use the QR code to open the route in your map app.",
                  "Ten la dirección a mano y usa el código QR para abrir la ruta en tu mapa.",
                )}
              </p>
              <div className="photo-block">
                {guide.location?.photoUrl ? <img src={guide.location.photoUrl} alt={guide.tenant.name} /> : null}
                <span>{localeText(locale, "Localização", "Location", "Ubicación")}</span>
              </div>
              <div className="location-layout">
                <div>
                  <h3>{guide.tenant.name}</h3>
                  <p>{guide.contact.address || guide.location?.address || localeText(locale, "Endereço a confirmar.", "Address to be confirmed.", "Dirección por confirmar.")}</p>
                  <p className="muted">
                    {guide.location?.orientation ||
                      localeText(
                        locale,
                        "Siga as orientações cadastradas no Guia para chegar com facilidade e conforto até a hospedagem.",
                        "Follow the directions saved in the Guide to reach the property easily and comfortably.",
                        "Sigue las indicaciones guardadas en la Guía para llegar con facilidad y comodidad al alojamiento.",
                      )}
                  </p>
                </div>
                <div className="map-card">
                  <div>
                    <QrCodeBlock />
                    <strong>{localeText(locale, "Abrir no mapa", "Open map", "Abrir mapa")}</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }
      case "accommodations": {
        const cards = guide.accommodations.slice(0, 2);
        return (
          <section className="page" style={themeStyle}>
            <div className="page-inner">
              <span className="page-no">04</span>
              <div className="eyebrow">{localeText(locale, "Acomodações", "Accommodations", "Alojamientos")}</div>
              <h1>{localeText(locale, "Escolha seu espaço de descanso.", "Choose your place to unwind.", "Elige tu espacio para descansar.")}</h1>
              {cards.map((accommodation) => (
                <article key={accommodation.id} className="stay-card">
                  <div className="photo-block compact-photo">
                    {accommodation.imageUrl ? <img src={accommodation.imageUrl} alt={accommodation.name} /> : null}
                    <span>{accommodation.name}</span>
                  </div>
                  <div className="stay-body">
                    <div className="stay-head">
                      <h3>{accommodation.name}</h3>
                      <span className="capacity">
                        {accommodation.capacity
                          ? `${accommodation.capacity} ${localeText(locale, "hóspedes", "guests", "huéspedes")}`
                          : localeText(locale, "Capacidade a confirmar", "Capacity to confirm", "Capacidad por confirmar")}
                      </span>
                    </div>
                    <div className="facts">
                      {accommodation.area_m2 ? <span className="fact">{accommodation.area_m2} m²</span> : null}
                      {accommodation.view_description ? <span className="fact">{accommodation.view_description}</span> : null}
                    </div>
                    <p className="muted">
                      {accommodation.short_description ||
                        localeText(
                          locale,
                          "Consulte no Guia Digital as informações completas e atualizadas desta acomodação.",
                          "Check the digital guide for the complete and up-to-date information about this accommodation.",
                          "Consulta la Guía Digital para obtener la información completa y actualizada de este alojamiento.",
                        )}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      }
      case "rules": {
        const rules = guide.rules.slice(0, 3);
        return (
          <section className="page" style={themeStyle}>
            <div className="page-inner">
              <span className="page-no">05</span>
              <div className="eyebrow">{localeText(locale, "Regras e orientações", "Rules & guidelines", "Reglas y orientaciones")}</div>
              <h1>{localeText(locale, "Para uma estadia tranquila.", "For a peaceful stay.", "Para una estadía tranquila.")}</h1>
              <p className="section-intro muted">
                {localeText(
                  locale,
                  "As informações abaixo são atualizadas diretamente pela administração do tenant.",
                  "The information below is updated directly by the tenant administration.",
                  "La información siguiente se actualiza directamente desde la administración del tenant.",
                )}
              </p>
              {rules.map((rule, index) => (
                <div key={rule.id} className="rule-card">
                  <div className="rule-icon">{String(index + 1).padStart(2, "0")}</div>
                  <div>
                    <h3>{rule.title}</h3>
                    <p>{rule.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      }
      case "services": {
        const services = guide.services.slice(0, 2);
        return (
          <section className="page" style={themeStyle}>
            <div className="page-inner">
              <span className="page-no">06</span>
              <div className="eyebrow">{localeText(locale, "Serviços", "Services", "Servicios")}</div>
              <h1>{localeText(locale, "Tudo para tornar sua estadia melhor.", "Everything to make your stay better.", "Todo para hacer tu estadía mejor.")}</h1>
              {services.map((service) => (
                <article key={service.id} className="editorial-card">
                  <div className="photo-block tiny-photo">
                    {service.imageUrl ? <img src={service.imageUrl} alt={service.name} /> : null}
                  </div>
                  <div>
                    <span className="tag">{localeText(locale, "Serviço", "Service", "Servicio")}</span>
                    <h3>{service.name}</h3>
                    <p className="muted">
                      {service.short_description ||
                        service.description ||
                        localeText(
                          locale,
                          "Descrição, horários e orientações aparecem aqui quando disponíveis.",
                          "Description, hours and instructions appear here when available.",
                          "La descripción, horarios e instrucciones aparecen aquí cuando estén disponibles.",
                        )}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      }
      case "tips": {
        const tips = guide.localTips.slice(0, 2);
        return (
          <section className="page" style={themeStyle}>
            <div className="page-inner">
              <span className="page-no">07</span>
              <div className="eyebrow">{localeText(locale, "Dicas da região", "Local tips", "Consejos de la región")}</div>
              <h1>{localeText(locale, "Descubra o que existe por perto.", "Discover what is nearby.", "Descubre lo que hay cerca.")}</h1>
              {tips.map((tip) => (
                <article key={tip.id} className="editorial-card wide-card">
                  <div className="photo-block tiny-photo">
                    {tip.imageUrl ? <img src={tip.imageUrl} alt={tip.name} /> : null}
                  </div>
                  <div>
                    <span className="tag">{localeText(locale, "Natureza", "Nature", "Naturaleza")}</span>
                    <h3>{tip.name}</h3>
                    <p>{tip.short_description || tip.description || localeText(locale, "Informações da dica serão exibidas quando estiverem disponíveis no tenant.", "Tip information will appear when available in the tenant configuration.", "La información del consejo aparecerá cuando esté disponible en la configuración del tenant.")}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      }
      case "contact": (
        <section className="page" style={themeStyle}>
          <div className="page-inner">
            <span className="page-no">08</span>
            <div className="eyebrow">{localeText(locale, "Contatos", "Contacts", "Contactos")}</div>
            <h1>{localeText(locale, "Precisou? Fale com a gente.", "Need anything? Get in touch.", "¿Necesitas algo? Háblanos.")}</h1>
            <div className="contact-grid">
              <div className="contact-card">
                <strong>WhatsApp</strong>
                <span>{guide.contact.whatsapp || guide.contact.phone || localeText(locale, "Não informado", "Not provided", "No informado")}</span>
              </div>
              <div className="contact-card">
                <strong>{localeText(locale, "Endereço", "Address", "Dirección")}</strong>
                <span>{guide.contact.address || guide.location?.address || localeText(locale, "Não informado", "Not provided", "No informado")}</span>
              </div>
              <div className="contact-card">
                <strong>Instagram</strong>
                <span>{guide.contact.instagram || localeText(locale, "Não informado", "Not provided", "No informado")}</span>
              </div>
              <div className="contact-card">
                <strong>{localeText(locale, "Site", "Website", "Sitio web")}</strong>
                <span>{guide.contact.website || localeText(locale, "Não informado", "Not provided", "No informado")}</span>
              </div>
            </div>
            <div className="qr-panel">
              <div className="eyebrow">{localeText(locale, "Acesse o Guia Digital", "Open the Digital Guide", "Accede a la Guía Digital")}</div>
              <div className="qr-layout">
                <QrCodeBlock />
                <div>
                  <h3>{localeText(locale, "Escaneie e continue no celular", "Scan and continue on your phone", "Escanea y continúa en tu celular")}</h3>
                  <p className="muted">
                    {localeText(
                      locale,
                      "Vídeos, informações atualizadas, localização e Anfitrião Virtual ficam sempre disponíveis no Guia Digital.",
                      "Videos, updated information, location, and the virtual host remain available in the Digital Guide.",
                      "Videos, información actualizada, ubicación y el Anfitrión Virtual están siempre disponibles en la Guía Digital.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )
      case "digital":
        return (
          <section className="page digital" style={themeStyle}>
            <div className="page-inner">
              <span className="page-no">09</span>
              <div className="eyebrow">{localeText(locale, "Guia Digital", "Digital Guide", "Guía Digital")}</div>
              <div className="digital-layout">
                <div className="digital-box">
                  <h2>{localeText(locale, "Tem muito mais no seu celular.", "There is much more on your phone.", "Hay mucho más en tu celular.")}</h2>
                  <QrCodeBlock />
                  <h3>{guide.tenant.name}</h3>
                  <p>
                    {localeText(
                      locale,
                      "Aponte a câmera do celular e acesse informações, vídeos, acomodações, regras, dicas da região e atendimento virtual.",
                      "Point your phone camera at the code to access information, videos, accommodations, rules, local tips and virtual support.",
                      "Apunta la cámara del celular para acceder a información, videos, alojamientos, reglas, consejos de la región y atención virtual.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>
        );
      case "backcover":
        return (
          <section className="page back" style={themeStyle}>
            <div className="page-inner">
              <div className="brand-mark back-logo">{guide.tenant.name.toUpperCase()}</div>
              <div className="eyebrow">{localeText(locale, "Obrigado", "Thank you", "Gracias")}</div>
              <h1>{localeText(locale, "Esperamos que sua estadia seja memorável.", "We hope your stay is memorable.", "Esperamos que tu estadía sea memorable.")}</h1>
              <p>
                {localeText(
                  locale,
                  "Sempre que precisar, consulte o Guia Digital para encontrar as informações mais atualizadas da hospedagem.",
                  "Whenever you need it, open the Digital Guide for the most up-to-date information about the property.",
                  "Cuando lo necesites, consulta la Guía Digital para ver la información más actualizada del alojamiento.",
                )}
              </p>
              <div className="brand-line">Guia Digital RF Tecnologia · inovação · automação · confiança</div>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="guide-print-shell">
      <style>{`
        :root {
          --page-width: 148mm;
          --page-height: 210mm;
          --page-pad: 11mm;
          --radius: 18px;
        }

        * { box-sizing: border-box; }

        html, body {
          background: #ddd9d1;
          color: var(--text);
          font-family: Inter, "Segoe UI", sans-serif;
        }

        .guide-print-shell {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .guide-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.625rem;
          justify-content: space-between;
          padding: 0.85rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          background: rgba(255,255,255,0.9);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
        }

        .guide-toolbar strong {
          margin-right: auto;
          color: var(--primary);
          font-size: 0.92rem;
        }

        .guide-toolbar select,
        .guide-toolbar button {
          min-height: 2.5rem;
          padding: 0 0.9rem;
          border-radius: 0.8rem;
          border: 1px solid #d4d4d8;
          background: #fff;
          font: inherit;
        }

        .guide-toolbar .primary-action {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          font-weight: 700;
        }

        .book {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, var(--page-width)));
          gap: 1.2rem;
          justify-content: center;
          padding: 0.9rem;
          border-radius: 1.6rem;
          background: #ece7df;
        }

        .page {
          position: relative;
          width: var(--page-width);
          height: var(--page-height);
          overflow: hidden;
          background: var(--background);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
          color: var(--text);
        }

        .page-inner {
          position: relative;
          z-index: 2;
          height: 100%;
          padding: var(--page-pad);
        }

        .eyebrow {
          font-size: 8.5pt;
          font-weight: 800;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--secondary);
          margin-bottom: 3mm;
        }

        .page-no {
          position: absolute;
          right: 9mm;
          top: 7mm;
          font-size: 8pt;
          letter-spacing: 0.18em;
          font-weight: 700;
          color: var(--muted);
        }

        h1, h2, h3, p { margin-top: 0; }
        h1, h2, .quote-title, .tenant-name, .brand-mark { font-family: Georgia, "Times New Roman", serif; }
        h1 { font-size: 27pt; line-height: 0.96; margin-bottom: 4mm; color: var(--primary); }
        h2 { font-size: 20pt; line-height: 1.04; margin-bottom: 4mm; color: var(--primary); }
        h3 { font-size: 11.5pt; margin-bottom: 2mm; color: var(--primary); }
        p { font-size: 9.2pt; line-height: 1.6; margin-bottom: 3mm; color: var(--text); }
        .muted { color: var(--muted); }
        .section-intro { margin-bottom: 6mm; }

        .hero-photo, .photo-block, .tiny-photo {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(36,56,44,.8), rgba(36,56,44,.28));
          border-radius: var(--radius);
        }

        .hero-photo img, .photo-block img, .tiny-photo img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-block {
          height: 62mm;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 4mm;
          color: rgba(255,255,255,0.9);
          font-size: 8pt;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: linear-gradient(180deg, rgba(10,10,10,0.12), rgba(10,10,10,0.62));
        }

        .compact-photo { height: 48mm; }
        .tiny-photo { height: 36mm; }

        .cover {
          background: var(--primary);
          color: #fff;
        }

        .cover .hero-photo {
          position: absolute;
          inset: 0;
          border-radius: 0;
          background: linear-gradient(180deg, rgba(20,35,28,0.2), rgba(20,35,28,0.82));
        }

        .cover .page-inner {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 11mm 11mm 10mm;
        }

        .cover-top { display: flex; justify-content: center; }
        .brand-mark {
          width: 48mm;
          min-height: 20mm;
          display: grid;
          place-items: center;
          text-align: center;
          padding: 4mm;
          border-radius: 14px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.42);
          color: #fff;
          font-size: 11pt;
          letter-spacing: 0.08em;
        }

        .cover-copy { position: relative; z-index: 2; margin-top: auto; max-width: 110mm; }
        .cover .eyebrow { color: #e8dcb8; }
        .cover h1 { color: #fff; font-size: 28pt; }
        .tenant-name {
          color: #e6d4a8;
          font-size: 18pt;
          margin-bottom: 3mm;
        }
        .cover p { color: rgba(255,255,255,.85); max-width: 92mm; }
        .cover-bottom {
          display: flex;
          justify-content: space-between;
          gap: 3mm;
          padding-top: 4mm;
          border-top: 1px solid rgba(255,255,255,.3);
          font-size: 8.2pt;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,.72);
        }

        .welcome-layout {
          display: grid;
          grid-template-columns: 52mm 1fr;
          gap: 6mm;
          margin-top: 4mm;
        }
        .welcome-photo { height: 118mm; border-radius: 38px 38px 18px 18px; }
        .quote-box {
          background: var(--primary);
          color: #fff;
          border-radius: 26px;
          padding: 6mm;
          min-height: 68mm;
        }
        .quote-title {
          color: #ead9a4;
          font-size: 17pt;
          line-height: 1.08;
          margin-bottom: 3mm;
        }
        .quote-box p { color: rgba(255,255,255,.8); margin: 0; }
        .mini-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 3mm;
          margin-top: 4mm;
        }
        .mini-card {
          padding: 4mm;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--surface);
        }
        .mini-card span {
          display: block;
          margin-bottom: 1.5mm;
          font-size: 7.5pt;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--secondary);
        }
        .mini-card strong { font-size: 10pt; }

        .location-layout { display: grid; grid-template-columns: 1fr 46mm; gap: 6mm; }
        .map-card {
          display: grid;
          place-items: center;
          padding: 5mm;
          border-radius: var(--radius);
          background: repeating-linear-gradient(45deg,#eae2d2,#eae2d2 5px,#f1eadb 5px,#f1eadb 10px);
          border: 1px solid var(--border);
          text-align: center;
          color: var(--primary);
        }
        .map-card strong { display: block; margin-top: 3mm; }
        .qr {
          width: 35mm;
          aspect-ratio: 1;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          padding: 2px;
          background: #fff;
          border: 1px solid var(--primary);
          border-radius: 4mm;
          margin: 0 auto 3mm;
        }
        .qr span { display: block; border-radius: 1px; }

        .stay-card {
          overflow: hidden;
          margin-bottom: 5mm;
          border: 1px solid var(--border);
          border-radius: 24px;
          background: var(--surface);
        }
        .stay-body { padding: 5mm; }
        .stay-head { display: flex; align-items: baseline; justify-content: space-between; gap: 3mm; margin-bottom: 2mm; }
        .capacity {
          color: var(--secondary);
          font-size: 7.5pt;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 800;
        }
        .facts { display: flex; flex-wrap: wrap; gap: 2mm; margin: 3mm 0; }
        .fact {
          display: inline-block;
          padding: 2mm 3mm;
          border-radius: 999px;
          background: var(--soft);
          color: var(--primary);
          font-size: 8pt;
          font-weight: 700;
        }

        .rule-card {
          display: grid;
          grid-template-columns: 11mm 1fr;
          gap: 4mm;
          padding: 4mm 0;
          border-bottom: 1px solid var(--border);
        }
        .rule-icon {
          width: 10mm;
          height: 10mm;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          font-size: 8pt;
          font-weight: 800;
        }

        .editorial-card {
          display: grid;
          grid-template-columns: 46mm 1fr;
          gap: 5mm;
          padding: 4mm;
          margin-bottom: 4mm;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--surface);
        }
        .wide-card { grid-template-columns: 50mm 1fr; }
        .tag {
          display: inline-block;
          margin-bottom: 2mm;
          font-size: 7.5pt;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4mm;
          margin-top: 5mm;
        }
        .contact-card {
          min-height: 30mm;
          padding: 5mm;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--surface);
        }
        .contact-card strong { display: block; margin-bottom: 2mm; color: var(--primary); }
        .contact-card span { display: block; font-size: 9pt; }

        .qr-panel {
          margin-top: 9mm;
          padding: 6mm;
          border-radius: 28px;
          background: var(--soft);
        }
        .qr-layout {
          display: grid;
          grid-template-columns: 37mm 1fr;
          gap: 6mm;
          align-items: center;
        }

        .digital {
          background: var(--primary);
          color: white;
        }
        .digital .eyebrow { color: #d6c187; }
        .digital h2, .digital h3, .digital p { color: white; }
        .digital-layout {
          height: calc(100% - 24mm);
          display: grid;
          place-items: center;
          text-align: center;
        }
        .digital-box {
          width: 102mm;
          padding: 10mm;
          border: 1px solid rgba(255,255,255,.24);
          border-radius: 24px;
          background: rgba(255,255,255,.06);
        }
        .digital-box .qr { width: 48mm; border-color: rgba(255,255,255,.3); }
        .digital-box p { color: rgba(255,255,255,.82); }

        .back {
          background: var(--primary);
          color: white;
        }
        .back .page-inner {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        .back .eyebrow { color: #d9c58d; }
        .back h1 { color: white; }
        .back p { max-width: 84mm; color: rgba(255,255,255,.8); }
        .back-logo {
          width: 55mm;
          margin-bottom: 8mm;
        }
        .brand-line {
          position: absolute;
          left: 50%;
          bottom: 10mm;
          transform: translateX(-50%);
          width: max-content;
          max-width: calc(100% - 18mm);
          font-size: 8pt;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,.62);
        }

        @media (max-width: 1100px) {
          .book { grid-template-columns: var(--page-width); }
        }

        @media print {
          @page { size: A5 portrait; margin: 0; }
          html, body { background: white !important; margin: 0; padding: 0; }
          .print-hidden { display: none !important; }
          .guide-print-shell { padding: 0; }
          .book {
            display: block;
            background: transparent;
            padding: 0;
          }
          .page {
            width: var(--page-width);
            height: var(--page-height);
            margin: 0 auto 8mm;
            box-shadow: none;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="print-hidden guide-toolbar">
        <strong>Prévia — Guia Impresso A5</strong>
        <select value={locale} onChange={(event) => setLocale(event.target.value as GuideLocale)}>
          {SUPPORTED_LOCALES.map((available) => (
            <option key={available} value={available}>
              {available === "pt-BR" ? "Português" : available === "en" ? "English" : "Español"}
            </option>
          ))}
        </select>
        <button type="button" className="primary-action" onClick={() => window.print()}>
          Imprimir / Salvar PDF
        </button>
      </div>

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
        {selectedCatalog.map((item) => (
          <div key={item.key}>{renderPage(item.key)}</div>
        ))}
      </main>
    </div>
  );
}
