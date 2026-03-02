import type {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskListResponse,
  TaskSingleResponse,
  TaskDeleteResponse,
  TaskErrorResponse,
} from "shared";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${SERVER_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as TaskErrorResponse).error || "Request failed");
  }
  return data as T;
}

export const taskApi = {
  list: (query?: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (page !== undefined && page > 0) params.set("page", page.toString());
    if (limit !== undefined && limit > 0) params.set("limit", limit.toString());
    const queryString = params.toString();
    return request<TaskListResponse>(`/api/tasks${queryString ? `?${queryString}` : ""}`);
  },

  get: (id: number) => request<TaskSingleResponse>(`/api/tasks/${id}`),

  create: (body: TaskCreate) =>
    request<TaskSingleResponse>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: number, body: TaskUpdate) =>
    request<TaskSingleResponse>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (id: number) =>
    request<TaskDeleteResponse>(`/api/tasks/${id}`, {
      method: "DELETE",
    }),
};

export type { Task, TaskCreate, TaskUpdate };
