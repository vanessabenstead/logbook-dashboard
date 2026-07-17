import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function normalizeLogDate(value: string | Date): string {
  if (value instanceof Date) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, "0");
    const day = String(value.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return String(value).slice(0, 10);
}

// Wraps a CSV field in quotes and escapes any inner quotes, so habit names
// with commas or quotes in them don't break the file.
function csvField(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month"); // "YYYY-MM" or absent for all-time

  let rows: { log_date: string | Date; name: string }[];

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    const monthStart = `${y}-${String(m).padStart(2, "0")}-01`;
    const daysInMonth = new Date(y, m, 0).getDate();
    const monthEnd = `${y}-${String(m).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

    rows = (await sql`
      select hl.log_date, h.name
      from habit_logs hl
      join habits h on h.id = hl.habit_id
      where hl.log_date >= ${monthStart} and hl.log_date <= ${monthEnd}
      order by hl.log_date asc, h.name asc
    `) as { log_date: string | Date; name: string }[];
  } else {
    rows = (await sql`
      select hl.log_date, h.name
      from habit_logs hl
      join habits h on h.id = hl.habit_id
      order by hl.log_date asc, h.name asc
    `) as { log_date: string | Date; name: string }[];
  }

  const lines = ["Date,Habit"];
  for (const r of rows) {
    lines.push(`${csvField(normalizeLogDate(r.log_date))},${csvField(r.name)}`);
  }
  const csv = lines.join("\r\n");

  const filename = month ? `habits-${month}.csv` : "habits-all-time.csv";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
