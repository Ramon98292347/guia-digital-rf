# AI Designer

## Objetivo

Documentar a arquitetura conceitual do AI Designer da plataforma Guia Digital RF Tecnologia.

O AI Designer deverá ajudar a RF Tecnologia a transformar informações de um estabelecimento em uma proposta visual personalizada para o Guia Digital, sempre usando a mesma aplicação, o mesmo Design System e configurações validadas.

Princípio permanente:

**Um sistema. Muitos clientes. Experiências completamente personalizadas.**

## Papel da IA

A IA funciona como um designer assistivo da plataforma. Ela pode propor identidade, layout, composição e variantes, mas não cria aplicação independente, componente exclusivo ou CSS arbitrário para um cliente.

AI Designer é uma capability controlada por entitlement. A aplicação deve consultar a capacidade resolvida do tenant antes de permitir geração, preview avançado ou publicação de propostas de IA.

Super Admin poderá futuramente executar demonstrações, suporte ou geração assistida conforme autorização própria, mas isso não elimina a regra de entitlement do tenant para uso comercial.

A saída da IA deve ser uma configuração visual compatível com:

* Design System;
* Component Registry;
* templates;
* presets;
* tokens;
* variantes;
* seções permitidas;
* regras de responsividade;
* limites de segurança da plataforma.

## Entradas possíveis

A IA poderá analisar dados autorizados, como:

* nome do estabelecimento;
* categoria;
* logo;
* cores existentes;
* site institucional;
* fotografias;
* vídeos;
* textos institucionais;
* localização;
* estilo arquitetônico;
* posicionamento da marca;
* público esperado;
* características da experiência;
* preferências fornecidas pelo cliente;
* módulos ativados.

Não assumir informações ausentes e não inventar dados do estabelecimento.

## O que a IA poderá propor

### Identidade

* cores;
* combinações;
* tipografia;
* contraste;
* estilo geral.

### Template / preset

Exemplos conceituais:

* Natureza Premium;
* Luxo Contemporâneo;
* Rústico Elegante;
* Praia;
* Minimalista.

### Hero

* variante;
* mídia;
* alinhamento;
* altura;
* estilo do conteúdo;
* CTA.

### Cards

* variante;
* raio;
* densidade;
* proporção de imagem;
* sombra;
* borda.

### Home

* seções;
* ordem;
* destaque;
* composição;
* variantes.

### Navegação

* itens principais;
* bottom navigation;
* item destacado;
* comportamento mobile.

### Galeria, acomodações e serviços

* galeria em grid, masonry, carousel ou featured;
* acomodações em grid, carrossel, cards grandes, editorial ou horizontal;
* serviços com ícones, cards, imagem ou carrossel.

### Detalhes visuais

* espaçamento;
* superfícies;
* intensidade de sombras;
* estilo de botões;
* tratamento de imagens;
* animações leves permitidas.

## O que a IA não poderá fazer

A IA não poderá:

* alterar regras de segurança;
* alterar RLS;
* criar tenant por conta própria sem autorização;
* acessar dados de outro tenant;
* gerar JavaScript arbitrário para execução;
* gerar CSS arbitrário publicado automaticamente;
* criar HTML livre;
* modificar banco estrutural;
* instalar dependências;
* criar componentes específicos por cliente;
* alterar componentes globais sem processo de desenvolvimento;
* publicar automaticamente uma proposta sem aprovação;
* inventar dados do estabelecimento;
* escolher ou acoplar a arquitetura a um provedor específico de IA nesta etapa.

## Serviço abstrato

Planejar um serviço conceitual:

```text
AIDesignService
```

Esse serviço deverá depender de contratos da plataforma, não diretamente de um fornecedor espalhado pelo código. Isso permitirá trocar ou combinar provedores futuramente.

Não escolher provedor, modelo, SDK ou prompt de produção nesta etapa.

## Fluxo principal

```text
Novo estabelecimento
        ↓
Cadastro básico
        ↓
Logo + Fotos + Vídeos + Conteúdo
        ↓
Preferências / Site / Referências
        ↓
AI DESIGNER
        ↓
Análise de identidade
        ↓
Escolha ou combinação de preset
        ↓
Geração de Design Spec
        ↓
Validação
        ↓
Preview
        ↓
Aprovação RF / Administrador
        ↓
Salvar configuração
        ↓
Publicar
```

## AI Design Spec

A saída principal da IA será uma estrutura conceitual chamada `AI Design Spec`.

Ela deve conter apenas valores permitidos pela plataforma.

Exemplo conceitual:

```json
{
  "template": "natureza-premium",
  "branding": {
    "primary": "...",
    "secondary": "...",
    "accent": "...",
    "fontHeading": "...",
    "fontBody": "..."
  },
  "hero": {
    "variant": "fullscreen-image",
    "alignment": "center",
    "height": "large"
  },
  "cards": {
    "variant": "image-heavy",
    "radius": "large",
    "shadow": "soft"
  },
  "navigation": {
    "variant": "bottom",
    "highlight": "concierge"
  },
  "sections": [
    {
      "type": "quick_actions",
      "variant": "rounded-icons"
    },
    {
      "type": "accommodations",
      "variant": "carousel"
    },
    {
      "type": "gallery",
      "variant": "masonry"
    }
  ]
}
```

Esse JSON é apenas exemplo. A estrutura final deverá ser tipada e validada.

## Schema Validator

Antes de qualquer configuração gerada pela IA ser aceita:

```text
AI Design Spec
      ↓
Schema Validator
      ↓
É válida?
   ↙      ↘
 SIM      NÃO
 ↓         ↓
Preview   Corrigir/rejeitar
```

A IA só poderá selecionar:

* templates registrados;
* variantes existentes;
* tokens permitidos;
* seções permitidas;
* destinos permitidos;
* propriedades previstas no schema.

Nunca confiar diretamente na saída textual da IA.

## Component Registry

O `Component Registry` é um catálogo tipado da plataforma. Ele informa à IA e ao sistema quais componentes, variantes e propriedades existem.

Exemplo conceitual:

```text
Hero:
- fullscreen-image
- video
- split
- minimal
- editorial

Gallery:
- grid
- masonry
- carousel
- featured

Accommodations:
- carousel
- grid
- horizontal
- large-cards
```

Esse catálogo é estrutural e poderá existir no código. Não é dado específico de cliente.

## Metadata dos componentes

Componentes e variantes deverão possuir metadata suficiente para uso futuro pelo AI Designer.

Exemplo conceitual:

```text
Hero.fullscreen-image

supports:
- image
- video?
- alignment
- overlay
- cta

mobileCompatible: true
```

Não implementar metadata agora. Apenas planejar o contrato.

## Variante inexistente

Se a IA desejar usar algo que a plataforma ainda não suporta:

```text
hero.variant = cinematic-luxury
```

e essa variante não existir, ela não poderá publicar esse valor.

Deverá registrar:

**Nova capacidade visual necessária.**

Fluxo:

```text
IA identifica necessidade
       ↓
Variante não existe
       ↓
Sugestão de nova variante
       ↓
RF Tecnologia avalia
       ↓
Codex / desenvolvimento implementa
       ↓
Nova variante entra no Component Registry
       ↓
Passa a ficar disponível para qualquer tenant
```

Cada novo cliente pode ajudar a evoluir a plataforma sem criar código exclusivo para ele.

## Design gerado não é código do cliente

Exemplo proibido:

```text
VillaCaravaggioHome.tsx
```

Exemplo correto:

```text
Tenant Villa Caravaggio
+
Design Spec
+
Component Registry
+
UIConfigResolver
=
Guia Villa Caravaggio
```

## UIConfigResolver

O `UIConfigResolver` deverá combinar:

```text
Platform Defaults
       ↓
Design Template
       ↓
Preset Snapshot
       ↓
AI Design Spec
       ↓
Tenant Overrides
       ↓
Section Overrides
       ↓
Resolved UI
```

Ordem de precedência:

1. defaults da plataforma;
2. defaults do template;
3. configuração inicial/preset;
4. configuração gerada pela IA;
5. alterações manuais do tenant;
6. configuração específica da seção.

Alterações manuais posteriores do administrador não devem ser sobrescritas automaticamente pela IA.

## Edição humana

A IA acelera o trabalho, mas não retira controle do proprietário ou da RF Tecnologia.

Depois da geração, o administrador poderá alterar:

* cores;
* fontes;
* fotos;
* variantes;
* seções;
* ordem;
* textos;
* navegação;
* configurações permitidas.

Tudo sem modificar código.

## Regenerar design

Planejar a possibilidade futura de gerar nova proposta com IA sem substituir automaticamente o design publicado.

```text
Design publicado
      ↓
Gerar nova proposta
      ↓
Novo draft
      ↓
Preview
      ↓
Comparar
      ↓
Aprovar
      ↓
Nova versão publicada
```

## Versionamento

Recomendação: criar conceitualmente `tenant_design_versions`.

Motivo: preservar histórico, permitir draft/preview, comparar propostas e impedir que uma geração sobrescreva o design publicado.

Campos possíveis:

```text
id
tenant_id
version
source
status
design_config
created_by
created_at
published_at
```

`source`:

```text
manual
ai
preset
```

`status`:

```text
draft
published
archived
```

## Execuções de IA

Planejar conceitualmente `ai_design_jobs` para registrar execuções mínimas.

Campos possíveis:

```text
id
tenant_id
status
requested_by
input_summary
result_version_id
created_at
completed_at
error
```

Não armazenar prompt gigante, mídia bruta ou dados sensíveis sem necessidade.

## Preview e publicação

Toda proposta da IA deve primeiro existir como `draft`.

Preview deve permitir visualizar:

* celular;
* tablet;
* desktop.

Prioridade absoluta:

**celular.**

Regra obrigatória:

**A IA pode gerar. A publicação precisa ser controlada.**

Nenhum design criado pela IA deve substituir automaticamente um design publicado sem ação explícita autorizada.

## Análise de site e referências

Quando houver site institucional, ele poderá servir como:

* referência de marca;
* fonte de identidade;
* inspiração visual;
* fonte inicial de conteúdo quando autorizado.

O AI Designer não deverá simplesmente copiar o site. O Guia precisa parecer um aplicativo de hospitalidade.

Referências visuais podem orientar estilo, composição, atmosfera e sofisticação. Não copiar literalmente designs protegidos ou marcas de terceiros.

## Villa Caravaggio

O **Chalés Villa Caravaggio** será o primeiro caso real de validação do AI Designer.

O processo poderá considerar futuramente:

* logo oficial;
* site oficial;
* fotos;
* vídeos;
* identidade existente;
* natureza da região;
* características dos chalés.

Exemplo conceitual de proposta:

```text
Estilo:
Natureza Premium

Hero:
fullscreen-image

Home:
fortemente visual

Cards:
image-heavy

Acomodações:
carousel

Galeria:
masonry / featured

Navegação:
bottom navigation premium

Concierge:
destaque central
```

Isso será apenas configuração do tenant. Não colocar esses valores como defaults globais.

## Criação automática futura de cliente

Fluxo conceitual do Super Admin:

```text
+ Novo cliente

Nome:
[ ]

Categoria:
[ ]

Site:
[ ]

Logo:
[ upload ]

Fotos:
[ upload ]

Estilo desejado:
[ ]

[ CRIAR COM IA ]
```

Depois:

```text
Analisando identidade...
Analisando fotografias...
Selecionando estrutura...
Criando proposta...
```

Resultado:

```text
Seu Guia está pronto para revisão.

[ Visualizar ]
[ Personalizar ]
[ Gerar outra proposta ]
[ Publicar ]
```

Não implementar agora.

## Modos futuros

### Criar do zero

IA cria a primeira proposta visual.

### Melhorar design atual

IA analisa configuração existente e sugere melhorias.

### Nova versão

IA cria uma alternativa sem alterar a atual.

### Ajuste direcionado

Exemplos:

```text
Deixe o Guia mais sofisticado.
Dê mais destaque aos chalés e menos à galeria.
```

A IA deve alterar somente configurações permitidas.

## Segurança multi-tenant

A geração referente ao Tenant A não poderá utilizar:

* conteúdo privado;
* mídia privada;
* configurações privadas;

do Tenant B.

Somente referências globais autorizadas da plataforma poderão ser compartilhadas.

## Privacidade

O AI Designer visual inicialmente não precisa analisar conversas, estadias, informações de hóspedes ou métricas pessoais.

Aplicar minimização de dados.

## Fallback

Se a geração falhar:

* manter design anterior;
* nunca quebrar Guia publicado;
* utilizar template seguro quando for primeiro cadastro;
* registrar erro;
* permitir tentar novamente.

## Design System primeiro

Regra:

```text
Design System
      ↓
define possibilidades
      ↓
AI Designer
      ↓
combina possibilidades
      ↓
Tenant Design
```

Não:

```text
AI
↓
HTML/CSS aleatório
↓
Produção
```

## Evolução da plataforma

```text
Novo cliente
      ↓
Nova necessidade visual
      ↓
AI Designer identifica lacuna
      ↓
RF avalia
      ↓
Nova variante reutilizável
      ↓
Component Registry cresce
      ↓
Todos os clientes futuros se beneficiam
```

## Revisão

Checklist:

* IA gera configuração, não aplicação independente.
* Design Spec é validada.
* Existe preview antes de publicar.
* Administrador pode editar depois.
* Configuração publicada não é sobrescrita sem autorização.
* Design System continua controlando qualidade.
* Nova necessidade pode virar variante reutilizável.
* Não existe componente específico Villa Caravaggio.
* IA respeita multi-tenancy.
* Há fallback seguro.
* Não é page builder livre.
* O sistema continua mobile-first.
