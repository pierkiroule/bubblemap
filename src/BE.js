// src/BE.js
import React, { useEffect, useState } from 'react';
import { ref, update, get, remove } from 'firebase/database';
import { db } from './firebase';

function BE({ sessionId, bulleId, onClose }) {
  const [radius, setRadius] = useState(30);
  const [titre, setTitre] = useState('');
  const [color, setColor] = useState('#00aaff');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!sessionId || !bulleId) return;
    const bulleRef = ref(db, `bulles/${sessionId}/${bulleId}`);
    get(bulleRef).then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRadius(data.radius || 30);
        setTitre(data.titre || '');
        setColor(data.color || '#00aaff');
        setVisible(data.visiblePourParticipants !== false);
      }
    });
  }, [sessionId, bulleId]);

  const handleSave = () => {
    const bulleRef = ref(db, `bulles/${sessionId}/${bulleId}`);
    update(bulleRef, { titre, radius, color, visiblePourParticipants: visible })
      .then(onClose);
  };

  const handleDelete = () => {
    const bulleRef = ref(db, `bulles/${sessionId}/${bulleId}`);
    remove(bulleRef).then(onClose);
  };

  return (
    <div style={editorContainer}>
      <h3 style={titleStyle}>Éditer Bulle</h3>

      <label style={labelStyle}>Titre</label>
      <input
        type="text"
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        style={inputStyle}
      />

      <label style={labelStyle}>Rayon ({radius} m)</label>
      <input
        type="range"
        min="10"
        max="100"
        value={radius}
        onChange={(e) => setRadius(Number(e.target.value))}
        style={sliderStyle}
      />

      <label style={labelStyle}>Couleur</label>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        style={inputStyle}
      />

      <div style={visibilityContainer}>
        <input
          type="checkbox"
          checked={visible}
          onChange={() => setVisible(!visible)}
        />
        <span style={{ marginLeft: 8 }}>Visible pour les participants</span>
      </div>

      <div style={buttonRow}>
        <button onClick={handleSave} style={saveButton}>💾 Sauver</button>
        <button onClick={handleDelete} style={deleteButton}>🗑️ Supprimer</button>
        <button onClick={onClose} style={closeButton}>❌ Fermer</button>
      </div>
    </div>
  );
}

// Styles
const editorContainer = {
  position: 'absolute',
  bottom: 20,
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  padding: 20,
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  width: 300,
  zIndex: 2000,
  textAlign: 'center',
};

const titleStyle = {
  marginBottom: 20,
  color: '#0077aa',
  fontWeight: 'bold',
};

const labelStyle = {
  display: 'block',
  marginTop: 12,
  fontWeight: 'bold',
  fontSize: '0.9rem',
};

const inputStyle = {
  width: '100%',
  padding: 8,
  marginTop: 5,
  borderRadius: 6,
  border: '1px solid #ccc',
};

const sliderStyle = {
  width: '100%',
  marginTop: 8,
};

const visibilityContainer = {
  display: 'flex',
  alignItems: 'center',
  marginTop: 12,
};

const buttonRow = {
  marginTop: 20,
  display: 'flex',
  gap: '10px',
  justifyContent: 'center',
};

const saveButton = {
  flex: 1,
  padding: '8px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
};

const deleteButton = {
  flex: 1,
  padding: '8px',
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
};

const closeButton = {
  flex: 1,
  padding: '8px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
};

export default BE;