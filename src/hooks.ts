import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Book } from './types';
import { z } from 'zod';

export function useDebounce<T>(value: T, ms = 300) {
  const [v, set] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => set(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

const GoogleBooksResponse = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        volumeInfo: z.object({
          title: z.string(),
          authors: z.array(z.string()).optional(),
          industryIdentifiers: z
            .array(z.object({ type: z.string(), identifier: z.string() }))
            .optional(),
          publishedDate: z.string().optional(),
          pageCount: z.number().optional(),
          language: z.string().optional(),
          categories: z.array(z.string()).optional(),
          imageLinks: z.object({ thumbnail: z.string().optional() }).optional(),
        }),
      }),
    )
    .optional(),
});

export async function searchGoogleBooks(q: string) {
  const res = await fetch(`/api/v1/google-books?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Failed');
  const json = await res.json();
  const data = GoogleBooksResponse.parse(json);
  return (
    data.items?.map((v) => {
      const isbn13 = v.volumeInfo.industryIdentifiers?.find((i) =>
        i.type.includes('ISBN_13'),
      )?.identifier;
      const external: Book['external'] = { googleId: v.id };
      if (isbn13) external.isbn13 = isbn13;

      const book: Partial<Book> = {
        external,
        title: v.volumeInfo.title,
        authors: v.volumeInfo.authors ?? [],
        genres: v.volumeInfo.categories ?? [],
      };
      const year = v.volumeInfo.publishedDate?.slice(0, 4);
      if (year) book.year = Number(year);
      if (v.volumeInfo.pageCount !== undefined)
        book.pages = v.volumeInfo.pageCount;
      if (v.volumeInfo.language) book.language = v.volumeInfo.language;
      const cover = v.volumeInfo.imageLinks?.thumbnail;
      if (cover) book.cover = cover;
      return book;
    }) ?? []
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
