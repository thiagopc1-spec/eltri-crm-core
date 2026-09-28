import type {
  Activity,
  Contact,
  Db,
  Interest,
  Opportunity,
  Property,
  Stage,
} from "@/domain/types";

function unwrap<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

/* ---------- Contacts ---------- */
export async function listContacts(db: Db, companyId: string): Promise<Contact[]> {
  const { data, error } = await db
    .from("contacts")
    .select("id, name, email, phone, kind, source, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  return unwrap(data as Contact[] | null, error);
}

export async function insertContact(
  db: Db,
  companyId: string,
  ownerId: string,
  input: { name: string; email?: string; phone?: string; kind: Contact["kind"]; source?: string },
) {
  const { error } = await db.from("contacts").insert({
    company_id: companyId,
    owner_id: ownerId,
    name: input.name,
    email: input.email || null,
    phone: input.phone || null,
    kind: input.kind,
    source: input.source || null,
  });
  if (error) throw new Error(error.message);
}

/* ---------- Properties ---------- */
export async function listProperties(db: Db, companyId: string): Promise<Property[]> {
  const { data, error } = await db
    .from("properties")
    .select(
      "id, code, title, purpose, status, property_type, price, area, bedrooms, city, neighborhood",
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  return unwrap(data as Property[] | null, error);
}

export async function insertProperty(
  db: Db,
  companyId: string,
  input: {
    title: string;
    code?: string;
    purpose: Property["purpose"];
    property_type?: string;
    price?: number | null;
    area?: number | null;
    bedrooms?: number | null;
    city?: string;
    neighborhood?: string;
  },
) {
  const { error } = await db.from("properties").insert({
    company_id: companyId,
    title: input.title,
    code: input.code || null,
    purpose: input.purpose,
    property_type: input.property_type || null,
    price: input.price ?? null,
    area: input.area ?? null,
    bedrooms: input.bedrooms ?? null,
    city: input.city || null,
    neighborhood: input.neighborhood || null,
  });
  if (error) throw new Error(error.message);
}

/* ---------- Pipeline ---------- */
export async function findDefaultPipeline(db: Db, companyId: string) {
  const { data, error } = await db
    .from("pipelines")
    .select("id, name")
    .eq("company_id", companyId)
    .order("is_default", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function listStages(db: Db, pipelineId: string): Promise<Stage[]> {
  const { data, error } = await db
    .from("pipeline_stages")
    .select("id, name, position, probability")
    .eq("pipeline_id", pipelineId)
    .order("position");
  return unwrap(data as Stage[] | null, error);
}

/* ---------- Opportunities ---------- */
type OpportunityRow = Omit<Opportunity, "contact_name"> & {
  contacts: { name: string } | null;
};

export async function listOpportunities(db: Db, companyId: string): Promise<Opportunity[]> {
  const { data, error } = await db
    .from("opportunities")
    .select(
      "id, title, value, status, stage_id, expected_close_date, contacts ( name )",
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as OpportunityRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    value: Number(row.value),
    status: row.status,
    stage_id: row.stage_id,
    expected_close_date: row.expected_close_date,
    contact_name: row.contacts?.name ?? null,
  }));
}

export async function insertOpportunity(
  db: Db,
  companyId: string,
  ownerId: string,
  input: {
    title: string;
    value: number;
    pipeline_id: string;
    stage_id: string;
    contact_id?: string | null;
    expected_close_date?: string | null;
  },
) {
  const { error } = await db.from("opportunities").insert({
    company_id: companyId,
    owner_id: ownerId,
    title: input.title,
    value: input.value,
    pipeline_id: input.pipeline_id,
    stage_id: input.stage_id,
    contact_id: input.contact_id || null,
    expected_close_date: input.expected_close_date || null,
  });
  if (error) throw new Error(error.message);
}

export async function updateOpportunityStage(
  db: Db,
  companyId: string,
  opportunityId: string,
  stageId: string,
) {
  const { error } = await db
    .from("opportunities")
    .update({ stage_id: stageId, updated_at: new Date().toISOString() })
    .eq("id", opportunityId)
    .eq("company_id", companyId);
  if (error) throw new Error(error.message);
}

/* ---------- Activities ---------- */
type ActivityRow = Omit<Activity, "contact_name"> & { contacts: { name: string } | null };

export async function listActivities(db: Db, companyId: string): Promise<Activity[]> {
  const { data, error } = await db
    .from("activities")
    .select("id, title, description, type, due_at, done_at, contacts ( name )")
    .eq("company_id", companyId)
    .order("due_at", { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as ActivityRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    due_at: row.due_at,
    done_at: row.done_at,
    contact_name: row.contacts?.name ?? null,
  }));
}

export async function insertActivity(
  db: Db,
  companyId: string,
  ownerId: string,
  input: {
    title: string;
    type: Activity["type"];
    due_at?: string | null;
    description?: string;
    contact_id?: string | null;
  },
) {
  const { error } = await db.from("activities").insert({
    company_id: companyId,
    owner_id: ownerId,
    title: input.title,
    type: input.type,
    due_at: input.due_at || null,
    description: input.description || null,
    contact_id: input.contact_id || null,
  });
  if (error) throw new Error(error.message);
}

export async function markActivityDone(db: Db, companyId: string, activityId: string) {
  const { error } = await db
    .from("activities")
    .update({ done_at: new Date().toISOString() })
    .eq("id", activityId)
    .eq("company_id", companyId);
  if (error) throw new Error(error.message);
}

/* ---------- Interests ---------- */
type InterestRow = Omit<Interest, "contact_name"> & { contacts: { name: string } | null };

export async function listInterests(db: Db, companyId: string): Promise<Interest[]> {
  const { data, error } = await db
    .from("interests")
    .select(
      "id, contact_id, purpose, property_type, city, neighborhoods, min_price, max_price, min_bedrooms, active, contacts ( name )",
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as InterestRow[]).map((row) => ({
    id: row.id,
    contact_id: row.contact_id,
    contact_name: row.contacts?.name ?? null,
    purpose: row.purpose,
    property_type: row.property_type,
    city: row.city,
    neighborhoods: row.neighborhoods,
    min_price: row.min_price === null ? null : Number(row.min_price),
    max_price: row.max_price === null ? null : Number(row.max_price),
    min_bedrooms: row.min_bedrooms,
    active: row.active,
  }));
}

export async function insertInterest(
  db: Db,
  companyId: string,
  input: {
    contact_id: string;
    purpose: Interest["purpose"];
    property_type?: string;
    city?: string;
    neighborhoods?: string;
    min_price?: number | null;
    max_price?: number | null;
    min_bedrooms?: number | null;
  },
) {
  const { error } = await db.from("interests").insert({
    company_id: companyId,
    contact_id: input.contact_id,
    purpose: input.purpose,
    property_type: input.property_type || null,
    city: input.city || null,
    neighborhoods: input.neighborhoods || null,
    min_price: input.min_price ?? null,
    max_price: input.max_price ?? null,
    min_bedrooms: input.min_bedrooms ?? null,
  });
  if (error) throw new Error(error.message);
}

/* ---------- Counters ---------- */
export async function countRows(db: Db, table: "contacts" | "properties", companyId: string) {
  const { count, error } = await db
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}
