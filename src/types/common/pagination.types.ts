export type Ordre = "asc" | "desc";

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
}

export interface Page<T> {
  data: T[];
  meta: PageMeta;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  ordre?: Ordre;
}
