import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

type FocusTask = { title: string; priority: number; due_at: string | Date | null };

export async function GET(request: NextRequest) {
  // Vercel automatically sends this header when IT triggers the cron job —
  // this check stops anyone else on the internet from hitting this URL and
  // spamming your phone. Skipped in local dev so you can test easily.
  if (process.env.NODE_ENV === "production") {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const tasks = (await sql`
    select title, priority, due_at from tasks
    where status = 'open'
      and (priority = 1 or due_at::date <= current_date)
    order by priority asc, due_at asc nulls last
    limit 6
  `) as FocusTask[];

  const messageBody =
    tasks.length === 0
      ? "Logbook: nothing urgent on today's list. Good morning!"
      : `Logbook — today's focus:\n${tasks.map((t) => `- ${t.title}`).join("\n")}`;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const toNumber = process.env.RECIPIENT_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber || !toNumber) {
    return NextResponse.json(
      { ok: false, error: "Missing Twilio environment variables." },
      { status: 500 }
    );
  }

  const twilioResponse = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: fromNumber, To: toNumber, Body: messageBody }),
    }
  );

  if (!twilioResponse.ok) {
    const errorText = await twilioResponse.text();
    return NextResponse.json({ ok: false, error: errorText }, { status: 502 });
  }

  return NextResponse.json({ ok: true, tasksIncluded: tasks.length });
}
