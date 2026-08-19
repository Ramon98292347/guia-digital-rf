import { notFound } from "next/navigation";
import { ResourcePage } from "@/features/admin/content/components/resource-page";
import { archiveResourceAction, deleteResourceAction, deleteSchedulePeriodAction, moveResourceAction, restoreResourceAction, saveResourceAction, saveSchedulePeriodAction } from "@/features/admin/content/actions";
import { SchedulePeriods } from "@/features/admin/content/components/schedule-periods";
import { getResourceDefinition } from "@/features/admin/content/resource-config";
import { getResourcePageData } from "@/features/admin/content/service";

type PageProps = {
  params: Promise<{ tenantSlug: string; resource: string }>;
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminResourcePage({ params, searchParams }: PageProps) {
  const [{ tenantSlug, resource }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const definition = getResourceDefinition(resource);
  if (!definition) notFound();
  const data = await getResourcePageData(tenantSlug, definition.key);
  if (!data) notFound();

  const saveAction = saveResourceAction.bind(null, definition.key, tenantSlug);
  const archiveAction = archiveResourceAction.bind(null, definition.key, tenantSlug);
  const deleteAction = deleteResourceAction.bind(null, definition.key, tenantSlug);
  const restoreAction = restoreResourceAction.bind(null, definition.key, tenantSlug);
  const moveAction = moveResourceAction.bind(null, definition.key, tenantSlug);
  const clientDefinition = { key: definition.key, title: definition.title, description: definition.description, table: definition.table, singleton: definition.singleton, fields: definition.fields };

  const schedulePeriodAction = saveSchedulePeriodAction.bind(null, tenantSlug);
  const deletePeriodAction = deleteSchedulePeriodAction.bind(null, tenantSlug);
  const feedback = { salvo: "Alterações salvas com sucesso.", arquivado: "Registro arquivado.", restaurado: "Registro restaurado." }[resolvedSearchParams.status ?? ""] ?? null;
  return <>{<ResourcePage tenantSlug={tenantSlug} definition={clientDefinition} rows={data.rows} options={data.options} saveAction={saveAction} archiveAction={archiveAction} deleteAction={deleteAction} restoreAction={restoreAction} moveAction={moveAction} feedback={feedback} />}{definition.key === "horarios" ? <div className="mx-auto max-w-6xl"><SchedulePeriods schedules={data.rows} periods={data.periods} saveAction={schedulePeriodAction} deleteAction={deletePeriodAction} /></div> : null}</>;
}
