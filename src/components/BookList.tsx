import * as React from 'react';
import { FixedSizeList as List } from 'react-window';
import { Book } from '../types';
import { deleteBook } from '../db';
import { EditBookModal } from './EditBookModal';

function BookRow({
  book,
  style,
  onEdit,
  onDelete,
}: {
  book: Book;
  style: React.CSSProperties;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div style={{ ...style, display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1 }}>
        <strong>{book.title}</strong>
        <span> by {book.authors.join(', ')}</span>
      </div>
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  );
}

export function BookList({ books }: { books: Book[] }) {
  const [editing, setEditing] = React.useState<Book | null>(null);
  return (
    <>
      <List height={600} itemCount={books.length} itemSize={88} width="100%">
        {({ index, style }) => (
          <BookRow
            key={books[index].id}
            style={style}
            book={books[index]}
            onEdit={() => setEditing(books[index])}
            onDelete={() => deleteBook(books[index].id)}
          />
        )}
      </List>
      {editing && (
        <EditBookModal book={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
