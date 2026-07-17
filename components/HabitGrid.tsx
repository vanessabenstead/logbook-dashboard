"use client";

import { useState, useTransition } from "react";
import type { Habit, HabitLog } from "@/lib/db";
import { toggleHabitLog, archiveHabit } from "@/lib/actions";

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

// Postgres `date` columns can come back from the driver as either a string
// or a JS Date object depending on version/config — handle both so this
// never crashes on `.slice is not a function`.
function normalizeLogDate(value: string | Date): string {
  if (value instanceof Date) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, "0");
    const day = String(value.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return String(value).slice(0, 10);
}

export default function HabitGrid({
  habits,
  logs,
  weekStart,
}: {
  habits: Habit[];
  logs: HabitLog[];
  weekStart: string; // "YYYY-MM-DD", a Monday
}) {
  const monday = parseLocalDate(weekStart);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  // Local, instantly-updating copy of which boxes are checked. Seeded from
  // the server data, then updated immediately on click — the actual save
  // happens in the background, so a slow connection to the database no
  // longer makes clicks feel laggy or wrong.
  const [loggedSet, setLoggedSet] = useState<Set<string>>(
    () => new Set(logs.map((l) => `${l.habit_id}:${normalizeLogDate(l.log_date)}`))
  );
  const [, startTransition] = useTransition();

  const todayIso = isoDate(new Date());

  function handleToggle(habitId: number, iso: string) {
    const key = `${habitId}:${iso}`;
    const currentlyLogged = loggedSet.has(key);

    setLoggedSet((prev) => {
      const next = new Set(prev);
      if (currentlyLogged) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

    startTransition(() => {
      toggleHabitLog(habitId, iso, currentlyLogged);
    });
  }

  if (habits.length === 0) {
    return (
      <p className="entry-card px-4 py-6 text-center text-sm text-muted">
        No habits yet — add one below to start tracking your training days.
      </p>
    );
  }

  return (
    <div className="entry-card overflow-x-auto px-4 py-4" style={{ ["--tick" as string]: "#4f9d91" }}>
      <table className="w-full min-w-[560px] table-fixed border-collapse text-sm">
        <thead>
          <tr>
            <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
              Habit
            </th>
            {days.map((d) => (
              <th key={isoDate(d)} className="pb-3 text-center font-mono text-[10px] uppercase tracking-wide text-muted">
                <span className={isoDate(d) === todayIso ? "text-amber" : ""}>
                  {d.toLocaleDateString(undefined, { weekday: "short" })}
                </span>
                <br />
                <span className="text-muted/70">{d.getDate()}</span>
              </th>
            ))}
            <th className="pb-3" />
          </tr>
        </thead>
        <tbody>
          {habits.map((h) => {
            const weekCount = days.filter((d) =>
              loggedSet.has(`${h.id}:${isoDate(d)}`)
            ).length;
            return (
              <tr key={h.id} className="border-t border-line">
                <td className="py-3 pr-4 text-paper">
                  {h.name}
                  <span className="ml-2 font-mono text-[10px] text-muted">
                    {weekCount}/7
                  </span>
                </td>
                {days.map((d) => {
                  const iso = isoDate(d);
                  const logged = loggedSet.has(`${h.id}:${iso}`);
                  return (
                    <td
                      key={iso}
                      className="cursor-pointer py-3 text-center"
                      onClick={() => handleToggle(h.id, iso)}
                    >
                      <span className={`checkbox-visual mx-auto ${logged ? "checked" : ""}`} aria-hidden="true" />
                    </td>
                  );
                })}
                <td className="py-3 pl-2 text-right">
                  <form action={archiveHabit.bind(null, h.id)}>
                    <button
                      type="submit"
                      className="font-mono text-[10px] uppercase text-muted hover:text-rust"
                    >
                      Remove
                    </button>
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
