// src/Router.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { DJ } from './DJ';
import { P } from './P';
import HomeDJ from './HomeDJ';
import HomeP from './HomeP';
import { useSessionMeta } from './Sync';
import { getModeSettings } from './modes';
import { TimerP } from './TimerP';

function RoutedP() {
  const { sessionId } = useParams();
  const meta = useSessionMeta(sessionId);
  const mode = getModeSettings(meta?.mode || 'blind');

  if (mode.timer) return <TimerP sessionId={sessionId} />;
  return <P sessionId={sessionId} />;
}

export default function AppRouter() {
  return (
    <Router>
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <h1>•°○</h1>
        <nav style={{ marginBottom: '1rem' }}>
          <Link to="/dj" style={{ margin: '0 1rem' }}>DJ</Link>
          <Link to="/p" style={{ margin: '0 1rem' }}>Participant</Link>
        </nav>

        <Routes>
          <Route path="/dj" element={<HomeDJ />} />
          <Route path="/dj/:sessionId" element={<DJ />} />
          <Route path="/p" element={<HomeP />} />
          <Route path="/p/:sessionId" element={<RoutedP />} />
          <Route path="*" element={<div>Choisissez un rôle : DJ ou Participant</div>} />
        </Routes>
      </div>
    </Router>
  );
}