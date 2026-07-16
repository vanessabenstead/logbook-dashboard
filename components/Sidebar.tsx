import Link from "next/link";

const links = [
  { href: "/", label: "Today", mark: "01" },
  { href: "/tasks", label: "Tasks", mark: "02" },
  { href: "/notes", label: "Notes", mark: "03" },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col justify-between px-6 py-8 sm:flex">
      <div>
        <div className="mb-10">
          <p className="font-display text-xl italic tracking-tight text-paper">
            Logbook
          </p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            daily record
          </p>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group flex items-center gap-3 rounded px-2 py-2 text-sm text-muted transition-colors hover:bg-panel hover:text-paper"
            >
              <span className="font-mono text-[11px] text-muted group-hover:text-amber">
                {l.mark}
              </span>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="font-mono text-[10px] leading-relaxed text-muted/70">
        Entries persist to your
        <br />
        Neon Postgres database.
      </p>
    </aside>
  );
}
