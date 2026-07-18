"use client";

import { useState, useTransition } from "react";
import type { Task } from "@/lib/db";
import { toggleTask, deleteTask } from "@/lib/actions";
import { burstConfetti } from "@/lib/confetti";

const PRIORITY_LABEL: Record<number, string> = { 1: "High", 2: "Medium", 3: "Low" };
const PRIORITY_COLOR: Record<number, string> = {
  1: "#B5654A",
  2: "#8A7159",
  3: "#6B7F5F",
};

export default function TaskItem({ task, index }: { task: Task; index: number }) {
  const [done, setDone] = useState(task.status === "done");
  const [, startTransition] = useTransition();
  const overdue = !done && task.due_at && new Date(task.due_at) < new Date();

  function handleToggle() {
    const wasDone = done;
    const next = !wasDone;
    setDone(next);
    if (next) burstConfetti();
    startTransition(() => {
      toggleTask(task.id, wasDone);
    });
  }

  return (
    <div
      className="entry-card flex items-start gap-3 px-4 py-3"
      style={{ ["--tick" as string]: overdue ? "#B5654A" : PRIORITY_COLOR[task.priority] }}
    >
      <span className="log-number pt-1 text-[11px] text-muted">
        {String(index).padStart(2, "0")}
      </span>

      <button
        type="button"
        onClick={handleToggle}
        className="pt-1"
        aria-label={done ? "Mark as open" : "Mark as done"}
      >
        <span className={`checkbox-visual ${done ? "checked" : ""}`} aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <p className={`text-sm ${done ? "text-muted line-through" : "text-paper"}`}>
          {task.title}
        </p>
        {task.notes && (
          <p className="mt-1 text-xs text-muted">{task.notes}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-wide text-muted">
          <span className="rounded border border-line px-1.5 py-0.5 text-muted">
            {task.category}
          </span>
          <span style={{ color: PRIORITY_COLOR[task.priority] }}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          {task.due_at && (
            <span className={overdue ? "text-rust" : ""}>
              {overdue ? "Overdue — " : "Due "}
              {new Date(task.due_at).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>

      <form action={deleteTask.bind(null, task.id)}>
        <button
          type="submit"
          aria-label="Delete task"
          className="rounded px-2 py-1 text-xs text-muted transition-colors hover:text-rust"
        >
          Remove
        </button>
      </form>
    </div>
  );
}
