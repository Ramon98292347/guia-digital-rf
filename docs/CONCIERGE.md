# Concierge

## Objetivo

Documentar o Concierge Virtual como uma camada da plataforma que consulta os mesmos dados utilizados pelo Guia e pelo Admin.

## Princípios

* O Concierge funciona dentro do próprio Guia.
* Deve utilizar a mesma fonte de verdade das telas do sistema.
* Não criar uma segunda base duplicada apenas para o Concierge.
* O Concierge deve acessar somente dados do tenant atual.
* Se não encontrar uma resposta, nunca inventar.

## Fluxo conceitual

```text
Pergunta do hóspede
        ↓
Identificar tenant
        ↓
Identificar intenção
        ↓
Consultar fontes internas
        ↓
Encontrou informação?
   ↙               ↘
 SIM               NÃO
 ↓                  ↓
Responder       Fallback
                  ↓
           Oferecer contato
                  ↓
        Registrar pergunta
```

## Fontes de conhecimento

### Dados estruturados

Exemplos:

```text
wifi
schedules
services
accommodations
events
products
rules
contacts
```

### Conhecimento complementar

Exemplos:

```text
FAQs
knowledge_items
```

O Concierge deverá preferir dados estruturados quando a informação já existir no sistema.

Exemplo: se existe tabela de horários, não duplicar o horário dentro de FAQ.

## Informações consultáveis

O Concierge deverá consultar informações como:

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

## Perguntas sem resposta

O recurso conceitual `unanswered_questions` deverá guardar:

* tenant;
* pergunta;
* data;
* quantidade;
* categoria provável;
* status.

Isso permitirá ao administrador descobrir lacunas de informação e melhorar o conteúdo do Guia.

## Fallback

Quando não encontrar informação suficiente, o Concierge deverá informar que não encontrou aquela informação e oferecer contato com a recepção ou equipe.

## Saudações

O Concierge deverá compreender cumprimentos em português, incluindo:

* oi;
* olá;
* bom dia;
* boa tarde;
* boa noite;
* obrigado;
* obrigada.

As saudações deverão considerar o horário local configurado para o tenant.
