import { neon } from "@neondatabase/serverless";

// One tagged-template SQL client, reused across server actions and route handlers.
// The Neon serverless driver works over HTTP, so it's safe to call from
// Vercel's serverless / edge functions without connection-pool exhaustion.
if (!process.env.DATABASE_URL) {
  // Thrown at request time (not build time) so `next build` doesn't
  // require a live database.
  console.warn(
    "DATABASE_URL is not set. Set it in .env.local (dev) or your Vercel project's Environment Variables (prod)."
  );
}

export const sql = neon(process.env.DATABASE_URL ?? "");

export type Task = {
  id: number;
  title: string;
  notes: string | null;
  priority: 1 | 2 | 3;
  status: "open" | "done";
  due_at: string | null;
  created_at: string;
  completed_at: string | null;
};

export type Note = {
  id: number;
  body: string;
  pinned: boolean;
  created_at: string;
};
