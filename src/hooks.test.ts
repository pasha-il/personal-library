import { renderHook, act } from '@testing-library/react';
import { useDebounce, searchGoogleBooks, useExternalSearch } from './hooks';
import { useQuery } from '@tanstack/react-query';

jest.mock('@tanstack/react-query', () => ({ useQuery: jest.fn() }));

// useDebounce tests
describe('useDebounce', () => {
  jest.useFakeTimers();
  test('debounces updates', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'a' },
    });
    expect(result.current).toBe('a');
    rerender({ value: 'b' });
    expect(result.current).toBe('a');
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('b');
  });
});

// searchGoogleBooks tests
describe('searchGoogleBooks', () => {
  test('maps fetch results', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: '1',
            volumeInfo: {
              title: 'Test',
              authors: ['Ann'],
              industryIdentifiers: [{ type: 'ISBN_13', identifier: '123' }],
              publishedDate: '2001',
              pageCount: 100,
              language: 'en',
              categories: ['Fiction'],
              imageLinks: { thumbnail: 'url' },
            },
          },
        ],
      }),
    });
    // @ts-ignore
    global.fetch = fetchMock;
    const res = await searchGoogleBooks('foo bar');
    expect(fetchMock).toHaveBeenCalledWith('/api/google-books?q=foo%20bar');
    expect(res[0]).toMatchObject({
      title: 'Test',
      authors: ['Ann'],
      external: { googleId: '1', isbn13: '123' },
    });
  });
});

// useExternalSearch tests
const mockUseQuery = useQuery as unknown as jest.Mock;

describe('useExternalSearch', () => {
  test('enables query only for length > 2', () => {
    mockUseQuery.mockReturnValue({});
    useExternalSearch('hi');
    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['gb', 'hi'],
      queryFn: expect.any(Function),
      enabled: false,
      staleTime: 600000,
    });
    useExternalSearch('hello');
    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['gb', 'hello'],
      queryFn: expect.any(Function),
      enabled: true,
      staleTime: 600000,
    });
  });
});
