// src/Pm.js
import { ref, onValue, set } from 'firebase/database';
import { db } from './firebase';
import { useEffect } from 'react';

export default function Pm({ sessionId, mapRef }) {
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const participants = {};

    const participantsRef = ref(db, `participants/${sessionId}`);

    const listener = onValue(participantsRef, (snapshot) => {
      const data = snapshot.val() || {};

      // Nettoyer anciens
      Object.values(participants).forEach(m => map.removeLayer(m));

      Object.entries(data).forEach(([id, p]) => {
        const marker = L.circle([p.lat, p.lng], { radius: 5, color: 'green' }).addTo(map);
        participants[id] = marker;
      });
    });

    // Enregistrer sa position (pour tests)
    map.on('locationfound', (e) => {
      const myRef = ref(db, `participants/${sessionId}/dj`);
      set(myRef, { lat: e.latlng.lat, lng: e.latlng.lng });
    });

    map.locate({ watch: true, enableHighAccuracy: true });

    return () => {
      map.off('locationfound');
      listener();
    };
  }, [mapRef, sessionId]);

  return null;
}