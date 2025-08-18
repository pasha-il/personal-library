import * as React from 'react';
import { useDebounce, useExternalSearch } from '../hooks';
import { Book } from '../types';
import { db } from '../db';

export function AddBookModal({ onClose }: { onClose: () => void }) {
  const [q, setQ] = React.useState('');
  const dq = useDebounce(q, 350);
  const { data: candidates = [], isFetching } = useExternalSearch(dq);

  return (
    <div role="dialog" aria-label="Add a book">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search title, author, or ISBN"
        aria-label="Search books"
      />
      {isFetching ? (
        <span>Loading...</span>
      ) : (
        <ul>
          {candidates.map((b) => (
            <li key={b.external?.googleId}>
              <button onClick={() => addBookOptimistically(b)}>Add “{b.title}”</button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={onClose}>Close</button>
    </div>
  );
}

export async function addBookOptimistically(b: Partial<Book>) {
  const book: Book = {
    id: crypto.randomUUID(),
    title: b.title!,
    authors: b.authors ?? [],
    genres: b.genres ?? [],
    language: b.language,
    year: b.year,
    rating: undefined,
    pages: b.pages,
    status: 'wishlist',
    tags: [],
    addedAt: new Date().toISOString(),
    external: b.external,
  };
  await db.books.add(book);
  fetch('/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  }).catch(() => {
    /* show toast & retry later */
  });
}
