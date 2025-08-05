create extension if not exists "uuid-ossp";

create table if not exists public.subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  interests jsonb,
  subscribed_at timestamptz default now()
);

alter table public.subscribers enable row level security;

create policy "Allow insert for service role" on public.subscribers
  for insert
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Allow insert for authenticated users" on public.subscribers
  for insert
  to authenticated
  with check (true);
