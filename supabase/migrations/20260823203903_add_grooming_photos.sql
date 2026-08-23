-- Pet avatar

alter table public.pets
add column photo_path text;


-- Client consent for publishing photos

alter table public.clients
add column photo_publication_consent boolean not null default false;


-- Grooming session photos

create table public.grooming_session_photos (
  id uuid primary key default gen_random_uuid(),

  grooming_session_id uuid not null
    references public.grooming_sessions(id)
    on delete cascade,

  storage_path text not null,

  published boolean not null default true,

  sort_order integer not null default 0,

  created_at timestamptz not null default now()
);


-- RLS

alter table public.grooming_session_photos
enable row level security;

create policy "authenticated users full access"
on public.grooming_session_photos
for all
to authenticated
using (true)
with check (true);