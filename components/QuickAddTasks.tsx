import { createTasksBulk } from "@/lib/actions";
import { TASK_CATEGORIES } from "@/lib/db";

export default function QuickAddTasks({ defaultCategory }: { defaultCategory?: string }) {
  return (
    <details className="entry-card px-4 py-4" style={{ ["--tick" as string]: "#8A7159" }}>
      <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
        Quick-add a checklist (paste multiple lines)
      </summary>
      <form action={createTasksBulk} className="mt-4 flex flex-col gap-3">
        <div>
          <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
            One item per line
          </label>
          <textarea
            name="titles"
            required
            rows={6}
            placeholder={"Book venue\nSend invites\nOrder cake"}
            className="w-full resize-y rounded border border-line bg-ink px-3 py-2 text-sm text-paper placeholder:text-muted/60 focus:border-amber focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="sm:w-40">
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
              Category
            </label>
            <select
              name="category"
              defaultValue={defaultCategory ?? "General"}
              className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-paper focus:border-amber focus:outline-none"
            >
              {TASK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-56">
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
              Due date (applies to all, optional)
            </label>
            <input
              type="datetime-local"
              name="due_at"
              className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-paper focus:border-amber focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-amber px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90"
          >
            Add all
          </button>
        </div>
      </form>
    </details>
  );
}
