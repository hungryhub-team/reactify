import { z } from "zod";
export declare const taskCreateSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    date: z.ZodString;
}, z.core.$strip>;
export declare const taskUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type TaskCreate = z.infer<typeof taskCreateSchema>;
export type TaskUpdate = z.infer<typeof taskUpdateSchema>;
export type Task = {
    id: number;
    title: string;
    description: string | null;
    date: string;
    createdAt: string;
    updatedAt: string;
};
export type TaskListResponse = {
    success: true;
    data: Task[];
};
export type TaskSingleResponse = {
    success: true;
    data: Task;
};
export type TaskDeleteResponse = {
    success: true;
    message: string;
};
export type TaskErrorResponse = {
    success: false;
    error: string;
    code?: string;
};
