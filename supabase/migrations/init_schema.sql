-- ============================================================
-- Fairway Giving — Complete Database Schema
-- ============================================================

-- 1. ENUMS
create type user_role as enum ('admin', 'subscriber');
create type user_status as enum ('active', 'suspended');
create type subscription_plan as enum ('monthly', 'yearly');
create type subscription_status as enum ('active', 'canceled', 'past_due');
create type score_status as enum ('entered', 'verified', 'rejected');
create type draw_status as enum ('upcoming', 'completed');
create type payout_status as enum ('pending', 'verified', 'paid');
create type verification_status as enum ('pending', 'approved', 'rejected');
create type match_type as enum ('5 Matches', '4 Matches', '3 Matches');

-- 2. TABLES

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  first_name text not null default '',
  last_name text not null default '',
  avatar_url text,
  role user_role not null default 'subscriber',
  status user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  plan subscription_plan not null default 'monthly',
  status subscription_status not null default 'active',
  next_renewal_date timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_subscriptions_user on subscriptions(user_id);

create table charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mission text not null default '',
  image_url text not null default '',
  tags text[] not null default '{}',
  is_spotlight boolean not null default false,
  total_raised numeric not null default 0,
  upcoming_events int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_charity_selections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  charity_id uuid not null references charities(id) on delete cascade,
  contribution_percentage int not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table golf_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  score_value int not null check (score_value >= 1 and score_value <= 45),
  played_date date not null,
  status score_status not null default 'entered',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, played_date)
);
create index idx_scores_user_date on golf_scores(user_id, played_date desc);

create table draw_results (
  id uuid primary key default gen_random_uuid(),
  month_name text not null,
  status draw_status not null default 'upcoming',
  countdown_end timestamptz,
  lucky_numbers int[],
  total_jackpot numeric not null default 0,
  total_participants int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table draw_winners (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references draw_results(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  match_type match_type not null,
  prize_amount numeric not null default 0,
  payout_status payout_status not null default 'pending',
  proof_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_winners_draw on draw_winners(draw_id);
create index idx_winners_user on draw_winners(user_id);

create table winner_verifications (
  id uuid primary key default gen_random_uuid(),
  winner_id uuid not null references draw_winners(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  admin_id uuid references profiles(id),
  status verification_status not null default 'pending',
  notes text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on notifications(user_id, created_at desc);

create table prize_pools (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references draw_results(id) on delete cascade unique,
  total_amount numeric not null default 0,
  tier_5_amount numeric not null default 0,
  tier_4_amount numeric not null default 0,
  tier_3_amount numeric not null default 0,
  rolled_over_amount numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. AUTO-UPDATE updated_at TRIGGER
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','subscriptions','charities','user_charity_selections',
    'golf_scores','draw_results','draw_winners','winner_verifications','prize_pools'
  ] loop
    execute format(
      'create trigger trg_%s_updated_at before update on %I for each row execute function update_updated_at()',
      t, t
    );
  end loop;
end $$;

-- 4. ENABLE RLS
alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table charities enable row level security;
alter table user_charity_selections enable row level security;
alter table golf_scores enable row level security;
alter table draw_results enable row level security;
alter table draw_winners enable row level security;
alter table winner_verifications enable row level security;
alter table notifications enable row level security;
alter table prize_pools enable row level security;

-- 5. RLS POLICIES (permissive dev policies)
-- profiles
create policy "profiles_select" on profiles for select to authenticated using (true);
create policy "profiles_insert" on profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update" on profiles for update to authenticated using (auth.uid() = id or (select role from profiles where id = auth.uid()) = 'admin');

-- subscriptions
create policy "subs_select" on subscriptions for select to authenticated using (true);
create policy "subs_insert" on subscriptions for insert to authenticated with check (auth.uid() = user_id);
create policy "subs_update" on subscriptions for update to authenticated using (auth.uid() = user_id or (select role from profiles where id = auth.uid()) = 'admin');

-- charities (public read, admin write)
create policy "charities_select" on charities for select to authenticated using (true);
create policy "charities_insert" on charities for insert to authenticated with check ((select role from profiles where id = auth.uid()) = 'admin');
create policy "charities_update" on charities for update to authenticated using ((select role from profiles where id = auth.uid()) = 'admin');
create policy "charities_delete" on charities for delete to authenticated using ((select role from profiles where id = auth.uid()) = 'admin');

-- user_charity_selections
create policy "ucs_select" on user_charity_selections for select to authenticated using (true);
create policy "ucs_insert" on user_charity_selections for insert to authenticated with check (auth.uid() = user_id);
create policy "ucs_update" on user_charity_selections for update to authenticated using (auth.uid() = user_id);

-- golf_scores
create policy "scores_select" on golf_scores for select to authenticated using (true);
create policy "scores_insert" on golf_scores for insert to authenticated with check (auth.uid() = user_id);
create policy "scores_update" on golf_scores for update to authenticated using (auth.uid() = user_id or (select role from profiles where id = auth.uid()) = 'admin');
create policy "scores_delete" on golf_scores for delete to authenticated using (auth.uid() = user_id);

-- draw_results
create policy "draws_select" on draw_results for select to authenticated using (true);
create policy "draws_insert" on draw_results for insert to authenticated with check ((select role from profiles where id = auth.uid()) = 'admin');
create policy "draws_update" on draw_results for update to authenticated using ((select role from profiles where id = auth.uid()) = 'admin');

-- draw_winners
create policy "winners_select" on draw_winners for select to authenticated using (true);
create policy "winners_insert" on draw_winners for insert to authenticated with check ((select role from profiles where id = auth.uid()) = 'admin');
create policy "winners_update" on draw_winners for update to authenticated using (auth.uid() = user_id or (select role from profiles where id = auth.uid()) = 'admin');

-- winner_verifications
create policy "verif_select" on winner_verifications for select to authenticated using (true);
create policy "verif_insert" on winner_verifications for insert to authenticated with check (auth.uid() = user_id or (select role from profiles where id = auth.uid()) = 'admin');
create policy "verif_update" on winner_verifications for update to authenticated using ((select role from profiles where id = auth.uid()) = 'admin');

-- notifications
create policy "notif_select" on notifications for select to authenticated using (auth.uid() = user_id);
create policy "notif_insert" on notifications for insert to authenticated with check (true);
create policy "notif_update" on notifications for update to authenticated using (auth.uid() = user_id);

-- prize_pools
create policy "pools_select" on prize_pools for select to authenticated using (true);
create policy "pools_insert" on prize_pools for insert to authenticated with check ((select role from profiles where id = auth.uid()) = 'admin');
create policy "pools_update" on prize_pools for update to authenticated using ((select role from profiles where id = auth.uid()) = 'admin');

-- 6. STORAGE BUCKETS (run via Supabase dashboard or supabase CLI)
-- insert into storage.buckets (id, name, public) values ('charity-media', 'charity-media', true);
-- insert into storage.buckets (id, name, public) values ('winner-proofs', 'winner-proofs', false);
