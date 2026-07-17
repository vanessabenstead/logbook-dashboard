import { createHabit } from "@/lib/actions";

export default function HabitForm() {
  return (
    <form
      action={createHabit}
      className="entry-card flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-end"
      style={{ ["--tick" as string]: "#e8a33d" }}
    >
      <div className="flex-1">
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
          New habit
        </label>
        <input
          name="name"
          required
          placeholder="e.g. BFT session, HYROX row + sled, protein target"
          className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-paper placeholder:text-muted/60 focus:border-amber focus:outline-none"
        />
      </div>
      <input type="hidden" name="category" value="HYROX" />
      <button
        type="submit"
        className="rounded bg-amber px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90"
      >
        Track it
      </button>
    </form>
  );
}
