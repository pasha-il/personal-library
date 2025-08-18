import * as React from 'react';
import { FixedSizeList as List } from 'react-window';
import { Book } from '../types';

function BookRow({ book, style }: { book: Book; style: React.CSSProperties }) {
  return (
    <div style={style}>
      <strong>{book.title}</strong>
      <span> by {book.authors.join(', ')}</span>
    </div>
  );
}

export function BookList({ books }: { books: Book[] }) {
  return (
    <List height={600} itemCount={books.length} itemSize={88} width="100%">
      {({ index, style }) => (
        <BookRow key={books[index].id} style={style} book={books[index]} />
      )}
    </List>
  );
}
