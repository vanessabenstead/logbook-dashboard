import Link from "next/link";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

type Row = { name: string; days_completed: number };

function parseMonthParam(param: string | undefined): { year: number; month: number } {
  if (param && /^\d{4}-\d{2}$/.test(param)) {
    const [y, m] = param.split("-").map(Number);
    return { year: y, month: m };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function monthParam(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function addMonths(year: number, month: number, delta: number) {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export default async function HabitReportPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const { year, month } = parseMonthParam(searchParams.month);
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

  const rows = (await sql`
    select h.name, count(hl.id)::int as days_completed
    from habits h
    left join habit_logs hl
      on hl.habit_id = h.id
      and hl.log_date >= ${monthStart}
      and hl.log_date <= ${monthEnd}
    where h.archived = false
    group by h.name
    order by h.name asc
  `) as Row[];

  const prev = addMonths(year, month, -1);
  const next = addMonths(year, month, 1);
  const isCurrentMonth = monthParam(year, month) === monthParam(new Date().getFullYear(), new Date().getMonth() + 1);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Training log
          </p>
          <h1 className="mt-1 font-display text-3xl italic text-paper">Monthly report</h1>
        </div>
        <Link
          href="/habits"
          className="rounded border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-muted transition-colors hover:border-amber hover:text-amber"
        >
          ← Back to habits
        </Link>
      </header>

      <div className="flex items-center justify-between">
        <Link
          href={`/habits/report?month=${monthParam(prev.year, prev.month)}`}
          className="font-mono text-[11px] uppercase tracking-wide text-muted hover:text-paper"
        >
          ← Prev month
        </Link>
        <p className="font-display text-xl italic text-paper">
          {monthLabel(year, month)}
          {isCurrentMonth && <span className="ml-2 font-mono text-[11px] not-italic text-amber">(this month)</span>}
        </p>
        <Link
          href={`/habits/report?month=${monthParam(next.year, next.month)}`}
          className="font-mono text-[11px] uppercase tracking-wide text-muted hover:text-paper"
        >
          Next month →
        </Link>
      </div>

      <div className="entry-card px-5 py-5" style={{ ["--tick" as string]: "#e8a33d" }}>
        {rows.length === 0 ? (
          <p className="text-center text-sm text-muted">No habits tracked yet.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                <th className="pb-3">Habit</th>
                <th className="pb-3 text-right">Days logged</th>
                <th className="pb-3 text-right">Of {daysInMonth}</th>
                <th className="pb-3 text-right">Completion</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pct = Math.round((r.days_completed / daysInMonth) * 100);
                return (
                  <tr key={r.name} className="border-t border-line">
                    <td className="py-3 text-paper">{r.name}</td>
                    <td className="py-3 text-right log-number text-paper">{r.days_completed}</td>
                    <td className="py-3 text-right log-number text-muted">{daysInMonth}</td>
                    <td className="py-3 text-right log-number text-teal">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <a
        href={`/api/habits/export?month=${monthParam(year, month)}`}
        className="entry-card flex items-center justify-between px-5 py-4 text-sm text-paper transition-colors hover:border-amber"
        style={{ ["--tick" as string]: "#4f9d91" }}
      >
        <span>Download this month as a spreadsheet file (CSV)</span>
        <span className="font-mono text-[11px] uppercase text-amber">Download ↓</span>
      </a>
    </div>
  );
}
