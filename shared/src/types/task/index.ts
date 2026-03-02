import { z } from "zod";
import type { PaginationMeta } from "../common";

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

// ---------------------
// Types
// ---------------------

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

// ---------------------
// Response Types
// ---------------------

export type TaskListResponse = {
  success: true;
  data: Task[];
  pagination: PaginationMeta;
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
