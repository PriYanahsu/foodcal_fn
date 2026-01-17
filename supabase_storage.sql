-- 1. Create a new storage bucket called 'avatars'
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- 2. Allow public access to the bucket (viewing images)
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 3. Allow authenticated users to upload their own avatar
create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- 4. Allow users to update their own avatar
create policy "Anyone can update their own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner )
  with check ( bucket_id = 'avatars' and auth.uid() = owner );
