import * as React from 'react';
import { Book } from '../types';
import { updateBook } from '../db';

export function EditBookModal({ book, onClose }: { book: Book; onClose: () => void }) {
  const [title, setTitle] = React.useState(book.title);
  const [authors, setAuthors] = React.useState(book.authors.join(', '));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const updated: Book = {
      ...book,
      title,
      authors: authors.split(',').map((a) => a.trim()).filter(Boolean),
    };
    await updateBook(updated);
    onClose();
  }

  return (
    <div role="dialog" aria-label={`Edit ${book.title}`}>
      <form onSubmit={onSubmit}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Authors
          <input value={authors} onChange={(e) => setAuthors(e.target.value)} />
        </label>
        <button type="submit">Save</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
}

