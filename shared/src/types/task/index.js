import { z } from "zod";
// ---------------------
// Zod Schemas
// ---------------------
export const taskCreateSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    description: z.string().max(1000, "Description too long").optional(),
    date: z.string().min(1, "Date is required"),
});
export const taskUpdateSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
    description: z.string().max(1000, "Description too long").optional(),
    date: z.string().min(1, "Date is required").optional(),
});
