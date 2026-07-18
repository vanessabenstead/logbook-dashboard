import type { Habit, HabitLog } from "@/lib/db";

function normalizeLogDate(value: string | Date): string {
  if (value instanceof Date) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, "0");
    const day = String(value.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return String(value).slice(0, 10);
}

export default function GoalsSummary({ habits, logs }: { habits: Habit[]; logs: HabitLog[] }) {
  if (habits.length === 0) return null;

  const countsByHabit = new Map<number, number>();
  for (const log of logs) {
    countsByHabit.set(log.habit_id, (countsByHabit.get(log.habit_id) ?? 0) + 1);
  }

  return (
    <div className="entry-card px-5 py-5">
      <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        Goals this week
      </p>
      <div className="flex flex-col gap-4">
        {habits.map((h) => {
          const count = countsByHabit.get(h.id) ?? 0;
          const target = h.weekly_target;
          const pct = Math.min(100, Math.round((count / target) * 100));
          const met = count >= target;
          return (
            <div key={h.id}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-paper">{h.name}</span>
                <span className={`font-mono text-[11px] ${met ? "text-teal" : "text-muted"}`}>
                  {count}/{target}{met ? " ✓" : ""}
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-line">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${met ? "bg-teal" : "bg-amber"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
