// src/P.js
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useBubbles, useSessionMeta } from './Sync';
import { getModeSettings } from './modes';

export function P({ sessionId }) {
  const container = useRef(null);
  const mapRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [visibleText, setVisibleText] = useState(null);
  const [opacity, setOpacity] = useState(0);
  const [detectableCount, setDetectableCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const bubbles = useBubbles(sessionId);
  const meta = useSessionMeta(sessionId);
  const mode = getModeSettings(meta?.mode || 'blind');
  const layers = useRef({});

  useEffect(() => {
    if (container.current && !mapRef.current) {
      const m = L.map(container.current).setView([48.85, 2.35], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(m);
      mapRef.current = m;
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;

    let countDetectable = 0;

    bubbles.forEach(([id, bubble]) => {
      const { lat, lng, radius, detectable = true } = bubble;
      if (detectable) countDetectable++;

      if (!layers.current[id]) {
        layers.current[id] = L.circle([lat, lng], {
          radius,
          color: detectable ? 'orange' : 'gray',
          fillOpacity: detectable && mode.bubblesVisible ? 0.3 : 0,
          opacity: mode.bubblesVisible ? 1 : 0,
          interactive: false
        }).addTo(map);
      } else {
        layers.current[id].setLatLng([lat, lng]);
        layers.current[id].setRadius(radius);
        layers.current[id].setStyle({
          color: detectable ? 'orange' : 'gray',
          fillOpacity: detectable && mode.bubblesVisible ? 0.3 : 0,
          opacity: mode.bubblesVisible ? 1 : 0
        });
      }
    });

    setDetectableCount(countDetectable);
    setTotalCount(bubbles.length);

    Object.keys(layers.current).forEach(id => {
      if (!bubbles.find(([bid]) => bid === id)) {
        map.removeLayer(layers.current[id]);
        delete layers.current[id];
      }
    });
  }, [bubbles, ready, mode]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;

    const map = mapRef.current;

    const onMove = () => {
      const center = map.getCenter();
      let bestText = null;
      let maxOpacity = 0;

      bubbles.forEach(([id, bubble]) => {
        const { lat, lng, radius, text, detectable = true } = bubble;
        if (!text || (mode.detectableOnly && !detectable)) return;

        const d = center.distanceTo([lat, lng]);
        if (d < radius) {
          const o = 1 - d / radius;
          if (o > maxOpacity) {
            bestText = text;
            maxOpacity = o;
          }
        }
      });

      setVisibleText(bestText);
      setOpacity(maxOpacity);
    };

    map.on('move', onMove);
    return () => map.off('move', onMove);
  }, [bubbles, ready, mode]);

  return (
    <>
      <div ref={container} style={{ height: '100vh', width: '100vw' }} />

      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(255,255,255,0.8)',
        padding: '4px 8px',
        borderRadius: 6,
        fontSize: 14,
        fontFamily: 'sans-serif'
      }}>
        Bulles détectables : {detectableCount} / {totalCount}
        <div style={{ fontSize: 12, marginTop: 4 }}>
          Mode : {mode.name}
        </div>
      </div>

      {visibleText && (
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '10%',
          right: '10%',
          textAlign: 'center',
          fontSize: 20,
          fontFamily: 'Georgia, serif',
          color: '#333',
          opacity,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none'
        }}>
          {visibleText}
        </div>
      )}
    </>
  );
}