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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

