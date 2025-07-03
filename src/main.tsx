import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add noise texture to the document
const noiseElement = document.createElement('div');
noiseElement.className = 'noise';
document.body.appendChild(noiseElement);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);