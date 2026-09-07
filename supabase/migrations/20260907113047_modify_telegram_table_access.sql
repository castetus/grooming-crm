create policy "Allow authenticated select telegram booking sessions"
on telegram_booking_sessions
for select
to authenticated
using (true);

create policy "Allow authenticated insert telegram booking sessions"
on telegram_booking_sessions
for insert
to authenticated
with check (true);

create policy "Allow authenticated update telegram booking sessions"
on telegram_booking_sessions
for update
to authenticated
using (true)
with check (true);

create policy "Allow authenticated delete telegram booking sessions"
on telegram_booking_sessions
for delete
to authenticated
using (true);