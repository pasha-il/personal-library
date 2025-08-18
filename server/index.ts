import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface Book {
  title: string;
  author: string;
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

