import type { Note } from "@/lib/db";
import { togglePin, deleteNote } from "@/lib/actions";

export default function NoteItem({ note, index }: { note: Note; index: number }) {
  return (
    <div
      className="entry-card flex items-start gap-3 px-4 py-3"
      style={{ ["--tick" as string]: note.pinned ? "#8A7159" : "#2a3140" }}
    >
      <span className="log-number pt-0.5 text-[11px] text-muted">
        {String(index).padStart(2, "0")}
      </span>
      <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm text-paper">{note.body}</p>
      <div className="flex shrink-0 items-center gap-3 font-mono text-[10px] uppercase tracking-wide">
        <form action={togglePin.bind(null, note.id, note.pinned)}>
          <button
            type="submit"
            className={note.pinned ? "text-amber" : "text-muted hover:text-paper"}
          >
            {note.pinned ? "Pinned" : "Pin"}
          </button>
        </form>
        <form action={deleteNote.bind(null, note.id)}>
          <button type="submit" className="text-muted hover:text-rust">
            Remove
          </button>
        </form>
      </div>
    </div>
  );
}
