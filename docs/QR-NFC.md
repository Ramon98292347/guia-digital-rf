# QR/NFC

## Objetivo

Documentar a arquitetura conceitual para acesso ao Guia por URL, QR Code, NFC e pontos físicos identificáveis.

## Formas de acesso

O sistema deverá permitir acesso por:

* URL;
* QR Code;
* NFC;
* PWA instalada.

## Pontos de acesso

Entidades conceituais:

```text
qr_points
nfc_points
```

Cada ponto poderá possuir:

```text
tenant
nome
tipo
local
identificador
destino
ativo
analytics
```

Exemplos:

```text
Recepção
Chalé 01
Chalé 02
Restaurante
Área da piscina
Chaveiro
Placa
```

## Contextualização futura

A arquitetura deverá permitir que um acesso por QR/NFC informe contexto ao Guia, como origem do acesso, local físico ou ponto específico.

Exemplos:

```text
/guia/pousadaexemplo?source=nfc
/guia/pousadaexemplo?ponto=chale-01
```

## Analytics

Eventos relacionados a QR/NFC poderão alimentar métricas internas, como:

* origem QR;
* origem NFC;
* ponto acessado;
* módulo aberto após leitura;
* horário de acesso;
* conversão para instalação PWA.

Essas métricas devem respeitar privacidade e isolamento entre tenants.
