// src/RE.js
import React, { useState } from 'react';

export default function RE({ onAddResource }) {
  const [type, setType] = useState('audios');
  const [url, setUrl] = useState('');
  const [points, setPoints] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    onAddResource(type, {
      url,
      points: parseInt(points) || 0,
    });

    // Reset
    setUrl('');
    setPoints(0);
  };

  return (
    <form onSubmit={handleSubmit} style={containerStyle}>
      <h4>➕ Nouvelle Ressource</h4>

      <div style={fieldStyle}>
        <label>Type :</label>
        <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
          <option value="audios">Audio</option>
          <option value="images">Image</option>
          <option value="videos">Vidéo</option>
          <option value="textes">Texte</option>
          <option value="weblinks">Lien web</option>
          <option value="modelsAR">Modèle AR</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label>URL ou texte :</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Collez une URL ou entrez un texte"
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label>Points (optionnel) :</label>
        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          style={inputStyle}
        />
      </div>

      <button type="submit" style={submitButton}>
        ✅ Ajouter
      </button>
    </form>
  );
}

// Styles
const containerStyle = {
  marginTop: '10px',
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  background: 'white',
};

const fieldStyle = {
  marginBottom: '10px',
};

const inputStyle = {
  width: '100%',
  padding: '6px',
  marginTop: '5px',
};

const submitButton = {
  marginTop: '10px',
  padding: '10px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
};