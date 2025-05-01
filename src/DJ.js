// src/DJ.js
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BM } from './BM';
import { DJcon } from './DJcon';
import { getModeSettings } from './modes';
import { useSessionMeta, setSessionMeta } from './Sync';
import { ref, set } from 'firebase/database';
import { db } from './firebase';

export function DJ() {
  const { sessionId } = useParams();
  const meta = useSessionMeta(sessionId);
  const modeConfig = getModeSettings(meta?.mode || 'blind');

  const mapRef = useRef(null);
  const container = useRef(null);
  const [ready, setReady] = useState(false);
  const [bubblesReady, setBubblesReady] = useState(false);
  const [showConsole, setShowConsole] = useState(true);
  const circlesRef = useRef({});
  const [visibleCount, setVisibleCount] = useState(0);
  const [detectableCount, setDetectableCount] = useState(0);

  useEffect(() => {
    if (container.current && !mapRef.current) {
      const m = L.map(container.current).setView([48.85, 2.35], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(m);
      mapRef.current = m;
      setReady(true);
    }
  }, []);

  useEffect(() => {
    const ids = Object.keys(circlesRef.current);
    let v = 0;
    let d = 0;
    ids.forEach(id => {
      const b = circlesRef.current[id];
      if (!b) return;
      const visible = b.circle?.options.opacity !== 0;
      if (visible) v++;
      if (b.detectable !== false) d++;
    });
    setVisibleCount(v);
    setDetectableCount(d);
  }, [showConsole, bubblesReady]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      touchAction: 'none',
      pointerEvents: 'auto',
    }}>
      <div ref={container} style={{ height: '100%', width: '100%' }} />

      {ready && (
        <>
          {modeConfig.timer && (
            <button
              onClick={() => {
                if (meta?.started) return;
                const ok = window.confirm('Démarrer Timer Quest maintenant ?');
                if (ok) {
                  setSessionMeta(sessionId, { ...meta, started: true });
                }
              }}
              disabled={meta?.started}
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 1001,
                background: meta?.started ? '#eee' : '#ffefd5',
                border: '1px solid orange',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 14,
                color: meta?.started ? '#999' : '#000',
                cursor: meta?.started ? 'not-allowed' : 'pointer'
              }}
            >
              {meta?.started ? 'Timer lancé' : 'Lancer Timer Quest'}
            </button>
          )}

          <BM
            map={mapRef.current}
            sessionId={sessionId}
            circlesRef={circlesRef}
            onReady={() => setBubblesReady(true)}
            mode={modeConfig}
          />

          {showConsole && bubblesReady && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '35vh',
              background: 'rgba(255,255,255,0.85)',
              overflowY: 'auto',
              zIndex: 1000,
              borderTop: '1px solid #ccc',
              padding: 10
            }}>
              <DJcon
                map={mapRef.current}
                sessionId={sessionId}
                circlesRef={circlesRef}
                mode={modeConfig}
              />
            </div>
          )}

          <button
            onClick={() => setShowConsole(v => !v)}
            style={{
              position: 'absolute',
              bottom: showConsole ? '36vh' : 10,
              left: 10,
              zIndex: 1001,
              fontSize: 20,
              background: 'white',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ccc',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              padding: 0
            }}
          >
            🎛
          </button>

          {/* Affichage des stats */}
          <div style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1001,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 12,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            {visibleCount} visibles / {detectableCount} détectables
          </div>

          {/* Affichage meta */}
          <div style={{
            position: 'absolute',
            top: 50,
            right: 10,
            zIndex: 1001,
            background: '#fffaf0',
            border: '1px solid #ddd',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 11,
            fontFamily: 'sans-serif',
            lineHeight: 1.4,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <div><strong>Mode</strong> : {modeConfig.name}</div>
            <div><strong>Plan</strong> : {meta?.plan || 'free'}</div>
            {modeConfig.timer && (
              <div><strong>Timer</strong> : {meta?.started ? 'Lancé' : 'En attente'}</div>
            )}
          </div>

          {/* Bouton reset */}
          <button
            onClick={() => {
              const ok = window.confirm('Supprimer toutes les bulles ?');
              if (ok) set(ref(db, `sessions/${sessionId}/bubbles`), {});
            }}
            style={{
              position: 'absolute',
              bottom: 60,
              right: 10,
              zIndex: 1001,
              fontSize: 12,
              padding: '6px 10px',
              border: '1px solid #ccc',
              borderRadius: 4,
              background: '#fefefe'
            }}
          >
            Réinitialiser session
          </button>
        </>
      )}
    </div>
  );
}