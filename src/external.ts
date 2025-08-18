export const openLibCover = (olId?: string, isbn13?: string) =>
  isbn13
    ? `https://covers.openlibrary.org/b/isbn/${isbn13}-M.jpg`
    : olId
    ? `https://covers.openlibrary.org/b/olid/${olId}-M.jpg`
    : undefined;
