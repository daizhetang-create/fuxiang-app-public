-- 浮想 MVP：在 Supabase SQL Editor 中一次性运行
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '新朋友',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default 'violet',
  created_at timestamptz not null default now()
);

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  summary text not null default '',
  raw_text text not null default '',
  type text not null default 'idea' check (type in ('idea','thinking','project','demo','journal','memory')),
  stage text not null default 'seed' check (stage in ('seed','growing','building','complete')),
  tags text[] not null default '{}',
  space text not null default '灵感收件箱',
  color text not null default 'violet' check (color in ('lime','violet','coral','blue','sand')),
  related_ids uuid[] not null default '{}',
  next_step text,
  audio_path text,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_id uuid not null references public.ideas(id) on delete cascade,
  target_id uuid not null references public.ideas(id) on delete cascade,
  relation text not null check (relation in ('similar','extends','supports','conflicts','belongs_to','action_for')),
  confidence numeric(4,3) not null default 0.5,
  created_at timestamptz not null default now(),
  unique(source_id, target_id, relation)
);

create index if not exists ideas_user_created_idx on public.ideas(user_id, created_at desc);
create index if not exists ideas_tags_idx on public.ideas using gin(tags);
create index if not exists relationships_user_idx on public.relationships(user_id);

alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.ideas enable row level security;
alter table public.relationships enable row level security;

create policy "profiles_self" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "spaces_owner" on public.spaces for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ideas_owner" on public.ideas for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "relationships_owner" on public.relationships for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into storage.buckets (id, name, public, file_size_limit)
values ('voice-notes', 'voice-notes', false, 10485760)
on conflict (id) do nothing;

create policy "voice_owner_read" on storage.objects for select
using (bucket_id = 'voice-notes' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "voice_owner_insert" on storage.objects for insert
with check (bucket_id = 'voice-notes' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "voice_owner_delete" on storage.objects for delete
using (bucket_id = 'voice-notes' and auth.uid()::text = (storage.foldername(name))[1]);
