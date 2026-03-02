import { taskRepository } from "../repository/postgres";
import type { Task, TaskCreate, TaskUpdate } from "shared";
import type { TaskEntity } from "../repository/postgres";

type UsecaseErrorCode = "INVALID_ID" | "NOT_FOUND" | "DB_ERROR";

type UsecaseError = {
  error: string;
  code: UsecaseErrorCode;
};

type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: UsecaseError };

type PaginatedResult<T> =
  | { ok: true; data: T; total: number }
  | { ok: false; error: UsecaseError };

function serializeTask(t: TaskEntity): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    date: t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

function isValidId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

async function listTasks(params: { q: string; page?: number; limit?: number }): Promise<PaginatedResult<Task[]>> {
  const q = params.q.trim();
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 10;

  const result = await taskRepository.findMany({
    q,
    page,
    limit,
  });

  if (!result.success) {
    console.error("[tasks][usecase] List error:", result.error);
    return {
      ok: false,
      error: { error: result.error.message, code: "DB_ERROR" },
    };
  }

  return {
    ok: true,
    data: result.data.items.map(serializeTask),
    total: result.data.total,
  };
}

async function getTaskById(id: number): Promise<Result<Task>> {
  if (!isValidId(id)) {
    return { ok: false, error: { error: "Invalid ID", code: "INVALID_ID" } };
  }

  const result = await taskRepository.findById(id);

  if (!result.success) {
    console.error("[tasks][usecase] Get error:", result.error);
    return { ok: false, error: { error: result.error.message, code: "DB_ERROR" } };
  }

  if (!result.data) {
    return { ok: false, error: { error: "Task not found", code: "NOT_FOUND" } };
  }

  return { ok: true, data: serializeTask(result.data) };
}

async function createTask(input: TaskCreate): Promise<Result<Task>> {
  const result = await taskRepository.create({
    title: input.title,
    description: input.description ?? null,
    date: new Date(input.date),
  });

  if (!result.success) {
    console.error("[tasks][usecase] Create error:", result.error);
    return { ok: false, error: { error: result.error.message, code: "DB_ERROR" } };
  }

  return { ok: true, data: serializeTask(result.data) };
}

async function updateTask(
  id: number,
  input: TaskUpdate,
): Promise<Result<Task>> {
  if (!isValidId(id)) {
    return { ok: false, error: { error: "Invalid ID", code: "INVALID_ID" } };
  }

  // Check if task exists
  const existsResult = await taskRepository.exists(id);
  if (!existsResult.success) {
    console.error("[tasks][usecase] Update error:", existsResult.error);
    return { ok: false, error: { error: existsResult.error.message, code: "DB_ERROR" } };
  }

  if (!existsResult.data) {
    return { ok: false, error: { error: "Task not found", code: "NOT_FOUND" } };
  }

  const updateData: Record<string, unknown> = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.date !== undefined) updateData.date = new Date(input.date);

  const result = await taskRepository.update(id, updateData);

  if (!result.success) {
    console.error("[tasks][usecase] Update error:", result.error);
    return { ok: false, error: { error: result.error.message, code: "DB_ERROR" } };
  }

  return { ok: true, data: serializeTask(result.data) };
}

async function deleteTask(id: number): Promise<Result<{ message: string }>> {
  if (!isValidId(id)) {
    return { ok: false, error: { error: "Invalid ID", code: "INVALID_ID" } };
  }

  // Check if task exists
  const existsResult = await taskRepository.exists(id);
  if (!existsResult.success) {
    console.error("[tasks][usecase] Delete error:", existsResult.error);
    return { ok: false, error: { error: existsResult.error.message, code: "DB_ERROR" } };
  }

  if (!existsResult.data) {
    return { ok: false, error: { error: "Task not found", code: "NOT_FOUND" } };
  }

  const result = await taskRepository.delete(id);

  if (!result.success) {
    console.error("[tasks][usecase] Delete error:", result.error);
    return { ok: false, error: { error: result.error.message, code: "DB_ERROR" } };
  }

  return { ok: true, data: { message: "Task deleted" } };
}

export const taskUsecase = {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
