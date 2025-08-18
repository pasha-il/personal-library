import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Book } from './types';

export function useDebounce<T>(value: T, ms = 300) {
  const [v, set] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => set(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

export async function searchGoogleBooks(q: string) {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20`);
  if (!res.ok) throw new Error('Failed');
  const data = await res.json();
  return (
    data.items?.map((v: any) => ({
      external: {
        googleId: v.id,
        isbn13: v.volumeInfo.industryIdentifiers?.find((i: any) => i.type.includes('ISBN_13'))?.identifier,
      },
      title: v.volumeInfo.title,
      authors: v.volumeInfo.authors ?? [],
      year: Number(v.volumeInfo.publishedDate?.slice(0, 4)),
      pages: v.volumeInfo.pageCount,
      language: v.volumeInfo.language,
      genres: v.volumeInfo.categories ?? [],
      cover: v.volumeInfo.imageLinks?.thumbnail,
    })) ?? []
  );
}

export function useExternalSearch(debouncedQ: string) {
  return useQuery({
    queryKey: ['gb', debouncedQ],
    queryFn: () => searchGoogleBooks(debouncedQ),
    enabled: debouncedQ.length > 2,
    staleTime: 1000 * 60 * 10,
  });
}
