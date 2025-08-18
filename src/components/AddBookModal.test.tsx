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
}));

const mockedUseExternalSearch = useExternalSearch as unknown as jest.Mock;

describe('AddBookModal', () => {
  it('renders candidates and adds a book', async () => {
    mockedUseExternalSearch.mockReturnValue({
      data: [{ title: 'Test', authors: [] }],
      isFetching: false,
    });
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    render(<AddBookModal onClose={() => {}} />);
    expect(screen.getByText('Add “Test”')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Add “Test”'));
    await waitFor(() => expect(db.books.add).toHaveBeenCalled());
  });
});
