import { createContext, useContext } from "react";

import type { Workspace } from "@/domain/types";

interface WorkspaceContextValue {
  workspace: Workspace;
  companyId: string;
  setCompanyId: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export const WorkspaceProvider = WorkspaceContext.Provider;

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace deve ser usado dentro do workspace autenticado.");
  return value;
}
