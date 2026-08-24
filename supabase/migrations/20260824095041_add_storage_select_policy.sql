create policy "authenticated users can select grooming media"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'grooming-media'
);