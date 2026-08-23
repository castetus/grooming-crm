create policy "authenticated users full access"
on public.grooming_services
for all
to authenticated
using (true)
with check (true);