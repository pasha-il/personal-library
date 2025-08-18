import * as React from 'react';
import { Book } from '../types';
import { updateBook } from '../db';

export function EditBookModal({ book, onClose }: { book: Book; onClose: () => void }) {
  const [title, setTitle] = React.useState(book.title);
  const [authors, setAuthors] = React.useState(book.authors.join(', '));
  const [coverUrl, setCoverUrl] = React.useState(book.cover ?? '');
  const [coverFile, setCoverFile] = React.useState<string | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCoverFile(reader.result as string);
    reader.readAsDataURL(file);
  }

  const resolvedCover = coverFile || coverUrl || undefined;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const updated: Book = {
      ...book,
      title,
      authors: authors.split(',').map((a) => a.trim()).filter(Boolean),
      ...(resolvedCover !== undefined ? { cover: resolvedCover } : {}),
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
        <label>
          Cover URL
          <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />
        </label>
        <label>
          Upload Cover
          <input type="file" accept="image/*" onChange={onFileChange} />
        </label>
        <button type="submit">Save</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
}

