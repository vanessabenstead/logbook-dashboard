import { sql, type Task } from "@/lib/db";
import TaskForm from "@/components/TaskForm";
import TaskItem from "@/components/TaskItem";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = (await sql`
    select * from tasks
    order by (status = 'done'), priority asc, due_at asc nulls last
  `) as Task[];

  const open = tasks.filter((t) => t.status === "open");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Ledger
        </p>
        <h1 className="mt-1 font-display text-3xl italic text-paper">Tasks</h1>
      </header>

      <TaskForm />

      <section>
        <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Open — {open.length}
        </h2>
        <div className="flex flex-col gap-2">
          {open.length === 0 ? (
            <p className="entry-card px-4 py-6 text-center text-sm text-muted">
              No open tasks. Everything's logged as done.
            </p>
          ) : (
            open.map((t, i) => <TaskItem key={t.id} task={t} index={i + 1} />)
          )}
        </div>
      </section>

      {done.length > 0 && (
        <section>
          <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Completed — {done.length}
          </h2>
          <div className="flex flex-col gap-2">
            {done.map((t, i) => (
              <TaskItem key={t.id} task={t} index={i + 1} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
