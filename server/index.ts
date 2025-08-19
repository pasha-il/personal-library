import express from 'express';
import booksRouter from './routes/books';
import googleBooksRouter from './routes/google-books';
import authMiddleware from './middleware/auth';

const app = express();
app.use(express.json());

app.use('/api/v1', authMiddleware);
app.use('/api/v1/books', booksRouter);
app.use('/api/v1/google-books', googleBooksRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
