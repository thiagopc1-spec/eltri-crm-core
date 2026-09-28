import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import * as service from "@/domain/services/crm.service.server";

const companyInput = z.object({ companyId: z.string().uuid() });

const optionalText = z.string().trim().optional();
const optionalNumber = z.number().nullable().optional();

export const fetchDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => companyInput.parse(data))
  .handler(({ context, data }) =>
    service.getDashboard({
      db: context.supabase,
      userId: context.userId,
      companyId: data.companyId,
    }),
  );

export const fetchContacts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => companyInput.parse(data))
  .handler(({ context, data }) =>
    service.getContacts({
      db: context.supabase,
      userId: context.userId,
      companyId: data.companyId,
    }),
  );

export const addContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    companyInput
      .extend({
        name: z.string().trim().min(1),
        email: optionalText,
        phone: optionalText,
        source: optionalText,
        kind: z.enum(["lead", "client", "owner", "partner"]),
      })
      .parse(data),
  )
  .handler(({ context, data }) =>
    service.createContact(
      { db: context.supabase, userId: context.userId, companyId: data.companyId },
      data,
    ),
  );

export const fetchProperties = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => companyInput.parse(data))
  .handler(({ context, data }) =>
    service.getProperties({
      db: context.supabase,
      userId: context.userId,
      companyId: data.companyId,
    }),
  );

export const addProperty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    companyInput
      .extend({
        title: z.string().trim().min(1),
        code: optionalText,
        purpose: z.enum(["sale", "rent"]),
        property_type: optionalText,
        price: optionalNumber,
        area: optionalNumber,
        bedrooms: optionalNumber,
        city: optionalText,
        neighborhood: optionalText,
      })
      .parse(data),
  )
  .handler(({ context, data }) =>
    service.createProperty(
      { db: context.supabase, userId: context.userId, companyId: data.companyId },
      data,
    ),
  );

export const fetchPipeline = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => companyInput.parse(data))
  .handler(({ context, data }) =>
    service.getPipeline({
      db: context.supabase,
      userId: context.userId,
      companyId: data.companyId,
    }),
  );

export const fetchOpportunities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => companyInput.parse(data))
  .handler(({ context, data }) =>
    service.getOpportunities({
      db: context.supabase,
      userId: context.userId,
      companyId: data.companyId,
    }),
  );

export const addOpportunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    companyInput
      .extend({
        title: z.string().trim().min(1),
        value: z.number().nonnegative(),
        stage_id: z.string().uuid(),
        contact_id: z.string().uuid().nullable().optional(),
        expected_close_date: z.string().nullable().optional(),
      })
      .parse(data),
  )
  .handler(({ context, data }) =>
    service.createOpportunity(
      { db: context.supabase, userId: context.userId, companyId: data.companyId },
      data,
    ),
  );

export const moveOpportunityStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    companyInput
      .extend({ opportunityId: z.string().uuid(), stageId: z.string().uuid() })
      .parse(data),
  )
  .handler(({ context, data }) =>
    service.moveOpportunity(
      { db: context.supabase, userId: context.userId, companyId: data.companyId },
      data.opportunityId,
      data.stageId,
    ),
  );

export const fetchActivities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => companyInput.parse(data))
  .handler(({ context, data }) =>
    service.getActivities({
      db: context.supabase,
      userId: context.userId,
      companyId: data.companyId,
    }),
  );

export const addActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    companyInput
      .extend({
        title: z.string().trim().min(1),
        type: z.enum(["call", "visit", "meeting", "email", "note", "followup"]),
        due_at: z.string().nullable().optional(),
        description: optionalText,
        contact_id: z.string().uuid().nullable().optional(),
      })
      .parse(data),
  )
  .handler(({ context, data }) =>
    service.createActivity(
      { db: context.supabase, userId: context.userId, companyId: data.companyId },
      data,
    ),
  );

export const finishActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => companyInput.extend({ activityId: z.string().uuid() }).parse(data))
  .handler(({ context, data }) =>
    service.completeActivity(
      { db: context.supabase, userId: context.userId, companyId: data.companyId },
      data.activityId,
    ),
  );

export const fetchInterests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => companyInput.parse(data))
  .handler(({ context, data }) =>
    service.getInterests({
      db: context.supabase,
      userId: context.userId,
      companyId: data.companyId,
    }),
  );

export const addInterest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    companyInput
      .extend({
        contact_id: z.string().uuid(),
        purpose: z.enum(["sale", "rent"]),
        property_type: optionalText,
        city: optionalText,
        neighborhoods: optionalText,
        min_price: optionalNumber,
        max_price: optionalNumber,
        min_bedrooms: optionalNumber,
      })
      .parse(data),
  )
  .handler(({ context, data }) =>
    service.createInterest(
      { db: context.supabase, userId: context.userId, companyId: data.companyId },
      data,
    ),
  );
