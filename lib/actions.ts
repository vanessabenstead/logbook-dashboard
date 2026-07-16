"use server";

import { revalidatePath } from "next/cache";
import { sql } from "./db";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/notes");
}

// ---------- Tasks ----------

export async function createTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const priority = Number(formData.get("priority") ?? 2);
  const dueRaw = String(formData.get("due_at") ?? "").trim();
  const dueAt = dueRaw ? new Date(dueRaw).toISOString() : null;

  await sql`
    insert into tasks (title, notes, priority, due_at)
    values (${title}, ${notes}, ${priority}, ${dueAt})
  `;
  revalidateAll();
}

export async function toggleTask(id: number, currentlyDone: boolean) {
  if (currentlyDone) {
    await sql`update tasks set status = 'open', completed_at = null where id = ${id}`;
  } else {
    await sql`update tasks set status = 'done', completed_at = now() where id = ${id}`;
  }
  revalidateAll();
}

export async function deleteTask(id: number) {
  await sql`delete from tasks where id = ${id}`;
  revalidateAll();
}

// ---------- Notes ----------

export async function createNote(formData: FormData) {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  await sql`insert into notes (body) values (${body})`;
  revalidateAll();
}

export async function togglePin(id: number, currentlyPinned: boolean) {
  await sql`update notes set pinned = ${!currentlyPinned} where id = ${id}`;
  revalidateAll();
}

export async function deleteNote(id: number) {
  await sql`delete from notes where id = ${id}`;
  revalidateAll();
}
