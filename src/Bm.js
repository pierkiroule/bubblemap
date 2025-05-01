import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ref, set, get } from 'firebase/database';
import { db } from './firebase';
import BE from './BE';

function Bm({ mapRef, sessionId }) {
  const [bulles, setBulles] = useState({});
  const [selectedBulleId, setSelectedBulleId] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isAddingBulle, setIsAddingBulle] = useState(false); // Mode d'ajout

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Load existing bulles
    const bullesRef = ref(db, `bulles/${sessionId}`);
    get(bullesRef).then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        const bullesData = {};
        Object.entries(data).forEach(([id, bulle]) => {
          const marker = createMarker(bulle.latlng, id);
          bullesData[id] = { ...bulle, marker };
        });
        setBulles(bullesData);
      }
    });

    map.on('click', (e) => {
      if (isAddingBulle) {
        handleAddBulle(e.latlng);
        setIsAddingBulle(false); // Désactiver le mode d'ajout après la création de la bulle
      } else {
        handleSelectBulle(e.latlng);
      }
    });

    return () => {
      map.off();
    };
  }, [mapRef, isAddingBulle, bulles]);

  const createMarker = (latlng, id) => {
    const marker = L.marker(latlng, { draggable: true }).addTo(mapRef.current);
    marker.on('dragend', (e) => {
      const newLatLng = e.target.getLatLng();
      updateBullePosition(id, newLatLng);
    });
    return marker;
  };

  const handleAddBulle = (latlng) => {
    const id = Date.now().toString();
    const newBulle = {
      latlng,
      titre: "Nouvelle bulle",
      radius: 30,
      color: "#00aaff",
      visiblePourParticipants: true,
    };

    const bulleRef = ref(db, `bulles/${sessionId}/${id}`);
    set(bulleRef, newBulle);

    // Créer un marqueur et l'ajouter à la carte immédiatement
    const marker = createMarker(latlng, id);
    setBulles((prev) => ({
      ...prev,
      [id]: { ...newBulle, marker }
    }));
    setSelectedBulleId(id);
  };

  const handleSelectBulle = (latlng) => {
    let found = null;
    Object.entries(bulles).forEach(([id, bulle]) => {
      const distance = mapRef.current.distance(latlng, bulle.latlng);
      if (distance < (bulle.radius || 30)) {
        found = id;
      }
    });
    if (found) {
      setSelectedBulleId(found);
    } else {
      setSelectedBulleId(null);
    }
  };

  const handleOpenEditor = () => {
    if (selectedBulleId) {
      setShowEditor(true);
    }
  };

  const updateBullePosition = (id, newLatLng) => {
    const bulleRef = ref(db, `bulles/${sessionId}/${id}`);
    set(bulleRef, {
      ...bulles[id],
      latlng: { lat: newLatLng.lat, lng: newLatLng.lng }
    });
    setBulles((prev) => ({
      ...prev,
      [id]: { ...prev[id], latlng: newLatLng }
    }));
  };

  const handleStartAddingBulle = () => {
    setIsAddingBulle(true); // Active le mode d'ajout
  };

  const handleStopAddingBulle = () => {
    setIsAddingBulle(false); // Désactive le mode d'ajout
  };

  return (
    <>
      {/* Bouton flottant pour ajouter une bulle */}
      <div style={buttonStyle}>
        <button onClick={handleStartAddingBulle}>➕ Ajouter une bulle</button>
        <button onClick={handleStopAddingBulle}>❌ Annuler</button>
      </div>

      {/* Affichage de l'éditeur de bulle si une bulle est sélectionnée */}
      {showEditor && selectedBulleId && (
        <BE
          sessionId={sessionId}
          bulleId={selectedBulleId}
          onClose={() => setShowEditor(false)}
        />
      )}
    </>
  );
}

const buttonStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  zIndex: 1000,
  backgroundColor: '#00aaff',
  color: 'white',
  borderRadius: '12px',
  padding: '10px 20px',
  cursor: 'pointer',
  fontSize: '16px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
};

export default Bm;