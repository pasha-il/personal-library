import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.join(__dirname, 'books.json');

function readBooks(): Book[] {
  try {
    const data = fs.readFileSync(dataFile, 'utf-8');
    return JSON.parse(data) as Book[];
  } catch {
    return [];
  }
}

function writeBooks(books: Book[]): void {
  fs.writeFileSync(dataFile, JSON.stringify(books, null, 2));
}

app.post('/api/books', (req, res) => {
  const book: Book = req.body;
  const books = readBooks();
  books.push(book);
  writeBooks(books);
  res.status(201).json(book);
});

app.get('/api/books', (_req, res) => {
  const books = readBooks();
  res.json(books);
});

app.put('/api/books/:id', (req, res) => {
  const { id } = req.params;
  const book: Book = req.body;
  const books = readBooks();
  const idx = books.findIndex((b) => b.id === id);
  if (idx >= 0) {
    books[idx] = book;
    writeBooks(books);
    res.json(book);
  } else {
    res.status(404).end();
  }
});

app.delete('/api/books/:id', (req, res) => {
  const { id } = req.params;
  const books = readBooks();
  const idx = books.findIndex((b) => b.id === id);
  if (idx >= 0) {
    const [removed] = books.splice(idx, 1);
    writeBooks(books);
    res.json(removed);
  } else {
    res.status(404).end();
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

