-- Phase 1 database: tables, RLS helpers, policies and grants (project.md §7, §9).

create extension if not exists vector with schema extensions;

-- Tables ---------------------------------------------------------------------

create table public.accounts (
  clerk_user_id text primary key,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null references public.accounts (clerk_user_id) on delete cascade,
  name text not null,
  public_key text not null unique,
  messages_used integer not null default 0 check (messages_used >= 0),
  period_start timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index projects_owner_id_idx on public.projects (owner_id);

create table public.widget_configs (
  project_id uuid primary key references public.projects (id) on delete cascade,
  button_color text,
  position text not null default 'bottom-right'
    check (position in ('bottom-right', 'bottom-left', 'top-right', 'top-left')),
  label text,
  animation text not null default 'fade' check (animation in ('fade', 'slide', 'scale')),
  header_text text,
  show_badge boolean not null default true
);

create table public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  type text not null check (type in ('text', 'pdf', 'md', 'txt')),
  storage_key text,
  status text not null default 'uploading'
    check (status in ('uploading', 'processing', 'ready', 'failed')),
  created_at timestamptz not null default now()
);
create index knowledge_sources_project_id_idx on public.knowledge_sources (project_id);

create table public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  source_id uuid not null references public.knowledge_sources (id) on delete cascade,
  content text not null,
  embedding extensions.vector(1536) not null
);
create index knowledge_chunks_project_id_idx on public.knowledge_chunks (project_id);
create index knowledge_chunks_source_id_idx on public.knowledge_chunks (source_id);
create index knowledge_chunks_embedding_idx
  on public.knowledge_chunks using hnsw (embedding extensions.vector_cosine_ops);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  visitor_id text not null,
  created_at timestamptz not null default now()
);
create index conversations_project_id_idx on public.conversations (project_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role text not null check (role in ('visitor', 'bot')),
  body text not null,
  created_at timestamptz not null default now()
);
create index messages_conversation_id_created_at_idx
  on public.messages (conversation_id, created_at);

-- RLS helpers (the only functions in this migration) ---------------------------

create function public.owned_project_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.projects where owner_id = (select auth.jwt() ->> 'sub');
$$;

create function public.owned_conversation_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.conversations
  where project_id in (select public.owned_project_ids());
$$;

revoke execute on function public.owned_project_ids() from public, anon;
revoke execute on function public.owned_conversation_ids() from public, anon;
grant execute on function public.owned_project_ids() to authenticated, service_role;
grant execute on function public.owned_conversation_ids() to authenticated, service_role;

-- RLS ------------------------------------------------------------------------

alter table public.accounts enable row level security;
alter table public.projects enable row level security;
alter table public.widget_configs enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.knowledge_chunks enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy accounts_select_own on public.accounts
  for select to authenticated
  using (clerk_user_id = (select auth.jwt() ->> 'sub'));

create policy projects_select_own on public.projects
  for select to authenticated
  using (owner_id = (select auth.jwt() ->> 'sub'));
create policy projects_update_own on public.projects
  for update to authenticated
  using (owner_id = (select auth.jwt() ->> 'sub'))
  with check (owner_id = (select auth.jwt() ->> 'sub'));
create policy projects_delete_own on public.projects
  for delete to authenticated
  using (owner_id = (select auth.jwt() ->> 'sub'));

create policy widget_configs_select_own on public.widget_configs
  for select to authenticated
  using (project_id in (select public.owned_project_ids()));
create policy knowledge_sources_select_own on public.knowledge_sources
  for select to authenticated
  using (project_id in (select public.owned_project_ids()));
create policy knowledge_chunks_select_own on public.knowledge_chunks
  for select to authenticated
  using (project_id in (select public.owned_project_ids()));
create policy conversations_select_own on public.conversations
  for select to authenticated
  using (project_id in (select public.owned_project_ids()));
create policy messages_select_own on public.messages
  for select to authenticated
  using (conversation_id in (select public.owned_conversation_ids()));

-- Grants ---------------------------------------------------------------------

revoke all on public.accounts, public.projects, public.widget_configs,
  public.knowledge_sources, public.knowledge_chunks, public.conversations,
  public.messages from public, anon, authenticated, service_role;

grant select on public.accounts, public.projects, public.widget_configs,
  public.knowledge_sources, public.knowledge_chunks, public.conversations,
  public.messages to authenticated;
grant update (name) on public.projects to authenticated;
grant delete on public.projects to authenticated;

grant select, insert, update, delete on public.accounts, public.projects,
  public.widget_configs, public.knowledge_sources, public.knowledge_chunks,
  public.conversations, public.messages to service_role;
