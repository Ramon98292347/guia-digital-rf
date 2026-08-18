# Mídia e Storage

## Objetivo

Definir a infraestrutura real de Storage multi-tenant para fotos, vídeos e documentos do Guia Digital RF Tecnologia.

Princípio:

**PostgreSQL guarda metadata. Supabase Storage guarda o arquivo real.**

## Buckets

### tenant-private-media

Bucket privado.

Uso:

* uploads novos;
* drafts;
* preview administrativo;
* arquivos ainda não publicados;
* mídia que não deve aparecer no Guia público.

Tenant Admin e Tenant Staff podem enviar e visualizar mídia privada do próprio tenant. Staff não publica diretamente.

### tenant-public-media

Bucket público.

Uso:

* assets aprovados;
* imagens e vídeos publicados;
* mídia que pode aparecer no Guia público.

Admin e Staff não possuem INSERT direto no bucket público via cliente normal. Publicação deve passar por operação server-side autorizada.

## Paths

Paths usam `tenant_id` como primeiro segmento.

Formato:

```text
{tenant_id}/{category}/{uuid}.{ext}
```

Categorias permitidas:

```text
branding
accommodations
gallery
services
local-tips
general
```

Não usar nome de pousada, slug comercial ou domínio como estrutura de path.

Bloqueios:

* `../`;
* barra invertida;
* path sem tenant;
* categoria desconhecida;
* extensão não permitida.

## Tipos e limites

MVP permite:

```text
image/jpeg
image/png
image/webp
image/avif
video/mp4
video/webm
application/pdf
```

SVG genérico não é permitido nesta fase.

Limite inicial:

```text
50 MB
```

Esse limite é técnico e centralizado. Futuramente poderá variar por plano, entitlement, infraestrutura ou tipo de mídia.

## Fluxo de publicação

```text
Upload
  ↓
tenant-private-media
  ↓
media.status = draft/ready
  ↓
Preview privado
  ↓
Publicação server-side
  ↓
tenant-public-media
  ↓
media.status = published
```

Não basta o navegador alterar `storage_bucket`.

Publicação não é uma transação PostgreSQL com Storage. O serviço deve tratar falhas explicitamente e fazer compensação quando possível.

## Preview

Preview privado usa signed URL temporária.

Valor inicial:

```text
5 minutos
```

Signed URL não deve ser salva no banco.

## Remoção

Remover publicação é diferente de excluir arquivo definitivamente.

Antes de exclusão definitiva, o serviço deve verificar referências em:

```text
accommodations
accommodation_media
services
gallery_items
local_tips
```

Se houver referência, a remoção definitiva deve falhar de forma controlada.

## Service Role

`SUPABASE_SERVICE_ROLE_KEY` só pode ser usada no servidor.

Regras:

* nunca usar `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`;
* nunca importar cliente admin em Client Components;
* usar apenas em operações privilegiadas, como publicação controlada;
* operações normais do Admin devem preferir sessão normal + RLS.

## PWA

Não cachear automaticamente:

* private media;
* signed URLs;
* drafts;
* uploads administrativos.

Somente assets públicos e necessários devem entrar em estratégias futuras de cache.

## Futuro

Evoluções previstas:

* upload resumível;
* retry/progresso no Admin;
* compressão/otimização;
* derivados `thumbnail`, `card`, `hero`, `full`;
* quota por plano/entitlement;
* hardening por magic bytes;
* cleanup de objetos órfãos;
* transcoding ou streaming avançado de vídeo.
