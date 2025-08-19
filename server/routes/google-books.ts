import { Router } from 'express';
import { GoogleBooksQuerySchema } from '../schemas';

const router = Router();

const gbCache = new Map<string, { ts: number; data: any }>();
const CACHE_MS = 1000 * 60 * 60; // 1 hour

router.get('/', async (req, res) => {
  const parse = GoogleBooksQuerySchema.safeParse(req.query);
  if (!parse.success) {
    return res.status(400).json({
      code: 'BAD_REQUEST',
      message: 'Invalid query',
      details: parse.error.flatten(),
    });
  }
  const { q } = parse.data;
  const cached = gbCache.get(q);
  if (cached && Date.now() - cached.ts < CACHE_MS) {
    return res.json(cached.data);
  }
  const url = new URL('https://www.googleapis.com/books/v1/volumes');
  url.searchParams.set('q', q);
  url.searchParams.set('maxResults', '20');
  const key = process.env.GOOGLE_BOOKS_KEY;
  if (key) url.searchParams.set('key', key);
  try {
    const r = await fetch(url);
    if (!r.ok) {
      return res.status(500).json({
        code: 'INTERNAL',
        message: 'Failed to fetch',
        details: r.statusText,
      });
    }
    const data = await r.json();
    gbCache.set(q, { ts: Date.now(), data });
    res.json(data);
  } catch (e) {
    res.status(500).json({
      code: 'INTERNAL',
      message: 'Failed to fetch',
      details: e instanceof Error ? e.message : e,
    });
  }
});

export default router;
