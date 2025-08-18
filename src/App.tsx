import * as React from 'react';
import { liveQuery } from 'dexie';

import { db } from './db';
import { Book } from './types';
import { BookList } from './components/BookList';
import { AddBookModal } from './components/AddBookModal';

export default function App() {
  const [books, setBooks] = React.useState<Book[]>([]);
  const [isModalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    const sub = liveQuery(() => db.books.toArray()).subscribe({
      next: setBooks,
    });
    return () => sub.unsubscribe();
  }, []);

  return (
    <div>
      <button onClick={() => setModalOpen(true)}>Add a book</button>
      <BookList books={books} />
      {isModalOpen && <AddBookModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

