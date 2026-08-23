create or replace function public.complete_appointment(
  target_appointment_id uuid,
  session_total_price numeric,
  session_grooming_details text default null,
  session_notes text default null
)
returns uuid
language plpgsql
security invoker
as $$
declare
  target_appointment public.appointments%rowtype;
  created_session_id uuid;
begin
  select *
  into target_appointment
  from public.appointments
  where id = target_appointment_id
  for update;

  if not found then
    raise exception 'Appointment not found';
  end if;

  if target_appointment.status <> 'confirmed' then
    raise exception
      'Only confirmed appointments can be completed. Current status: %',
      target_appointment.status;
  end if;

  insert into public.grooming_sessions (
    appointment_id,
    pet_id,
    groomer_id,
    performed_at,
    location_type,
    total_price,
    grooming_details,
    notes
  )
  values (
    target_appointment.id,
    target_appointment.pet_id,
    target_appointment.groomer_id,
    now(),
    target_appointment.location_type,
    session_total_price,
    session_grooming_details,
    session_notes
  )
  returning id into created_session_id;

  update public.appointments
  set status = 'completed'
  where id = target_appointment.id;

  return created_session_id;
end;
$$;