import { selectFiltered } from './filter';
import { Book, FilterState } from './types';

const books: Book[] = [
  {
    id: '1',
    title: 'Zeta',
    authors: ['Alice'],
    genres: [],
    language: 'en',
    year: 2000,
    rating: undefined,
    pages: undefined,
    status: 'reading',
    tags: [],
    addedAt: '2020-01-01',
  },
  {
    id: '2',
    title: 'Alpha',
    authors: ['Bob'],
    genres: [],
    language: 'en',
    year: 1990,
    rating: undefined,
    pages: undefined,
    status: 'wishlist',
    tags: [],
    addedAt: '2021-01-01',
  },
];

const baseFilter: FilterState = {
  q: '',
  statuses: [],
  genres: [],
  minYear: undefined,
  maxYear: undefined,
  minRating: undefined,
  tags: [],
  language: undefined,
  sortBy: 'title',
  sortDir: 'asc',
};

test('filters by query', () => {
  const res = selectFiltered(books, { ...baseFilter, q: 'alp' });
  expect(res).toEqual([books[1]]);
});

test('sorts by year ascending', () => {
  const res = selectFiltered(books, { ...baseFilter, sortBy: 'year', sortDir: 'asc' });
  expect(res.map((b) => b.year)).toEqual([1990, 2000]);
});

test('sorts by title ascending', () => {
  const res = selectFiltered(books, { ...baseFilter, sortBy: 'title', sortDir: 'asc' });
  expect(res.map((b) => b.title)).toEqual(['Alpha', 'Zeta']);
});

test('handles undefined numeric fields when sorting', () => {
  const ratingBooks: Book[] = [
    {
      id: '1',
      title: 'A',
      authors: ['A'],
      genres: [],
      language: 'en',
      year: 2000,
      rating: undefined,
      pages: undefined,
      status: 'reading',
      tags: [],
      addedAt: '2020-01-01',
    },
    {
      id: '2',
      title: 'B',
      authors: ['B'],
      genres: [],
      language: 'en',
      year: 2001,
      rating: 4,
      pages: undefined,
      status: 'reading',
      tags: [],
      addedAt: '2020-01-02',
    },
  ];
  const res = selectFiltered(ratingBooks, { ...baseFilter, sortBy: 'rating', sortDir: 'asc' });
  expect(res.map((b) => b.rating)).toEqual([undefined, 4]);
});

test('handles missing authors when sorting by author', () => {
  const authorBooks: Book[] = [
    {
      id: '1',
      title: 'A',
      authors: [],
      genres: [],
      language: 'en',
      year: 2000,
      rating: undefined,
      pages: undefined,
      status: 'reading',
      tags: [],
      addedAt: '2020-01-01',
    },
    {
      id: '2',
      title: 'B',
      authors: ['Bob'],
      genres: [],
      language: 'en',
      year: 2000,
      rating: undefined,
      pages: undefined,
      status: 'reading',
      tags: [],
      addedAt: '2020-01-02',
    },
  ];
  const res = selectFiltered(authorBooks, { ...baseFilter, sortBy: 'author', sortDir: 'asc' });
  expect(res.map((b) => b.id)).toEqual(['1', '2']);
});
