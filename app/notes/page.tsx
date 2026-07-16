import { sql, type Note } from "@/lib/db";
import NoteForm from "@/components/NoteForm";
import NoteItem from "@/components/NoteItem";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const notes = (await sql`
    select * from notes order by pinned desc, created_at desc
  `) as Note[];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Margin notes
        </p>
        <h1 className="mt-1 font-display text-3xl italic text-paper">Notes</h1>
      </header>

      <NoteForm />

      <section>
        <div className="flex flex-col gap-2">
          {notes.length === 0 ? (
            <p className="entry-card px-4 py-6 text-center text-sm text-muted">
              Nothing jotted down yet.
            </p>
          ) : (
            notes.map((n, i) => <NoteItem key={n.id} note={n} index={i + 1} />)
          )}
        </div>
      </section>
    </div>
  );
}
