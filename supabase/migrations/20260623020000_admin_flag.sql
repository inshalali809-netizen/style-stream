alter table public.profiles add column is_admin boolean not null default false;

drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and is_admin = (select is_admin from public.profiles where id = auth.uid())
  );