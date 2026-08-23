-- ============================================================
-- Grooming CRM: initial schema
-- ============================================================


-- ============================================================
-- Clients
-- ============================================================

create table public.clients (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  phone text,
  telegram_username text,
  telegram_chat_id bigint,

  preferred_language text not null default 'ru'
    check (preferred_language in ('ru', 'sr')),

  address text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- Pets
-- ============================================================

create table public.pets (
  id uuid primary key default gen_random_uuid(),

  client_id uuid not null
    references public.clients(id)
    on delete cascade,

  name text not null,

  species text not null
    check (species in ('dog', 'cat')),

  breed text,

  birth_date date,

  sex text not null
    check (sex in ('male', 'female')),

  -- Что обычно делаем этому питомцу.
  -- Пока свободный текст, услуги вынесем в отдельные сущности позже.
  grooming_plan text,

  recommended_interval_days integer
    check (recommended_interval_days > 0),

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- Groomers
-- ============================================================

create table public.groomers (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  phone text,
  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ============================================================
-- Booking requests
-- Заявки, которые в будущем будут приходить с публичного сайта.
-- Они ещё не являются appointment.
-- ============================================================

create table public.booking_requests (
  id uuid primary key default gen_random_uuid(),

  client_name text not null,

  phone text,
  telegram_username text,

  preferred_language text not null default 'ru'
    check (preferred_language in ('ru', 'sr')),

  pet_name text not null,

  species text not null
    check (species in ('dog', 'cat')),

  breed text,

  sex text not null
    check (sex in ('male', 'female')),

  requested_start timestamptz not null,
  requested_end timestamptz,

  location_type text not null
    check (location_type in ('salon', 'mobile')),

  address text,

  comment text,

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'approved',
        'rejected',
        'expired'
      )
    ),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (
    requested_end is null
    or requested_end > requested_start
  )
);


-- ============================================================
-- Appointments
-- Только нормальные записи CRM.
-- Клиент и питомец здесь уже существуют.
-- ============================================================

create table public.appointments (
  id uuid primary key default gen_random_uuid(),

  client_id uuid not null
    references public.clients(id),

  pet_id uuid not null
    references public.pets(id),

  groomer_id uuid
    references public.groomers(id),

  -- Если appointment появился из заявки с сайта,
  -- сохраняем связь с ней.
  booking_request_id uuid
    references public.booking_requests(id)
    on delete set null,

  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,

  location_type text not null
    check (location_type in ('salon', 'mobile')),

  address text,

  estimated_price numeric(10, 2)
    check (estimated_price >= 0),

  status text not null default 'confirmed'
    check (
      status in (
        'confirmed',
        'completed',
        'cancelled',
        'no_show'
      )
    ),

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (scheduled_end > scheduled_start)
);


-- ============================================================
-- Grooming sessions
-- Фактически состоявшийся груминг / история.
-- ============================================================

create table public.grooming_sessions (
  id uuid primary key default gen_random_uuid(),

  appointment_id uuid
    references public.appointments(id)
    on delete set null,

  pet_id uuid not null
    references public.pets(id),

  groomer_id uuid
    references public.groomers(id),

  performed_at timestamptz not null default now(),

  location_type text not null
    check (location_type in ('salon', 'mobile')),

  total_price numeric(10, 2) not null
    check (total_price >= 0),

  -- Что конкретно сделали во время этого визита.
  grooming_details text,

  notes text,

  created_at timestamptz not null default now()
);


-- ============================================================
-- Indexes
-- ============================================================

create index pets_client_id_idx
  on public.pets(client_id);

create index booking_requests_requested_start_idx
  on public.booking_requests(requested_start);

create index booking_requests_status_idx
  on public.booking_requests(status);

create index appointments_client_id_idx
  on public.appointments(client_id);

create index appointments_pet_id_idx
  on public.appointments(pet_id);

create index appointments_groomer_id_idx
  on public.appointments(groomer_id);

create index appointments_scheduled_start_idx
  on public.appointments(scheduled_start);

create index appointments_status_idx
  on public.appointments(status);

create index grooming_sessions_pet_id_idx
  on public.grooming_sessions(pet_id);

create index grooming_sessions_performed_at_idx
  on public.grooming_sessions(performed_at);


-- ============================================================
-- updated_at
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_set_updated_at
before update on public.clients
for each row
execute function public.set_updated_at();

create trigger pets_set_updated_at
before update on public.pets
for each row
execute function public.set_updated_at();

create trigger groomers_set_updated_at
before update on public.groomers
for each row
execute function public.set_updated_at();

create trigger booking_requests_set_updated_at
before update on public.booking_requests
for each row
execute function public.set_updated_at();

create trigger appointments_set_updated_at
before update on public.appointments
for each row
execute function public.set_updated_at();


-- ============================================================
-- RLS
-- ============================================================

alter table public.clients enable row level security;
alter table public.pets enable row level security;
alter table public.groomers enable row level security;
alter table public.booking_requests enable row level security;
alter table public.appointments enable row level security;
alter table public.grooming_sessions enable row level security;


-- CRM: любой авторизованный сотрудник пока имеет полный доступ.

create policy "authenticated users full access"
on public.clients
for all
to authenticated
using (true)
with check (true);

create policy "authenticated users full access"
on public.pets
for all
to authenticated
using (true)
with check (true);

create policy "authenticated users full access"
on public.groomers
for all
to authenticated
using (true)
with check (true);

create policy "authenticated users full access"
on public.booking_requests
for all
to authenticated
using (true)
with check (true);

create policy "authenticated users full access"
on public.appointments
for all
to authenticated
using (true)
with check (true);

create policy "authenticated users full access"
on public.grooming_sessions
for all
to authenticated
using (true)
with check (true);