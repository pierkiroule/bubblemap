// src/App.js
import React from 'react';
import AppRouter from './Router';
import './index.css'; // ou le fichier contenant les styles

export default function App() {
  return (
    <>
      <AppRouter />
      <a
        href="https://cybertherapie.fr"
        target="_blank"
        rel="noopener noreferrer"
        className="bubble-link"
        title="Cyberthérapie"
      >
        Pier
      </a>
    </>
  );
}