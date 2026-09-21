import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { TimetableApp } from './TimetableApp';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <TimetableApp />
    </React.StrictMode>
  );
}
