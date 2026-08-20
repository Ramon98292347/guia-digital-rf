import { ConciergeAdminPage } from "@/features/concierge/components/concierge-admin-page";
import { getConciergeAdminData } from "@/features/concierge/server/admin";
import { clearConciergeKnowledgeAction, saveConciergeKnowledgeAction, saveConciergeSettingsAction, testConciergeAction } from "@/features/concierge/server/actions";

type PageProps = {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminConciergePage({ params, searchParams }: PageProps) {
  const [{ tenantSlug }, query] = await Promise.all([params, searchParams]);
  const data = await getConciergeAdminData(tenantSlug);
  if (!data) return null;
  return (
    <ConciergeAdminPage
      tenantSlug={tenantSlug}
      settings={data.settings}
      knowledge={data.knowledge}
      media={data.media as Record<string, unknown>[]}
      contacts={data.contacts as Record<string, unknown>[]}
      status={query.status ?? null}
      saveSettings={saveConciergeSettingsAction.bind(null, tenantSlug)}
      saveKnowledge={saveConciergeKnowledgeAction.bind(null, tenantSlug)}
      clearKnowledge={clearConciergeKnowledgeAction.bind(null, tenantSlug)}
      testConcierge={testConciergeAction.bind(null, tenantSlug)}
    />
  );
}
