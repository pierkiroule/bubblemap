// src/ResourceEditor.js
import React, { useState } from 'react';

export default function ResourceEditor({ onAddResource }) {
  const [type, setType] = useState('audio');
  const [urlOrContent, setUrlOrContent] = useState('');
  const [points, setPoints] = useState(1);
  const [loop, setLoop] = useState(false);
  const [opacityControl, setOpacityControl] = useState(false);

  const handleAdd = () => {
    if (!urlOrContent.trim()) {
      alert("Champ vide !");
      return;
    }

    let resource = { points };

    if (type === 'audio' || type === 'video' || type === 'weblink' || type === 'modelsAR' || type === 'image') {
      resource.url = urlOrContent;
    } else if (type === 'text') {
      resource.content = urlOrContent;
    }

    if (type === 'audio' || type === 'video') {
      resource.loop = loop;
    }
    if (type === 'image') {
      resource.opacityControl = opacityControl;
    }

    onAddResource(type, resource);

    // Reset
    setUrlOrContent('');
    setPoints(1);
    setLoop(false);
    setOpacityControl(false);
  };

  return (
    <div style={containerStyle}>
      <h3>➕ Ajouter une ressource</h3>

      <div style={inputGroup}>
        <label>Type :</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="audio">Audio</option>
          <option value="image">Image</option>
          <option value="video">Vidéo</option>
          <option value="text">Texte</option>
          <option value="weblink">Lien Web</option>
          <option value="modelsAR">Modèle AR</option>
        </select>
      </div>

      <div style={inputGroup}>
        <label>{type === 'text' ? 'Texte :' : 'URL :'}</label>
        <input
          type="text"
          value={urlOrContent}
          onChange={(e) => setUrlOrContent(e.target.value)}
          style={inputStyle}
          placeholder={type === 'text' ? 'Entrer un texte' : 'Entrer une URL'}
        />
      </div>

      <div style={inputGroup}>
        <label>Points :</label>
        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(parseInt(e.target.value))}
          style={inputStyle}
          min={0}
        />
      </div>

      {(type === 'audio' || type === 'video') && (
        <div style={inputGroup}>
          <label>Lecture en boucle :</label>
          <input
            type="checkbox"
            checked={loop}
            onChange={(e) => setLoop(e.target.checked)}
          />
        </div>
      )}

      {type === 'image' && (
        <div style={inputGroup}>
          <label>Contrôle Opacité :</label>
          <input
            type="checkbox"
            checked={opacityControl}
            onChange={(e) => setOpacityControl(e.target.checked)}
          />
        </div>
      )}

      <button onClick={handleAdd} style={buttonStyle}>
        ➕ Ajouter
      </button>
    </div>
  );
}

// Styles
const containerStyle = {
  padding: '15px',
  border: '1px solid #ccc',
  borderRadius: '10px',
  background: 'white',
  marginTop: '20px',
};

const inputGroup = {
  marginBottom: '10px',
  display: 'flex',
  flexDirection: 'column',
};

const inputStyle = {
  padding: '8px',
  borderRadius: '5px',
  border: '1px solid #aaa',
};

const buttonStyle = {
  padding: '10px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
};