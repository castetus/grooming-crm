create policy "authenticated users can upload grooming media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'grooming-media'
);

create policy "authenticated users can update grooming media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'grooming-media'
)
with check (
  bucket_id = 'grooming-media'
);

create policy "authenticated users can delete grooming media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'grooming-media'
);