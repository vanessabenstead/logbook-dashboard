import { createTask } from "@/lib/actions";
import { TASK_CATEGORIES } from "@/lib/db";

export default function TaskForm({ defaultCategory }: { defaultCategory?: string }) {
  return (
    <form
      action={createTask}
      className="entry-card flex flex-col gap-3 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3"
      style={{ ["--tick" as string]: "#6B7F5F" }}
    >
      <div className="flex-1 basis-full sm:basis-auto">
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
          New entry
        </label>
        <input
          name="title"
          required
          placeholder="What needs doing?"
          className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-paper placeholder:text-muted/60 focus:border-amber focus:outline-none"
        />
      </div>
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
      <div className="sm:w-36">
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
          Priority
        </label>
        <select
          name="priority"
          defaultValue={2}
          className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-paper focus:border-amber focus:outline-none"
        >
          <option value={1}>High</option>
          <option value={2}>Medium</option>
          <option value={3}>Low</option>
        </select>
      </div>
      <div className="sm:w-56">
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
          Due
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
        Log it
      </button>
    </form>
  );
}
