import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { MapCreation } from './components/MapCreation';
import { MapDashboard } from './components/MapDashboard';

const App = () => {
  const [hasMapParam, setHasMapParam] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setHasMapParam(!!params.get('map'));
  }, []);

  if (hasMapParam) {
    return <MapDashboard />;
  }

  return <MapCreation />;
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
