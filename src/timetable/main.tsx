import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Navbar from '../components/Navbar';
import { TimetableApp } from './TimetableApp';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Navbar />
      <TimetableApp />
    </React.StrictMode>
  );
}
