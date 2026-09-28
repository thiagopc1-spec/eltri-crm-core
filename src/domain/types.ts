import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

/** Supabase client scoped to the authenticated user (RLS applies). */
export type Db = SupabaseClient<Database>;

export type AppRole = "owner" | "admin" | "manager" | "agent";

export interface Company {
  id: string;
  name: string;
}

export interface Workspace {
  userId: string;
  fullName: string;
  email: string | null;
  organization: { id: string; name: string };
  companies: Company[];
  roles: AppRole[];
}

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  kind: "lead" | "client" | "owner" | "partner";
  source: string | null;
  created_at: string;
}

export interface Property {
  id: string;
  code: string | null;
  title: string;
  purpose: "sale" | "rent";
  status: "available" | "reserved" | "sold" | "rented" | "inactive";
  property_type: string | null;
  price: number | null;
  area: number | null;
  bedrooms: number | null;
  city: string | null;
  neighborhood: string | null;
}

export interface Stage {
  id: string;
  name: string;
  position: number;
  probability: number;
}

export interface Opportunity {
  id: string;
  title: string;
  value: number;
  status: "open" | "won" | "lost";
  stage_id: string;
  expected_close_date: string | null;
  contact_name: string | null;
}

export interface Activity {
  id: string;
  title: string;
  description: string | null;
  type: "call" | "visit" | "meeting" | "email" | "note" | "followup";
  due_at: string | null;
  done_at: string | null;
  contact_name: string | null;
}

export interface Interest {
  id: string;
  contact_id: string;
  contact_name: string | null;
  purpose: "sale" | "rent";
  property_type: string | null;
  city: string | null;
  neighborhoods: string | null;
  min_price: number | null;
  max_price: number | null;
  min_bedrooms: number | null;
  active: boolean;
}

export interface DashboardSummary {
  contacts: number;
  openOpportunities: number;
  openPipelineValue: number;
  properties: number;
  activitiesDue: number;
  stages: { name: string; count: number; value: number }[];
}
