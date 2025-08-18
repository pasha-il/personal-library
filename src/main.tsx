import * as React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { syncPendingRequests } from './db';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

syncPendingRequests();
