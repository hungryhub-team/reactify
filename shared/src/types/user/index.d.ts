import { z } from "zod";
export declare const USER_ROLES: {
    readonly SUPER_ADMIN: 1;
    readonly USER: 2;
};
export declare const USER_ROLE_LABELS: Record<number, string>;
/** Default password assigned to new users and used for password resets */
export declare const DEFAULT_USER_PASSWORD = "default";
export declare const userCreateSchema: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodNumber;
}, z.core.$strip>;
export declare const userUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
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
export type UserListResponse = {
    success: true;
    data: User[];
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
