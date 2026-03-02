// Base repository types and interfaces

export type RepositoryError = {
  message: string;
  code: string;
  originalError?: unknown;
};

export type RepositoryResult<T> =
  | { success: true; data: T }
  | { success: false; error: RepositoryError };

export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedData<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function createError(message: string, code: string, originalError?: unknown): RepositoryError {
  return { message, code, originalError };
}

export function success<T>(data: T): RepositoryResult<T> {
  return { success: true, data };
}

export function failure<T>(error: RepositoryError): RepositoryResult<T> {
  return { success: false, error };
}
