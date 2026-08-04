import { useMemo } from "react";
import { BOOKS } from "../data/books";
import type { Book } from "../types/book";

export type BookListFilters = {
  isNew?: boolean;
  sortBy?: "popularity" | "newest";
  limit?: number;
  excludeIds?: string[];
};

export function useBookList(filters: BookListFilters = {}): Book[] {
  const { isNew, sortBy, limit, excludeIds } = filters;

  return useMemo(() => {
    let list = BOOKS.slice();

    if (isNew !== undefined) {
      list = list.filter((b) => !!b.isNew === isNew);
    }
    if (excludeIds && excludeIds.length > 0) {
      const excluded = new Set(excludeIds);
      list = list.filter((b) => !excluded.has(b.id));
    }

    if (sortBy === "popularity") {
      list = list.sort((a, b) => (b.readCount ?? 0) - (a.readCount ?? 0));
    } else if (sortBy === "newest") {
      list = list.sort((a, b) => new Date(b.addedAt ?? 0).getTime() - new Date(a.addedAt ?? 0).getTime());
    }

    return typeof limit === "number" ? list.slice(0, limit) : list;
  }, [isNew, sortBy, limit, excludeIds]);
}
