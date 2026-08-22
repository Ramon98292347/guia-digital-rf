"use client";

import { Globe, Printer, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
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
    welcome: "Bienvenido",
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

function QrCodePattern() {
  const cells = useMemo(
    () =>
      Array.from({ length: 49 }, (_, index) => {
        const row = Math.floor(index / 7);
        const col = index % 7;
        const isBorder = row === 0 || col === 0 || row === 6 || col === 6;
        const shouldFill =
          isBorder ||
          ((row + col) % 3 === 0 && row > 1 && col > 1) ||
          (row % 2 === 0 && col % 2 === 0 && row > 2 && col > 2) ||
          (row > 2 && col > 2 && (row + col) % 2 === 1);
        return shouldFill ? "bg-black" : "bg-white";
      }),
    [],
  );

  return (
    <div className="grid grid-cols-7 gap-[2px] rounded-md border border-black bg-black p-2">
      {cells.map((className, index) => (
        <span key={index} className={cn("block aspect-square rounded-[1px]", className)} />
      ))}
    </div>
  );
}

function PrintablePage({
  title,
  children,
  badge,
}: {
  title: string;
  children: React.ReactNode;
  badge: string;
}) {
  return (
    <article className="a5-page relative overflow-hidden rounded-[18px] border border-neutral-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
        <span>{badge}</span>
        <span>{title}</span>
      </div>
      <div className="space-y-3 p-4 text-neutral-800">{children}</div>
    </article>
  );
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
      case "cover":
        return (
          <PrintablePage title={labels[locale].cover} badge="01">
            <div className="relative flex h-[420px] flex-col justify-between overflow-hidden rounded-[16px] bg-neutral-100">
              {guide.design.heroImagePath ? (
                <img src={guide.design.heroImagePath} alt={guide.tenant.name} className="absolute inset-0 h-full w-full object-cover" />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/35 to-black/70" />
              <div className="relative z-10 flex items-center justify-between px-4 pt-3 text-[10px] font-medium text-white/90">
                <span>{guide.tenant.name}</span>
                <span>{locale === "pt-BR" ? "Guia de Boas-Vindas" : locale === "en" ? "Welcome Guide" : "Guía de Bienvenida"}</span>
              </div>
              <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center text-white">
                {guide.branding.logoPath ? (
                  <img src={guide.branding.logoPath} alt={guide.tenant.name} className="mb-3 h-14 w-auto object-contain" />
                ) : null}
                <p className="text-[12px] font-medium uppercase tracking-[0.28em] text-white/80">
                  {locale === "pt-BR" ? "Guia de Boas-Vindas" : locale === "en" ? "Welcome Guide" : "Guía de Bienvenida"}
                </p>
                <h1 className="mt-3 text-[26px] font-black uppercase leading-none tracking-[0.12em]">
                  {guide.tenant.name}
                </h1>
                <p className="mt-3 max-w-[220px] text-[11px] leading-relaxed text-white/90">
                  {guide.design.heroSubtitle ||
                    (locale === "pt-BR"
                      ? "A sua experiência começa aqui."
                      : locale === "en"
                        ? "Your experience begins here."
                        : "Su experiencia empieza aquí.")}
                </p>
              </div>
            </div>
          </PrintablePage>
        );
      case "welcome":
        return (
          <PrintablePage title={labels[locale].welcome} badge="02">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {locale === "pt-BR" ? "Boas-vindas" : locale === "en" ? "Welcome" : "Bienvenidos"}
              </p>
              <h2 className="text-[24px] font-black leading-none text-neutral-900">
                {guide.design.heroTitle || guide.tenant.name}
              </h2>
              <p className="text-[11px] leading-5 text-neutral-700">
                {guide.design.welcomeMessage ||
                  (locale === "pt-BR"
                    ? "Seja bem-vindo ao seu refúgio. Aqui você encontra tudo o que precisa para aproveitar a sua estadia com conforto e praticidade."
                    : locale === "en"
                      ? "Welcome to your retreat. Here you will find everything you need to enjoy your stay with comfort and convenience."
                      : "Sea bienvenido a su refugio. Aquí encontrará todo lo que necesita para disfrutar de su estadía con comodidad y facilidad.")}
              </p>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  {locale === "pt-BR" ? "Pendentes" : locale === "en" ? "Highlights" : "Destacados"}
                </p>
                <div className="mt-2 space-y-2 text-[11px] text-neutral-700">
                  {guide.quickActions.slice(0, 3).map((action) => (
                    <div key={action.label} className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-[9px] text-emerald-700">
                        {action.icon.slice(0, 2).toUpperCase()}
                      </span>
                      <span>{action.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PrintablePage>
        );
      case "location":
        return (
          <PrintablePage title={labels[locale].location} badge="03">
            <div className="space-y-3">
              {guide.location?.photoUrl ? (
                <img src={guide.location.photoUrl} alt={guide.tenant.name} className="h-28 w-full rounded-xl object-cover" />
              ) : null}
              <h3 className="text-[18px] font-black leading-tight text-neutral-900">
                {guide.location?.title || (locale === "pt-BR" ? "Como chegar" : locale === "en" ? "How to get there" : "Cómo llegar")}
              </h3>
              <p className="text-[11px] leading-5 text-neutral-700">
                {guide.location?.address || guide.contact.address || "Endereço não informado."}
              </p>
              <p className="text-[11px] leading-5 text-neutral-700">
                {guide.location?.orientation ||
                  (locale === "pt-BR"
                    ? "Siga as orientações para chegar com facilidade e conforto até a sua hospedagem."
                    : locale === "en"
                      ? "Follow the directions to reach your stay comfortably and easily."
                      : "Siga las indicaciones para llegar a su alojamiento con facilidad y comodidad.")}
              </p>
            </div>
          </PrintablePage>
        );
      case "accommodations":
        return (
          <PrintablePage title={labels[locale].accommodations} badge="04">
            <div className="space-y-3">
              {guide.accommodations.slice(0, 2).map((accommodation) => (
                <div key={accommodation.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                  <img src={accommodation.imageUrl ?? guide.design.heroImagePath ?? ""} alt={accommodation.name} className="h-24 w-full object-cover" />
                  <div className="space-y-2 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[14px] font-black text-neutral-900">{accommodation.name}</h4>
                      <span className="text-[10px] uppercase tracking-[0.12em] text-neutral-500">
                        {accommodation.capacity ? `${accommodation.capacity} hóspedes` : "Capacidade"}
                      </span>
                    </div>
                    <p className="text-[10px] leading-5 text-neutral-700">
                      {accommodation.short_description || "Descrição não informada."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </PrintablePage>
        );
      case "rules":
        return (
          <PrintablePage title={labels[locale].rules} badge="05">
            <div className="space-y-2">
              {guide.rules.slice(0, 4).map((rule) => (
                <div key={rule.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-2">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-600">{rule.category}</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] text-amber-700">{rule.severity}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-neutral-900">{rule.title}</p>
                  <p className="mt-1 text-[10px] leading-5 text-neutral-700">{rule.content}</p>
                </div>
              ))}
            </div>
          </PrintablePage>
        );
      case "services":
        return (
          <PrintablePage title={labels[locale].services} badge="06">
            <div className="space-y-2">
              {guide.services.slice(0, 4).map((service) => (
                <div key={service.id} className="flex gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-2">
                  <img src={service.imageUrl ?? guide.design.heroImagePath ?? ""} alt={service.name} className="h-14 w-14 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black text-neutral-900">{service.name}</p>
                    <p className="mt-1 text-[10px] leading-5 text-neutral-700">{service.short_description || service.description || "Serviço em atualização."}</p>
                  </div>
                </div>
              ))}
            </div>
          </PrintablePage>
        );
      case "tips":
        return (
          <PrintablePage title={labels[locale].tips} badge="07">
            <div className="space-y-2">
              {guide.localTips.slice(0, 4).map((tip) => (
                <div key={tip.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-2">
                  <div className="mb-2 flex items-center gap-2">
                    <img src={tip.imageUrl ?? guide.design.heroImagePath ?? ""} alt={tip.name} className="h-10 w-10 rounded-md object-cover" />
                    <p className="text-[11px] font-black text-neutral-900">{tip.name}</p>
                  </div>
                  <p className="text-[10px] leading-5 text-neutral-700">{tip.short_description || tip.description || "Dica em atualização."}</p>
                </div>
              ))}
            </div>
          </PrintablePage>
        );
      case "contact":
        return (
          <PrintablePage title={labels[locale].contact} badge="08">
            <div className="space-y-3 text-[11px] text-neutral-700">
              {guide.contact.phone ? <p><span className="font-semibold text-neutral-900">Tel:</span> {guide.contact.phone}</p> : null}
              {guide.contact.whatsapp ? <p><span className="font-semibold text-neutral-900">WhatsApp:</span> {guide.contact.whatsapp}</p> : null}
              {guide.contact.email ? <p><span className="font-semibold text-neutral-900">E-mail:</span> {guide.contact.email}</p> : null}
              {guide.contact.instagram ? <p><span className="font-semibold text-neutral-900">Instagram:</span> {guide.contact.instagram}</p> : null}
              {guide.contact.website ? <p><span className="font-semibold text-neutral-900">Site:</span> {guide.contact.website}</p> : null}
              {guide.contact.address ? <p><span className="font-semibold text-neutral-900">Endereço:</span> {guide.contact.address}</p> : null}
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-center">
                <div className="mb-2 flex justify-center">
                  <QrCodePattern />
                </div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-neutral-500">
                  {locale === "pt-BR" ? "Acesse o guia digital" : locale === "en" ? "Access the digital guide" : "Acceda a la guía digital"}
                </p>
              </div>
            </div>
          </PrintablePage>
        );
      case "digital":
        return (
          <PrintablePage title={labels[locale].digital} badge="09">
            <div className="space-y-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {locale === "pt-BR" ? "Tem muito mais no seu celular" : locale === "en" ? "There is much more on your phone" : "Hay mucho más en tu celular"}
              </p>
              <div className="flex justify-center">
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                  <QrCodePattern />
                </div>
              </div>
              <p className="text-[12px] font-bold text-neutral-900">
                {guide.tenant.name}
              </p>
              <p className="text-[10px] leading-5 text-neutral-700">
                {locale === "pt-BR"
                  ? "Aponte a câmera do celular e acesse o Guia Digital."
                  : locale === "en"
                    ? "Point your phone camera at the code and access the Digital Guide."
                    : "Apunte la cámara de su celular para acceder a la Guía Digital."}
              </p>
            </div>
          </PrintablePage>
        );
      case "backcover":
        return (
          <PrintablePage title={labels[locale].backcover} badge="10">
            <div className="flex h-[420px] flex-col justify-between rounded-[16px] bg-neutral-900 p-4 text-white">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-white/70">
                <span>{guide.tenant.name}</span>
                <Sparkles className="size-4" />
              </div>
              <div className="space-y-2">
                <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/70">{locale === "pt-BR" ? "Obrigado" : locale === "en" ? "Thank you" : "Gracias"}</p>
                <h3 className="text-[26px] font-black uppercase leading-none tracking-[0.12em]">{guide.tenant.name}</h3>
                <p className="max-w-[220px] text-[10px] leading-5 text-white/80">
                  {locale === "pt-BR"
                    ? "Esperamos que sua estadia seja acolhedora, confortável e memorável."
                    : locale === "en"
                      ? "We hope your stay is warm, comfortable, and memorable."
                      : "Esperamos que su estadía sea acogedora, cómoda y memorable."}
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-3 text-[10px] text-white/85">
                {guide.contact.phone ? `Tel: ${guide.contact.phone}` : "Contato disponível no Guia Digital."}
              </div>
            </div>
          </PrintablePage>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <style jsx global>{`
        @page {
          size: A5 portrait;
          margin: 0;
        }

        @media print {
          body {
            background: white !important;
          }

          .print-hidden {
            display: none !important;
          }

          .guide-preview-grid {
            display: block !important;
            padding: 0 !important;
          }

          .a5-page {
            break-inside: avoid;
            page-break-inside: avoid;
            page-break-after: always;
            box-shadow: none !important;
            margin: 0 auto 0.8rem auto !important;
          }
        }
      `}</style>

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
                    locale === available
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:bg-neutral-100",
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
                    selected
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300",
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

      <div className="guide-preview-grid grid gap-5 rounded-[26px] bg-neutral-100 p-4 md:grid-cols-2 xl:grid-cols-3 print:!grid-cols-1">
        {selectedCatalog.map((item) => (
          <div key={item.key}>{renderPage(item.key)}</div>
        ))}
      </div>
    </div>
  );
}
