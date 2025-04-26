import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { database } from './firebaseClient';
import { ref, set, update, remove, onValue, push } from 'firebase/database';
import { StatusBar } from './components/StatusBar';
import { BulleEditor } from './components/BulleEditor';
import { useAudioPlayer } from './hooks/useAudioPlayer';

export default function AppDJF({ sessionId = 'session-dj' }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [bulles, setBulles] = useState([]);
  const [activeBulle, setActiveBulle] = useState(null);
  const [djPosition, setDjPosition] = useState(null);
  const [dbConnected, setDbConnected] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [selectedAudioUrl, setSelectedAudioUrl] = useState('');
  const [audioPlayer, setAudioPlayer] = useState(null);
  const { play, stop, setVolume } = useAudioPlayer();
  const [showLabels, setShowLabels] = useState(true);
  const [showBulles, setShowBulles] = useState(true);
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

  useEffect(() => {
    const map = L.map('map').setView([48.85, 2.35], 18);
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 25,
      maxNativeZoom: 20,
    }).addTo(map);

    map.on('locationfound', (e) => {
      const radius = e.accuracy || 50;
      L.marker(e.latlng, {
        icon: L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      }).addTo(map)
        .bindPopup(`Vous êtes ici (précision ${Math.round(radius)} m)`)
        .openPopup();
      if (!djPosition) {
        map.setView(e.latlng, 18);
      } else {
        map.panTo(e.latlng);
      }
      setDjPosition(e.latlng);
    });

    map.on('locationerror', (e) => {
      console.error('Erreur de localisation :', e.message);
    });

    map.locate({
      watch: true,
      enableHighAccuracy: true
    });

    map.on('dblclick', (e) => {
      createBulle(e.latlng);
    });

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
    const connectedRef = ref(database, '.info/connected');
    return onValue(connectedRef, (snap) => {
      setDbConnected(snap.val() === true);
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach(({ group }) => group.remove());
    markersRef.current = [];

    if (!showBulles) return;

    bulles.forEach((bulle) => {
      if (!bulle?.latlng) return;
      const group = L.layerGroup().addTo(mapRef.current);

      const circle = L.circle(bulle.latlng, {
        radius: bulle.radius,
        color: bulle.color,
      }).addTo(group);

      if (showLabels && bulle.titre) {
        const tooltip = L.tooltip({
          permanent: true,
          direction: 'top',
          className: 'bulle-label'
        }).setContent(bulle.titre).setLatLng(bulle.latlng);
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
        if (showLabels) {
          group.eachLayer(layer => {
            if (layer instanceof L.Tooltip) {
              layer.setLatLng(newLatLng);
            }
          });
        }
      });

      handle.on('dragend', (e) => {
        const finalLatLng = e.target.getLatLng();
        setTimeout(() => {
          update(ref(database, `bulles/${sessionId}/${bulle.id}`), { latlng: finalLatLng });
        }, 300);
      });

      circle.on('click', () => {
        setActiveBulle(bulle);
      });

      markersRef.current.push({ group });
    });
  }, [bulles, showLabels, showBulles, sessionId]);

  useEffect(() => {
    if (!djPosition || !bulles.length) return;
    for (let bulle of bulles) {
      const distance = mapRef.current.distance(djPosition, bulle.latlng);
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
  }, [djPosition, bulles]);

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
set(newRef, newBulle);}

  const deleteBulle = () => {
    if (!activeBulle) return;
    remove(ref(database, `bulles/${sessionId}/${activeBulle.id}`));
    setActiveBulle(null);
  };

  const deleteAllBulles = async () => {
    try {
      await set(ref(database, `bulles/${sessionId}`), null);
      setBulles([]);
      markersRef.current.forEach(({ group }) => group.remove());
      markersRef.current = [];
      setActiveBulle(null);
    } catch (e) {
      console.error('Erreur suppression bulles:', e);
    }
  };

  const loadPlaylistFromFile = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const urls = e.target.result
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (urls.length > 0) {
      setPlaylist(urls);
      setSelectedAudioUrl(urls[0]);
      set(ref(database, `playlists/${sessionId}`), urls);
    } else {
      console.warn('Playlist vide, rien à sauvegarder.');
    }
  };
  reader.readAsText(file);

  };

  const currentActiveBulle = bulles.find((b) => b.id === activeBulle?.id);

  return (
    <>
      <div id="map" style={{ height: '100vh', width: '100%' }} />

      <div style={{
        position: 'absolute',
        bottom: 70,
        right: 10,
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <select
          value={randomBulleCount}
          onChange={(e) => setRandomBulleCount(Number(e.target.value))}
          style={{ padding: '6px', borderRadius: '4px' }}
        >
          <option value={3}>3 bulles</option>
          <option value={5}>5 bulles</option>
          <option value={10}>10 bulles</option>
          <option value={20}>20 bulles</option>
        </select>

        <button
          onClick={() => createRandomBullesAroundDJ()}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Ajouter Bulles
        </button>

        <button
          onClick={() => setShowBulles(!showBulles)}
          style={{
            backgroundColor: showBulles ? '#ffc107' : '#007bff',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {showBulles ? 'Cacher Bulles' : 'Montrer Bulles'}
        </button>
      </div>

      <StatusBar
        dbConnected={dbConnected}
        sessionId={sessionId}
        onLoadPlaylist={loadPlaylistFromFile}
      />

      {currentActiveBulle && (
        <BulleEditor
          bulle={currentActiveBulle}
          onUpdateTitre={(titre) => update(ref(database, `bulles/${sessionId}/${currentActiveBulle.id}`), { titre })}
          onUpdateColor={(color) => update(ref(database, `bulles/${sessionId}/${currentActiveBulle.id}`), { color })}
          onUpdateRadius={(radius) => update(ref(database, `bulles/${sessionId}/${currentActiveBulle.id}`), { radius })}
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels(v => !v)}
          audios={currentActiveBulle.audios}
          onToggleAudioActive={(key, current) => update(ref(database, `bulles/${sessionId}/${currentActiveBulle.id}/audios/${key}`), { active: !current })}
          onUpdateVolume={(key, vol) => update(ref(database, `bulles/${sessionId}/${currentActiveBulle.id}/audios/${key}`), { volume: vol })}
          onPlayAudio={(url) => {
 stop();
  const player = new Audio(url);
  player.loop = false; // préécoute = sans boucle
  player.volume = 1.0;

  player.play().then(() => {
    setAudioPlayer(player);
  }).catch((error) => {
    console.error('Erreur de lecture audio:', error);
  });
}}
          onStopAudio={() => {
            if (audioPlayer) {
              audioPlayer.pause();
              setAudioPlayer(null);
            }
          }}
          onRemoveAudio={(key) => remove(ref(database, `bulles/${sessionId}/${currentActiveBulle.id}/audios/${key}`))}
          playlist={playlist}
          selectedAudioUrl={selectedAudioUrl}
          onSelectAudio={setSelectedAudioUrl}
          onAssociateAudio={() => {
            if (selectedAudioUrl) {
              const audioRef = ref(database, `bulles/${sessionId}/${currentActiveBulle.id}/audios`);
              push(audioRef, {
                name: selectedAudioUrl.split('/').pop(),
                url: selectedAudioUrl,
                active: true,
                volume: 1
              });
            }
          }}
          onDeleteBulle={deleteBulle}
          onDeleteAllBulles={deleteAllBulles}
          onCloseEditor={() => setActiveBulle(null)}
        />
      )}
      </>);
}
