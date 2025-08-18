import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterControls } from './FilterControls';
import { FilterState } from '../types';

const baseFilter: FilterState = {
  q: '',
  statuses: [],
  genres: [],
  tags: [],
  sortBy: 'title',
  sortDir: 'asc',
};

test('updates search query', async () => {
  const user = userEvent.setup();
  const setFilter = jest.fn();
  render(<FilterControls filter={baseFilter} setFilter={setFilter} />);
  const input = screen.getByLabelText(/search books/i);
  await user.type(input, 'abc');
  expect(setFilter).toHaveBeenCalledTimes(3);
});

test('toggles status filter', async () => {
  const user = userEvent.setup();
  const setFilter = jest.fn();
  render(<FilterControls filter={baseFilter} setFilter={setFilter} />);
  const checkbox = screen.getByLabelText(/reading/i);
  await user.click(checkbox);
  const updater = setFilter.mock.calls[0][0];
  const result = typeof updater === 'function' ? updater(baseFilter) : updater;
  expect(result.statuses).toContain('reading');
});

