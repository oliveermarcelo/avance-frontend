export interface FrappeResponse<T> {
  message: T;
}

export interface FrappeError {
  exc_type: string;
  exception: string;
  _server_messages?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}