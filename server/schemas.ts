import { z } from 'zod';

export const BookSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
});
export type Book = z.infer<typeof BookSchema>;

export const BookIdSchema = z.object({
  id: z.string(),
});

export const GoogleBooksQuerySchema = z.object({
  q: z.string().trim().min(1),
});
