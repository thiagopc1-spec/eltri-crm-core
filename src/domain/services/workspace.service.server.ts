import * as repo from "@/domain/repositories/workspace.repository.server";
import type { Db, Workspace } from "@/domain/types";

/**
 * Loads the workspace for the authenticated user, bootstrapping the
 * organization / first company on first access.
 */
export async function getWorkspace(
  db: Db,
  userId: string,
  identity: { fullName: string; email: string },
): Promise<Workspace> {
  let profile = await repo.findProfile(db, userId);

  if (!profile?.org_id) {
    await repo.bootstrapWorkspace(db, {
      orgName: `${identity.fullName || "Nova"} · Organização`,
      companyName: "Matriz",
      fullName: identity.fullName,
      email: identity.email,
    });
    profile = await repo.findProfile(db, userId);
  }

  if (!profile?.org_id) throw new Error("Não foi possível preparar a organização do usuário.");

  const [organization, companies, roles] = await Promise.all([
    repo.findOrganization(db, profile.org_id),
    repo.listCompanies(db, profile.org_id),
    repo.listRoles(db, userId),
  ]);

  return {
    userId,
    fullName: profile.full_name || identity.fullName,
    email: profile.email ?? identity.email,
    organization: { id: profile.org_id, name: organization?.name ?? "Organização" },
    companies,
    roles,
  };
}

/** Authorization: the company must belong to the user's organization and be accessible. */
export async function assertCompanyAccess(db: Db, userId: string, companyId: string) {
  const profile = await repo.findProfile(db, userId);
  if (!profile?.org_id) throw new Error("Usuário sem organização.");

  const companies = await repo.listCompanies(db, profile.org_id);
  const allowed = companies.some((c) => c.id === companyId);
  if (!allowed) throw new Error("Acesso negado para esta empresa.");

  return { orgId: profile.org_id, companyId };
}
