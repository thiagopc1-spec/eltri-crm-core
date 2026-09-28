import * as repo from "@/domain/repositories/crm.repository.server";
import type { Activity, Contact, DashboardSummary, Db, Interest, Property } from "@/domain/types";

import { assertCompanyAccess } from "./workspace.service.server";

type Ctx = { db: Db; userId: string; companyId: string };

async function guard({ db, userId, companyId }: Ctx) {
  await assertCompanyAccess(db, userId, companyId);
}

export async function getContacts(ctx: Ctx) {
  await guard(ctx);
  return repo.listContacts(ctx.db, ctx.companyId);
}

export async function createContact(
  ctx: Ctx,
  input: { name: string; email?: string; phone?: string; kind: Contact["kind"]; source?: string },
) {
  await guard(ctx);
  if (!input.name.trim()) throw new Error("Informe o nome do contato.");
  await repo.insertContact(ctx.db, ctx.companyId, ctx.userId, input);
}

export async function getProperties(ctx: Ctx) {
  await guard(ctx);
  return repo.listProperties(ctx.db, ctx.companyId);
}

export async function createProperty(
  ctx: Ctx,
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
  await guard(ctx);
  if (!input.title.trim()) throw new Error("Informe o título do imóvel.");
  await repo.insertProperty(ctx.db, ctx.companyId, input);
}

export async function getPipeline(ctx: Ctx) {
  await guard(ctx);
  const pipeline = await repo.findDefaultPipeline(ctx.db, ctx.companyId);
  if (!pipeline) return { pipeline: null, stages: [], opportunities: [] };
  const [stages, opportunities] = await Promise.all([
    repo.listStages(ctx.db, pipeline.id),
    repo.listOpportunities(ctx.db, ctx.companyId),
  ]);
  return { pipeline, stages, opportunities };
}

export async function getOpportunities(ctx: Ctx) {
  await guard(ctx);
  const [opportunities, pipeline] = await Promise.all([
    repo.listOpportunities(ctx.db, ctx.companyId),
    repo.findDefaultPipeline(ctx.db, ctx.companyId),
  ]);
  const stages = pipeline ? await repo.listStages(ctx.db, pipeline.id) : [];
  return { opportunities, stages, pipelineId: pipeline?.id ?? null };
}

export async function createOpportunity(
  ctx: Ctx,
  input: {
    title: string;
    value: number;
    stage_id: string;
    contact_id?: string | null;
    expected_close_date?: string | null;
  },
) {
  await guard(ctx);
  if (!input.title.trim()) throw new Error("Informe o título da oportunidade.");
  const pipeline = await repo.findDefaultPipeline(ctx.db, ctx.companyId);
  if (!pipeline) throw new Error("Nenhum funil configurado para esta empresa.");
  await repo.insertOpportunity(ctx.db, ctx.companyId, ctx.userId, {
    ...input,
    pipeline_id: pipeline.id,
  });
}

export async function moveOpportunity(ctx: Ctx, opportunityId: string, stageId: string) {
  await guard(ctx);
  await repo.updateOpportunityStage(ctx.db, ctx.companyId, opportunityId, stageId);
}

export async function getActivities(ctx: Ctx) {
  await guard(ctx);
  return repo.listActivities(ctx.db, ctx.companyId);
}

export async function createActivity(
  ctx: Ctx,
  input: {
    title: string;
    type: Activity["type"];
    due_at?: string | null;
    description?: string;
    contact_id?: string | null;
  },
) {
  await guard(ctx);
  if (!input.title.trim()) throw new Error("Informe o título da atividade.");
  await repo.insertActivity(ctx.db, ctx.companyId, ctx.userId, input);
}

export async function completeActivity(ctx: Ctx, activityId: string) {
  await guard(ctx);
  await repo.markActivityDone(ctx.db, ctx.companyId, activityId);
}

export async function getInterests(ctx: Ctx) {
  await guard(ctx);
  const [interests, contacts] = await Promise.all([
    repo.listInterests(ctx.db, ctx.companyId),
    repo.listContacts(ctx.db, ctx.companyId),
  ]);
  return { interests, contacts };
}

export async function createInterest(
  ctx: Ctx,
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
  await guard(ctx);
  if (!input.contact_id) throw new Error("Selecione o contato do interesse.");
  await repo.insertInterest(ctx.db, ctx.companyId, input);
}

export async function getDashboard(ctx: Ctx): Promise<DashboardSummary> {
  await guard(ctx);
  const [contacts, properties, { stages, opportunities }, activities] = await Promise.all([
    repo.countRows(ctx.db, "contacts", ctx.companyId),
    repo.countRows(ctx.db, "properties", ctx.companyId),
    getPipeline(ctx),
    repo.listActivities(ctx.db, ctx.companyId),
  ]);

  const open = opportunities.filter((o) => o.status === "open");

  return {
    contacts,
    properties,
    openOpportunities: open.length,
    openPipelineValue: open.reduce((sum, o) => sum + Number(o.value), 0),
    activitiesDue: activities.filter((a) => !a.done_at).length,
    stages: stages.map((stage) => {
      const items = open.filter((o) => o.stage_id === stage.id);
      return {
        name: stage.name,
        count: items.length,
        value: items.reduce((sum, o) => sum + Number(o.value), 0),
      };
    }),
  };
}
