export interface ApiResponse<T> {

  success: boolean;

  message: string;

  data: T;
}

/*
|--------------------------------------------------------------------------
| PAGINATION
|--------------------------------------------------------------------------
*/

export interface PaginationMeta {

  current_page: number;

  last_page: number;

  per_page: number;

  total: number;
}

export interface PaginatedData<T>
  extends PaginationMeta {

  data: T[];
}

export interface PaginatedResponse<T> {

  success: boolean;

  message: string;

  data: PaginatedData<T>;
}

export type LaravelPaginatedResponse<T> =
  PaginatedResponse<T>;