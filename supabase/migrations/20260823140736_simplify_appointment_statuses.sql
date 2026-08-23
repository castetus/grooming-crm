-- ============================================================
-- Remove booking_requests and move pending state to appointments
-- ============================================================

-- 1. Remove FK from appointments to booking_requests

alter table public.appointments
drop constraint if exists appointments_booking_request_id_fkey;

alter table public.appointments
drop column if exists booking_request_id;


-- 2. Replace appointment status constraint

alter table public.appointments
drop constraint if exists appointments_status_check;

alter table public.appointments
add constraint appointments_status_check
check (
  status in (
    'pending',
    'confirmed',
    'cancelled',
    'completed'
  )
);


-- Existing appointments were created with confirmed/completed/cancelled/no_show.
-- Convert no_show to cancelled before the new constraint becomes relevant.

update public.appointments
set status = 'cancelled'
where status = 'no_show';


-- 3. Default remains confirmed because appointments created manually
-- by a groomer are immediately confirmed.

alter table public.appointments
alter column status set default 'confirmed';


-- 4. Remove booking_requests table

drop table if exists public.booking_requests;