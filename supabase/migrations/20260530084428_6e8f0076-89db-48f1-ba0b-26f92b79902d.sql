drop policy if exists "Avatar images are publicly accessible" on storage.objects;

create policy "Users can list their own avatars"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
