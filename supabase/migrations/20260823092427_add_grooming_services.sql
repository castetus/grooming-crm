create table public.grooming_services (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  description text,

  default_price numeric(10, 2)
    check (default_price >= 0),

  default_duration_minutes integer
    check (default_duration_minutes > 0),

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);