
create table public.keepalive (
  id integer primary key check (id = 1),
  last_ping_at timestamptz not null default now()
);

insert into public.keepalive (id)
values (1);

alter table public.keepalive enable row level security;
