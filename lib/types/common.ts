import { Prisma } from "@prisma/client";

export type ListingArgsType<T> = {
  filter: Record<string, T>;
  limit: number;
  number_page: number;
  sort?: Record<string, Prisma.SortOrder>;
};
