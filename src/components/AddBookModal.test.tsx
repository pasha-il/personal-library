import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddBookModal } from './AddBookModal';
import { useDebounce, useExternalSearch } from '../hooks';
import { db } from '../db';

jest.mock('../hooks', () => ({
  useDebounce: jest.fn((v: any) => v),
  useExternalSearch: jest.fn(),
}));

jest.mock('../db', () => ({
  db: { books: { add: jest.fn() } },
  sendOrQueue: jest.fn().mockResolvedValue(undefined),
}));

const mockedUseExternalSearch = useExternalSearch as unknown as jest.Mock;

describe('AddBookModal', () => {
  it('renders candidates and adds a book', async () => {
    mockedUseExternalSearch.mockReturnValue({
      data: [{ title: 'Test', authors: [], external: { googleId: 'g1' } }],
      isFetching: false,
    });
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    render(<AddBookModal onClose={() => {}} />);
    expect(screen.getByText('Add “Test”')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Cover URL'), {
      target: { value: 'http://example.com/c.jpg' },
    });
    fireEvent.click(screen.getByText('Add “Test”'));
    await waitFor(() =>
      expect(db.books.add).toHaveBeenCalledWith(
        expect.objectContaining({ cover: 'http://example.com/c.jpg' })
      )
    );
  });
});
