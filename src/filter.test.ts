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
