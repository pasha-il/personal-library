import { Book, FilterState } from './types';

type SortDir = FilterState['sortDir'];

function normalize<K extends keyof Book>(b: Book, field: K): string | number {
  const value = b[field];
  if (field === 'authors') {
    return b.authors[0]?.toLowerCase() ?? '';
  }
  if (typeof value === 'string') return value.toLowerCase();
  if (typeof value === 'number') return value;
  return 0;
}

function compare<K extends keyof Book>(a: Book, b: Book, field: K, dir: SortDir): number {
  const mult = dir === 'asc' ? 1 : -1;
  const av = normalize(a, field);
  const bv = normalize(b, field);
  if (av === bv) return 0;
  return av > bv ? mult : -mult;
}

export const selectFiltered = (books: Book[], f: FilterState) =>
  books
    .filter(b =>
      (!f.q || [b.title, ...b.authors].join(' ').toLowerCase().includes(f.q.toLowerCase())) &&
      (!f.statuses.length || f.statuses.includes(b.status)) &&
      (!f.genres.length || f.genres.some(g => b.genres.includes(g))) &&
      (!f.tags.length || f.tags.every(t => b.tags.includes(t))) &&
      (!f.language || b.language === f.language) &&
      (!f.minYear || (b.year ?? 0) >= f.minYear) &&
      (!f.maxYear || (b.year ?? 9999) <= f.maxYear) &&
      (!f.minRating || (b.rating ?? 0) >= f.minRating)
    )
    .sort((a, b) =>
      f.sortBy === 'author'
        ? compare(a, b, 'authors', f.sortDir)
        : compare(a, b, f.sortBy, f.sortDir)
    );
