import Link from "next/link";
import { sql, type Habit, type HabitLog } from "@/lib/db";
import HabitGrid from "@/components/HabitGrid";
import HabitForm from "@/components/HabitForm";

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

      <div className="entry-card px-5 py-6" style={{ ["--tick" as string]: "#c1554a" }}>
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
        <HabitGrid habits={habits} logs={logs} weekStart={isoDate(weekMonday)} />
      </div>
    </div>
  );
}
