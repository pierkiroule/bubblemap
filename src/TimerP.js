import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useBubbles, useSessionMeta } from './Sync';

export function TimerP({ sessionId }) {
  const container = useRef(null);
  const mapRef = useRef(null);
  const [ready, setReady] = useState(false);
  const bubbles = useBubbles(sessionId);
  const layers = useRef({});
  const [countdown, setCountdown] = useState(10);
  const [activeText, setActiveText] = useState(null);
  const meta = useSessionMeta(sessionId);

  // Init carte
  useEffect(() => {
    if (container.current && !mapRef.current) {
      const map = L.map(container.current).setView([48.85, 2.35], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      mapRef.current = map;
      setReady(true);
    }
  }, []);

  // Affichage des bulles
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;

    bubbles.forEach(([id, b]) => {
      const { lat, lng, radius, detectable = true } = b;
      if (!layers.current[id]) {
        layers.current[id] = L.circle([lat, lng], {
          radius,
          color: detectable ? 'orange' : 'gray',
          fillOpacity: 0.2,
          opacity: 1,
        }).addTo(map);
      } else {
        layers.current[id].setLatLng([lat, lng]);
        layers.current[id].setRadius(radius);
      }
    });

    Object.keys(layers.current).forEach(id => {
      if (!bubbles.find(([bid]) => bid === id)) {
        map.removeLayer(layers.current[id]);
        delete layers.current[id];
      }
    });
  }, [bubbles, ready]);

  // Timer contrôlé par meta.started
  useEffect(() => {
    if (!meta?.started) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          pickRandomText();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [bubbles, meta?.started]);

  const pickRandomText = () => {
    const texts = bubbles.map(([, b]) => b.text).filter(Boolean);
    if (texts.length === 0) return;
    const t = texts[Math.floor(Math.random() * texts.length)];
    setActiveText(t);
  };

  return (
    <>
      <div ref={container} style={{ height: '100vh', width: '100vw' }} />

      {!meta?.started && (
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '10%',
          right: '10%',
          textAlign: 'center',
          fontSize: 18,
          fontFamily: 'sans-serif',
          color: '#555',
          background: 'rgba(255,255,255,0.9)',
          padding: 20,
          borderRadius: 8,
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}>
          En attente du lancement par le DJ...
        </div>
      )}

      {meta?.started && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(255,255,255,0.9)',
          padding: '6px 10px',
          borderRadius: 6,
          fontSize: 14
        }}>
          Prochaine bulle dans : {countdown}s
        </div>
      )}

      {activeText && (
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '10%',
          right: '10%',
          textAlign: 'center',
          fontSize: 22,
          fontFamily: 'Georgia, serif',
          color: '#333',
          background: 'rgba(255,255,255,0.85)',
          padding: 12,
          borderRadius: 10,
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}>
          {activeText}
        </div>
      )}
    </>
  );
}