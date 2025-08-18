export type ReadingStatus = 'reading' | 'completed' | 'paused' | 'dnf' | 'wishlist';

export type Book = {
  id: string;
  title: string;
  authors: string[];
  genres: string[];
  language?: string;
  year?: number;
  rating?: number;
  pages?: number;
  status: ReadingStatus;
  tags: string[];
  addedAt: string; // ISO
  external?: { googleId?: string; openLibraryId?: string; isbn13?: string };
};

export type FilterState = {
  q: string;
  statuses: ReadingStatus[];
  genres: string[];
  minYear?: number;
  maxYear?: number;
  minRating?: number;
  tags: string[];
  language?: string;
  sortBy: 'title' | 'author' | 'addedAt' | 'year' | 'rating';
  sortDir: 'asc' | 'desc';
};
