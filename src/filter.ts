import { Book, FilterState } from './types';

type SortFields = FilterState['sortBy'];
type SortDir = FilterState['sortDir'];

function compare(a: Book, b: Book, field: SortFields, dir: SortDir): number {
  const mult = dir === 'asc' ? 1 : -1;
  let av: any = a[field as keyof Book];
  let bv: any = b[field as keyof Book];
  if (typeof av === 'string') av = av.toLowerCase();
  if (typeof bv === 'string') bv = bv.toLowerCase();
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
    .sort((a, b) => compare(a, b, f.sortBy, f.sortDir));
