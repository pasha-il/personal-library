import { render, screen, fireEvent } from '@testing-library/react';
import { BookList } from './BookList';
import { Book } from '../types';

jest.mock('react-window', () => ({
  FixedSizeList: ({ itemCount, children }: any) => (
    <div>{Array.from({ length: itemCount }).map((_, i) => children({ index: i, style: {} }))}</div>
  ),
}));

const deleteBook = jest.fn();

jest.mock('../db', () => ({
  deleteBook: (id: string) => deleteBook(id),
}));

jest.mock('./EditBookModal', () => ({
  EditBookModal: ({ book, onClose }: any) => (
    <div role="dialog">
      Editing {book.title}
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const books: Book[] = [
  {
    id: '1',
    title: 'Book One',
    authors: ['Ann'],
    genres: [],
    language: 'en',
    year: undefined,
    rating: undefined,
    pages: undefined,
    status: 'reading',
    tags: [],
    addedAt: '2020-01-01',
  },
];

test('renders books and handles delete', () => {
  render(<BookList books={books} />);
  expect(screen.getByText('Book One')).toBeInTheDocument();
  expect(screen.getByText('No cover')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Delete'));
  expect(deleteBook).toHaveBeenCalledWith('1');
});

test('opens edit modal', () => {
  render(<BookList books={books} />);
  fireEvent.click(screen.getByText('Edit'));
  expect(screen.getByRole('dialog')).toHaveTextContent('Editing Book One');
});
