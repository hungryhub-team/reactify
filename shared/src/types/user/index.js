import { z } from "zod";
// ---------------------
// Constants
// ---------------------
export const USER_ROLES = {
    SUPER_ADMIN: 1,
    USER: 2,
};
export const USER_ROLE_LABELS = {
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
