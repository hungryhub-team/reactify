import { db } from "../../db";
import { tasks } from "../../db/schema";
import { eq, ilike, or, count as drizzleCount, sql } from "drizzle-orm";
import {
  type RepositoryResult,
  type PaginationParams,
  type PaginatedData,
  createError,
  success,
  failure,
} from "../types";

// ---------------------
// Types
// ---------------------

export type TaskEntity = typeof tasks.$inferSelect;

export type TaskCreateInput = typeof tasks.$inferInsert;

export type TaskUpdateInput = Partial<TaskCreateInput>;

export type TaskSearchParams = {
  q?: string;
} & PaginationParams;

// ---------------------
// Repository
// ---------------------

export class TaskRepository {
  /**
   * Find task by ID
   */
  async findById(id: number): Promise<RepositoryResult<TaskEntity | null>> {
    try {
      const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
      return success(result[0] ?? null);
    } catch (error) {
      console.error("[TaskRepository] findById error:", error);
      return failure(createError("Failed to find task by ID", "DB_ERROR", error));
    }
  }

  /**
   * Find all tasks with optional search and pagination
   */
  async findMany(params: TaskSearchParams): Promise<RepositoryResult<PaginatedData<TaskEntity>>> {
    try {
      const { q, page, limit } = params;
      const skip = (page - 1) * limit;

      let conditions = undefined;
      if (q) {
        conditions = or(
          ilike(tasks.title, `%${q}%`),
          ilike(tasks.description, `%${q}%`)
        );
      }

      const [items, totalResult] = await Promise.all([
        db.select()
          .from(tasks)
          .where(conditions)
          .orderBy(sql`${tasks.createdAt} DESC`)
          .limit(limit)
          .offset(skip),
        db.select({ count: drizzleCount() }).from(tasks).where(conditions),
      ]);

      const total = totalResult[0]?.count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return success({
        items,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      console.error("[TaskRepository] findMany error:", error);
      return failure(createError("Failed to find tasks", "DB_ERROR", error));
    }
  }

  /**
   * Create a new task
   */
  async create(input: TaskCreateInput): Promise<RepositoryResult<TaskEntity>> {
    try {
      const result = await db.insert(tasks).values({
        title: input.title,
        description: input.description ?? null,
        date: input.date,
      }).returning();
      return success(result[0]!);
    } catch (error) {
      console.error("[TaskRepository] create error:", error);
      return failure(createError("Failed to create task", "DB_ERROR", error));
    }
  }

  /**
   * Update an existing task
   */
  async update(id: number, input: TaskUpdateInput): Promise<RepositoryResult<TaskEntity>> {
    try {
      const updateData = {
        ...input,
        updatedAt: new Date(),
      };

      const result = await db.update(tasks).set(updateData).where(eq(tasks.id, id)).returning();

      if (result.length === 0) {
        return failure(createError("Task not found to update", "NOT_FOUND", null));
      }

      return success(result[0]!);
    } catch (error) {
      console.error("[TaskRepository] update error:", error);
      return failure(createError("Failed to update task", "DB_ERROR", error));
    }
  }

  /**
   * Delete a task
   */
  async delete(id: number): Promise<RepositoryResult<TaskEntity>> {
    try {
      const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();

      if (result.length === 0) {
        return failure(createError("Task not found to delete", "NOT_FOUND", null));
      }

      return success(result[0]!);
    } catch (error) {
      console.error("[TaskRepository] delete error:", error);
      return failure(createError("Failed to delete task", "DB_ERROR", error));
    }
  }

  /**
   * Count total tasks with optional filter
   */
  async count(): Promise<RepositoryResult<number>> {
    try {
      const result = await db.select({ value: drizzleCount() }).from(tasks);
      return success(result[0]?.value ?? 0);
    } catch (error) {
      console.error("[TaskRepository] count error:", error);
      return failure(createError("Failed to count tasks", "DB_ERROR", error));
    }
  }

  /**
   * Check if task exists
   */
  async exists(id: number): Promise<RepositoryResult<boolean>> {
    try {
      const result = await db.select({ id: tasks.id }).from(tasks).where(eq(tasks.id, id)).limit(1);
      return success(result.length > 0);
    } catch (error) {
      console.error("[TaskRepository] exists error:", error);
      return failure(createError("Failed to check task existence", "DB_ERROR", error));
    }
  }
}

// Export singleton instance
export const taskRepository = new TaskRepository();
