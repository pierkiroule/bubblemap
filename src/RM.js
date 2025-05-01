// src/RM.js
import React, { useEffect, useState } from 'react';
import { ref, onValue, push, remove } from 'firebase/database';
import { db } from './firebase';

export default function RM({ sessionId, bulleId }) {
  const [resources, setResources] = useState([]);
  const [newResourceUrl, setNewResourceUrl] = useState('');

  useEffect(() => {
    if (!sessionId || !bulleId) return;
    const resourcesRef = ref(db, `bulles/${sessionId}/${bulleId}/resources`);
    return onValue(resourcesRef, (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.entries(data).map(([id, resource]) => ({ id, ...resource })) : [];
      setResources(list);
    });
  }, [sessionId, bulleId]);

  const handleAddResource = () => {
    if (newResourceUrl.trim() === '') return;
    const resourcesRef = ref(db, `bulles/${sessionId}/${bulleId}/resources`);
    push(resourcesRef, { url: newResourceUrl.trim(), type: guessType(newResourceUrl.trim()) });
    setNewResourceUrl('');
  };

  const handleRemoveResource = (id) => {
    const resourceRef = ref(db, `bulles/${sessionId}/${bulleId}/resources/${id}`);
    remove(resourceRef);
  };

  return (
    <div style={rmContainer}>
      <h4>Ressources</h4>

      <div style={{ display: 'flex', marginBottom: 10 }}>
        <input
          type="text"
          placeholder="URL audio, image, etc."
          value={newResourceUrl}
          onChange={(e) => setNewResourceUrl(e.target.value)}
          style={inputStyle}
        />
        <button onClick={handleAddResource} style={addButton}>＋</button>
      </div>

      {resources.map((res) => (
        <div key={res.id} style={resourceItem}>
          <span style={{ flex: 1 }}>{res.type} : {res.url.split('/').pop()}</span>
          <button onClick={() => handleRemoveResource(res.id)} style={removeButton}>❌</button>
        </div>
      ))}
    </div>
  );
}

// Petite fonction pour deviner le type automatiquement
function guessType(url) {
  if (url.match(/\.(mp3|wav|ogg)$/)) return 'audio';
  if (url.match(/\.(jpg|jpeg|png|gif)$/)) return 'image';
  if (url.match(/\.(mp4|webm)$/)) return 'video';
  if (url.startsWith('http')) return 'web';
  return 'autre';
}

// Styles
const rmContainer = { marginTop: 20, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 8 };
const inputStyle = { flex: 1, padding: 6, marginRight: 5 };
const addButton = { padding: '6px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' };
const resourceItem = { display: 'flex', alignItems: 'center', marginBottom: 5 };
const removeButton = { padding: '2px 6px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' };