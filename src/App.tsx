import * as React from 'react';
import { liveQuery } from 'dexie';

import { db } from './db';
import { Book } from './types';
import { BookList } from './components/BookList';
import { AddBookModal } from './components/AddBookModal';

export default function App() {
  const [books, setBooks] = React.useState<Book[]>([]);
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const sub = liveQuery(() => db.books.toArray()).subscribe({
      next: setBooks,
    });
    async function loadBooks(retries = 3): Promise<void> {
      try {
        const res = await fetch('/api/books');
        if (!res.ok) throw new Error('Network response was not ok');
        const serverBooks: Book[] = await res.json();
        for (const book of serverBooks) {
          const existing = await db.books.get(book.id);
          if (!existing) {
            await db.books.add(book);
          }
        }
      } catch {
        if (retries > 0) {
          setTimeout(() => loadBooks(retries - 1), 1000);
        } else {
          setError('Failed to load books');
        }
      }
    }
    loadBooks();

    return () => sub.unsubscribe();
  }, []);

  return (
    <div>
      <button onClick={() => setModalOpen(true)}>Add a book</button>
      <BookList books={books} />
      {error && <div role="alert">{error}</div>}
      {isModalOpen && <AddBookModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

