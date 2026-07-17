create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_-]{3,30}$'),
  display_name text not null,
  headline text,
  bio text,
  company text,
  location text,
  email text,
  phone text,
  avatar_url text,
  accent_color text not null default '#ff5a36',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  url text not null,
  kind text not null default 'website',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.links enable row level security;

create policy "Published profiles are public" on public.profiles for select using (is_published or auth.uid() = id);
create policy "Owners create profiles" on public.profiles for insert with check (auth.uid() = id);
create policy "Owners update profiles" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Owners delete profiles" on public.profiles for delete using (auth.uid() = id);
create policy "Published profile links are public" on public.links for select using (exists (select 1 from public.profiles p where p.id = profile_id and (p.is_published or p.id = auth.uid())));
create policy "Owners create links" on public.links for insert with check (auth.uid() = profile_id);
create policy "Owners update links" on public.links for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "Owners delete links" on public.links for delete using (auth.uid() = profile_id);

create index links_profile_position_idx on public.links(profile_id, position);
