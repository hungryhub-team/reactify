import pg from "pg";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Seed users and accounts for Better Auth
 *
 * Creates users from allowed-users.json with credential accounts.
 * Uses raw SQL via pg pool to avoid Prisma adapter compatibility issues.
 * Passwords are hashed using Bun's built-in bcrypt.
 *
 * Usage: bun run src/seed.ts
 */

interface AllowedUsersConfig {
  allowedEmails: string[];
}

// Default seed password — change in production
const DEFAULT_PASSWORD = "password123";

// Seed user profiles keyed by email
const userProfiles: Record<string, { name: string }> = {
  "rahmatrdn.dev@gmail.com": { name: "Rahmat" },
  "manager@example.com": { name: "Manager" },
};

function loadAllowedEmails(): string[] {
  const filePath = join(import.meta.dir, "allowed-users.json");
  const raw = readFileSync(filePath, "utf-8");
  const data: AllowedUsersConfig = JSON.parse(raw);
  return data.allowedEmails || [];
}

function generateCuid(): string {
  // Simple cuid-like ID generator
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const counter = Math.floor(Math.random() * 1000).toString(36);
  return `c${timestamp}${randomPart}${counter}`;
}

async function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });
}

async function seed() {
  console.log("🌱 Starting seed...\n");

  const connectionString =
    process.env.DATABASE_URL ||
    "postgres://root:rootroot@localhost:5432/reactify_example_db";

  const pool = new pg.Pool({ connectionString });

  try {
    const emails = loadAllowedEmails();

    if (emails.length === 0) {
      console.log("⚠️  No allowed emails found in allowed-users.json");
      return;
    }

    const hashedPassword = await hashPassword(DEFAULT_PASSWORD);
    const now = new Date().toISOString();

    for (const email of emails) {
      const normalizedEmail = email.toLowerCase();
      const profile = userProfiles[normalizedEmail] || {
        name: normalizedEmail.split("@")[0],
      };

      // Check if user already exists
      const existing = await pool.query(
        'SELECT id FROM "user" WHERE email = $1',
        [normalizedEmail],
      );

      if (existing.rows.length > 0) {
        console.log(`⏭️  User already exists: ${normalizedEmail}`);
        continue;
      }

      const userId = generateCuid();
      const accountId = generateCuid();

      // Insert user
      await pool.query(
        `INSERT INTO "user" (id, email, name, "emailVerified", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, normalizedEmail, profile.name, true, now, now],
      );

      // Insert credential account
      await pool.query(
        `INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [accountId, userId, "credential", userId, hashedPassword, now, now],
      );

      console.log(`✅ Created user: ${profile.name} (${normalizedEmail})`);
    }

    console.log("\n🌱 Seed completed!");
    console.log(`\n📋 Default credentials:`);
    console.log(`   Password: ${DEFAULT_PASSWORD}`);
    console.log(`   Emails: ${emails.join(", ")}`);
  } finally {
    await pool.end();
  }
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
