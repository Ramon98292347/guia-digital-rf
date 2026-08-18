import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  BedDouble,
  PencilLine,
  Plus,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import {
  changeAccommodationStatusAction,
  moveAccommodationAction,
} from "@/features/accommodations/actions";
import { AccommodationStatusBadge } from "@/features/accommodations/components/status-badge";
import { getAccommodationListData } from "@/features/accommodations/server/service";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminAccommodationsPageProps = {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ status?: string }>;
};

const successMessages: Record<string, string> = {
  criada: "Acomodação criada com sucesso.",
  salva: "Acomodação salva com sucesso.",
  publicada: "Acomodação publicada com sucesso.",
  arquivada: "Acomodação arquivada com sucesso.",
  ordem: "A ordem das acomodações foi atualizada.",
};

export default async function AdminAccommodationsPage({
  params,
  searchParams,
}: AdminAccommodationsPageProps) {
  const [{ tenantSlug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const { context, accommodations } = await getAccommodationListData(tenantSlug);
  const feedbackMessage = resolvedSearchParams.status
    ? successMessages[resolvedSearchParams.status] ?? null
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Conteúdo do estabelecimento</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Acomodações</h1>
        </div>
        <Link
          href={`/admin/${tenantSlug}/acomodacoes/nova`}
          className={buttonVariants({ size: "lg" })}
        >
          <Plus className="size-4" aria-hidden="true" />
          Nova acomodação
        </Link>
      </div>

      {feedbackMessage ? (
        <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm">
          {feedbackMessage}
        </div>
      ) : null}

      {accommodations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <BedDouble className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">Nenhuma acomodação cadastrada ainda.</p>
              <p className="text-sm text-muted-foreground">
                Crie a primeira acomodação do tenant atual para começar a
                estruturar o conteúdo.
              </p>
            </div>
            <Link
              href={`/admin/${tenantSlug}/acomodacoes/nova`}
              className={buttonVariants({ size: "lg" })}
            >
              <Plus className="size-4" aria-hidden="true" />
              Nova acomodação
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {accommodations.map((accommodation, index) => (
            <Card key={accommodation.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="truncate">{accommodation.name}</CardTitle>
                    <AccommodationStatusBadge status={accommodation.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    /{accommodation.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <form
                    action={moveAccommodationAction.bind(null, {
                      tenantSlug,
                      accommodationId: accommodation.id,
                      direction: "up",
                    })}
                  >
                    <Button
                      type="submit"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Mover para cima"
                      disabled={index === 0}
                    >
                      <ArrowUp className="size-4" aria-hidden="true" />
                    </Button>
                  </form>
                  <form
                    action={moveAccommodationAction.bind(null, {
                      tenantSlug,
                      accommodationId: accommodation.id,
                      direction: "down",
                    })}
                  >
                    <Button
                      type="submit"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Mover para baixo"
                      disabled={index === accommodations.length - 1}
                    >
                      <ArrowDown className="size-4" aria-hidden="true" />
                    </Button>
                  </form>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div
                    className={cn(
                      "relative h-36 overflow-hidden rounded-lg border border-border bg-muted sm:w-40",
                      !accommodation.coverUrl && "flex items-center justify-center",
                    )}
                  >
                    {accommodation.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={accommodation.coverUrl}
                        alt={accommodation.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <BedDouble className="size-5 text-muted-foreground" aria-hidden="true" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {accommodation.short_description?.trim() ||
                        "Sem descrição curta cadastrada."}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-4" aria-hidden="true" />
                        {accommodation.capacity
                          ? `${accommodation.capacity} hóspedes`
                          : "Capacidade não informada"}
                      </span>
                      <span>Ordem {accommodation.sort_order}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/${tenantSlug}/acomodacoes/${accommodation.id}/editar`}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    <PencilLine className="size-4" aria-hidden="true" />
                    Editar
                  </Link>

                  {accommodation.status !== "published" ? (
                    <form
                      action={changeAccommodationStatusAction.bind(null, {
                        tenantSlug,
                        accommodationId: accommodation.id,
                        intent: "published",
                      })}
                    >
                      <Button type="submit" variant="secondary">
                        <Send className="size-4" aria-hidden="true" />
                        Publicar
                      </Button>
                    </form>
                  ) : null}

                  {accommodation.status !== "draft" ? (
                    <form
                      action={changeAccommodationStatusAction.bind(null, {
                        tenantSlug,
                        accommodationId: accommodation.id,
                        intent: "draft",
                      })}
                    >
                      <Button type="submit" variant="outline">
                        Salvar como rascunho
                      </Button>
                    </form>
                  ) : null}

                  {accommodation.status !== "archived" ? (
                    <form
                      action={changeAccommodationStatusAction.bind(null, {
                        tenantSlug,
                        accommodationId: accommodation.id,
                        intent: "archived",
                      })}
                    >
                      <Button type="submit" variant="ghost">
                        <Trash2 className="size-4" aria-hidden="true" />
                        Arquivar
                      </Button>
                    </form>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="flex flex-col gap-2 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Tenant atual: <span className="font-medium text-foreground">{context.tenant.name}</span>
          </span>
          <span>
            Todas as operações usam sessão, tenant validado, membership e RLS.
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
