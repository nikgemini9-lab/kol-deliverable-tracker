-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Workspaces
create table public.workspaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  owner_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Workspace members
create table public.workspace_members (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz default now(),
  unique(workspace_id, user_id)
);

-- Companies
create table public.companies (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null,
  x_handle text,
  keywords text[] default '{}',
  website text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- KOLs
create table public.kols (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null,
  x_handle text not null,
  profile_link text,
  monthly_fee numeric default 0,
  campaign_start date,
  campaign_end date,
  notes text,
  status text default 'active' check (status in ('active', 'paused', 'completed')),
  avatar_url text,
  follower_count integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Campaigns
create table public.campaigns (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  kol_id uuid references public.kols(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  month integer not null check (month between 1 and 12),
  year integer not null,
  status text default 'active' check (status in ('active', 'completed', 'overdue', 'at_risk')),
  payout_recommendation text default 'review' check (payout_recommendation in ('pay', 'hold', 'review')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(kol_id, company_id, month, year)
);

-- Deliverables (promised per campaign)
create table public.deliverables (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade unique,
  original_tweets integer default 0,
  company_mentions integer default 0,
  handle_tags integer default 0,
  quote_tweets integer default 0,
  replies_interactions integer default 0,
  newsletter_mention boolean default false,
  space_participation boolean default false,
  custom_deliverables jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tracked posts (from Rettiwt)
create table public.tracked_posts (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  kol_id uuid references public.kols(id) on delete cascade,
  tweet_id text unique not null,
  tweet_url text,
  tweet_text text,
  tweet_type text check (tweet_type in ('original', 'mention', 'handle_tag', 'reply', 'quote_tweet', 'mixed')),
  likes integer default 0,
  replies integer default 0,
  reposts integer default 0,
  views integer default 0,
  posted_at timestamptz,
  created_at timestamptz default now()
);

-- Manual logs
create table public.manual_logs (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  kol_id uuid references public.kols(id) on delete cascade,
  deliverable_type text not null,
  date date,
  link text,
  notes text,
  likes integer default 0,
  replies integer default 0,
  reposts integer default 0,
  views integer default 0,
  proof_link text,
  created_at timestamptz default now()
);

-- Sync logs
create table public.sync_logs (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  kol_id uuid references public.kols(id) on delete cascade,
  status text check (status in ('success', 'failed', 'partial')),
  tweets_fetched integer default 0,
  tweets_matched integer default 0,
  error_message text,
  synced_at timestamptz default now()
);

-- Indexes
create index on public.tracked_posts(kol_id);
create index on public.tracked_posts(campaign_id);
create index on public.campaigns(kol_id);
create index on public.campaigns(workspace_id);
create index on public.kols(workspace_id);
create index on public.manual_logs(campaign_id);
create index on public.manual_logs(kol_id);
create index on public.sync_logs(kol_id);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.companies enable row level security;
alter table public.kols enable row level security;
alter table public.campaigns enable row level security;
alter table public.deliverables enable row level security;
alter table public.tracked_posts enable row level security;
alter table public.manual_logs enable row level security;
alter table public.sync_logs enable row level security;

-- Helper: check workspace membership
create or replace function public.is_workspace_member(workspace_uuid uuid)
returns boolean as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = workspace_uuid and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Workspace policies
create policy "Members can view workspace"
  on public.workspaces for select
  using (public.is_workspace_member(id));
create policy "Owners can update workspace"
  on public.workspaces for update
  using (owner_id = auth.uid());
create policy "Users can create workspace"
  on public.workspaces for insert
  with check (owner_id = auth.uid());

-- Workspace members policies
create policy "Members can view own membership"
  on public.workspace_members for select
  using (user_id = auth.uid() or workspace_id in (
    select workspace_id from public.workspace_members where user_id = auth.uid()
  ));
create policy "Users can insert own membership"
  on public.workspace_members for insert
  with check (user_id = auth.uid());
create policy "Owners can manage members"
  on public.workspace_members for all
  using (workspace_id in (select id from public.workspaces where owner_id = auth.uid()));

-- Companies, KOLs, Campaigns: workspace member access
create policy "Workspace member access - companies"
  on public.companies for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "Workspace member access - kols"
  on public.kols for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "Workspace member access - campaigns"
  on public.campaigns for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- Deliverables, tracked_posts, manual_logs, sync_logs: via campaign
create policy "Access deliverables via campaign"
  on public.deliverables for all
  using (campaign_id in (
    select id from public.campaigns where public.is_workspace_member(workspace_id)
  ));

create policy "Access tracked_posts via campaign"
  on public.tracked_posts for all
  using (campaign_id in (
    select id from public.campaigns where public.is_workspace_member(workspace_id)
  ));

create policy "Access manual_logs via campaign"
  on public.manual_logs for all
  using (campaign_id in (
    select id from public.campaigns where public.is_workspace_member(workspace_id)
  ));

create policy "Access sync_logs via workspace"
  on public.sync_logs for all
  using (public.is_workspace_member(workspace_id));

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
