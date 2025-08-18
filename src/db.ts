import Dexie, { Table } from 'dexie';
import { Book } from './types';

class DB extends Dexie {
  books!: Table<Book, string>;
  constructor() {
    super('books');
    this.version(1).stores({
      books: 'id, title, year, status, *authors, *tags',
    });
  }
}

export const db = new DB();
