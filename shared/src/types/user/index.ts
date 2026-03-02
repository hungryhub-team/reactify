import { z } from "zod";
import type { PaginationMeta } from "../common";

// ---------------------
// Constants
// ---------------------

export const USER_ROLES = {
  SUPER_ADMIN: 1,
  USER: 2,
} as const;

export const USER_ROLE_LABELS: Record<number, string> = {
  [USER_ROLES.SUPER_ADMIN]: "Super Admin",
  [USER_ROLES.USER]: "User",
};

/** Default password assigned to new users and used for password resets */
export const DEFAULT_USER_PASSWORD = "default";

// ---------------------
// Zod Schemas
// ---------------------

export const userCreateSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  role: z.number().int().min(1).max(2),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.number().int().min(1).max(2).optional(),
});

// ---------------------
// Types
// ---------------------

export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;

export type User = {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean | null;
  image: string | null;
  role: number;
  createdAt: string;
  updatedAt: string;
};

// ---------------------
// Response Types
// ---------------------

export type UserListResponse = {
  success: true;
  data: User[];
  pagination: PaginationMeta;
};

export type UserSingleResponse = {
  success: true;
  data: User;
};

export type UserDeleteResponse = {
  success: true;
  message: string;
};

export type UserResetPasswordResponse = {
  success: true;
  message: string;
};

export type UserErrorResponse = {
  success: false;
  error: string;
  code?: string;
};
