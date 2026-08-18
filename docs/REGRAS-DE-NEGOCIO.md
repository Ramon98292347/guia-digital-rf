# Regras de Negócio

## Objetivo

Documentar regras permanentes da plataforma Guia Digital RF Tecnologia.

## Regras principais

1. Tenant nunca acessa outro tenant.
2. Conteúdo do cliente é editável.
3. Módulos podem ser ativados/desativados.
4. Conteúdo de hóspedes exige moderação.
5. Concierge não inventa.
6. Concierge utiliza fonte única.
7. Identidade é dinâmica.
8. PWA pertence visualmente ao estabelecimento.
9. QR/NFC podem identificar pontos.
10. Super Admin é separado do Admin.
11. Dados específicos não ficam no código.
12. Interface pública é mobile-first.
13. Padrão brasileiro.
14. Informações ausentes não devem ser inventadas.
15. Mudanças de conteúdo devem refletir no Guia e no Concierge.

## Regra central

**Um sistema. Muitos clientes. Experiências completamente personalizadas.**

## Conteúdo específico de clientes

Nunca deixar diretamente nos componentes ou serviços dados específicos como nome da pousada, logo, cores, telefone, WhatsApp, endereço, e-mail, horários, Wi-Fi, senha de Wi-Fi, regras, acomodações, fotos, vídeos, serviços, produtos, preços, cardápios, eventos, promoções, cupons, FAQs, respostas do Concierge, textos, links ou informações turísticas específicas.

Tudo que variar entre clientes deve vir do banco de dados, configurações ou painel administrativo.

## Conteúdo de hóspedes

Fotos, vídeos, avaliações ou experiências enviadas por hóspedes nunca deverão ser publicados automaticamente.

Fluxo:

```text
PENDENTE → APROVADO ou REJEITADO
```

Somente conteúdo aprovado poderá ficar público.

## Padrão brasileiro

Toda interface destinada aos clientes e hóspedes deve utilizar português do Brasil.

Utilizar padrão brasileiro para:

* datas;
* horários;
* moeda;
* textos;
* mensagens;
* validações apresentadas ao usuário.

Exemplos:

```text
17/08/2026
14:30
R$ 150,00
```

## Segurança e dados sensíveis

Exigem cuidado especial:

* senha de Wi-Fi;
* dados de hóspedes;
* informações de estadia;
* conversas;
* dados administrativos;
* tokens;
* chaves de API.

Nenhuma chave privada deverá ser exposta no frontend.
