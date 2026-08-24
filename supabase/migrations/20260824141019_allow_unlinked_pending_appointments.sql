-- ============================================================
-- Pending appointments may exist without linked client/pet
-- ============================================================


-- 1. client_id and pet_id become nullable

alter table public.appointments
alter column client_id drop not null;

alter table public.appointments
alter column pet_id drop not null;


-- 2. Store snapshot/contact data directly on appointment

alter table public.appointments
add column client_name text;

alter table public.appointments
add column phone text;

alter table public.appointments
add column telegram_username text;

alter table public.appointments
add column pet_name text;

alter table public.appointments
add column species text
  check (
    species is null
    or species in ('dog', 'cat')
  );

alter table public.appointments
add column breed text;

alter table public.appointments
add column sex text
  check (
    sex is null
    or sex in ('male', 'female')
  );


-- 3. Non-pending appointments must be linked to client and pet

alter table public.appointments
add constraint appointments_linked_when_not_pending_check
check (
  status = 'pending'
  or (
    client_id is not null
    and pet_id is not null
  )
);