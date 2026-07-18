import { sql, type Task, type Note } from "@/lib/db";
import StatStrip from "@/components/StatStrip";
import DayRail from "@/components/DayRail";
import LevelCard from "@/components/LevelCard";
import TaskItem from "@/components/TaskItem";
import NoteItem from "@/components/NoteItem";

export const dynamic = "force-dynamic";

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning, Vanessa";
  if (hour < 18) return "Good afternoon, Vanessa";
  return "Good evening, Vanessa";
}

export default async function TodayPage() {
  const allTasks = (await sql`select * from tasks order by due_at asc nulls last`) as Task[];
  const pinnedNotes = (await sql`
    select * from notes where pinned = true order by created_at desc limit 5
  `) as Note[];

  const today = new Date();
  const focus = allTasks
    .filter((t) => t.status === "open")
    .filter((t) => {
      if (t.priority === 1) return true;
      if (!t.due_at) return false;
      const d = new Date(t.due_at);
      return d.toDateString() === today.toDateString() || d < today;
    })
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          {today.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="mt-1 font-display text-3xl italic text-paper">{getGreeting(today.getHours())}</h1>
      </header>

      <LevelCard />
      <StatStrip tasks={allTasks} />
      <DayRail tasks={allTasks} />

      <section>
        <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Focus — overdue, due today, or high priority
        </h2>
        <div className="flex flex-col gap-2">
          {focus.length === 0 ? (
            <p className="entry-card px-4 py-6 text-center text-sm text-muted">
              Nothing urgent logged. Add a task to get started.
            </p>
          ) : (
            focus.map((t, i) => <TaskItem key={t.id} task={t} index={i + 1} />)
          )}
        </div>
      </section>

      {pinnedNotes.length > 0 && (
        <section>
          <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Pinned notes
          </h2>
          <div className="flex flex-col gap-2">
            {pinnedNotes.map((n, i) => (
              <NoteItem key={n.id} note={n} index={i + 1} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
