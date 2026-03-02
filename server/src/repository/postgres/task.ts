import { prisma } from "../../db";
import type { Prisma } from "../../../generated/prisma/client";
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

export type TaskEntity = {
  id: number;
  title: string;
  description: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type TaskCreateInput = {
  title: string;
  description?: string | null;
  date: Date;
};

export type TaskUpdateInput = {
  title?: string;
  description?: string | null;
  date?: Date;
};

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
      const task = await prisma.task.findUnique({
        where: { id },
      });
      return success(task);
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

      const where: Prisma.TaskWhereInput = q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {};

      const [items, total] = await Promise.all([
        prisma.task.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.task.count({ where }),
      ]);

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
      const task = await prisma.task.create({
        data: {
          title: input.title,
          description: input.description ?? null,
          date: input.date,
        },
      });
      return success(task);
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
      const task = await prisma.task.update({
        where: { id },
        data: input,
      });
      return success(task);
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
      const task = await prisma.task.delete({
        where: { id },
      });
      return success(task);
    } catch (error) {
      console.error("[TaskRepository] delete error:", error);
      return failure(createError("Failed to delete task", "DB_ERROR", error));
    }
  }

  /**
   * Count total tasks with optional filter
   */
  async count(where?: Prisma.TaskWhereInput): Promise<RepositoryResult<number>> {
    try {
      const count = await prisma.task.count({ where });
      return success(count);
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
      const count = await prisma.task.count({
        where: { id },
      });
      return success(count > 0);
    } catch (error) {
      console.error("[TaskRepository] exists error:", error);
      return failure(createError("Failed to check task existence", "DB_ERROR", error));
    }
  }
}

// Export singleton instance
export const taskRepository = new TaskRepository();
