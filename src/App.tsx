import * as React from 'react';
import { liveQuery } from 'dexie';

import { db } from './db';
import { Book, FilterState } from './types';
import { BookList } from './components/BookList';
import { AddBookModal } from './components/AddBookModal';
import { FilterControls } from './components/FilterControls';
import { selectFiltered } from './filter';

export default function App() {
  const [books, setBooks] = React.useState<Book[]>([]);
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<FilterState>({
    q: '',
    statuses: [],
    genres: [],
    tags: [],
    sortBy: 'title',
    sortDir: 'asc',
  });

  React.useEffect(() => {
    const sub = liveQuery(() => db.books.toArray()).subscribe({
      next: setBooks,
    });
    async function loadBooks(retries = 3): Promise<void> {
      try {
        const res = await fetch('/api/v1/books');
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

  const filteredBooks = React.useMemo(
    () => selectFiltered(books, filter),
    [books, filter],
  );

  return (
    <div>
      <button onClick={() => setModalOpen(true)}>Add a book</button>
      <FilterControls filter={filter} setFilter={setFilter} />
      <BookList books={filteredBooks} />
      {error && <div role="alert">{error}</div>}
      {isModalOpen && <AddBookModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
