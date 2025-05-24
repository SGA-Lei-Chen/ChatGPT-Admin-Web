import type { Pagination } from "@achat/db/types";
import { type AnyColumn, and, asc, desc, sql } from "drizzle-orm";
import type { PgSelect } from "drizzle-orm/pg-core";
import db from "..";

export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}

export async function withPagination<T extends PgSelect>(
  qb: T,
  params: { page?: number; perPage?: number } = {},
) {
  const { page = 1, perPage = 10 } = params;

  const offset = (page - 1) * perPage;

  // 构建计数查询
  const countQuery = sql`SELECT COUNT(*) as count FROM (${qb.getSQL()}) as sub`;

  // 并行执行查询
  const [rows, [{ count }]] = await Promise.all([
    qb.limit(perPage).offset(offset),
    db.execute(countQuery),
  ]);

  const total = Number(count);
  const totalPages = Math.ceil(total / perPage);

  return {
    data: rows,
    pagination: {
      totalNumber: total,
      pageSize: perPage,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
