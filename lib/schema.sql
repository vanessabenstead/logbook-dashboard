-- Run once against your Neon database (via `npm run db:init`, or paste into the Neon SQL editor).

create table if not exists tasks (
  id            bigserial primary key,
  title         text not null,
  notes         text,
  priority      smallint not null default 2,       -- 1 = high, 2 = medium, 3 = low
  status        text not null default 'open',       -- 'open' | 'done'
  due_at        timestamptz,
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);

create index if not exists tasks_status_idx on tasks (status);
create index if not exists tasks_due_at_idx on tasks (due_at);

create table if not exists notes (
  id          bigserial primary key,
  body        text not null,
  pinned      boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists notes_pinned_idx on notes (pinned);
