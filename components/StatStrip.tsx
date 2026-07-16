import type { Task } from "@/lib/db";

export default function StatStrip({ tasks }: { tasks: Task[] }) {
  const open = tasks.filter((t) => t.status === "open").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const overdue = tasks.filter(
    (t) => t.status === "open" && t.due_at && new Date(t.due_at) < new Date()
  ).length;
  const high = tasks.filter((t) => t.status === "open" && t.priority === 1).length;

  const stats = [
    { label: "Open", value: open, color: "text-paper" },
    { label: "Completed", value: done, color: "text-teal" },
    { label: "Overdue", value: overdue, color: overdue ? "text-rust" : "text-muted" },
    { label: "High priority", value: high, color: high ? "text-amber" : "text-muted" },
  ];

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-panel px-4 py-3">
          <p className={`log-number text-2xl ${s.color}`}>{s.value}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}
