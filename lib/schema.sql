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

-- How many days per week this habit is meant to happen — powers the Goals section.
alter table habits add column if not exists weekly_target smallint not null default 7;

create table if not exists habit_logs (
  id          bigserial primary key,
  habit_id    bigint not null references habits(id) on delete cascade,
  log_date    date not null,
  created_at  timestamptz not null default now(),
  unique (habit_id, log_date)
);

create index if not exists habit_logs_habit_idx on habit_logs (habit_id);
create index if not exists habit_logs_date_idx on habit_logs (log_date);

-- Meal planning: a rotation of go-to recipes, each with a free-form list of
-- ingredient lines, plus a weekly plan that assigns one recipe per day.
create table if not exists recipes (
  id          bigserial primary key,
  name        text not null,
  notes       text,
  created_at  timestamptz not null default now()
);

create table if not exists recipe_ingredients (
  id          bigserial primary key,
  recipe_id   bigint not null references recipes(id) on delete cascade,
  line        text not null,
  sort_order  smallint not null default 0
);

create table if not exists meal_plan_entries (
  id          bigserial primary key,
  plan_date   date not null unique,
  recipe_id   bigint not null references recipes(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists recipe_ingredients_recipe_idx on recipe_ingredients (recipe_id);
create index if not exists meal_plan_entries_date_idx on meal_plan_entries (plan_date);
