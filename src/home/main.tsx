import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import HomeApp from './HomeApp';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <HomeApp />
    </React.StrictMode>
  );
}
