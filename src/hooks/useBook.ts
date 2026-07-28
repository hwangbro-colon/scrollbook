import { useMemo } from "react";
import { BOOKS } from "../data/books";
import type { Book } from "../types/book";

export function useBook(bookId: string): Book | undefined {
  return useMemo(() => BOOKS.find((b) => b.id === bookId), [bookId]);
}
