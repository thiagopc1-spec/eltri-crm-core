import type { AppRole, Company, Db } from "@/domain/types";

export async function findProfile(db: Db, userId: string) {
  const { data, error } = await db
    .from("profiles")
    .select("id, org_id, full_name, email")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function bootstrapWorkspace(
  db: Db,
  input: { orgName: string; companyName: string; fullName: string; email: string },
) {
  const { data, error } = await db.rpc("bootstrap_workspace", {
    _org_name: input.orgName,
    _company_name: input.companyName,
    _full_name: input.fullName,
    _email: input.email,
  });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function findOrganization(db: Db, orgId: string) {
  const { data, error } = await db
    .from("organizations")
    .select("id, name")
    .eq("id", orgId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function listCompanies(db: Db, orgId: string): Promise<Company[]> {
  const { data, error } = await db
    .from("companies")
    .select("id, name")
    .eq("org_id", orgId)
    .order("created_at");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listRoles(db: Db, userId: string): Promise<AppRole[]> {
  const { data, error } = await db.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.role as AppRole);
}
