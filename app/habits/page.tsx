import Link from "next/link";
import { sql, type Habit, type HabitLog } from "@/lib/db";
import HabitGrid from "@/components/HabitGrid";
import HabitForm from "@/components/HabitForm";
import GoalsSummary from "@/components/GoalsSummary";

export const dynamic = "force-dynamic";

// Fixed race date — edit here if the date ever changes.
const RACE_DATE = new Date("2026-12-13T00:00:00");

function isoDate(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Parses a "YYYY-MM-DD" string as a LOCAL calendar date (avoids the
// UTC-shift bug that `new Date("YYYY-MM-DD")` has).
function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // move back to Monday
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default async function HabitsPage({
  searchParams,
}: {
  searchParams: { week?: string };
}) {
  const thisWeekMonday = startOfWeek(new Date());
  const weekMonday = searchParams.week ? parseLocalDate(searchParams.week) : thisWeekMonday;
  const weekSunday = new Date(weekMonday);
  weekSunday.setDate(weekMonday.getDate() + 6);

  const prevWeek = new Date(weekMonday);
  prevWeek.setDate(weekMonday.getDate() - 7);
  const nextWeek = new Date(weekMonday);
  nextWeek.setDate(weekMonday.getDate() + 7);

  const isCurrentWeek = isoDate(weekMonday) === isoDate(thisWeekMonday);

  const habits = (await sql`
    select * from habits where archived = false order by created_at asc
  `) as Habit[];

  const logs = (await sql`
    select hl.* from habit_logs hl
    join habits h on h.id = hl.habit_id
    where hl.log_date >= ${isoDate(weekMonday)} and hl.log_date <= ${isoDate(weekSunday)}
  `) as HabitLog[];

  // Goals always reflect the actual current week, even if you're browsing
  // a past or future week in the grid below — reuse the fetch above if
  // they're the same week, otherwise fetch separately.
  const thisWeekSunday = new Date(thisWeekMonday);
  thisWeekSunday.setDate(thisWeekMonday.getDate() + 6);
  const currentWeekLogs = isCurrentWeek
    ? logs
    : ((await sql`
        select hl.* from habit_logs hl
        join habits h on h.id = hl.habit_id
        where hl.log_date >= ${isoDate(thisWeekMonday)} and hl.log_date <= ${isoDate(thisWeekSunday)}
      `) as HabitLog[]);

  // Streaks look back further than the visible week — pull the last 60
  // days per habit and count consecutive days ending today (or yesterday,
  // so the streak doesn't look "broken" before today is even over).
  const streakRows = (await sql`
    select habit_id, log_date from habit_logs
    where log_date >= (current_date - interval '60 days')
    order by habit_id, log_date desc
  `) as { habit_id: number; log_date: string | Date }[];

  function normalizeDate(value: string | Date): string {
    if (value instanceof Date) {
      const y = value.getUTCFullYear();
      const m = String(value.getUTCMonth() + 1).padStart(2, "0");
      const d = String(value.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    return String(value).slice(0, 10);
  }

  const loggedDatesByHabit = new Map<number, Set<string>>();
  for (const row of streakRows) {
    const iso = normalizeDate(row.log_date);
    if (!loggedDatesByHabit.has(row.habit_id)) loggedDatesByHabit.set(row.habit_id, new Set());
    loggedDatesByHabit.get(row.habit_id)!.add(iso);
  }

  const streaks: Record<number, number> = {};
  for (const h of habits) {
    const set = loggedDatesByHabit.get(h.id) ?? new Set();
    let streak = 0;
    const cursor = new Date();
    if (!set.has(isoDate(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (set.has(isoDate(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    streaks[h.id] = streak;
  }

  const today = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysToRace = Math.ceil((RACE_DATE.getTime() - today.getTime()) / msPerDay);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Training log
          </p>
          <h1 className="mt-1 font-display text-3xl italic text-paper">Habits</h1>
        </div>
        <Link
          href="/habits/report"
          className="rounded border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-muted transition-colors hover:border-amber hover:text-amber"
        >
          Monthly report →
        </Link>
      </header>

      <div className="entry-card px-5 py-6" style={{ ["--tick" as string]: "#B5654A" }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          HYROX Melbourne
        </p>
        <p className="log-number mt-1 text-4xl text-paper">
          {daysToRace} <span className="text-lg text-muted">days to go</span>
        </p>
        <p className="mt-1 font-mono text-[11px] text-muted">
          Race day: {RACE_DATE.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <GoalsSummary habits={habits} logs={currentWeekLogs} />

      <HabitForm />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <Link
            href={`/habits?week=${isoDate(prevWeek)}`}
            className="font-mono text-[11px] uppercase tracking-wide text-muted hover:text-paper"
          >
            ← Prev week
          </Link>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            {weekMonday.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            {" – "}
            {weekSunday.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            {isCurrentWeek && <span className="ml-2 text-amber">(this week)</span>}
          </p>
          <Link
            href={`/habits?week=${isoDate(nextWeek)}`}
            className="font-mono text-[11px] uppercase tracking-wide text-muted hover:text-paper"
          >
            Next week →
          </Link>
        </div>
        {!isCurrentWeek && (
          <div className="mb-3 text-center">
            <Link
              href="/habits"
              className="font-mono text-[10px] uppercase tracking-wide text-amber hover:underline"
            >
              Jump to this week
            </Link>
          </div>
        )}
        <HabitGrid habits={habits} logs={logs} weekStart={isoDate(weekMonday)} streaks={streaks} />
      </div>
    </div>
  );
}
