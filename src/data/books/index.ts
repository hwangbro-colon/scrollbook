import type { Book } from "../../types/book";
import unsuJoheunNal from "./unsu-joheun-nal.json";
import byeoljubujeon from "./byeoljubujeon.json";

const RAW_BOOKS = [unsuJoheunNal, byeoljubujeon] as unknown as Book[];

// Safety net: a book is only ever loaded into the app if it's explicitly
// marked public_domain AND declares where its text came from. Anything
// else (e.g. a copyrighted work added by mistake) is silently dropped here
// rather than reaching any screen.
export const BOOKS: Book[] = RAW_BOOKS.filter((book) => {
  const isPublicDomain = book.copyrightStatus === "public_domain";
  const hasSource = typeof book.source === "string" && book.source.trim().length > 0;
  if (!isPublicDomain || !hasSource) {
    console.warn(`[books] Excluded "${book.title ?? book.id}" — missing public_domain status or source field.`);
    return false;
  }
  return true;
});
