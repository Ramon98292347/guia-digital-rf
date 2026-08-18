# Guia Digital RF Tecnologia

## VISÃO DO PRODUTO

O Guia Digital RF Tecnologia é uma plataforma profissional para pousadas, chalés, hotéis e hospedagens.

O sistema deve permitir:

**Cadastrar estabelecimento → Personalizar → Publicar → Gerar QR/NFC.**

A plataforma pertence à RF Tecnologia.

Cada estabelecimento é um tenant.

Nunca criar um projeto ou código separado para cada estabelecimento.

---

## ARQUITETURA MULTI-TENANT

Toda funcionalidade nova deve considerar múltiplos estabelecimentos.

Dados de um tenant jamais podem aparecer para outro tenant.

Entidades específicas de estabelecimentos deverão possuir associação ao tenant.

Não confiar somente em `tenantId` enviado pelo frontend.

A segurança e o isolamento deverão ser garantidos também no backend e banco de dados.

---

## SEGURANÇA MULTI-TENANT

Toda entidade pertencente a estabelecimento deve respeitar isolamento de tenant no banco e no servidor.

Nunca confiar apenas em `tenant_id`, role ou permissão enviados pelo frontend.

Toda tabela nova deve ter seu modelo de acesso definido.

Credenciais privilegiadas nunca podem chegar ao cliente.

Testes negativos de isolamento são obrigatórios para policies multi-tenant.

---

## PLANOS, FEATURES E ENTITLEMENTS

Planos comerciais devem liberar features e limites por configuração, nunca por condicionais espalhadas no código.

Usar o conceito de entitlement resolvido por tenant:

`plano base + features do plano + extras + overrides = capacidades finais`

Não usar nome comercial de plano como regra de produto dentro de componentes, serviços ou policies.

Feature não é módulo. Entitlement não é autorização.

Um tenant possuir uma feature não significa que qualquer usuário daquele tenant pode administrá-la.

Downgrade, bloqueio ou remoção de feature não deve destruir dados automaticamente.

---

## DOMÍNIOS E URLS

Múltiplos tenants podem usar URLs, subdomínios e domínios diferentes apontando para a mesma aplicação.

Nunca criar deployment, projeto Vercel, código, banco ou pasta separados por domínio ou cliente.

A resolução por `hostname` e `pathname` deve ser centralizada em um `TenantResolver`.

Resolução de tenant não substitui autorização, RLS ou validação server-side.

---

## PROIBIDO COLOCAR DADOS DE CLIENTES NO CÓDIGO

Nunca deixar diretamente nos componentes ou serviços:

* nome da pousada;
* logo;
* cores;
* telefone;
* WhatsApp;
* endereço;
* e-mail;
* horários;
* Wi-Fi;
* senha de Wi-Fi;
* regras;
* acomodações;
* fotos;
* vídeos;
* serviços;
* produtos;
* preços;
* cardápios;
* eventos;
* promoções;
* cupons;
* FAQs;
* respostas do Concierge;
* textos específicos;
* links específicos;
* informações turísticas específicas.

Tudo que variar entre clientes deve vir do banco de dados, configurações ou painel administrativo.

O código deve conter estrutura, componentes, funcionalidades e regras de negócio.

---

## PAINEL ADMINISTRATIVO

Todo conteúdo específico do estabelecimento deve ser administrável sem alteração de código.

O administrador deverá conseguir, quando aplicável:

* adicionar;
* editar;
* excluir;
* ativar;
* desativar;
* publicar;
* despublicar;
* reorganizar.

Isso inclui imagens, vídeos, textos e configurações.

Rotas e operações do Admin devem validar autenticação e autorização no servidor.

O `proxy.ts` pode renovar sessão e fazer redirecionamentos simples, mas não substitui membership, role, RLS ou validação server-side.

Service role não deve ser usado para leituras normais do Admin, como listar tenants, carregar dashboard ou buscar conteúdo do próprio estabelecimento. Essas consultas devem usar sessão do usuário e RLS.

Tenant selecionado na interface, cookie, parâmetro de rota ou lista enviada pelo frontend nunca é prova de autorização.

---

## SUPER ADMIN

Deve existir separação entre:

* hóspede;
* administrador do estabelecimento;
* Super Admin RF Tecnologia.

O Super Admin administra a plataforma e seus tenants.

O administrador de um estabelecimento administra somente seu próprio tenant.

---

## EXPERIÊNCIA DO HÓSPEDE

O Guia deve ser:

* mobile-first;
* rápido;
* elegante;
* moderno;
* intuitivo;
* acolhedor;
* premium;
* responsivo.

Não deve parecer:

* Linktree;
* lista de links;
* landing page genérica;
* dashboard administrativo;
* template genérico.

Deve transmitir a sensação de um aplicativo oficial do estabelecimento.

Objetivo:

**"Tenho toda a pousada na palma da minha mão."**

---

## IDENTIDADE VISUAL DINÂMICA

Cada estabelecimento poderá possuir:

* logo;
* ícone;
* cores;
* imagens;
* vídeos;
* tipografia;
* estilo;
* splash screen;
* aparência de cards;
* textos;
* identidade do PWA.

Tudo deverá ser configurável por tenant.

Nunca criar componentes exclusivos apenas para mudar a identidade visual de um cliente quando a mesma solução puder ser configurável.

---

## DESIGN POR IA

A plataforma permite que IA proponha designs e layouts personalizados para cada tenant.

A IA deve gerar configurações compatíveis com componentes, templates, tokens e variantes existentes.

Nunca criar projeto ou componente específico apenas para um estabelecimento quando a solução puder ser reutilizável.

Toda saída da IA deve ser validada antes de ser salva/publicada.

Design gerado por IA deve permanecer editável pelo painel administrativo.

Não permitir publicação automática sem autorização.

---

## PWA

O Guia deverá ser preparado para funcionar como PWA instalável.

O PWA deverá utilizar dinamicamente:

* nome;
* nome curto;
* logo/ícone;
* cor principal;
* cor de fundo;
* identidade do estabelecimento.

Para o hóspede, deve parecer o aplicativo do estabelecimento, não um aplicativo genérico da RF Tecnologia.

---

## MÍDIA E STORAGE

Mídia dos tenants deve utilizar Storage multi-tenant seguro.

Arquivos privados, drafts e previews administrativos nunca devem ser colocados em bucket público.

Paths de Storage devem usar `tenant_id` como primeiro segmento.

Publicação de mídia deve ser uma operação controlada server-side.

Nunca salvar signed URL temporária no banco.

Nunca colocar service role no frontend ou em variável `NEXT_PUBLIC_`.

---

## QR CODE E NFC

O sistema deverá permitir acesso por:

* URL;
* QR Code;
* NFC;
* PWA instalada.

A arquitetura deverá permitir futuramente identificar pontos específicos, como:

* recepção;
* quarto;
* chalé;
* restaurante;
* área de lazer;
* placa;
* chaveiro NFC.

---

## CONCIERGE VIRTUAL

O Concierge funcionará dentro do próprio Guia.

Ele deverá utilizar a mesma fonte de verdade utilizada pelas telas do sistema.

Não criar uma segunda base duplicada apenas para o Concierge.

Ele deverá consultar informações como:

* horários;
* Wi-Fi;
* acomodações;
* serviços;
* produtos;
* cardápios;
* eventos;
* promoções;
* cupons;
* regras;
* check-in;
* check-out;
* contatos;
* dicas da região;
* FAQs;
* base de conhecimento.

Se uma informação for alterada no painel, Guia e Concierge devem utilizar automaticamente o novo dado.

Se não encontrar uma resposta:

**NUNCA INVENTAR.**

Deverá informar que não encontrou aquela informação e oferecer contato com a recepção/equipe.

---

## SAUDAÇÕES

O Concierge deverá compreender cumprimentos em português, incluindo:

* oi;
* olá;
* bom dia;
* boa tarde;
* boa noite;
* obrigado;
* obrigada.

As saudações deverão considerar o horário local configurado para o tenant.

---

## CONTEÚDO DE HÓSPEDES

Fotos, vídeos, avaliações ou experiências enviadas por hóspedes nunca deverão ser publicados automaticamente.

Fluxo:

`PENDENTE → APROVADO ou REJEITADO`

Somente conteúdo aprovado poderá ficar público.

---

## PADRÃO BRASILEIRO

Toda interface destinada aos clientes e hóspedes deve utilizar português do Brasil.

Utilizar padrão brasileiro para:

* datas;
* horários;
* moeda;
* textos;
* mensagens;
* validações apresentadas ao usuário.

Exemplos:

`17/08/2026`

`14:30`

`R$ 150,00`

---

## ENGENHARIA

Utilizar TypeScript corretamente.

Evitar `any`.

Priorizar:

* componentes reutilizáveis;
* hooks;
* serviços;
* utilitários;
* tipos;
* módulos;
* responsabilidades bem separadas.

Evitar componentes gigantes.

Não duplicar lógica.

Antes de criar um novo componente ou serviço, verificar se já existe solução reutilizável.

---

## COMENTÁRIOS NO CÓDIGO

Comentários importantes devem ser escritos em português do Brasil.

Comentar:

* regras de negócio;
* decisões arquiteturais;
* comportamentos não óbvios;
* segurança;
* multi-tenancy.

Não adicionar comentários apenas para explicar código óbvio.

---

## PERFORMANCE

Priorizar experiência em celular e redes móveis instáveis.

Planejar:

* cache;
* carregamento progressivo;
* lazy-loading;
* otimização de imagens;
* PWA;
* Service Worker;
* skeletons quando necessário;
* redução de JavaScript desnecessário.

Não sacrificar desempenho apenas para criar animações.

---

## REGRA PARA NOVAS FUNCIONALIDADES

Antes de implementar qualquer nova funcionalidade, perguntar internamente:

**"Outro estabelecimento poderá precisar configurar isso de maneira diferente?"**

Se a resposta for sim, criar configuração administrável em vez de deixar o comportamento fixo no código.

---

## DADOS DO CHALÉS VILLA CARAVAGGIO

O Chalés Villa Caravaggio é o primeiro tenant real.

Informações específicas desse cliente serão fornecidas posteriormente.

Essas informações devem ser tratadas como:

* dados;
* seed;
* configuração do tenant;
* conteúdo administrável.

Nunca como regras permanentes da plataforma.

---

## PROCEDIMENTO ANTES DE ALTERAR O PROJETO

Antes de alterações relevantes:

1. Ler este `AGENTS.md`.
2. Analisar a estrutura existente.
3. Consultar a documentação relevante dentro de `docs/`.
4. Verificar se a funcionalidade já existe.
5. Evitar duplicações.
6. Preservar a arquitetura multi-tenant.
7. Implementar somente o escopo solicitado.
8. Executar verificações adequadas.
9. Corrigir erros causados pela alteração.
10. Informar ao final os arquivos modificados.

---

## REGRA DE ESCOPO

Não desenvolver funcionalidades não solicitadas apenas porque parecem úteis.

Quando uma tarefa for grande, primeiro elaborar um plano.

Preservar o que já estiver funcionando.

Não reescrever partes do sistema sem necessidade.

---

## OBJETIVOS

Objetivo do hóspede:

**"Tenho toda a pousada na palma da minha mão."**

Objetivo do proprietário:

**"Consigo administrar tudo sem depender de um programador."**

Objetivo da plataforma:

**"Cadastrar estabelecimento → Personalizar → Publicar → Gerar QR/NFC."**

Princípio permanente:

**"Um sistema. Muitos clientes. Experiências completamente personalizadas."**

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
