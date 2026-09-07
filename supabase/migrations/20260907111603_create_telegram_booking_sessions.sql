create table telegram_booking_sessions (
  telegram_user_id bigint primary key,
  chat_id bigint not null,
  step text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index telegram_booking_sessions_updated_at_idx
  on telegram_booking_sessions (updated_at);