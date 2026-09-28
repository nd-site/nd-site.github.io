import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.tsx';
import { AuthorApp } from '../author/AuthorApp.tsx';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  const isAuthoringRoute = window.location.pathname.includes('/author') || container.getAttribute('data-mode') === 'author';

  root.render(
    <React.StrictMode>
      {isAuthoringRoute ? <AuthorApp /> : <App />}
    </React.StrictMode>
  );
}
