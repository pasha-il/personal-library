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
      })
    )
    .optional(),
});

export async function searchGoogleBooks(q: string) {
  const res = await fetch(`/api/google-books?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Failed');
  const json = await res.json();
  const data = GoogleBooksResponse.parse(json);
  return (
    data.items?.map((v) => ({
      external: {
        googleId: v.id,
        isbn13: v.volumeInfo.industryIdentifiers?.find((i) => i.type.includes('ISBN_13'))?.identifier,
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
