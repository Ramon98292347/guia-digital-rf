# Super Admin

## Objetivo

Documentar o Super Admin exclusivo da RF Tecnologia, responsável por administrar a plataforma e seus tenants.

## Responsabilidades

O Super Admin RF Tecnologia deverá poder:

* cadastrar tenant;
* editar tenant;
* ativar;
* suspender;
* publicar;
* gerenciar usuários;
* visualizar módulos;
* configurar planos;
* configurar limites;
* visualizar métricas;
* acompanhar uso;
* prestar suporte;
* configurar recursos disponíveis por cliente.

## Fluxo principal

```text
Novo cliente
↓
Cadastrar estabelecimento
↓
Criar tenant
↓
Configurar identidade
↓
Ativar módulos
↓
Cadastrar administrador
↓
Adicionar conteúdo
↓
Publicar
↓
Gerar QR/NFC
```

## Separação entre Admin e Super Admin

O Super Admin administra a plataforma como um todo. O Admin administra somente o próprio estabelecimento.

Essa separação deve existir em autenticação, autorização, banco de dados, interface e logs administrativos.

## Planos, limites e recursos

A arquitetura deve permitir que a RF Tecnologia configure recursos disponíveis por tenant, como:

* módulos ativos;
* limites de mídia;
* quantidade de usuários;
* recursos de Concierge;
* recursos comerciais;
* analytics;
* integrações futuras.

Planos devem ser modelados por features e limites, não por condicionais hardcoded na aplicação.

O Super Admin deverá conseguir futuramente:

* criar, editar, ativar e arquivar planos;
* cadastrar features globais;
* definir limites por feature;
* associar features a planos;
* associar tenants a planos;
* liberar extras por tenant;
* aplicar overrides temporários ou permanentes;
* consultar entitlements finais de um tenant.

O Super Admin não deve depender de alteração de código para liberar PWA, AI Designer, Concierge, domínio próprio ou limites especiais quando essas capacidades já existirem na plataforma.

## Domínios

O Super Admin deverá administrar domínios e subdomínios dos tenants.

Deve conseguir futuramente:

* cadastrar URL da plataforma;
* cadastrar subdomínio RF;
* cadastrar domínio ou subdomínio do cliente;
* marcar domínio primário;
* acompanhar status de verificação;
* registrar instruções de DNS;
* desativar domínio sem remover o tenant.

Um domínio aponta para um tenant existente. Ele não cria projeto, banco ou deployment separado.

## Métricas e suporte

O Super Admin poderá acompanhar uso da plataforma, origem dos acessos, módulos utilizados, instalações PWA, QR/NFC e eventos relevantes, sempre respeitando privacidade e segurança.
