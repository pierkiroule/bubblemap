// src/IM.js
import React, { useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from './firebase';

export default function IM({ sessionId }) {
  const [afficherBulles, setAfficherBulles] = useState(true);
  const [afficherAudios, setAfficherAudios] = useState(true);
  const [afficherImages, setAfficherImages] = useState(true);
  const [afficherTextes, setAfficherTextes] = useState(true);

  const handleEnvoyer = () => {
    const configRef = ref(db, `/session/${sessionId}/config`);
    update(configRef, {
      afficherBulles,
      afficherAudios,
      afficherImages,
      afficherTextes
    })
    .then(() => {
      console.log('Configuration envoyée à Firebase.');
    })
    .catch((error) => {
      console.error('Erreur d’envoi configuration:', error);
    });
  };

  return (
    <div style={containerStyle}>
      <h3>🎛️ Gestion Interaction</h3>

      <Toggle label="Afficher Bulles" value={afficherBulles} onChange={setAfficherBulles} />
      <Toggle label="Afficher Audios" value={afficherAudios} onChange={setAfficherAudios} />
      <Toggle label="Afficher Images" value={afficherImages} onChange={setAfficherImages} />
      <Toggle label="Afficher Textes" value={afficherTextes} onChange={setAfficherTextes} />

      <button onClick={handleEnvoyer} style={submitButton}>
        🚀 Envoyer
      </button>
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div style={toggleStyle}>
      <label>{label}</label>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginLeft: '10px' }}
      />
    </div>
  );
}

// Styles
const containerStyle = {
  marginTop: '10px',
  padding: '15px',
  border: '2px solid #007bff',
  borderRadius: '10px',
  background: 'white',
};

const toggleStyle = {
  marginBottom: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const submitButton = {
  marginTop: '15px',
  padding: '10px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  width: '100%',
};