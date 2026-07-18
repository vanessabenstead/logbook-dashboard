import { sql } from "@/lib/db";
import { levelFromXp } from "@/lib/gamification";

export default async function LevelCard() {
  const taskRows = await sql`select count(*)::int as c from tasks where status = 'done'`;
  const habitRows = await sql`select count(*)::int as c from habit_logs`;
  const tasksDone = (taskRows[0]?.c as number) ?? 0;
  const habitsLogged = (habitRows[0]?.c as number) ?? 0;
  const xp = tasksDone * 10 + habitsLogged * 5;
  const { level, xpIntoLevel, xpForNextLevel } = levelFromXp(xp);
  const pct = Math.round((xpIntoLevel / xpForNextLevel) * 100);

  return (
    <div className="entry-card px-5 py-5" style={{ ["--tick" as string]: "#6B7F5F" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Level</p>
          <p className="log-number text-3xl text-paper">Lv. {level}</p>
        </div>
        <div className="text-right font-mono text-[11px] text-muted">
          <p>{xp} XP total</p>
          <p>
            {tasksDone} tasks done · {habitsLogged} habit logs
          </p>
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-amber transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 font-mono text-[10px] text-muted">
        {xpIntoLevel}/{xpForNextLevel} XP to level {level + 1}
      </p>
    </div>
  );
}
