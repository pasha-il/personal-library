import Dexie, { Table } from 'dexie';
import { Book } from './types';

class DB extends Dexie {
  books!: Table<Book, string>;
  constructor() {
    super('books');
    this.version(1).stores({
      books: 'id, title, year, status, *authors, *tags',
    });
  }
}

export const db = new DB();

export async function updateBook(book: Book) {
  await db.books.put(book);
  fetch(`/api/books/${book.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  }).catch(() => {
    /* show toast & retry later */
  });
}

export async function deleteBook(id: string) {
  await db.books.delete(id);
  fetch(`/api/books/${id}`, { method: 'DELETE' }).catch(() => {
    /* show toast & retry later */
  });
}
