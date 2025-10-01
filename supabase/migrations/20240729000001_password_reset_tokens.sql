-- Create the 'password_reset_tokens' table
create table if not exists public.password_reset_tokens (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    token_hash text not null,
    expires_at timestamptz not null,
    created_at timestamptz not null default now(),
    unique(user_id) -- Prevent multiple active tokens for the same user
);
-- Enable RLS
alter table public.password_reset_tokens enable row level security;
-- Create policy for service_role to access the table
-- This allows our Edge Function (which uses the service role key) to manage tokens.
-- Users should not be able to access this table directly.
create policy "Allow service_role full access" on public.password_reset_tokens for all
    using (true)
    with check (true);
