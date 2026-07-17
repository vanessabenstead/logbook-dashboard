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
    <>
      {/* Desktop / wide screens: table layout. Hidden below the md breakpoint. */}
      <div
        className="entry-card hidden overflow-x-auto px-4 py-4 md:block"
        style={{ ["--tick" as string]: "#4f9d91" }}
      >
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
              const weekCount = days.filter((d) => loggedSet.has(`${h.id}:${isoDate(d)}`)).length;
              return (
                <tr key={h.id} className="border-t border-line">
                  <td className="py-3 pr-4 text-paper">
                    {h.name}
                    <span className="ml-2 font-mono text-[10px] text-muted">{weekCount}/7</span>
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

      {/* Phone / narrow screens: stacked cards. Hidden at md and above. */}
      <div className="flex flex-col gap-3 md:hidden">
        {habits.map((h) => {
          const weekCount = days.filter((d) => loggedSet.has(`${h.id}:${isoDate(d)}`)).length;
          return (
            <div key={h.id} className="entry-card px-4 py-3" style={{ ["--tick" as string]: "#4f9d91" }}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm text-paper">
                  {h.name}
                  <span className="ml-2 font-mono text-[10px] text-muted">{weekCount}/7</span>
                </p>
                <form action={archiveHabit.bind(null, h.id)}>
                  <button
                    type="submit"
                    className="shrink-0 font-mono text-[10px] uppercase text-muted hover:text-rust"
                  >
                    Remove
                  </button>
                </form>
              </div>
              <div className="flex flex-wrap gap-2">
                {days.map((d) => {
                  const iso = isoDate(d);
                  const logged = loggedSet.has(`${h.id}:${iso}`);
                  const isToday = iso === todayIso;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => handleToggle(h.id, iso)}
                      aria-label={`Toggle ${h.name} on ${iso}`}
                      className="flex w-11 flex-col items-center gap-1 rounded py-1"
                    >
                      <span
                        className={`font-mono text-[9px] uppercase tracking-wide ${
                          isToday ? "text-amber" : "text-muted"
                        }`}
                      >
                        {d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}
                      </span>
                      <span className={`checkbox-visual ${logged ? "checked" : ""}`} aria-hidden="true" />
                      <span className="font-mono text-[9px] text-muted/70">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
