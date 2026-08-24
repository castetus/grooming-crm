drop policy if exists "authenticated users full access"
on public.pets;

create policy "authenticated users full access"
on public.pets
for all
to authenticated
using (true)
with check (true);