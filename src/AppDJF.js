import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { database } from './firebaseClient';
import { ref, set, update, remove, onValue, push } from 'firebase/database';
import BulleEditor from './components/BulleEditor';
import useAudioPlayer from './hooks/useAudioPlayer';

export default function AppDJF({ sessionId = 'session-dj' }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [bulles, setBulles] = useState([]);
  const [activeBulle, setActiveBulle] = useState(null);
  const [djPosition, setDjPosition] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [selectedAudioUrl, setSelectedAudioUrl] = useState('');
  const [audioPlayer, setAudioPlayer] = useState(null);
  const { play, stop, setVolume } = useAudioPlayer();
  const [showLabels, setShowLabels] = useState(true);
  const [randomBulleCount, setRandomBulleCount] = useState(5);

  const createRandomBullesAroundDJ = (count = randomBulleCount, maxDistance = 50) => {
    if (!djPosition) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * maxDistance;
      const dx = distance * Math.cos(angle);
      const dy = distance * Math.sin(angle);
      const newLat = djPosition.lat + (dy / 111320);
      const newLng = djPosition.lng + (dx / (40075000 * Math.cos(djPosition.lat * Math.PI / 180) / 360));
      createBulle(L.latLng(newLat, newLng));
    }
  };

  const createBulle = (latlng) => {
    const newRef = push(ref(database, `bulles/${sessionId}`));
    const newBulle = {
      latlng,
      radius: 20,
      color: '#ff0000',
      titre: 'Nouvelle bulle',
      audios: {},
      visibleParticipant: true
    };
    set(newRef, newBulle);
  };

  useEffect(() => {
    const map = L.map('map').setView([48.85, 2.35], 18);
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 25,
      maxNativeZoom: 20,
    }).addTo(map);

    map.on('locationfound', (e) => {
      setDjPosition(e.latlng);
      if (!djPosition) map.setView(e.latlng, 18);
    });

    map.on('locationerror', (e) => console.error('Erreur de localisation :', e.message));
    map.locate({ watch: true, enableHighAccuracy: true });
    map.on('dblclick', (e) => createBulle(e.latlng));

    return () => map.remove();
  }, []);

  useEffect(() => {
    const dbRef = ref(database, `bulles/${sessionId}`);
    return onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      setBulles(data ? Object.entries(data).map(([id, bulle]) => ({
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

      if (showLabels && bulle.titre) {
        const tooltip = L.tooltip({ permanent: true, direction: 'top' })
          .setContent(bulle.titre)
          .setLatLng(bulle.latlng);
        tooltip.addTo(group);
      }

      const handle = L.marker(bulle.latlng, {
        icon: L.divIcon({
          className: 'handle-icon',
          iconSize: [20, 20],
          html: '<div style="background:#007bff;width:16px;height:16px;border-radius:50%;border:2px solid white;"></div>'
        }),
        draggable: true
      }).addTo(group);

      handle.on('drag', (e) => {
        const newLatLng = e.target.getLatLng();
        circle.setLatLng(newLatLng);
      });

      handle.on('dragend', (e) => {
        const finalLatLng = e.target.getLatLng();
        update(ref(database, `bulles/${sessionId}/${bulle.id}`), { latlng: finalLatLng });
      });

      circle.on('click', () => {
        setActiveBulle(bulle);
      });

      markersRef.current.push({ group });
    });
  }, [bulles, showLabels]);

  const currentActiveBulle = bulles.find(b => b.id === activeBulle?.id);

  return (
    <>
      <div id="map" style={{ height: '100vh', width: '100%' }} />

      <div style={{
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        zIndex: 1000
      }}>
        <button onClick={() => createRandomBullesAroundDJ()} style={{ marginBottom: 8 }}>
          + Bulles
        </button>
        <button onClick={() => setShowLabels(v => !v)}>
          {showLabels ? 'Cacher Titres' : 'Montrer Titres'}
        </button>
      </div>

      {currentActiveBulle && (
        <BulleEditor
          bulle={currentActiveBulle}
          onUpdateTitre={(titre) => update(ref(database, `bulles/${sessionId}/${currentActiveBulle.id}`), { titre })}
          onUpdateColor={(color) => update(ref(database, `bulles/${sessionId}/${currentActiveBulle.id}`), { color })}
          onUpdateRadius={(radius) => update(ref(database, `bulles/${sessionId}/${currentActiveBulle.id}`), { radius })}
          audios={currentActiveBulle.audios}
          onCloseEditor={() => setActiveBulle(null)}
        />
      )}
    </>
  );
}