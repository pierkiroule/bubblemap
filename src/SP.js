// src/SP.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, set } from 'firebase/database';

function SP({ onSelectSession }) {
  const [sessions, setSessions] = useState([]);
  const [newSessionName, setNewSessionName] = useState('');

  useEffect(() => {
    const sessionsRef = ref(db, 'sessions');
    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSessions(Object.keys(data));
      } else {
        setSessions([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const createSession = () => {
    if (newSessionName.trim() !== '') {
      const sessionRef = ref(db, `sessions/${newSessionName}`);
      set(sessionRef, { createdAt: Date.now() });
      onSelectSession(newSessionName);
    }
  };

  return (
    <div style={container}>
      <h2>Choisis une session</h2>

      {/* Liste des sessions existantes */}
      <div style={listContainer}>
        {sessions.map((session) => (
          <button key={session} style={sessionButton} onClick={() => onSelectSession(session)}>
            {session}
          </button>
        ))}
      </div>

      {/* Créer une nouvelle session */}
      <div style={{ marginTop: 20 }}>
        <input
          type="text"
          value={newSessionName}
          onChange={(e) => setNewSessionName(e.target.value)}
          placeholder="Nouvelle session..."
          style={inputStyle}
        />
        <button style={createButton} onClick={createSession}>
          ➕ Créer
        </button>
      </div>
    </div>
  );
}

// Styles
const container = { textAlign: 'center', padding: 20 };
const listContainer = { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 };
const sessionButton = { padding: 10, fontSize: 16, borderRadius: 8, backgroundColor: '#00aaff', color: 'white', border: 'none', cursor: 'pointer' };
const inputStyle = { padding: 8, fontSize: 16, borderRadius: 8, border: '1px solid #ccc', marginRight: 10 };
const createButton = { padding: 8, fontSize: 16, borderRadius: 8, backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' };

export default SP;