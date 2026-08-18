# Admin

## Objetivo

Documentar a arquitetura conceitual do painel administrativo dos estabelecimentos.

O Admin deve ser orientado ao tenant atual. O administrador de um estabelecimento administra somente o próprio tenant e não pode acessar, editar ou visualizar dados de outro tenant.

## Princípios

* Todo conteúdo específico do estabelecimento deve ser administrável sem alteração de código.
* O painel deve permitir adicionar, editar, excluir, ativar, desativar, publicar, despublicar e reorganizar conteúdos quando aplicável.
* Nem todos os módulos precisam aparecer quando estiverem desativados ou indisponíveis para o plano do tenant.
* O Admin utiliza os mesmos serviços e a mesma fonte de verdade do Guia e do Concierge.
* O Admin só administra recursos liberados pelos entitlements do tenant e permitidos por sua autorização.

## Estrutura conceitual

```text
Dashboard

Conteúdo
 ├─ Início
 ├─ Acomodações
 ├─ Serviços
 ├─ Horários
 ├─ Wi-Fi
 ├─ Regras
 ├─ Contatos
 ├─ Galeria
 └─ Mídias

Experiência
 ├─ Dicas da Região
 ├─ Eventos
 ├─ Experiências dos Hóspedes
 ├─ Promoções
 └─ Cupons

Comercial
 ├─ Reservas
 ├─ Produtos
 ├─ Lojinha
 ├─ Frigobar
 └─ Cardápio

Concierge
 ├─ Configurações
 ├─ FAQs
 ├─ Base de Conhecimento
 ├─ Conversas
 └─ Perguntas sem Resposta

Aparência
 ├─ Logo
 ├─ Cores
 ├─ Imagens
 ├─ Vídeos
 ├─ Tipografia
 ├─ PWA
 └─ Organização da Home

QR/NFC

Configurações
```

## Admin inicial autenticado

O primeiro Admin real usa rota explícita por tenant:

```text
/admin/[tenantSlug]
```

`/admin` resolve a sessão atual e redireciona para:

* o único tenant ativo do usuário;
* `/admin/select`, quando houver múltiplos tenants;
* `/admin/no-access`, quando não houver membership ativa.

`/admin/[tenantSlug]` não confia no slug isoladamente. A página valida sessão, tenant, membership ativa e role no servidor antes de renderizar qualquer conteúdo.

Tenant inexistente ou inacessível retorna uma experiência segura de não encontrado para não revelar dados de outro estabelecimento.

## Admin Shell

A estrutura inicial do painel é:

```text
Sidebar desktop
+
Header
+
Conteúdo
```

No mobile, o header oferece navegação compacta e o conteúdo continua utilizável em telas pequenas.

O shell exibe:

* estabelecimento atual;
* seletor de tenant quando houver mais de um tenant autorizado;
* usuário autenticado;
* role em português;
* ação de logout.

Itens de navegação futuros podem aparecer desabilitados, mas não devem gerar links quebrados.

## Tenant Switcher

O seletor de tenant mostra somente a lista autorizada retornada pelo servidor.

A seleção visual não é autorização. Cada rota de destino valida novamente membership e RLS.

## Dashboard inicial

O dashboard inicial pode exibir contagens reais de registros disponíveis para o tenant atual.

Não exibir métricas fictícias, gráficos inventados ou atalhos para páginas que ainda não existem.

## Conteúdo e publicação

Conteúdos devem possuir estados adequados ao tipo de recurso, como rascunho, publicado, despublicado, ativo, inativo, pendente, aprovado ou rejeitado.

Fotos, vídeos, avaliações ou experiências enviadas por hóspedes nunca deverão ser publicados automaticamente. O fluxo conceitual é:

```text
PENDENTE → APROVADO ou REJEITADO
```

## Permissões

Papéis administrativos conceituais:

```text
tenant_staff
tenant_admin
```

O sistema deverá permitir permissões mais granulares futuramente, como restringir acesso a módulos comerciais, aparência, Concierge ou configurações.

## Recursos não contratados

Se uma feature não estiver contratada, a interface poderá futuramente:

* ocultar o recurso;
* exibir bloqueio;
* exibir chamada de upgrade;
* permitir leitura limitada quando fizer sentido.

Não deve permitir ativação real de PWA, AI Designer, Concierge, domínio próprio ou outros extras sem liberação pelo Super Admin ou fluxo comercial futuro.

Mesmo quando uma feature está contratada, autorização continua separada: usuário, membership, role e RLS ainda precisam permitir a ação.

## Mídia

O Admin futuro deverá usar a biblioteca central de mídia.

Regras de produto:

* upload começa no bucket privado;
* preview privado usa URL temporária;
* publicação copia/disponibiliza arquivo no bucket público por operação server-side;
* Staff pode enviar mídia privada do próprio tenant;
* Staff não publica diretamente no bucket público;
* exclusão definitiva deve verificar referências antes de remover arquivo.

Não criar upload anônimo de hóspedes dentro do fluxo administrativo comum.

## Segurança

O painel não deve confiar apenas no tenant informado pelo frontend. Toda operação administrativa deve validar autenticação, autorização e vínculo do usuário com o tenant no backend e no banco.
