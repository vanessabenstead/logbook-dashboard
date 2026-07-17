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

-- Lets tasks be grouped by event/area, e.g. 'Baptism', 'Birthday', 'HYROX', 'Business'.
alter table tasks add column if not exists category text not null default 'General';
create index if not exists tasks_category_idx on tasks (category);

create table if not exists notes (
  id          bigserial primary key,
  body        text not null,
  pinned      boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists notes_pinned_idx on notes (pinned);

-- Habit tracker: a habit is a recurring thing (e.g. "BFT session"), logged per calendar day.
create table if not exists habits (
  id          bigserial primary key,
  name        text not null,
  category    text not null default 'General',
  archived    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists habit_logs (
  id          bigserial primary key,
  habit_id    bigint not null references habits(id) on delete cascade,
  log_date    date not null,
  created_at  timestamptz not null default now(),
  unique (habit_id, log_date)
);

create index if not exists habit_logs_habit_idx on habit_logs (habit_id);
create index if not exists habit_logs_date_idx on habit_logs (log_date);
