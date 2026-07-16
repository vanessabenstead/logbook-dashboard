import { createNote } from "@/lib/actions";

export default function NoteForm() {
  return (
    <form
      action={createNote}
      className="entry-card flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-end"
      style={{ ["--tick" as string]: "#4f9d91" }}
    >
      <div className="flex-1">
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
          New note
        </label>
        <textarea
          name="body"
          required
          rows={2}
          placeholder="Jot something down..."
          className="w-full resize-none rounded border border-line bg-ink px-3 py-2 text-sm text-paper placeholder:text-muted/60 focus:border-amber focus:outline-none"
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
