import * as React from 'react';
import { useDebounce, useExternalSearch } from '../hooks';
import { Book } from '../types';
import { db, sendOrQueue } from '../db';

export function AddBookModal({ onClose }: { onClose: () => void }) {
  const [q, setQ] = React.useState('');
  const dq = useDebounce(q, 350);
  const { data: candidates = [], isFetching } = useExternalSearch(dq);
  const [coverUrl, setCoverUrl] = React.useState('');
  const [coverFile, setCoverFile] = React.useState<string | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCoverFile(reader.result as string);
    reader.readAsDataURL(file);
  }

  const resolvedCover = coverFile || coverUrl || undefined;

  return (
    <div role="dialog" aria-label="Add a book">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search title, author, or ISBN"
        aria-label="Search books"
      />
      <label>
        Cover URL
        <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />
      </label>
      <label>
        Upload Cover
        <input type="file" accept="image/*" onChange={onFileChange} />
      </label>
      {isFetching ? (
        <span>Loading...</span>
      ) : (
        <ul>
          {candidates.map((b) => (
            <li key={b.external?.googleId}>
              <button
                onClick={() =>
                  addBookOptimistically({
                    ...b,
                    ...(resolvedCover || (b as any).cover
                      ? { cover: resolvedCover || (b as any).cover }
                      : {}),
                  })
                }
              >
                Add “{b.title}”
              </button>
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
    ...(b.language !== undefined ? { language: b.language } : {}),
    ...(b.year !== undefined ? { year: b.year } : {}),
    ...(b.pages !== undefined ? { pages: b.pages } : {}),
    status: 'wishlist',
    tags: [],
    addedAt: new Date().toISOString(),
    ...(b.cover !== undefined ? { cover: b.cover } : {}),
    ...(b.external !== undefined ? { external: b.external } : {}),
  };
  await db.books.add(book);
  await sendOrQueue('/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  });
}
