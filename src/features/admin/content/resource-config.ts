import {
  BedDouble,
  BookOpen,
  CalendarClock,
  ContactRound,
  GalleryHorizontal,
  House,
  MapPinned,
  Palette,
  Settings2,
  ShieldCheck,
  Utensils,
  Wifi,
} from "lucide-react";
import type { ComponentType } from "react";

export type ResourceKey =
  | "inicio"
  | "servicos"
  | "wifi"
  | "horarios"
  | "regras"
  | "contatos"
  | "galeria"
  | "dicas"
  | "pwa"
  | "reservas";

type FieldType = "text" | "textarea" | "number" | "url" | "checkbox" | "select" | "time";

export type ResourceField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
};

export type ResourceOption = { value: string; label: string };

export type ResourceDefinition = {
  key: ResourceKey;
  title: string;
  description: string;
  table: string;
  icon: ComponentType<{ className?: string }>;
  singleton?: boolean;
  fields: ResourceField[];
};

const statusOptions = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Arquivado" },
];

export const resourceDefinitions: Record<ResourceKey, ResourceDefinition> = {
  inicio: {
    key: "inicio",
    title: "Início do Guia",
    description: "Organize as seções que aparecem na Home do estabelecimento.",
    table: "tenant_home_sections",
    icon: House,
    fields: [
      { name: "section_type", label: "Tipo da seção", type: "text", required: true },
      { name: "title", label: "Título", type: "text" },
      { name: "subtitle", label: "Subtítulo", type: "text" },
      { name: "variant", label: "Variante", type: "text" },
      { name: "enabled", label: "Exibir no Guia", type: "checkbox" },
      { name: "sort_order", label: "Ordem", type: "number" },
    ],
  },
  servicos: {
    key: "servicos",
    title: "Serviços",
    description: "Cadastre experiências e serviços disponíveis para os hóspedes.",
    table: "services",
    icon: Utensils,
    fields: [
      { name: "name", label: "Nome", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "short_description", label: "Descrição curta", type: "text" },
      { name: "description", label: "Descrição", type: "textarea" },
      { name: "price", label: "Preço", type: "number" },
      { name: "price_type", label: "Tipo de preço", type: "select", options: [{ value: "fixed", label: "Preço fixo" }, { value: "starting_from", label: "A partir de" }, { value: "upon_request", label: "Sob consulta" }, { value: "free", label: "Gratuito" }] },
      { name: "requires_booking", label: "Reserva necessária", type: "checkbox" },
      { name: "booking_url", label: "URL de reserva", type: "url" },
      { name: "contact_action", label: "Ação de contato", type: "text" },
      { name: "sort_order", label: "Ordem", type: "number" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
    ],
  },
  wifi: {
    key: "wifi",
    title: "Wi-Fi",
    description: "Gerencie as redes exibidas aos hóspedes, sem conexão automática.",
    table: "wifi_networks",
    icon: Wifi,
    fields: [
      { name: "name", label: "Nome", type: "text", required: true },
      { name: "ssid", label: "Nome da rede / SSID", type: "text", required: true },
      { name: "password", label: "Senha", type: "text" },
      { name: "area", label: "Área", type: "text" },
      { name: "is_guest_visible", label: "Mostrar ao hóspede", type: "checkbox" },
      { name: "sort_order", label: "Ordem", type: "number" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
    ],
  },
  horarios: {
    key: "horarios",
    title: "Horários",
    description: "Cadastre horários de funcionamento e seus períodos.",
    table: "schedules",
    icon: CalendarClock,
    fields: [
      { name: "name", label: "Nome", type: "text", required: true },
      { name: "schedule_type", label: "Tipo", type: "text", required: true, placeholder: "ex.: breakfast" },
      { name: "description", label: "Descrição", type: "textarea" },
      { name: "sort_order", label: "Ordem", type: "number" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
    ],
  },
  regras: {
    key: "regras",
    title: "Regras",
    description: "Informe regras importantes para uma estadia tranquila.",
    table: "rules",
    icon: ShieldCheck,
    fields: [
      { name: "title", label: "Título", type: "text", required: true },
      { name: "category", label: "Categoria", type: "text", required: true, placeholder: "ex.: house_rules" },
      { name: "content", label: "Conteúdo", type: "textarea", required: true },
      { name: "severity", label: "Importância", type: "select", options: [{ value: "info", label: "Informativa" }, { value: "important", label: "Importante" }, { value: "critical", label: "Crítica" }] },
      { name: "is_featured", label: "Destacar no Guia", type: "checkbox" },
      { name: "sort_order", label: "Ordem", type: "number" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
    ],
  },
  contatos: {
    key: "contatos",
    title: "Contatos",
    description: "Mantenha os canais de contato do estabelecimento atualizados.",
    table: "contacts",
    icon: ContactRound,
    fields: [
      { name: "contact_type", label: "Tipo", type: "select", required: true, options: [{ value: "phone", label: "Telefone" }, { value: "whatsapp", label: "WhatsApp" }, { value: "email", label: "E-mail" }, { value: "instagram", label: "Instagram" }, { value: "website", label: "Site" }, { value: "reception", label: "Recepção" }, { value: "emergency", label: "Emergência" }] },
      { name: "label", label: "Nome do contato", type: "text", required: true },
      { name: "value", label: "Valor", type: "text", required: true },
      { name: "description", label: "Descrição", type: "text" },
      { name: "is_primary", label: "Contato principal", type: "checkbox" },
      { name: "is_emergency", label: "Emergência", type: "checkbox" },
      { name: "sort_order", label: "Ordem", type: "number" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
    ],
  },
  galeria: {
    key: "galeria",
    title: "Galeria",
    description: "Associe fotos e vídeos já enviados à Biblioteca de Mídia.",
    table: "gallery_items",
    icon: GalleryHorizontal,
    fields: [
      { name: "category_id", label: "Categoria", type: "text", placeholder: "ID da categoria" },
      { name: "media_id", label: "Mídia", type: "text", required: true, placeholder: "ID da mídia publicada" },
      { name: "title", label: "Título", type: "text" },
      { name: "caption", label: "Legenda", type: "textarea" },
      { name: "is_featured", label: "Destacar", type: "checkbox" },
      { name: "sort_order", label: "Ordem", type: "number" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
    ],
  },
  dicas: {
    key: "dicas",
    title: "Dicas da Região",
    description: "Publique recomendações úteis para explorar a região.",
    table: "local_tips",
    icon: MapPinned,
    fields: [
      { name: "category_id", label: "Categoria", type: "text", placeholder: "ID da categoria" },
      { name: "name", label: "Nome", type: "text", required: true },
      { name: "short_description", label: "Descrição curta", type: "text" },
      { name: "description", label: "Descrição", type: "textarea" },
      { name: "address", label: "Endereço", type: "text" },
      { name: "phone", label: "Telefone", type: "text" },
      { name: "whatsapp", label: "WhatsApp", type: "text" },
      { name: "website", label: "Site", type: "url" },
      { name: "instagram", label: "Instagram", type: "text" },
      { name: "opening_hours_text", label: "Horário", type: "text" },
      { name: "distance_text", label: "Distância", type: "text" },
      { name: "recommended", label: "Recomendado", type: "checkbox" },
      { name: "sort_order", label: "Ordem", type: "number" },
      { name: "status", label: "Status", type: "select", options: statusOptions },
    ],
  },
  pwa: {
    key: "pwa",
    title: "PWA",
    description: "Configure a identidade instalável do Guia deste estabelecimento.",
    table: "tenant_pwa_settings",
    icon: Settings2,
    singleton: true,
    fields: [
      { name: "enabled", label: "Ativar PWA", type: "checkbox" },
      { name: "name", label: "Nome", type: "text" },
      { name: "short_name", label: "Nome curto", type: "text" },
      { name: "description", label: "Descrição", type: "textarea" },
      { name: "theme_color", label: "Cor do tema", type: "text", placeholder: "#075DD8" },
      { name: "background_color", label: "Cor de fundo", type: "text", placeholder: "#FFFFFF" },
      { name: "install_prompt_enabled", label: "Solicitar instalação", type: "checkbox" },
      { name: "offline_enabled", label: "Offline quando suportado", type: "checkbox" },
    ],
  },
  reservas: {
    key: "reservas",
    title: "Reservas",
    description: "Configure o acesso ao canal de reservas sem criar um motor próprio.",
    table: "booking_settings",
    icon: BookOpen,
    singleton: true,
    fields: [
      { name: "is_active", label: "Ativar reservas", type: "checkbox" },
      { name: "provider", label: "Provedor", type: "text" },
      { name: "external_url", label: "URL externa", type: "url" },
      { name: "button_label", label: "Texto do botão", type: "text" },
      { name: "open_mode", label: "Modo de abertura", type: "select", options: [{ value: "external", label: "Abrir externamente" }, { value: "internal", label: "Abrir internamente" }] },
    ],
  },
};

export function getResourceDefinition(key: string) {
  return resourceDefinitions[key as ResourceKey] ?? null;
}

export const sidebarResourceItems = [
  { group: "CONTEÚDO", label: "Início do Guia", href: "inicio", icon: House },
  { group: "CONTEÚDO", label: "Chalés / Acomodações", href: "acomodacoes", icon: BedDouble },
  { group: "CONTEÚDO", label: "Fotos e vídeos", href: "midia", icon: GalleryHorizontal },
  { group: "CONTEÚDO", label: "Serviços", href: "servicos", icon: Utensils },
  { group: "CONTEÚDO", label: "Wi-Fi", href: "wifi", icon: Wifi },
  { group: "CONTEÚDO", label: "Horários", href: "horarios", icon: CalendarClock },
  { group: "CONTEÚDO", label: "Regras", href: "regras", icon: ShieldCheck },
  { group: "CONTEÚDO", label: "Contatos", href: "contatos", icon: ContactRound },
  { group: "CONTEÚDO", label: "Galeria", href: "galeria", icon: GalleryHorizontal },
  { group: "CONTEÚDO", label: "Dicas da Região", href: "dicas", icon: MapPinned },
  { group: "CONTEÚDO", label: "Conteúdos do Guia", href: "conteudos", icon: BookOpen },
  { group: "PERSONALIZAÇÃO", label: "Aparência", href: "aparencia", icon: Palette },
  { group: "PERSONALIZAÇÃO", label: "PWA", href: "pwa", icon: Settings2 },
  { group: "CONFIGURAÇÕES", label: "Reservas", href: "reservas", icon: BookOpen },
] as const;
