import Link from "next/link";
import { sql, type Task, TASK_CATEGORIES } from "@/lib/db";
import TaskForm from "@/components/TaskForm";
import QuickAddTasks from "@/components/QuickAddTasks";
import TaskItem from "@/components/TaskItem";

export const dynamic = "force-dynamic";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const allTasks = (await sql`
    select * from tasks
    order by (status = 'done'), priority asc, due_at asc nulls last
  `) as Task[];

  const activeCategory = searchParams.category;
  const tasks = activeCategory
    ? allTasks.filter((t) => t.category === activeCategory)
    : allTasks;

  const open = tasks.filter((t) => t.status === "open");
  const done = tasks.filter((t) => t.status === "done");

  // Only show tabs for categories that actually have tasks, plus the fixed list.
  const categoriesInUse = Array.from(new Set(allTasks.map((t) => t.category)));
  const tabCategories = Array.from(new Set([...TASK_CATEGORIES, ...categoriesInUse]));

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Ledger
        </p>
        <h1 className="mt-1 font-display text-3xl italic text-paper">Tasks</h1>
      </header>

      <nav className="flex flex-wrap gap-2">
        <Link
          href="/tasks"
          className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors ${
            !activeCategory
              ? "border-amber text-amber"
              : "border-line text-muted hover:text-paper"
          }`}
        >
          All ({allTasks.length})
        </Link>
        {tabCategories.map((c) => {
          const count = allTasks.filter((t) => t.category === c).length;
          return (
            <Link
              key={c}
              href={`/tasks?category=${encodeURIComponent(c)}`}
              className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide transition-colors ${
                activeCategory === c
                  ? "border-amber text-amber"
                  : "border-line text-muted hover:text-paper"
              }`}
            >
              {c} ({count})
            </Link>
          );
        })}
      </nav>

      <TaskForm defaultCategory={activeCategory} />
      <QuickAddTasks defaultCategory={activeCategory} />

      <section>
        <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Open — {open.length}
        </h2>
        <div className="flex flex-col gap-2">
          {open.length === 0 ? (
            <p className="entry-card px-4 py-6 text-center text-sm text-muted">
              No open tasks here. Everything's logged as done.
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
