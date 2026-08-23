-- Add archive timestamps

alter table public.clients
add column archived_at timestamptz;

alter table public.pets
add column archived_at timestamptz;


-- Prevent accidental cascading physical deletion of pets

alter table public.pets
drop constraint if exists pets_client_id_fkey;

alter table public.pets
add constraint pets_client_id_fkey
foreign key (client_id)
references public.clients(id)
on delete restrict;


-- Archive client + all active pets atomically

create or replace function public.archive_client(target_client_id uuid)
returns void
language plpgsql
as $$
declare
  archived_time timestamptz := now();
begin
  update public.clients
  set archived_at = archived_time
  where id = target_client_id
    and archived_at is null;

  update public.pets
  set archived_at = archived_time
  where client_id = target_client_id
    and archived_at is null;
end;
$$;