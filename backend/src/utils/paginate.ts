import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Build skip/take from page/limit and wrap the result with pagination meta.
 */
export function paginate<T>(
  items: T[],
  total: number,
  { page, limit }: PaginationInput
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export function skipTake({ page, limit }: PaginationInput) {
  return { skip: (page - 1) * limit, take: limit };
}
