import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./db/schema";

export const connectionString =
  process.env.DATABASE_URL ||
  "postgres://root:rootroot@localhost:5432/reactify_example_db";

const pool = new pg.Pool({ connectionString });
export const db = drizzle({
  client: pool,
  schema,
  relations: schema.relations,
});
export { pool };
