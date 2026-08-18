# PWA

## Objetivo

Documentar os requisitos para funcionamento do Guia Digital como PWA instalável por tenant.

## Princípio

Para o hóspede, o PWA deve parecer o aplicativo oficial do estabelecimento, não um aplicativo genérico da RF Tecnologia.

PWA é uma capability comercial controlada por entitlement. Um tenant só deve receber experiência PWA avançada quando `hasFeature(tenantId, "pwa")` ou equivalente estiver habilitado.

## Requisitos planejados

O PWA deverá considerar:

* manifest dinâmico;
* ícones por tenant;
* nome por tenant;
* nome curto por tenant;
* theme color;
* background color;
* Service Worker;
* cache;
* experiência offline;
* instalação.

## Manifest dinâmico

O manifesto deverá utilizar dados do tenant atual, como:

* nome;
* nome curto;
* logo/ícone;
* cor principal;
* cor de fundo;
* identidade do estabelecimento.

URLs do manifest, start URL e escopo devem respeitar a URL primária do tenant:

```text
domínio próprio ativo
  ou subdomínio RF
  ou URL da plataforma
```

QR Code, NFC e instalação PWA devem preferir a URL canônica resolvida pelo `TenantResolver`.

## Cache e offline

Informações essenciais poderão continuar disponíveis quando apropriado:

* contatos;
* regras;
* horários;
* informações básicas;
* Wi-Fi já autorizado a aparecer ao hóspede.

Deve haver cuidado com segurança ao armazenar dados offline. Dados sensíveis, privados ou administrativos não devem ser expostos indevidamente em cache.

## Performance

A arquitetura PWA deve priorizar celulares e redes móveis instáveis, com carregamento progressivo, cache controlado, otimização de imagens e redução de JavaScript desnecessário.
