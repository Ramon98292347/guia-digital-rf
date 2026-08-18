import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para semear a demo do Villa Caravaggio.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const tenantSlug = "villa-caravaggio";
const pathPrefix = `/${tenantSlug}`;

const designConfig = {
  atmosphereLabel: "Natureza premium",
  heroImagePath: "/demo/villa/hero.jpg",
  heroSecondaryImagePath: "/demo/villa/hero-detail.jpg",
  heroLineImagePath: "/demo/villa/linha.png",
  heroTitle: "Bem-vindo(a)!",
  heroSubtitle: "Sua experiência começa aqui.",
  signature: "A natureza inspira. Aqui, você se conecta.",
  welcomeMessage:
    "Todas as informações e serviços que você precisa, na palma da mão.",
  contactPhone: "(27) 2018-2564",
  contactEmail: "chalesvillacaravaggio@gmail.com",
  contactAddress: "Circuito Caravaggio - Santa Teresa, ES - CEP: 29650-000",
  serviceHighlights: [
    "Estacionamento gratuito",
    "Ar condicionado",
    "Wi Fi",
    "Secador de cabelos",
    "TV Smart",
    "Frigobar",
    "Roupão",
    "Hidromassagem",
  ],
  mutedColor: "#f1e5d7",
  borderColor: "#eadbc7",
  overlayFrom: "rgba(249, 241, 233, 0.18)",
  overlayTo: "rgba(249, 241, 233, 0.88)",
};

const sectionRows = [
  {
    section_type: "quick_actions",
    title: "Explore sua experiência",
    subtitle:
      "Atalhos preparados para destacar os principais pontos do Guia em uma navegação mobile fluida.",
    sort_order: 10,
    settings: {
      items: [
        {
          label: "Acomodações",
          icon: "bed",
          target: "#acomodacoes",
          description: null,
        },
        {
          label: "Reservas",
          icon: "calendar",
          target: "#reserva",
          description: null,
        },
        {
          label: "Wi-Fi",
          icon: "wifi",
          target: "#servicos",
          description: null,
        },
        {
          label: "Como Chegar",
          icon: "map",
          target: "#mais",
          description: null,
        },
        {
          label: "Contato",
          icon: "phone",
          target: "#mais",
          description: null,
        },
        {
          label: "Galeria",
          icon: "gallery",
          target: "#galeria",
          description: null,
        },
        {
          label: "Gastronomia",
          icon: "utensils",
          target: "#cafe",
          description: null,
        },
        {
          label: "Dicas da Região",
          icon: "signpost",
          target: "#dicas",
          description: null,
        },
        {
          label: "Chat 24h",
          icon: "chat",
          target: "#concierge",
          description: null,
        },
      ],
    },
  },
  {
    section_type: "stay_summary",
    title: "Sua estadia começa aqui",
    subtitle:
      "Informações essenciais da estadia, serviços e contatos organizados em uma experiência pensada para o celular.",
    sort_order: 20,
    settings: {
      eyebrow: "Estadia",
      body: "Tudo o que o hóspede precisa consultar pode ser centralizado aqui com atualização por tenant, preservando a mesma arquitetura multi-tenant do produto.",
    },
  },
  {
    section_type: "accommodations",
    title: "Acomodações",
    subtitle:
      "A seção já está preparada para listar acomodações publicadas do tenant atual com fotos, capacidade e acesso à reserva.",
    sort_order: 30,
    settings: {},
  },
  {
    section_type: "services",
    title: "Serviços e informações",
    subtitle:
      "Facilidades e comodidades do Chalés Villa Caravaggio em uma apresentação clara e acolhedora.",
    sort_order: 40,
    settings: {},
  },
  {
    section_type: "custom_content",
    variant: "breakfast",
    title: "Café da manhã",
    subtitle:
      "Conteúdo demonstrativo baseado nas informações públicas atuais do estabelecimento.",
    sort_order: 50,
    settings: {
      eyebrow: "Manhã",
      body: "No Chalés Villa Caravaggio, o dia começa de um jeito especial: com uma charmosa cesta de café da manhã repleta de delícias, entregue todos os dias no conforto do seu chalé.",
    },
  },
  {
    section_type: "gallery",
    title: "Galeria",
    subtitle:
      "Seleção visual de demonstração para transmitir a atmosfera do Guia em uma apresentação mobile premium.",
    sort_order: 60,
    settings: {
      imagePaths: [
        "/demo/villa/gallery-1.jpg",
        "/demo/villa/gallery-2.jpg",
        "/demo/villa/gallery-3.jpg",
        "/demo/villa/gallery-4.jpg",
        "/demo/villa/gallery-5.jpg",
      ],
    },
  },
  {
    section_type: "local_tips",
    title: "Dicas de Santa Teresa",
    subtitle:
      "Espaço pronto para receber sugestões locais, roteiros e descobertas da região.",
    sort_order: 70,
    settings: {},
  },
  {
    section_type: "concierge_cta",
    title: "Concierge",
    subtitle:
      "Nesta demonstração, o Concierge aparece como interface visual. A orquestração inteligente poderá evoluir depois, usando os mesmos dados do tenant.",
    sort_order: 80,
    settings: {
      eyebrow: "Demonstração",
      body: "A interface visual do Concierge já está pronta para a apresentação. A inteligência real poderá ser conectada depois à mesma base de dados do tenant.",
    },
  },
  {
    section_type: "booking_cta",
    title: "Reservas",
    subtitle:
      "O canal oficial de reservas ainda será configurado pelo estabelecimento. A interface já está pronta para recebê-lo sem hardcode.",
    sort_order: 90,
    settings: {
      label: "Reservar agora",
      href: "https://book.omnibees.com/hotel/22503?lang=pt-BR&currencyId=16",
      helperText:
        "Canal oficial de reservas do Chalés Villa Caravaggio.",
    },
  },
];

const navigationRows = [
  {
    label: "Início",
    icon: "house",
    destination_type: "section",
    destination: "#topo",
    position: "primary",
    sort_order: 10,
  },
  {
    label: "Explorar",
    icon: "compass",
    destination_type: "section",
    destination: "#explorar",
    position: "primary",
    sort_order: 20,
  },
  {
    label: "Concierge",
    icon: "bot",
    destination_type: "section",
    destination: "#concierge",
    position: "primary",
    highlighted: true,
    sort_order: 30,
  },
  {
    label: "Estadia",
    icon: "key",
    destination_type: "section",
    destination: "#estadia",
    position: "primary",
    sort_order: 40,
  },
  {
    label: "Mais",
    icon: "more",
    destination_type: "section",
    destination: "#mais",
    position: "primary",
    sort_order: 50,
  },
];

async function ensureTenant() {
  const { data, error } = await supabase
    .from("tenants")
    .upsert(
      {
        name: "Chalés Villa Caravaggio",
        slug: tenantSlug,
        type: "hospitality",
        status: "active",
        timezone: "America/Sao_Paulo",
        locale: "pt-BR",
        currency: "BRL",
        published_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    )
    .select("id, name, slug")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function ensureDomains(tenantId) {
  const now = new Date().toISOString();

  const rows = [
    {
      tenant_id: tenantId,
      hostname: "localhost",
      path_prefix: pathPrefix,
      domain_type: "platform_path",
      status: "active",
      verification_status: "verified",
      verified_at: now,
      is_primary: true,
    },
    {
      tenant_id: tenantId,
      hostname: "127.0.0.1",
      path_prefix: pathPrefix,
      domain_type: "platform_path",
      status: "active",
      verification_status: "verified",
      verified_at: now,
      is_primary: false,
    },
  ];

  for (const row of rows) {
    const { data: existing, error: existingError } = await supabase
      .from("tenant_domains")
      .select("id")
      .eq("hostname", row.hostname)
      .eq("path_prefix", row.path_prefix)
      .eq("domain_type", row.domain_type)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("tenant_domains")
        .update(row)
        .eq("id", existing.id);

      if (updateError) {
        throw updateError;
      }

      continue;
    }

    const { error: insertError } = await supabase
      .from("tenant_domains")
      .insert(row);

    if (insertError) {
      throw insertError;
    }
  }
}

async function ensureBranding(tenantId) {
  const { error } = await supabase.from("tenant_branding").upsert({
    tenant_id: tenantId,
    primary_color: "#5ec5c0",
    secondary_color: "#f4ebe1",
    accent_color: "#8c3c96",
    background_color: "#fbf6ef",
    surface_color: "#fffdfa",
    foreground_color: "#4b3b35",
    logo_path: "/demo/villa/logo.png",
    icon_path: null,
    font_heading: "Raleway",
    font_body: "Raleway",
  });

  if (error) {
    throw error;
  }
}

async function ensureSettings(tenantId) {
  const { error: tenantSettingsError } = await supabase.from("tenant_settings").upsert({
    tenant_id: tenantId,
    settings: {
      demo_mode: true,
      public_guide_ready: true,
    },
  });

  if (tenantSettingsError) {
    throw tenantSettingsError;
  }

  const { error: designError } = await supabase.from("tenant_design_settings").upsert({
    tenant_id: tenantId,
    template_key: "natureza-premium",
    design_config: designConfig,
  });

  if (designError) {
    throw designError;
  }

  const { error: pwaError } = await supabase.from("tenant_pwa_settings").upsert({
    tenant_id: tenantId,
    enabled: false,
    name: "Chalés Villa Caravaggio",
    short_name: "Villa Caravaggio",
    description: "Demonstração pública do Guia Digital do tenant.",
    theme_color: "#5ec5c0",
    background_color: "#fbf6ef",
  });

  if (pwaError) {
    throw pwaError;
  }

  const { error: bookingError } = await supabase.from("booking_settings").upsert({
    tenant_id: tenantId,
    is_active: true,
    provider: "demo",
    external_url: "https://book.omnibees.com/hotel/22503?lang=pt-BR&currencyId=16",
    open_mode: "external",
    button_label: "Reservar agora",
  });

  if (bookingError) {
    throw bookingError;
  }
}

async function ensureModules(tenantId) {
  const { data: modules, error } = await supabase
    .from("modules")
    .select("id, key")
    .in("key", ["accommodations", "services", "gallery", "concierge", "wifi"]);

  if (error) {
    throw error;
  }

  const rows = modules.map((module, index) => ({
    tenant_id: tenantId,
    module_id: module.id,
    enabled: true,
    sort_order: (index + 1) * 10,
    settings: { demo_mode: true, key: module.key },
  }));

  for (const row of rows) {
    const { error: upsertError } = await supabase.from("tenant_modules").upsert(row, {
      onConflict: "tenant_id,module_id",
    });

    if (upsertError) {
      throw upsertError;
    }
  }
}

async function replaceHomeAndNavigation(tenantId) {
  const { error: deleteSectionsError } = await supabase
    .from("tenant_home_sections")
    .delete()
    .eq("tenant_id", tenantId);

  if (deleteSectionsError) {
    throw deleteSectionsError;
  }

  const { error: insertSectionsError } = await supabase
    .from("tenant_home_sections")
    .insert(
      sectionRows.map((section) => ({
        tenant_id: tenantId,
        enabled: true,
        variant: section.variant ?? null,
        section_type: section.section_type,
        title: section.title,
        subtitle: section.subtitle,
        sort_order: section.sort_order,
        content_source: "manual",
        settings: section.settings,
        style_overrides: {},
      })),
    );

  if (insertSectionsError) {
    throw insertSectionsError;
  }

  const { error: deleteNavigationError } = await supabase
    .from("tenant_navigation")
    .delete()
    .eq("tenant_id", tenantId);

  if (deleteNavigationError) {
    throw deleteNavigationError;
  }

  const { error: insertNavigationError } = await supabase
    .from("tenant_navigation")
    .insert(
      navigationRows.map((item) => ({
        tenant_id: tenantId,
        enabled: true,
        highlighted: item.highlighted ?? false,
        ...item,
      })),
    );

  if (insertNavigationError) {
    throw insertNavigationError;
  }
}

async function main() {
  const tenant = await ensureTenant();
  await ensureDomains(tenant.id);
  await ensureBranding(tenant.id);
  await ensureSettings(tenant.id);
  await ensureModules(tenant.id);
  await replaceHomeAndNavigation(tenant.id);

  console.log("Demo Villa Caravaggio configurada.");
  console.log(`Tenant: ${tenant.slug}`);
  console.log(`Rota pública: /guia/${tenant.slug}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
