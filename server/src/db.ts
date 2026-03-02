import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

export const connectionString =
  process.env.DATABASE_URL ||
  "postgres://root:rootroot@localhost:5432/reactify_example_db";

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
export { pool };
