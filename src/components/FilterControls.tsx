import * as React from 'react';
import { FilterState, ReadingStatus } from '../types';

const allStatuses: ReadingStatus[] = ['reading', 'completed', 'paused', 'dnf', 'wishlist'];

export function FilterControls({
  filter,
  setFilter,
}: {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
}) {
  const toggleStatus = (status: ReadingStatus, checked: boolean) => {
    setFilter(f => ({
      ...f,
      statuses: checked
        ? [...f.statuses, status]
        : f.statuses.filter(s => s !== status),
    }));
  };

  return (
    <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        aria-label="Search books"
        type="text"
        placeholder="Search..."
        value={filter.q}
        onChange={e => {
          const value = e.target.value;
          setFilter(f => ({
            ...f,
            q: value,
          }));
        }}
      />
      <div>
        {allStatuses.map(s => (
          <label key={s} style={{ marginRight: 8 }}>
            <input
              type="checkbox"
              checked={filter.statuses.includes(s)}
              onChange={e => toggleStatus(s, e.target.checked)}
            />
            {s}
          </label>
        ))}
      </div>
    </div>
  );
}

