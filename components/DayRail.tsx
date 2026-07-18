"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/lib/db";

const PRIORITY_COLOR: Record<number, string> = {
  1: "#B5654A",
  2: "#8A7159",
  3: "#6B7F5F",
};

function hoursOfDay(date: Date) {
  return date.getHours() + date.getMinutes() / 60;
}

export default function DayRail({ tasks }: { tasks: Task[] }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const today = new Date();
  const todaysTasks = tasks.filter((t) => {
    if (!t.due_at) return false;
    const d = new Date(t.due_at);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  });

  const nowPct = now ? (hoursOfDay(now) / 24) * 100 : null;

  return (
    <div className="entry-card px-5 py-6" style={{ ["--tick" as string]: "#8A7159" }}>
      <div className="mb-5 flex items-baseline justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Watch — {today.toLocaleDateString(undefined, { weekday: "long" })}
        </p>
        <p className="font-mono text-[11px] text-muted">
          {now ? now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "--:--"}
        </p>
      </div>

      <div className="relative h-16">
        {/* hour ticks */}
        <div className="absolute inset-x-0 top-8 h-px bg-line" />
        {Array.from({ length: 25 }).map((_, h) => (
          <div
            key={h}
            className="absolute top-6 flex flex-col items-center"
            style={{ left: `${(h / 24) * 100}%` }}
          >
            <div className={`h-4 w-px ${h % 6 === 0 ? "bg-muted" : "bg-line"}`} />
            {h % 6 === 0 && (
              <span className="absolute top-5 -translate-x-1/2 font-mono text-[9px] text-muted">
                {h.toString().padStart(2, "0")}
              </span>
            )}
          </div>
        ))}

        {/* task marks */}
        {todaysTasks.map((t) => {
          const d = new Date(t.due_at as string);
          const pct = (hoursOfDay(d) / 24) * 100;
          return (
            <div
              key={t.id}
              className="group absolute top-4 -translate-x-1/2 cursor-default"
              style={{ left: `${pct}%` }}
              title={`${t.title} — ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`}
            >
              <div
                className="h-3 w-3 rounded-full border-2 border-ink"
                style={{
                  background: t.status === "done" ? "#6B7F5F" : PRIORITY_COLOR[t.priority],
                }}
              />
            </div>
          );
        })}

        {/* now indicator */}
        {nowPct !== null && (
          <div
            className="absolute top-2 -translate-x-1/2"
            style={{ left: `${nowPct}%` }}
          >
            <div className="h-9 w-px bg-amber" />
          </div>
        )}
      </div>

      <p className="mt-4 font-mono text-[11px] text-muted">
        {todaysTasks.length === 0
          ? "No timed entries logged for today."
          : `${todaysTasks.length} timed ${todaysTasks.length === 1 ? "entry" : "entries"} today.`}
      </p>
    </div>
  );
}
