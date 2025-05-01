// src/Part.js
import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import { ref, onChildAdded, onChildChanged, onChildRemoved } from 'firebase/database';
import { db } from './firebase';

function Part() {
  const mapRef = useRef(null);
  const [bulles, setBulles] = useState({});
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const map = L.map('map').setView([48.85, 2.35], 15);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 20,
    }).addTo(map);

    map.whenReady(() => {
      setMapReady(true);
    });

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapReady) return;

    const bullesRef = ref(db, 'bulles');

    const unsubscribeAdd = onChildAdded(bullesRef, (snapshot) => {
      const bulle = snapshot.val();
      if (bulle) addBulle(bulle);
    });

    const unsubscribeChange = onChildChanged(bullesRef, (snapshot) => {
      const bulle = snapshot.val();
      if (bulle) updateBulle(bulle);
    });

    const unsubscribeRemove = onChildRemoved(bullesRef, (snapshot) => {
      const bulle = snapshot.val();
      if (bulle) removeBulle(bulle.id);
    });

    return () => {
      unsubscribeAdd();
      unsubscribeChange();
      unsubscribeRemove();
    };
  }, [mapReady]);

  const addBulle = (bulle) => {
    if (!mapRef.current) return;

    const circle = L.circle(bulle.latlng, {
      radius: bulle.rayon || 30,
      color: bulle.color || '#00aaff',
      fillColor: bulle.color || '#00aaff',
      fillOpacity: 0.5,
    }).addTo(mapRef.current);

    setBulles(prev => ({ ...prev, [bulle.id]: { ...bulle, circle } }));
  };

  const updateBulle = (bulle) => {
    setBulles(prev => {
      if (prev[bulle.id]) {
        const oldCircle = prev[bulle.id].circle;
        oldCircle.setLatLng(bulle.latlng);
        oldCircle.setRadius(bulle.rayon || 30);
        oldCircle.setStyle({ color: bulle.color || '#00aaff', fillColor: bulle.color || '#00aaff' });
      }
      return { ...prev, [bulle.id]: { ...bulle, circle: prev[bulle.id].circle } };
    });
  };

  const removeBulle = (id) => {
    setBulles(prev => {
      if (prev[id]) {
        prev[id].circle.remove();
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return prev;
    });
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div id="map" style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
}

export default Part;