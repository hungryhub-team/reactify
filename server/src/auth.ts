import { betterAuth } from "better-auth";
import { pool } from "./db";

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

// Admin bypass: tracks emails that are allowed to sign up via admin user creation
const pendingAdminEmails = new Set<string>();

export function allowAdminSignUp(email: string) {
  pendingAdminEmails.add(email.toLowerCase());
}

export function clearAdminSignUp(email: string) {
  pendingAdminEmails.delete(email.toLowerCase());
}

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || "dev-secret-change-me-in-production",
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  trustedOrigins: [clientUrl],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const email = user.email?.toLowerCase();
          if (!email) {
            console.log(`[auth] Blocked sign-up: no email provided`);
            return false;
          }

          // Allow admin-created users to bypass the sign-up restriction
          if (pendingAdminEmails.has(email)) {
            pendingAdminEmails.delete(email);
            console.log(`[auth] Admin sign-up allowed for: ${email}`);
            return { data: user };
          }

          // Check if user already exists in the database (seeded users)
          const result = await pool.query(
            'SELECT id FROM "user" WHERE LOWER(email) = $1',
            [email],
          );

          if (result.rows.length > 0) {
            console.log(`[auth] Allowed sign-up for existing user: ${email}`);
            return { data: user };
          }

          console.log(`[auth] Blocked sign-up for unauthorized email: ${email}`);
          return false;
        },
      },
    },
  },
});

export default auth;
