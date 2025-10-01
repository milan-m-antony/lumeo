-- Enable Row Level Security
alter table public.albums enable row level security;
alter table public.files enable row level security;
alter table public.file_album_links enable row level security;
alter table public.password_reset_tokens enable row level security;

-- Create user_id columns and foreign key constraints
alter table public.albums add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();
alter table public.files add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- Create Policies
drop policy if exists "Allow public read access" on public.albums;
drop policy if exists "Allow individual insert access" on public.albums;
drop policy if exists "Allow individual update access" on public.albums;
drop policy if exists "Allow individual delete access" on public.albums;

create policy "Allow public read access" on public.albums for select using (true);
create policy "Allow individual insert access" on public.albums for insert with check (auth.uid() = user_id);
create policy "Allow individual update access" on public.albums for update using (auth.uid() = user_id);
create policy "Allow individual delete access" on public.albums for delete using (auth.uid() = user_id);

drop policy if exists "Allow public read access" on public.files;
drop policy if exists "Allow individual insert access" on public.files;
drop policy if exists "Allow individual update access" on public.files;
drop policy if exists "Allow individual delete access" on public.files;

create policy "Allow public read access" on public.files for select using (true);
create policy "Allow individual insert access" on public.files for insert with check (auth.uid() = user_id);
create policy "Allow individual update access" on public.files for update using (auth.uid() = user_id);
create policy "Allow individual delete access" on public.files for delete using (auth.uid() = user_id);

drop policy if exists "Allow linked access" on public.file_album_links;
create policy "Allow linked access" on public.file_album_links for all using (
  exists (
    select 1 from public.files
    where files.id = file_album_links.file_id and files.user_id = auth.uid()
  ) and exists (
    select 1 from public.albums
    where albums.id = file_album_links.album_id and albums.user_id = auth.uid()
  )
);

drop policy if exists "Allow public insert access" on public.password_reset_tokens;
drop policy if exists "Allow user to delete their own tokens" on public.password_reset_tokens;
create policy "Allow public insert access" on public.password_reset_tokens for insert with check (true);
create policy "Allow user to delete their own tokens" on public.password_reset_tokens for delete using (auth.uid() = user_id);


-- Create Functions
create or replace function public.get_database_size()
returns bigint as $$
  select sum(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)))::bigint from pg_tables where schemaname = 'public';
$$ language sql;

create or replace function public.get_users_count()
returns integer as $$
  select count(*)::integer from auth.users;
$$ language sql security definer;