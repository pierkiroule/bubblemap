import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { database } from './firebaseClient';
import { ref, onValue } from 'firebase/database';

export default function AppParticipant({ sessionId }) {
  const mapRef = useRef(null);
  const [bulles, setBulles] = useState([]);
  const [position, setPosition] = useState(null);
  const userMarkerRef = useRef(null);
  const audioRef = useRef(null);
  const currentAudioInfoRef = useRef({ bulleId: null, audioKey: null });
  const [loading, setLoading] = useState(true);

  // Init carte
  useEffect(() => {
    const map = L.map('map', {
      zoomControl: true,
      doubleClickZoom: false,
      touchZoom: true,
      dragging: true
    }).setView([48.85, 2.35], 15);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    return () => map.remove();
  }, []);

  // GPS tracking
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);

        if (mapRef.current) {
          mapRef.current.setView(coords, mapRef.current.getZoom());
          if (!userMarkerRef.current) {
            const marker = L.marker(coords).addTo(mapRef.current);
            userMarkerRef.current = marker;
          } else {
            userMarkerRef.current.setLatLng(coords);
          }
        }
      },
      (err) => console.error('Erreur GPS', err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Sync bulles
  useEffect(() => {
    const sessionRef = ref(database, 'bulles/' + sessionId);
    return onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      setBulles(data ? Object.values(data).filter(b => b.visibleParticipant) : []);
      setLoading(false);
    });
  }, [sessionId]);

  // Affichage bulles visibles uniquement
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer._isBulleLayer) map.removeLayer(layer);
    });

    bulles.forEach((bulle) => {
      if (bulle.visible === false) return; // Ne pas afficher les bulles cachées
      const circle = L.circle(bulle.latlng, {
        radius: bulle.radius,
        color: bulle.color,
        fillColor: bulle.color,
        fillOpacity: 0.3,
        interactive: false
      });
      circle._isBulleLayer = true;
      circle.addTo(map);
    });
  }, [bulles]);

  // Audio déclenché par proximité
  useEffect(() => {
    if (!position || !bulles.length) return;

    const [lat, lng] = position;
    let bulleProche = null;
    let distanceMin = Infinity;
    let audioToPlay = null;

    bulles.forEach((bulle) => {
      const d = getDistance(lat, lng, bulle.latlng.lat, bulle.latlng.lng);
      if (d <= bulle.radius) {
        const audios = bulle.audios || {};
        const audioKey = Object.keys(audios).find((key) => audios[key].active);
        if (audioKey) {
          if (d < distanceMin) {
            bulleProche = bulle;
            distanceMin = d;
            audioToPlay = { ...audios[audioKey], key: audioKey, bulleId: bulle.id, distance: d };
          }
        }
      }
    });

    if (audioToPlay) {
      const volumeMax = audioToPlay.volume ?? 1;
      const loop = audioToPlay.loop !== false;
      const volume = Math.max(0, Math.min(1, 1 - audioToPlay.distance / bulleProche.radius)) * volumeMax;

      const isNew =
        currentAudioInfoRef.current.bulleId !== audioToPlay.bulleId ||
        currentAudioInfoRef.current.audioKey !== audioToPlay.key;

      if (isNew) {
        if (audioRef.current) audioRef.current.pause();

        const player = new Audio(audioToPlay.url);
        player.loop = loop;
        player.volume = volume;
        player.play().catch((e) => console.warn("Audio error:", e));
        audioRef.current = player;
        currentAudioInfoRef.current = {
          bulleId: audioToPlay.bulleId,
          audioKey: audioToPlay.key
        };
      } else {
        if (audioRef.current) {
          audioRef.current.volume = volume;
        }
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        currentAudioInfoRef.current = { bulleId: null, audioKey: null };
      }
    }
  }, [position, bulles]);

  return (
    <>
      <div id="map" style={{ height: '100vh', width: '100vw' }} />
      {loading && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'white',
          padding: '5px 10px',
          borderRadius: '6px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          zIndex: 2000
        }}>
          Chargement des bulles...
        </div>
      )}
    </>
  );
}

// Distance en mètres entre deux points GPS
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}