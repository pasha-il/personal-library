import Dexie, { Table } from 'dexie';
import { Book } from './types';
import { notify } from './notifications';

export interface PendingRequest {
  id?: number;
  url: string;
  options: RequestInit;
}

class DB extends Dexie {
  books!: Table<Book, string>;
  pendingRequests!: Table<PendingRequest, number>;
  constructor() {
    super('books');
    this.version(1).stores({
      books: 'id, title, year, status, *authors, *tags',
    });
    this.version(2).stores({
      books: 'id, title, year, status, *authors, *tags',
      pendingRequests: '++id',
    });
  }
}

export const db = new DB();

export async function sendOrQueue(url: string, options: RequestInit) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error('Network response was not ok');
  } catch {
    await db.pendingRequests.add({ url, options });
    notify('Network error. Saved locally and will retry when online.');
  }
}

export async function syncPendingRequests() {
  if (!navigator.onLine) return;
  const pending = await db.pendingRequests.toArray();
  if (!pending.length) return;
  let succeeded = false;
  for (const req of pending) {
    try {
      const res = await fetch(req.url, req.options);
      if (!res.ok) throw new Error('Network response was not ok');
      await db.pendingRequests.delete(req.id!);
      succeeded = true;
    } catch {
      // keep request in queue
    }
  }
  if (succeeded) {
    notify('Pending changes synced.');
  }
}

window.addEventListener('online', syncPendingRequests);

export async function updateBook(book: Book) {
  await db.books.put(book);
  await sendOrQueue(`/api/v1/books/${book.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  });
}

export async function deleteBook(id: string) {
  await db.books.delete(id);
  await sendOrQueue(`/api/v1/books/${id}`, { method: 'DELETE' });
}
