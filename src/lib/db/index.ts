import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error("Database URL not found!");
}

//connecting db via neon
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql);
