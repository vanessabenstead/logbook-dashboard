// Applies lib/schema.sql to the database at DATABASE_URL.
// Usage: npm run db:init   (reads .env.local automatically)
import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const sql = neon(url);
const schema = readFileSync(new URL("../lib/schema.sql", import.meta.url), "utf8");

// Split on blank-line-separated statements is fragile for general SQL, but
// schema.sql only contains simple create table / create index statements,
// so a semicolon split is safe here.
const withoutComments = schema
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");

const statements = withoutComments
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

for (const statement of statements) {
  await sql(statement);
  console.log("OK:", statement.split("\n")[0]);
}

console.log("Schema applied.");
