import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { BookSchema, BookIdSchema, type Book } from '../schemas';

const router = Router();
const prisma = new PrismaClient();

function formatBook(book: any): Book {
  return {
    id: book.id,
    title: book.title,
    authors: book.authors.map((a: any) => a.name),
  };
}

router.post('/', async (req, res) => {
  const parse = BookSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({
      code: 'BAD_REQUEST',
      message: 'Invalid book',
      details: parse.error.flatten(),
    });
  }
  const book = parse.data;
  try {
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
  } catch (e) {
    res.status(500).json({
      code: 'INTERNAL',
      message: 'Failed to add book',
      details: e instanceof Error ? e.message : e,
    });
  }
});

router.get('/', async (_req, res) => {
  try {
    const books = await prisma.book.findMany({ include: { authors: true } });
    res.json(books.map(formatBook));
  } catch (e) {
    res.status(500).json({
      code: 'INTERNAL',
      message: 'Failed to read books',
      details: e instanceof Error ? e.message : e,
    });
  }
});

router.put('/:id', async (req, res) => {
  const idParse = BookIdSchema.safeParse(req.params);
  if (!idParse.success) {
    return res.status(400).json({
      code: 'BAD_REQUEST',
      message: 'Invalid id',
      details: idParse.error.flatten(),
    });
  }
  const parse = BookSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({
      code: 'BAD_REQUEST',
      message: 'Invalid book',
      details: parse.error.flatten(),
    });
  }
  const book = parse.data;
  const { id } = idParse.data;
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
  } catch (e) {
    res.status(500).json({
      code: 'INTERNAL',
      message: 'Failed to update book',
      details: e instanceof Error ? e.message : e,
    });
  }
});

router.delete('/:id', async (req, res) => {
  const idParse = BookIdSchema.safeParse(req.params);
  if (!idParse.success) {
    return res.status(400).json({
      code: 'BAD_REQUEST',
      message: 'Invalid id',
      details: idParse.error.flatten(),
    });
  }
  const { id } = idParse.data;
  try {
    const removed = await prisma.book.delete({
      where: { id },
      include: { authors: true },
    });
    res.json(formatBook(removed));
  } catch (e) {
    res.status(500).json({
      code: 'INTERNAL',
      message: 'Failed to delete book',
      details: e instanceof Error ? e.message : e,
    });
  }
});

export default router;
