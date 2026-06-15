create table if not exists public.flower_jobs (
	id uuid primary key,
	created_at timestamptz not null default now(),
	user_input jsonb not null default '{}'::jsonb,
	mood_analysis jsonb,
	recipe jsonb,
	image_prompt text,
	images jsonb not null default '{}'::jsonb
);

alter table public.flower_jobs enable row level security;

create index if not exists flower_jobs_created_at_idx on public.flower_jobs (created_at desc);

grant usage on schema public to service_role;
grant select, insert, update, delete on public.flower_jobs to service_role;

insert into storage.buckets (id, name, public)
values ('flower-bouquets', 'flower-bouquets', true)
on conflict (id) do update set public = excluded.public;
