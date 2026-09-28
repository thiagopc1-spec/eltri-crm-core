import { useQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/eltri/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { getWorkspace } from "@/lib/api/workspace.functions";
import { WorkspaceProvider } from "@/lib/workspace-context";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth" });
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const loadWorkspace = useServerFn(getWorkspace);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["workspace"],
    queryFn: () => loadWorkspace(),
  });

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/auth", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (data && !companyId && data.companies[0]) setCompanyId(data.companies[0].id);
  }, [data, companyId]);

  if (isLoading || !data || !companyId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        {error ? "Não foi possível carregar seu workspace." : "Carregando workspace…"}
      </div>
    );
  }

  return (
    <WorkspaceProvider value={{ workspace: data, companyId, setCompanyId }}>
      <AppShell>
        <Outlet />
      </AppShell>
    </WorkspaceProvider>
  );
}
