import type {
  User,
  UserCreate,
  UserUpdate,
  UserListResponse,
  UserSingleResponse,
  UserDeleteResponse,
  UserResetPasswordResponse,
  UserErrorResponse,
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
    throw new Error((data as UserErrorResponse).error || "Request failed");
  }
  return data as T;
}

export const userApi = {
  list: (query?: string, role?: number, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (role !== undefined && role !== null) params.set("role", role.toString());
    if (page !== undefined && page > 0) params.set("page", page.toString());
    if (limit !== undefined && limit > 0) params.set("limit", limit.toString());
    const queryString = params.toString();
    return request<UserListResponse>(`/api/users${queryString ? `?${queryString}` : ""}`);
  },

  get: (id: string) => request<UserSingleResponse>(`/api/users/${id}`),

  create: (body: UserCreate) =>
    request<UserSingleResponse>("/api/users", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: string, body: UserUpdate) =>
    request<UserSingleResponse>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    request<UserDeleteResponse>(`/api/users/${id}`, {
      method: "DELETE",
    }),

  resetPassword: (id: string) =>
    request<UserResetPasswordResponse>(`/api/users/${id}/reset-password`, {
      method: "POST",
    }),
};

export type { User, UserCreate, UserUpdate };
