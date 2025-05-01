// src/HomeP.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomeP() {
  const [sessionId, setSessionId] = useState('');
  const navigate = useNavigate();

  return (
    <div>
      <h2>Rejoindre une session</h2>
      <input
        type="text"
        placeholder="ID de la session"
        value={sessionId}
        onChange={e => setSessionId(e.target.value)}
        style={{ padding: '6px', fontSize: '16px', marginRight: '10px' }}
      />
      <button
        onClick={() => {
          if (sessionId.trim()) navigate(`/p/${sessionId.trim()}`);
        }}
      >
        Rejoindre
      </button>
    </div>
  );
}