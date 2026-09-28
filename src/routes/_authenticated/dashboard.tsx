import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { PageHeader, Panel, StatCard } from "@/components/eltri/page";
import { fetchDashboard } from "@/lib/api/crm.functions";
import { formatCurrency } from "@/lib/format";
import { useWorkspace } from "@/lib/workspace-context";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ELTRI CRM" },
      { name: "description", content: "Visão geral da operação comercial no ELTRI CRM." },
      { property: "og:title", content: "Dashboard — ELTRI CRM" },
      { property: "og:description", content: "Visão geral da operação comercial no ELTRI CRM." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { companyId, workspace } = useWorkspace();
  const load = useServerFn(fetchDashboard);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", companyId],
    queryFn: () => load({ data: { companyId } }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${workspace.fullName.split(" ")[0]}`}
        description="Panorama da empresa selecionada."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Contatos" value={isLoading ? "…" : String(data?.contacts ?? 0)} />
        <StatCard
          label="Oportunidades abertas"
          value={isLoading ? "…" : String(data?.openOpportunities ?? 0)}
        />
        <StatCard
          label="Valor em funil"
          value={isLoading ? "…" : formatCurrency(data?.openPipelineValue ?? 0)}
        />
        <StatCard
          label="Retornos pendentes"
          value={isLoading ? "…" : String(data?.activitiesDue ?? 0)}
        />
      </div>

      <Panel className="p-5">
        <h2 className="font-display text-sm font-semibold text-foreground">Funil por etapa</h2>
        <div className="mt-4 space-y-3">
          {(data?.stages ?? []).map((stage) => {
            const total = data?.openOpportunities || 1;
            const pct = Math.round((stage.count / total) * 100);
            return (
              <div key={stage.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{stage.name}</span>
                  <span className="text-muted-foreground">
                    {stage.count} · {formatCurrency(stage.value)}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${Math.max(pct, 3)}%` }}
                  />
                </div>
              </div>
            );
          })}
          {!isLoading && (data?.stages.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma etapa configurada.</p>
          ) : null}
        </div>
      </Panel>

      <Panel className="p-5">
        <h2 className="font-display text-sm font-semibold text-foreground">Imóveis cadastrados</h2>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {isLoading ? "…" : (data?.properties ?? 0)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Base de imóveis disponível para cruzamento com interesses.
        </p>
      </Panel>
    </div>
  );
}
