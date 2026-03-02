// ---------------------
// Common API Types
// ---------------------

export type ApiResponse = {
  message: string;
  success: true;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
