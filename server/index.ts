import express from 'express';
import { PrismaClient } from '@prisma/client';

interface Book {
  id: string;
  title: string;
  authors: string[];
  [key: string]: any;
}

const app = express();
app.use(express.json());

const gbCache = new Map<string, { ts: number; data: any }>();
const CACHE_MS = 1000 * 60 * 60; // 1 hour

const prisma = new PrismaClient();

function formatBook(book: any): Book {
  return {
    id: book.id,
    title: book.title,
    authors: book.authors.map((a: any) => a.name),
  };
}

app.post('/api/books', async (req, res) => {
  try {
    const book: Book = req.body;
    const created = await prisma.book.create({
      data: {
        id: book.id,
        title: book.title,
        authors: {
          connectOrCreate: book.authors.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { authors: true },
    });
    res.status(201).json(formatBook(created));
  } catch {
    res.status(500).json({ error: 'Failed to add book' });
  }
});

app.get('/api/books', async (_req, res) => {
  try {
    const books = await prisma.book.findMany({ include: { authors: true } });
    res.json(books.map(formatBook));
  } catch {
    res.status(500).json({ error: 'Failed to read books' });
  }
});

app.put('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  const book: Book = req.body;
  try {
    const updated = await prisma.book.update({
      where: { id },
      data: {
        title: book.title,
        authors: {
          set: [],
          connectOrCreate: book.authors.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { authors: true },
    });
    res.json(formatBook(updated));
  } catch {
    res.status(500).json({ error: 'Failed to update book' });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const removed = await prisma.book.delete({
      where: { id },
      include: { authors: true },
    });
    res.json(formatBook(removed));
  } catch {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

app.get('/api/google-books', async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  if (!q) return res.status(400).json({});
  const cached = gbCache.get(q);
  if (cached && Date.now() - cached.ts < CACHE_MS) {
    return res.json(cached.data);
  }
  const url = new URL('https://www.googleapis.com/books/v1/volumes');
  url.searchParams.set('q', q);
  url.searchParams.set('maxResults', '20');
  const key = process.env.GOOGLE_BOOKS_KEY;
  if (key) url.searchParams.set('key', key);
  const r = await fetch(url);
  if (!r.ok) return res.status(500).end();
  const data = await r.json();
  gbCache.set(q, { ts: Date.now(), data });
  res.json(data);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
