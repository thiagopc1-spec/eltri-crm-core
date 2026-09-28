-- ============ ENUMS ============
create type public.app_role as enum ('owner','admin','manager','agent');
create type public.opportunity_status as enum ('open','won','lost');
create type public.activity_type as enum ('call','visit','meeting','email','note','followup');
create type public.property_purpose as enum ('sale','rent');
create type public.property_status as enum ('available','reserved','sold','rented','inactive');
create type public.contact_kind as enum ('lead','client','owner','partner');

-- ============ TENANCY ============
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  document text,
  created_at timestamptz not null default now()
);
create index on public.companies (org_id);

create table public.profiles (
  id uuid primary key,
  org_id uuid references public.organizations(id) on delete set null,
  full_name text not null default '',
  email text,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  org_id uuid not null references public.organizations(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, org_id, role)
);
create index on public.user_roles (user_id);

create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  company_id uuid not null references public.companies(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, company_id)
);
create index on public.company_members (user_id);

-- ============ SECURITY HELPERS ============
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.current_org_id()
returns uuid language sql stable security definer set search_path = public as $$
  select org_id from public.profiles where id = auth.uid()
$$;

create or replace function public.has_company_access(_company_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.companies c
    join public.profiles p on p.id = auth.uid() and p.org_id = c.org_id
    where c.id = _company_id
      and (
        exists (
          select 1 from public.user_roles ur
          where ur.user_id = auth.uid() and ur.org_id = c.org_id and ur.role in ('owner','admin')
        )
        or exists (
          select 1 from public.company_members cm
          where cm.user_id = auth.uid() and cm.company_id = c.id
        )
      )
  )
$$;

-- ============ DOMAIN ============
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  document text,
  kind public.contact_kind not null default 'lead',
  source text,
  notes text,
  owner_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.contacts (company_id);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  code text,
  title text not null,
  purpose public.property_purpose not null default 'sale',
  status public.property_status not null default 'available',
  property_type text,
  price numeric(14,2),
  area numeric(10,2),
  bedrooms int,
  bathrooms int,
  parking_spots int,
  city text,
  neighborhood text,
  address text,
  owner_contact_id uuid references public.contacts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.properties (company_id);

create table public.pipelines (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.pipelines (company_id);

create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid not null references public.pipelines(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  position int not null default 0,
  probability int not null default 0,
  created_at timestamptz not null default now()
);
create index on public.pipeline_stages (pipeline_id);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  pipeline_id uuid not null references public.pipelines(id) on delete cascade,
  stage_id uuid not null references public.pipeline_stages(id) on delete restrict,
  contact_id uuid references public.contacts(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  title text not null,
  value numeric(14,2) not null default 0,
  status public.opportunity_status not null default 'open',
  expected_close_date date,
  owner_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.opportunities (company_id);
create index on public.opportunities (stage_id);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  type public.activity_type not null default 'followup',
  title text not null,
  description text,
  due_at timestamptz,
  done_at timestamptz,
  owner_id uuid,
  created_at timestamptz not null default now()
);
create index on public.activities (company_id);
create index on public.activities (due_at);

create table public.interests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  purpose public.property_purpose not null default 'sale',
  property_type text,
  city text,
  neighborhoods text,
  min_price numeric(14,2),
  max_price numeric(14,2),
  min_bedrooms int,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index on public.interests (company_id);

-- ============ GRANTS ============
grant select, insert, update, delete on public.organizations to authenticated;
grant select, insert, update, delete on public.companies to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant select on public.company_members to authenticated;
grant select, insert, update, delete on public.contacts to authenticated;
grant select, insert, update, delete on public.properties to authenticated;
grant select, insert, update, delete on public.pipelines to authenticated;
grant select, insert, update, delete on public.pipeline_stages to authenticated;
grant select, insert, update, delete on public.opportunities to authenticated;
grant select, insert, update, delete on public.activities to authenticated;
grant select, insert, update, delete on public.interests to authenticated;
grant all on public.organizations, public.companies, public.profiles, public.user_roles,
  public.company_members, public.contacts, public.properties, public.pipelines,
  public.pipeline_stages, public.opportunities, public.activities, public.interests to service_role;

-- ============ RLS ============
alter table public.organizations enable row level security;
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.company_members enable row level security;
alter table public.contacts enable row level security;
alter table public.properties enable row level security;
alter table public.pipelines enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.opportunities enable row level security;
alter table public.activities enable row level security;
alter table public.interests enable row level security;

create policy "org members read org" on public.organizations
  for select to authenticated using (id = public.current_org_id());

create policy "org members read companies" on public.companies
  for select to authenticated using (org_id = public.current_org_id());
create policy "admins manage companies" on public.companies
  for all to authenticated
  using (org_id = public.current_org_id() and (public.has_role(auth.uid(),'owner') or public.has_role(auth.uid(),'admin')))
  with check (org_id = public.current_org_id() and (public.has_role(auth.uid(),'owner') or public.has_role(auth.uid(),'admin')));

create policy "own profile read" on public.profiles
  for select to authenticated using (id = auth.uid() or org_id = public.current_org_id());
create policy "own profile write" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "read own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid() or org_id = public.current_org_id());

create policy "read company members" on public.company_members
  for select to authenticated using (public.has_company_access(company_id));

create policy "company scope contacts" on public.contacts
  for all to authenticated using (public.has_company_access(company_id)) with check (public.has_company_access(company_id));
create policy "company scope properties" on public.properties
  for all to authenticated using (public.has_company_access(company_id)) with check (public.has_company_access(company_id));
create policy "company scope pipelines" on public.pipelines
  for all to authenticated using (public.has_company_access(company_id)) with check (public.has_company_access(company_id));
create policy "company scope stages" on public.pipeline_stages
  for all to authenticated using (public.has_company_access(company_id)) with check (public.has_company_access(company_id));
create policy "company scope opportunities" on public.opportunities
  for all to authenticated using (public.has_company_access(company_id)) with check (public.has_company_access(company_id));
create policy "company scope activities" on public.activities
  for all to authenticated using (public.has_company_access(company_id)) with check (public.has_company_access(company_id));
create policy "company scope interests" on public.interests
  for all to authenticated using (public.has_company_access(company_id)) with check (public.has_company_access(company_id));

-- ============ BOOTSTRAP ============
create or replace function public.bootstrap_workspace(_org_name text, _company_name text, _full_name text, _email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid uuid := auth.uid();
  _org uuid;
  _company uuid;
  _pipeline uuid;
  _stage_new uuid;
  _stage_visit uuid;
  _stage_proposal uuid;
  _contact_a uuid;
  _contact_b uuid;
  _property_a uuid;
begin
  if _uid is null then
    raise exception 'not authenticated';
  end if;

  select org_id into _org from public.profiles where id = _uid;
  if _org is not null then
    return _org;
  end if;

  insert into public.organizations (name) values (coalesce(nullif(_org_name,''), 'Minha Organização'))
    returning id into _org;

  insert into public.profiles (id, org_id, full_name, email)
  values (_uid, _org, coalesce(_full_name,''), _email)
  on conflict (id) do update set org_id = excluded.org_id,
    full_name = coalesce(nullif(excluded.full_name,''), public.profiles.full_name);

  insert into public.user_roles (user_id, org_id, role) values (_uid, _org, 'owner');

  insert into public.companies (org_id, name)
  values (_org, coalesce(nullif(_company_name,''), 'Matriz'))
  returning id into _company;

  insert into public.company_members (user_id, company_id) values (_uid, _company);

  insert into public.pipelines (company_id, name, is_default)
  values (_company, 'Funil Comercial', true) returning id into _pipeline;

  insert into public.pipeline_stages (pipeline_id, company_id, name, position, probability)
  values (_pipeline, _company, 'Novo lead', 1, 10) returning id into _stage_new;
  insert into public.pipeline_stages (pipeline_id, company_id, name, position, probability)
  values (_pipeline, _company, 'Qualificação', 2, 25);
  insert into public.pipeline_stages (pipeline_id, company_id, name, position, probability)
  values (_pipeline, _company, 'Visita', 3, 45) returning id into _stage_visit;
  insert into public.pipeline_stages (pipeline_id, company_id, name, position, probability)
  values (_pipeline, _company, 'Proposta', 4, 70) returning id into _stage_proposal;
  insert into public.pipeline_stages (pipeline_id, company_id, name, position, probability)
  values (_pipeline, _company, 'Fechamento', 5, 90);

  insert into public.contacts (company_id, name, email, phone, kind, source, owner_id)
  values (_company, 'Ana Ribeiro', 'ana.ribeiro@exemplo.com', '(11) 98812-4477', 'lead', 'Site', _uid)
  returning id into _contact_a;
  insert into public.contacts (company_id, name, email, phone, kind, source, owner_id)
  values (_company, 'Carlos Menezes', 'carlos.menezes@exemplo.com', '(11) 99640-2210', 'client', 'Indicação', _uid)
  returning id into _contact_b;

  insert into public.properties (company_id, code, title, purpose, status, property_type, price, area, bedrooms, bathrooms, parking_spots, city, neighborhood)
  values (_company, 'ELT-001', 'Apartamento 3 dormitórios com varanda', 'sale', 'available', 'Apartamento', 890000, 112, 3, 2, 2, 'São Paulo', 'Pinheiros')
  returning id into _property_a;
  insert into public.properties (company_id, code, title, purpose, status, property_type, price, area, bedrooms, bathrooms, parking_spots, city, neighborhood)
  values (_company, 'ELT-002', 'Sala comercial reformada', 'rent', 'available', 'Comercial', 7200, 68, 0, 1, 1, 'São Paulo', 'Itaim Bibi');

  insert into public.opportunities (company_id, pipeline_id, stage_id, contact_id, property_id, title, value, expected_close_date, owner_id)
  values (_company, _pipeline, _stage_visit, _contact_a, _property_a, 'Compra apartamento Pinheiros', 890000, current_date + 30, _uid);
  insert into public.opportunities (company_id, pipeline_id, stage_id, contact_id, title, value, expected_close_date, owner_id)
  values (_company, _pipeline, _stage_new, _contact_b, 'Locação sala comercial', 86400, current_date + 45, _uid);

  insert into public.activities (company_id, contact_id, type, title, description, due_at, owner_id)
  values (_company, _contact_a, 'visit', 'Visita ao imóvel ELT-001', 'Confirmar horário com o proprietário', now() + interval '1 day', _uid);
  insert into public.activities (company_id, contact_id, type, title, description, due_at, owner_id)
  values (_company, _contact_b, 'call', 'Retorno sobre proposta de locação', null, now() + interval '3 day', _uid);

  insert into public.interests (company_id, contact_id, purpose, property_type, city, neighborhoods, min_price, max_price, min_bedrooms)
  values (_company, _contact_a, 'sale', 'Apartamento', 'São Paulo', 'Pinheiros, Vila Madalena', 700000, 950000, 3);

  return _org;
end;
$$;

grant execute on function public.bootstrap_workspace(text,text,text,text) to authenticated;