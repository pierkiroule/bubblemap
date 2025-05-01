// src/Pm.js
import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ref, onValue } from 'firebase/database';
import { db } from './firebase';

function Pm({ sessionId }) {
  const mapRef = useRef(null);
  const [bulles, setBulles] = useState([]);
  const [popBubbles, setPopBubbles] = useState([]);
  const [currentBulleData, setCurrentBulleData] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [hiddenCount, setHiddenCount] = useState(0);

  useEffect(() => {
    const map = L.map('map').setView([48.85, 2.35], 18);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    map.locate({ watch: true, enableHighAccuracy: true });
    map.on('locationfound', (e) => {
      map.setView(e.latlng, 18);
    });

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    const bullesRef = ref(db, `bulles/${sessionId}`);
    return onValue(bullesRef, (snapshot) => {
      const data = snapshot.val();
      const list = data
        ? Object.entries(data).map(([id, bulle]) => ({
            id,
            ...bulle,
            latlng: bulle.latlng ? L.latLng(bulle.latlng.lat, bulle.latlng.lng) : null
          }))
        : [];

      setBulles(list);

      const visibles = list.filter((b) => b.visiblePourParticipants !== false);
      const caches = list.filter((b) => b.visiblePourParticipants === false);
      setVisibleCount(visibles.length);
      setHiddenCount(caches.length);
    });
  }, [sessionId]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    function checkProximity(e) {
      const userPos = e.latlng;
      bulles.forEach((bulle) => {
        if (bulle.visiblePourParticipants === false) return;
        if (!bulle.latlng) return;
        const distance = userPos.distanceTo(bulle.latlng);
        if (distance <= (bulle.radius || 30)) {
          setPopBubbles((prev) => [...prev, { id: Date.now() }]);
          setTimeout(() => {
            setPopBubbles((prev) => prev.slice(1));
          }, 2000);

          triggerBulle(bulle);
        }
      });
    }

    map.on('locationfound', checkProximity);
    return () => map.off('locationfound', checkProximity);
  }, [bulles]);

  function triggerBulle(bulle) {
    if (currentBulleData?.id === bulle.id) return;

    if (audioPlayer) {
      audioPlayer.pause();
      setAudioPlayer(null);
    }

    if (bulle.audios) {
      const audiosArray = Object.values(bulle.audios).filter(a => a.active && a.url);
      if (audiosArray.length > 0) {
        const audio = new Audio(audiosArray[0].url);
        audio.volume = bulle.volume !== undefined ? bulle.volume : 1.0;
        audio.play().catch(err => console.error('Erreur audio', err));
        setAudioPlayer(audio);
      }
    }

    setCurrentBulleData({
      titre: bulle.titre || "Découverte!",
      contenu: bulle.contenu || null
    });
  }

  function closeModal() {
    setCurrentBulleData(null);
    if (audioPlayer) {
      audioPlayer.pause();
      setAudioPlayer(null);
    }
  }

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <div id="map" style={{ height: '100%', width: '100%' }}></div>

      {/* Bandeau d'information */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: 20,
        fontSize: 14,
        display: 'flex',
        gap: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        animation: 'pulse 2s infinite',
        zIndex: 1000
      }}>
        🟢 {visibleCount} ⚪ {hiddenCount}
      </div>

      {/* Effets visuels */}
      {popBubbles.map((bubble) => (
        <div key={bubble.id} style={{
          position: 'absolute',
          left: Math.random() * 80 + 10 + '%',
          bottom: 20,
          width: 20,
          height: 20,
          backgroundColor: '#00aaff',
          borderRadius: '50%',
          opacity: 0.7,
          animation: 'bubblePop 2s ease-out forwards',
          zIndex: 1000
        }} />
      ))}

      {/* Modale de contenu déclenché */}
      {currentBulleData && (
        <div onClick={closeModal} style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          zIndex: 3000,
          padding: 20,
          cursor: 'pointer'
        }}>
          <h2>{currentBulleData.titre}</h2>
          {currentBulleData.contenu && <p style={{ marginTop: 20 }}>{currentBulleData.contenu}</p>}
          <p style={{ marginTop: 20, fontSize: 14 }}>→ Cliquez pour fermer</p>
        </div>
      )}
    </div>
  );
}

export default Pm;