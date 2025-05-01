// src/Sync.js
import { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from './firebase';

// Envoie les bulles sur Firebase
export function syncBubbles(sessionId, circles) {
  const clean = {};
  Object.entries(circles).forEach(([id, bubble]) => {
    const { circle, title, mediaUrl, detectable = true, showTitle = false } = bubble;
    if (!circle) return;

    const { lat, lng } = circle.getLatLng();
    const radius = Number(circle.getRadius());
    const color = circle.options.color || 'blue';

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(radius)) {
      console.warn(`Sync ignoré : données invalides`, { lat, lng, radius });
      return;
    }

    clean[id] = {
      lat,
      lng,
      radius,
      color,
      title: title || '',
      mediaUrl: mediaUrl || '',
      detectable,
      showTitle,
    };
  });

  set(ref(db, `sessions/${sessionId}/bubbles`), clean);
}

// Récupère les bulles depuis Firebase
export function useBubbles(sessionId) {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const sessionRef = ref(db, `sessions/${sessionId}/bubbles`);
    return onValue(sessionRef, snap => {
      const val = snap.val() || {};
      const entries = Object.entries(val).filter(([, data]) =>
        data &&
        typeof data.lat === 'number' &&
        typeof data.lng === 'number' &&
        typeof data.radius === 'number' &&
        data.radius > 0
      );
      setBubbles(entries);
    });
  }, [sessionId]);

  return bubbles;
}

// Enregistre les métadonnées de la session (ex: mode)
export function setSessionMeta(sessionId, meta) {
  return set(ref(db, `sessions/${sessionId}/meta`), meta);
}

// Lit les métadonnées (mode, etc.)
export function useSessionMeta(sessionId) {
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    const r = ref(db, `sessions/${sessionId}/meta`);
    return onValue(r, snap => {
      setMeta(snap.val() || {});
    });
  }, [sessionId]);

  return meta;
}