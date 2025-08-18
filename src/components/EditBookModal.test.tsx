import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditBookModal } from './EditBookModal';
import { Book } from '../types';

const updateBook = jest.fn();

jest.mock('../db', () => ({
  updateBook: (book: Book) => updateBook(book),
}));

const sampleBook: Book = {
  id: '1',
  title: 'Original Title',
  authors: ['Author One'],
  genres: [],
  language: 'en',
  status: 'reading',
  tags: [],
  addedAt: '2020-01-01',
};

test('updates book and calls updateBook', async () => {
  render(<EditBookModal book={sampleBook} onClose={() => {}} />);

  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Updated Title' },
  });
  fireEvent.change(screen.getByLabelText('Authors'), {
    target: { value: 'Author One, Author Two' },
  });
  fireEvent.change(screen.getByLabelText('Cover URL'), {
    target: { value: 'http://example.com/new.jpg' },
  });

  fireEvent.click(screen.getByText('Save'));

  await waitFor(() =>
    expect(updateBook).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Updated Title',
        authors: ['Author One', 'Author Two'],
        cover: 'http://example.com/new.jpg',
      })
    )
  );
});

