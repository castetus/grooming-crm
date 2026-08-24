alter table public.appointments
drop constraint if exists appointments_linked_when_not_pending_check;

alter table public.appointments
drop constraint if exists appointments_linked_when_required_check;

alter table public.appointments
add constraint appointments_linked_when_required_check
check (
  status not in ('confirmed', 'completed')
  or (
    client_id is not null
    and pet_id is not null
  )
);