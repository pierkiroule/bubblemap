import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { database } from './firebaseClient';
import { ref, onValue } from 'firebase/database';
import useAudioPlayer from './hooks/useAudioPlayer';

export default function AppParticipant({ sessionId = 'session-dj' }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [bulles, setBulles] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const { play, stop, setVolume } = useAudioPlayer();

  useEffect(() => {
    const map = L.map('map').setView([48.85, 2.35], 18);
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    map.on('locationfound', (e) => {
      setUserPosition(e.latlng);
      map.setView(e.latlng, 18);
    });

    map.locate({ watch: true, enableHighAccuracy: true });

    return () => map.remove();
  }, []);

  useEffect(() => {
    const dbRef = ref(database, `bulles/${sessionId}`);
    return onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      setBulles(data ? Object.entries(data)
        .filter(([_, bulle]) => bulle.visibleParticipant !== false) // Respecte la visibilité
        .map(([id, bulle]) => ({
          ...bulle,
          id,
          latlng: L.latLng(bulle.latlng.lat, bulle.latlng.lng)
        })) : []);
    });
  }, [sessionId]);

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach(({ group }) => group.remove());
    markersRef.current = [];

    bulles.forEach((bulle) => {
      if (!bulle?.latlng) return;
      const group = L.layerGroup().addTo(mapRef.current);

      const circle = L.circle(bulle.latlng, {
        radius: bulle.radius,
        color: bulle.color,
      }).addTo(group);

      markersRef.current.push({ group });
    });
  }, [bulles]);

  useEffect(() => {
    if (!userPosition || !bulles.length) return;
    for (let bulle of bulles) {
      const distance = mapRef.current.distance(userPosition, bulle.latlng);
      const isInside = distance <= bulle.radius;
      const audios = bulle.audios || {};
      const activeAudio = Object.values(audios).find((a) => a.active);

      if (isInside && activeAudio) {
        const baseVolume = activeAudio.volume ?? 1;
        const proximityVolume = Math.max(0.1, 1 - distance / bulle.radius);
        const volume = baseVolume * proximityVolume;

        if (!audioPlayer) {
          play(activeAudio.url, { loop: true, volume });
        } else {
          setVolume(volume);
        }
        return;
      }
    }

    if (audioPlayer) {
      audioPlayer.pause();
      setAudioPlayer(null);
    }
  }, [userPosition, bulles]);

  return (
    <div id="map" style={{ height: '100vh', width: '100%' }} />
  );
}