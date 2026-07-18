"use server";

import { revalidatePath } from "next/cache";
import { sql } from "./db";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/notes");
  revalidatePath("/habits");
}

// ---------- Tasks ----------

export async function createTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const priority = Number(formData.get("priority") ?? 2);
  const category = String(formData.get("category") ?? "General").trim() || "General";
  const dueRaw = String(formData.get("due_at") ?? "").trim();
  const dueAt = dueRaw ? new Date(dueRaw).toISOString() : null;

  await sql`
    insert into tasks (title, notes, priority, due_at, category)
    values (${title}, ${notes}, ${priority}, ${dueAt}, ${category})
  `;
  revalidateAll();
}

// Adds many tasks at once from a newline-separated list — handy for seeding
// an event checklist (baptism, birthday, etc.) in one go instead of one at
// a time.
export async function createTasksBulk(formData: FormData) {
  const raw = String(formData.get("titles") ?? "");
  const category = String(formData.get("category") ?? "General").trim() || "General";
  const priority = Number(formData.get("priority") ?? 2);
  const dueRaw = String(formData.get("due_at") ?? "").trim();
  const dueAt = dueRaw ? new Date(dueRaw).toISOString() : null;

  const titles = raw
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter((line) => line.length > 0);

  for (const title of titles) {
    await sql`
      insert into tasks (title, priority, due_at, category)
      values (${title}, ${priority}, ${dueAt}, ${category})
    `;
  }
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

// ---------- Habits ----------

export async function createHabit(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const category = String(formData.get("category") ?? "HYROX").trim() || "HYROX";
  const weeklyTarget = Number(formData.get("weekly_target") ?? 7);
  await sql`insert into habits (name, category, weekly_target) values (${name}, ${category}, ${weeklyTarget})`;
  revalidatePath("/habits");
}

export async function updateHabit(id: number, name: string, weeklyTarget: number) {
  const trimmed = name.trim();
  if (!trimmed) return;
  await sql`update habits set name = ${trimmed}, weekly_target = ${weeklyTarget} where id = ${id}`;
  revalidatePath("/habits");
}

export async function archiveHabit(id: number) {
  await sql`update habits set archived = true where id = ${id}`;
  revalidatePath("/habits");
}

// Flips whether a habit is logged for a given date (YYYY-MM-DD).
export async function toggleHabitLog(habitId: number, dateStr: string, currentlyLogged: boolean) {
  if (currentlyLogged) {
    await sql`delete from habit_logs where habit_id = ${habitId} and log_date = ${dateStr}`;
  } else {
    await sql`
      insert into habit_logs (habit_id, log_date)
      values (${habitId}, ${dateStr})
      on conflict (habit_id, log_date) do nothing
    `;
  }
  revalidatePath("/habits");
}

// ---------- Meal planning ----------

export async function createRecipe(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const ingredientsRaw = String(formData.get("ingredients") ?? "");

  const lines = ingredientsRaw
    .split("\n")
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .filter((l) => l.length > 0);

  const rows = await sql`insert into recipes (name) values (${name}) returning id`;
  const recipeId = rows[0].id as number;

  for (let i = 0; i < lines.length; i++) {
    await sql`
      insert into recipe_ingredients (recipe_id, line, sort_order)
      values (${recipeId}, ${lines[i]}, ${i})
    `;
  }
  revalidatePath("/meals");
}

export async function deleteRecipe(id: number) {
  await sql`delete from recipes where id = ${id}`;
  revalidatePath("/meals");
}

export async function setMealPlanEntry(planDate: string, recipeId: number) {
  await sql`
    insert into meal_plan_entries (plan_date, recipe_id)
    values (${planDate}, ${recipeId})
    on conflict (plan_date) do update set recipe_id = excluded.recipe_id
  `;
  revalidatePath("/meals");
}

export async function clearMealPlanEntry(planDate: string) {
  await sql`delete from meal_plan_entries where plan_date = ${planDate}`;
  revalidatePath("/meals");
}
