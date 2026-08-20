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

## Implementação do MVP

O Concierge é uma capability única da plataforma. A configuração é tenant-scoped
e fica em `concierge_settings`; a base complementar opcional fica em
`concierge_knowledge` como um único documento JSON publicado por tenant.

### Ordem de consulta

1. Dados estruturados publicados do tenant atual.
2. Conteúdo universal publicado (`content_collections` e `content_items`).
3. JSON complementar publicado, somente para informações que não possuem módulo próprio.
4. Mensagem de fallback e contato configurado.

O serviço determinístico classifica intenções comuns e consulta apenas a fonte
relevante. O provider abstrato pode usar uma API de IA no servidor, mas nunca
recebe senha de Wi-Fi, credenciais ou dados de outro tenant.

### Segurança e operação

* `concierge_settings` é singleton por tenant e possui FKs compostas para mídia e contato do mesmo tenant.
* As duas tabelas possuem RLS e políticas de leitura por membership e escrita por administrador.
* O editor JSON rejeita arrays na raiz, JSON inválido e chaves/valores que indiquem senhas, tokens, chaves de API ou credenciais.
* O Wi-Fi retorna ações para a interface segura do Guia; a senha não entra no contexto do provider.
* O histórico permanente de hóspedes não é armazenado no MVP.
* O Admin oferece configuração, edição da base complementar e teste usando o tenant autorizado.
