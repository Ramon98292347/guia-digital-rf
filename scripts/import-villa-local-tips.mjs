import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  return Object.fromEntries(
    fs.readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "")];
      }),
  );
}

const env = loadEnv();
const expectedUrl = "https://kqtmwmgtyqkxsbtohjjm.supabase.co";
if (env.NEXT_PUBLIC_SUPABASE_URL !== expectedUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL não aponta para o projeto remoto esperado.");
}
if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
}

const tenantId = "866c6b1e-2e42-4fe0-b1c1-64fb27ffa0d9";
const supabase = createClient(expectedUrl, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const tips = [
  {
    name: "Caminhar pelo coração de Santa Teresa",
    short_description: "Passeie pelo centro, pela Praça Augusto Ruschi e pela Rua do Lazer, sem pressa.",
    description: "Conheça a arquitetura e o clima italiano da cidade. É um passeio para tomar um café e simplesmente curtir Santa Teresa.",
    address: "Praça Augusto Ruschi e Rua do Lazer, Santa Teresa - ES",
  },
  {
    name: "Conhecer o INMA - Instituto Nacional da Mata Atlântica",
    short_description: "Natureza, ciência e história em uma das atrações tradicionais da cidade.",
    description: "O Instituto Nacional da Mata Atlântica - INMA também é conhecido como Museu de Biologia Professor Mello Leitão.",
    address: "Instituto Nacional da Mata Atlântica - INMA / Museu de Biologia Prof. Mello Leitão, Santa Teresa - ES",
  },
  {
    name: "Viver o Circuito Caravaggio",
    short_description: "Descubra cantinas, vinícolas, cervejarias, restaurantes e produtos artesanais.",
    description: "Reserve algumas horas para percorrer a estrada e conhecer experiências em meio à natureza. O circuito tem aproximadamente 14 km.",
    address: "Circuito Caravaggio, Santa Teresa - ES",
  },
  {
    name: "Fazer uma experiência de vinho",
    short_description: "Visite uma vinícola, conheça a produção e experimente os sabores da região.",
    description: "A Vinícola Rassele é apontada pelo turismo municipal como a mais antiga vinícola em funcionamento de Santa Teresa.",
    address: "Vinícola Rassele, Santa Teresa - ES",
  },
  {
    name: "Conhecer a Cantina Mattiello",
    short_description: "Gastronomia e enoturismo em uma experiência com vinhos e espumantes.",
    description: "A propriedade oferece vinhos, espumantes e opção de tour.",
    address: "Cantina Mattiello, Santa Teresa - ES",
  },
  {
    name: "Contemplar Santa Teresa do alto",
    short_description: "Respire o ar das montanhas e aprecie a paisagem da Rampa do Caravaggio.",
    description: "Uma boa oportunidade para contemplar a paisagem e fazer fotos.",
    address: "Rampa do Caravaggio, Santa Teresa - ES",
  },
  {
    name: "Descobrir as cachoeiras e a Mata Atlântica",
    short_description: "Explore opções de natureza e quedas d'água da região.",
    description: "Santa Teresa tem opções como o Country Club, que possui uma queda d'água de aproximadamente 90 metros, segundo a Secretaria Municipal de Turismo.",
    address: "Country Club e áreas naturais de Santa Teresa - ES",
  },
  {
    name: "Conhecer a Rota Vale do Canaã",
    short_description: "Turismo rural, agroturismo, história, natureza e propriedades que recebem visitantes.",
    description: "A rota está ligada à história da colonização italiana de Santa Teresa e oferece uma experiência diferente do circuito turístico tradicional.",
    address: "Rota Vale do Canaã, Santa Teresa - ES",
  },
  {
    name: "Experimentar as cervejas artesanais da serra",
    short_description: "Conheça a cena de cervejarias artesanais de Santa Teresa.",
    description: "O Circuito Caravaggio reúne opções como a Cervejaria Zamprogno e a Três Santas.",
    address: "Circuito Caravaggio, Santa Teresa - ES",
  },
  {
    name: "Conhecer a história da imigração italiana",
    short_description: "Visite a Casa Lambert e conheça parte da história dos imigrantes da cidade.",
    description: "A Casa Lambert foi construída em 1875 pelos irmãos Antônio e Virgílio Lambert.",
    address: "Casa Lambert, Santa Teresa - ES",
  },
  {
    name: "Visitar a Chocolateria Pepe",
    short_description: "Uma parada para conhecer, provar chocolates e levar um pedacinho da cidade para casa.",
    description: "Uma experiência gastronômica que combina com o clima de Santa Teresa.",
    address: "Chocolateria Pepe, Santa Teresa - ES",
  },
  {
    name: "Dicas para visitar as vinícolas",
    short_description: "Confirme o horário de funcionamento e a necessidade de agendamento antes de sair.",
    description: "Segundo a Secretaria Municipal de Turismo, Santa Teresa responde por cerca de 80% da produção de uvas e vinhos do Espírito Santo. A tradição vinícola da cidade está diretamente ligada à imigração italiana. Algumas degustações e tours acontecem somente em horários específicos.",
    address: "Vinícolas de Santa Teresa - ES",
  },
  {
    name: "Visitar a Vinícola Ziviani",
    short_description: "Vinhos e licores com degustação na loja.",
    description: "Uma opção no Vale do Tabocas para conhecer vinhos e licores da região.",
    address: "Vale do Tabocas, Santa Teresa - ES. A cerca de 20 km do Centro.",
    phone: "(27) 99974-0850",
    instagram: "@vinicolaziviani",
  },
  {
    name: "Visitar a Vinícola Tabocas",
    short_description: "Vinhos finos artesanais e experiência de enoturismo.",
    description: "Uma experiência que une vinho, natureza, cultura e gastronomia.",
    address: "Vale do Tabocas - Alto Caldeirão, Santa Teresa - ES",
    phone: "(27) 99840-7860",
    instagram: "@vinicolatabocas_es",
  },
  {
    name: "Visitar a Vinícola Nonno Francesco",
    short_description: "Produção junto aos vinhedos, com espaço amplo, gramado e lago.",
    description: "Uma opção para conhecer a produção diretamente junto aos vinhedos.",
    address: "Vale do Tabocas, Santa Teresa - ES",
    phone: "(27) 99914-6667",
    instagram: "@vinicola_nonnofrancesco",
  },
  {
    name: "Visitar a Cantina Mattiello",
    short_description: "Vinhos e espumantes com tour pela vinícola.",
    description: "A visita guiada pode ser agendada pelo WhatsApp ou pelo site da cantina.",
    address: "São Lourenço, Santa Teresa - ES",
    phone: "(27) 99908-5282",
    instagram: "@cantinamattiello",
  },
  {
    name: "Visitar a Vinícola Rassele",
    short_description: "Vinhos artesanais, degustação e fermentado de jabuticaba.",
    description: "É apresentada pelo Turismo Municipal como a vinícola mais antiga da cidade em funcionamento.",
    address: "São Lourenço, próximo ao Centro, Santa Teresa - ES",
    phone: "(27) 99704-1800",
    instagram: "@vinicolarassele",
  },
  {
    name: "Visitar a Vinícola Tomazelli",
    short_description: "Vinícola e restaurante de culinária italiana.",
    description: "Uma opção para combinar gastronomia italiana e vinho.",
    address: "ES-261, Santa Teresa - ES",
    phone: "(27) 99871-1965",
    instagram: "@vinicolatomazelli",
  },
  {
    name: "Experiências gastronômicas recomendadas",
    short_description: "Sabores, encontros e boas histórias à mesa no Centro e no Circuito Caravaggio.",
    description: "Selecionamos lugares que recomendamos aos hóspedes para aproveitar Santa Teresa. Horários, dias de funcionamento e necessidade de reserva podem mudar; confirme diretamente com o estabelecimento antes de sair.",
    address: "Centro e Circuito Caravaggio, Santa Teresa - ES",
  },
  {
    name: "Giardino Restaurante",
    short_description: "Jantar especial e romântico.",
    description: "Uma opção para quem procura uma experiência gastronômica especial.",
    address: "Centro - Av. Getúlio Vargas, Santa Teresa - ES",
    instagram: "@giardinoristorante",
  },
  {
    name: "Gioconda Cantina Italiana",
    short_description: "Comida italiana com massas artesanais, risotos e pratos clássicos.",
    description: "Uma cantina italiana no Centro, com massas artesanais, risotos e pratos clássicos italianos.",
    address: "Centro - Rua do Lazer, Santa Teresa - ES",
    instagram: "@gioconda.cantinaitaliana",
  },
  {
    name: "Magazzino Fioravante",
    short_description: "Experiência gastronômica em atmosfera sofisticada.",
    description: "Uma opção para quem busca gastronomia e uma atmosfera mais sofisticada.",
    address: "Centro - Av. Getúlio Vargas, Santa Teresa - ES",
    instagram: "@magazzinofioravante",
  },
  {
    name: "Fabrício Bar + Restaurante",
    short_description: "Ambiente descontraído para uma refeição.",
    description: "Boa opção para uma refeição mais descontraída.",
    address: "São Lourenço, Santa Teresa - ES",
    instagram: "@fabriciobarrestaurante",
  },
  {
    name: "Restaurante Cafe Haus",
    short_description: "Restaurante tradicional.",
    description: "Uma opção tradicional no Centro de Santa Teresa.",
    address: "Centro - Av. José Ruschi, Santa Teresa - ES",
    instagram: "@cafehausst",
  },
  {
    name: "Tia Manuela Restaurante Português",
    short_description: "Culinária portuguesa no Centro.",
    description: "Uma alternativa para quem quer experimentar algo além da tradicional culinária italiana.",
    address: "Centro - Rua do Lazer, Santa Teresa - ES",
    instagram: "@tiamanuelarestaurante",
  },
  {
    name: "Santa Canela Gastrobar",
    short_description: "Gastronomia e drinks.",
    description: "Uma opção de gastronomia e drinks no Centro.",
    address: "Centro - Rua Coronel Bonfim, Santa Teresa - ES",
    instagram: "@santacanelagastrobar",
  },
  {
    name: "Ristorante Osteria Alla Botte",
    short_description: "Comida italiana em ambiente intimista.",
    description: "Uma experiência italiana em ambiente intimista.",
    address: "Centro - Rua Coronel Bonfim, Santa Teresa - ES",
    instagram: "@osteriaallabotte",
  },
  {
    name: "WO Santa Teresa",
    short_description: "Vista, pôr do sol e gastronomia.",
    description: "Uma experiência que vai além da gastronomia: a vista e o pôr do sol fazem parte do passeio.",
    address: "Rampa do Caravaggio, Santa Teresa - ES",
    instagram: "@wosantateresa",
  },
  {
    name: "Ristorante Romanha e Produtos Artesanais",
    short_description: "Almoço e experiência italiana no Circuito Caravaggio.",
    description: "Uma opção de almoço com experiência italiana e produtos artesanais.",
    address: "Circuito Caravaggio, Santa Teresa - ES",
    instagram: "@ristoranteromanha",
  },
  {
    name: "Armazém Caravaggio",
    short_description: "Gastronomia e montanhas com decks de vista.",
    description: "Fica aproximadamente 3 km do Centro e tem decks com vista para as montanhas.",
    address: "Circuito Caravaggio, Santa Teresa - ES",
    instagram: "@caravaggioarmazem",
  },
  {
    name: "Cervejaria Três Santas",
    short_description: "Cerveja artesanal e gastronomia.",
    description: "Além da cervejaria, funciona como pub e restaurante, com cervejas produzidas no próprio local.",
    address: "Circuito Caravaggio, Santa Teresa - ES",
    instagram: "@cervejariatressantas",
  },
  {
    name: "Villaggio Zamprogno",
    short_description: "Cervejaria e gastronomia no Circuito Caravaggio.",
    description: "É apresentada pelo Turismo Municipal como a primeira cervejaria artesanal de Santa Teresa.",
    address: "Circuito Caravaggio, Santa Teresa - ES",
    instagram: "@villaggiozamprogno",
  },
  {
    name: "Manacá Café",
    short_description: "Café e charme das montanhas.",
    description: "Uma opção de café para aproveitar o charme das montanhas no Circuito Caravaggio.",
    address: "Circuito Caravaggio, Santa Teresa - ES",
    instagram: "@manacacafe",
  },
].map((tip, index) => ({
  tenant_id: tenantId,
  ...tip,
  recommended: true,
  status: "published",
  sort_order: (index + 1) * 10,
}));

const { data: existing, error: existingError } = await supabase
  .from("local_tips")
  .select("id, name")
  .eq("tenant_id", tenantId)
  .is("deleted_at", null);
if (existingError) throw existingError;

const existingNames = new Set((existing ?? []).map((item) => item.name));
const pending = tips.filter((tip) => !existingNames.has(tip.name));
if (pending.length === 0) {
  console.log("As dicas da região já estavam cadastradas; nenhuma duplicata foi criada.");
  process.exit(0);
}

const { data: inserted, error: insertError } = await supabase
  .from("local_tips")
  .insert(pending)
  .select("id, name");
if (insertError) throw insertError;

console.log(`${inserted.length} dicas da região cadastradas e publicadas para o tenant Villa Caravaggio.`);
for (const item of inserted) console.log(`- ${item.name} (${item.id})`);
